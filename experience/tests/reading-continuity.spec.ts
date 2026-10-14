import {expect,test} from '@playwright/test';
import {goToStage} from './stage-navigation.js';

for(const work of ['register','permutation'] as const){
  test(work+' reconnects reader-owned interpretation without publishing or changing it',async({page})=>{
    await page.goto('/?work='+work);
    const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
    const main=page.locator(work==='register'?'#stage-main':'#permutation-main');
    const initialId=work==='register'?'#initial-answer':'#permutation-first';
    const note='Première observation personnelle\n\nUne question qui reste ouverte.';
    await goToStage(nav,'Explorer');
    await expect(main.locator('.first-reading-note')).toHaveCount(0);
    await goToStage(nav,'Questionner');
    await page.locator(initialId).fill(note);
    await goToStage(nav,'Explorer');
    const first=main.locator('.first-reading-note');
    await expect(first).toHaveCount(1);
    await expect(first.locator('blockquote')).toBeHidden();
    await first.locator('summary').click();
    await expect(first.locator('blockquote')).toHaveText(note);
    await goToStage(nav,'Comparer');
    await expect(main).toBeFocused();
    const comparisonNote=main.locator('.first-reading-note');
    await expect(comparisonNote.locator('blockquote')).toBeHidden();
    await comparisonNote.locator('summary').click();
    await expect(comparisonNote.locator('blockquote')).toHaveText(note);
    await main.getByRole('button',{name:'← Reprendre l’exploration'}).click();
    await expect(main).toBeFocused();
    await goToStage(nav,'Questionner');
    await expect(page.locator(initialId)).toHaveValue(note);
    await expect(page.evaluate(()=>Object.keys(localStorage))).toEqual([]);
  });
}

test('register comparison identifies un-authored, authored and invalid explored configurations',async({page})=>{
  await page.goto('/?work=register');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await goToStage(nav,'Explorer');
  await expect(page.getByText('Aucun texte n’a été rédigé pour cet arrangement.')).toBeVisible();
  const starting=await page.locator('#schedule-choice').inputValue();
  await goToStage(nav,'Comparer');
  const bridge=page.locator('.exploration-bridge');
  await expect(bridge).toContainText('fait partie des quatorze réparations minimales, sans texte rédigé');
  await expect(page.locator('.comparison article')).toHaveCount(2);
  await bridge.getByRole('button',{name:'← Reprendre l’exploration'}).click();
  await expect(page.locator('#schedule-choice')).toHaveValue(starting);

  const options=await page.locator('#schedule-choice option').evaluateAll(nodes=>
    nodes.map(node=>(node as HTMLOptionElement).value));
  let found=false;
  for(const value of options){
    await page.locator('#schedule-choice').selectOption(value);
    if(await page.getByText('Une réalisation littéraire rédigée existe pour cette configuration.').isVisible()){
      found=true;break;
    }
  }
  expect(found).toBe(true);
  await goToStage(nav,'Comparer');
  await expect(bridge).toContainText(/correspond au Texte (I|II)/);
  await expect(bridge).toContainText('La comparaison présente les deux réalisations rédigées.');
  await expect(page.locator('.comparison article')).toHaveCount(2);

  await bridge.getByRole('button',{name:'← Reprendre l’exploration'}).click();
  await page.locator('.day-toggle[data-day-index="7"]').click();
  await expect(page.getByText('Hors des 14 réparations minimales.')).toBeVisible();
  await goToStage(nav,'Comparer');
  await expect(bridge).toContainText('ne fait pas partie des quatorze réparations minimales.');
});

test('permutation comparison accurately reports identical and changed orders',async({page})=>{
  await page.goto('/?work=permutation');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await goToStage(nav,'Explorer');
  await page.locator('#permutation-select').selectOption('door/letter/question/bell');
  await goToStage(nav,'Comparer');
  const bridge=page.locator('.exploration-bridge');
  await expect(bridge).toContainText('Les deux colonnes présentent le même texte.');
  const identical=await page.locator('.comparison article').allTextContents();
  expect(identical[0]).toBe(identical[1]);
  await bridge.getByRole('button',{name:'← Reprendre l’exploration'}).click();
  await expect(page.locator('#permutation-select')).toHaveValue('door/letter/question/bell');
  await page.locator('#permutation-select').selectOption('question/bell/door/letter');
  await goToStage(nav,'Comparer');
  await expect(bridge).toContainText('Les quatre fragments sont inchangés.');
  const changed=await page.locator('.comparison article').allTextContents();
  expect(changed[0]).not.toBe(changed[1]);
});

test('English mobile continuity stays optional, responsive and keyboard navigable',async({page})=>{
  await page.setViewportSize({width:320,height:720});
  await page.goto('/?work=register&lang=en');
  const nav=page.getByRole('navigation',{name:'Experience stages'});
  await goToStage(nav,'Question');
  await page.locator('#initial-answer').fill('A private opening thought.');
  await goToStage(nav,'Compare');
  const bridge=page.locator('.exploration-bridge');
  await expect(bridge).toContainText('two authored realizations');
  const note=page.locator('.first-reading-note');
  await expect(note.locator('summary')).toHaveText('Reread my first impression');
  await note.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(note.locator('blockquote')).toHaveText('A private opening thought.');
  await bridge.getByRole('button',{name:'← Return to exploration'}).click();
  await expect(page.locator('#stage-main')).toBeFocused();
  const widths=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    document:document.documentElement.scrollWidth
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport+1);
});
