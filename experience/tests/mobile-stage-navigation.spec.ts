import {expect,test} from '@playwright/test';
import {goToStage,expectSixStages,expectStageActive} from './stage-navigation.js';

for(const width of [320,375,390]){
  test('mobile selector preserves six stages and reader drafts at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:720});
    await page.goto('/?work=register');
    const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
    const select=nav.getByRole('combobox',{name:'Choisir une étape'});
    await expect(select).toBeVisible();
    await expect(nav.locator('.steps')).toBeHidden();
    await expectSixStages(nav);
    await expect(select).toHaveValue('read');
    await expect(nav.locator('.mobile-stage-current')).toContainText('01 / 06');
    await goToStage(nav,'Questionner');
    await expect(page.locator('#stage-main')).toBeFocused();
    await page.locator('#initial-answer').fill('Une interprétation personnelle. '+width);
    await goToStage(nav,'Explorer');
    await expect(nav.locator('.mobile-stage-current')).toContainText('03 / 06');
    await goToStage(nav,'Questionner');
    await expect(page.locator('#initial-answer')).toHaveValue('Une interprétation personnelle. '+width);
    await goToStage(nav,'Revenir');
    await expectStageActive(nav,'Revenir');
    await expect(nav.locator('.mobile-stage-current')).toContainText('06 / 06');

    const overflow=await page.evaluate(()=>({
      document:document.documentElement.scrollWidth,
      viewport:document.documentElement.clientWidth
    }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport+1);

    await page.getByRole('button',{name:/Deuxième expérience/}).click();
    const second=page.getByRole('navigation',{name:'Étapes de l’expérience'});
    await expect(second.getByRole('combobox',{name:'Choisir une étape'})).toBeVisible();
    await expectSixStages(second);
    await goToStage(second,'Comparer');
    await expect(page.locator('#permutation-main')).toBeFocused();
    await expectStageActive(second,'Comparer');
  });
}

test('English native chooser labels and desktop stage buttons share exactly six destinations',async({page})=>{
  await page.setViewportSize({width:375,height:740});
  await page.goto('/?work=register&lang=en');
  let nav=page.getByRole('navigation',{name:'Experience stages'});
  const select=nav.getByRole('combobox',{name:'Choose a stage'});
  await expect(select).toBeVisible();
  await expect(select.locator('option')).toHaveText([
    '01 · Read','02 · Question','03 · Explore','04 · Compare','05 · Invent','06 · Reflect'
  ]);
  await goToStage(nav,'Invent');
  await expect(nav.locator('.mobile-stage-current')).toContainText('05 / 06');
  await expect(nav.locator('.mobile-stage-current')).toContainText('Invent');
  await expect(page.locator('#writing')).toBeVisible();

  await page.setViewportSize({width:1120,height:800});
  nav=page.getByRole('navigation',{name:'Experience stages'});
  await expect(nav.locator('.mobile-stage-navigation')).toBeHidden();
  await expectSixStages(nav);
  await expect(nav.getByRole('button',{name:/Invent/})).toHaveAttribute('aria-current','step');
  await goToStage(nav,'Reflect');
  await expect(page.locator('#stage-main')).toBeFocused();
});
