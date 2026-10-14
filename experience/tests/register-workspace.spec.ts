import {expect,test,type Page} from '@playwright/test';

async function openRegister(page:Page):Promise<void>{
  await page.goto('/?work=register');
  await page.getByRole('navigation',{name:'Étapes de l’expérience'})
    .getByRole('button',{name:/Explorer/}).click();
  await expect(page.locator('.day-toggle')).toHaveCount(8);
}

async function assignments(page:Page):Promise<string[]>{
  return page.locator('.day-toggle strong').allTextContents();
}

test('eight positions are directly editable, reversible and preserve the two-source boundary',async({page})=>{
  await openRegister(page);
  expect(await assignments(page)).toEqual(['Mira','Mira','Noor','Mira','Noor','Mira','Noor','Mira']);
  await expect(page.getByText('Réparation minimale : une répétition', {exact:false})).toBeVisible();
  await expect(page.getByText('Une réalisation littéraire rédigée existe', {exact:false})).toBeVisible();
  await page.locator('.day-toggle[data-day-index="0"]').click();
  expect(await assignments(page)).toEqual(['Noor','Mira','Noor','Mira','Noor','Mira','Noor','Mira']);
  await expect(page.getByText('Récurrence non respectée', {exact:false})).toBeVisible();
  await expect(page.getByText('Aucun relais répété.')).toBeVisible();
  await expect(page.getByText('Hors des 14 réparations minimales.')).toBeVisible();
  await expect(page.getByText('Aucun texte littéraire n’a été rédigé', {exact:false})).toBeVisible();
  await expect(page.locator('#schedule-choice option')).toHaveCount(15);
  await page.getByRole('button',{name:'Annuler',exact:true}).click();
  expect(await assignments(page)).toEqual(['Mira','Mira','Noor','Mira','Noor','Mira','Noor','Mira']);
  await expect(page.locator('#schedule-choice option')).toHaveCount(14);
  await page.getByRole('button',{name:'Rétablir',exact:true}).click();
  await expect(page.getByText('Récurrence non respectée', {exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Configuration initiale'}).click();
  expect(await assignments(page)).toEqual(['Mira','Mira','Noor','Mira','Noor','Mira','Noor','Mira']);
  await page.getByRole('button',{name:'Annuler',exact:true}).click();
  await expect(page.getByText('Récurrence non respectée', {exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Configuration initiale'}).click();
  await page.locator('.day-toggle[data-day-index="4"]').click();
  await expect(page.getByText('Récurrence respectée', {exact:false})).toBeVisible();
  await expect(page.getByText('3 relais répétés.')).toBeVisible();
  await expect(page.getByText('Hors des 14 réparations minimales.')).toBeVisible();
});

test('minimum-repair catalogue stays exact and shows prose only for two authorized schedules',async({page})=>{
  await openRegister(page);
  const repairs=await page.locator('#schedule-choice option').evaluateAll(nodes=>
    nodes.map(node=>(node as HTMLOptionElement).value));
  expect(new Set(repairs).size).toBe(14);
  let authored=0;
  for(const key of repairs){
    await page.locator('#schedule-choice').selectOption(key);
    await expect(page.getByText('Réparation minimale : une répétition', {exact:false})).toBeVisible();
    if(await page.getByText('Une réalisation littéraire rédigée existe', {exact:false}).isVisible()){
      authored++;
    } else {
      await expect(page.getByText('Aucun texte littéraire n’a été rédigé', {exact:false})).toBeVisible();
    }
  }
  expect(authored).toBe(2);
  await page.getByRole('navigation',{name:'Étapes de l’expérience'})
    .getByRole('button',{name:/Comparer/}).click();
  await expect(page.locator('.comparison article')).toHaveCount(2);
  await expect(page.getByText('Mira inscrivit une question',{exact:false})).toBeVisible();
  await expect(page.getByText('Noor trouva une question',{exact:false})).toBeVisible();
});

test('keyboard and English labels allow changing assignments at mobile reflow width',async({page})=>{
  await page.setViewportSize({width:320,height:680});
  await page.goto('/?work=register');
  await page.getByRole('button',{name:'Switch to English'}).click();
  const nav=page.getByRole('navigation',{name:'Experience stages'});
  await nav.getByRole('button',{name:/Explore/}).click();
  const first=page.locator('.day-toggle[data-day-index="0"]');
  await expect(first).toHaveAttribute('aria-label',/Change Mon₀ : Mira\. Choose Noor/);
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-label',/Change Mon₀ : Noor\. Choose Mira/);
  await expect(page.getByText('Recurrence violated', {exact:false})).toBeVisible();
  await expect(first).toBeFocused();
  const widths=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    doc:document.documentElement.scrollWidth,
    body:document.body.scrollWidth
  }));
  expect(widths.doc).toBeLessThanOrEqual(widths.viewport+1);
  expect(widths.body).toBeLessThanOrEqual(widths.viewport+1);
  for(const button of await page.locator('.day-toggle').all()){
    const rectangle=await button.boundingBox();
    expect(rectangle?.height??0).toBeGreaterThanOrEqual(44);
  }
});
