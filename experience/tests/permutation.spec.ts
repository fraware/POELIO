import {expect, test} from '@playwright/test';

test('permutation journey is literature-first, exhaustive and locally writable', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name:/Deuxième expérience/}).click();
  await expect(page.getByRole('heading', {name:'La porte était ouverte.'})).toBeVisible();
  const stages = page.getByRole('navigation', {name:'Étapes de l’expérience'});
  await expect(page.locator('.reading-column .fragment-passage')).toHaveCount(4);

  await stages.getByRole('button', {name:/Questionner/}).click();
  await page.locator('#permutation-first').fill('L’ordre fabrique une chronologie hypothétique.');
  await stages.getByRole('button', {name:/Explorer/}).click();
  await expect(page.locator('#permutation-select option')).toHaveCount(24);
  await page.locator('#order-filter').check();
  await expect(page.locator('#permutation-select option')).toHaveCount(12);
  await page.locator('#order-filter').uncheck();
  await expect(page.locator('#permutation-select option')).toHaveCount(24);
  await page.locator('#permutation-select').selectOption('question/bell/door/letter');

  await stages.getByRole('button', {name:/Comparer/}).click();
  await expect(page.locator('.comparison article')).toHaveCount(2);
  await expect(page.locator('.comparison section.changed-passage').first()).toBeVisible();
  const leftTexts=await page.locator('.comparison article').first().locator('section p:not(.fragment-index)').allTextContents();
  const rightTexts=await page.locator('.comparison article').last().locator('section p:not(.fragment-index)').allTextContents();
  expect([...leftTexts].sort()).toEqual([...rightTexts].sort());
  expect(leftTexts).not.toEqual(rightTexts);

  await stages.getByRole('button', {name:/Inventer/}).click();
  await page.locator('#permutation-rule').fill('La dernière phrase révèle le premier lieu.');
  await page.locator('#permutation-writing').fill('Le témoin attendit le bruit de la cloche.');
  await stages.getByRole('button', {name:/Revenir/}).click();
  await expect(page.getByText('L’ordre fabrique une chronologie hypothétique.')).toBeVisible();
  const download=page.waitForEvent('download');
  await page.getByRole('button', {name:'Conserver ma création'}).click();
  expect((await download).suggestedFilename()).toBe('poelio-fragments-et-invention.txt');

  await page.reload();
  await page.getByRole('button', {name:/Deuxième expérience/}).click();
  await stages.getByRole('button', {name:/Revenir/}).click();
  await expect(page.getByText('Aucune réponse.')).toBeVisible();
});

test('facilitator guide is a printable, publicly safe document', async ({page}) => {
  await page.goto('/facilitator.html');
  await expect(page.getByRole('heading', {name:'Guide de séance — 60 minutes'})).toBeVisible();
  await expect(page.getByRole('heading', {name:'Le Registre des clefs'})).toBeVisible();
  await expect(page.getByRole('heading', {name:'Les Quatre Témoins'})).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await expect(page.getByText('Une lecture littéraire', {exact:false})).toBeVisible();
});

test('second mechanism permits English interface and does not overflow on mobile', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name:/Deuxième expérience/}).click();
  await page.getByRole('button', {name:'Switch to English'}).click();
  await expect(page.getByRole('heading', {name:'The door stood open.'})).toBeVisible();
  const steps=page.getByRole('navigation', {name:'Experience stages'});
  await steps.getByRole('button', {name:/Explore/}).click();
  await expect(page.locator('#permutation-select option')).toHaveCount(24);
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.client+1);
});
