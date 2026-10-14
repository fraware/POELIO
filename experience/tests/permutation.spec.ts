import {goToStage} from './stage-navigation.js';
import {expect, test} from '@playwright/test';

test('permutation journey is literature-first, exhaustive and locally writable', async ({page}) => {
  await page.goto('/?work=register');
  await page.getByRole('button', {name:/Deuxième expérience/}).click();
  await expect(page.getByRole('heading', {name:'Les Quatre Témoins'})).toBeVisible();
  const stages = page.getByRole('navigation', {name:'Étapes de l’expérience'});
  await expect(page.locator('.reading-column .fragment-passage')).toHaveCount(4);

  await goToStage(stages,'Questionner');
  await page.locator('#permutation-first').fill('L’ordre fabrique une chronologie hypothétique.');
  await goToStage(stages,'Explorer');
  await expect(page.locator('#permutation-select option')).toHaveCount(24);
  await page.locator('#order-filter').check();
  await expect(page.locator('#permutation-select option')).toHaveCount(12);
  await page.locator('#order-filter').uncheck();
  await expect(page.locator('#permutation-select option')).toHaveCount(24);
  await page.locator('#permutation-select').selectOption('question/bell/door/letter');

  await goToStage(stages,'Comparer');
  await expect(page.locator('.comparison article')).toHaveCount(2);
  await expect(page.locator('.comparison section.changed-passage').first()).toBeVisible();
  const leftTexts=await page.locator('.comparison article').first().locator('section p:not(.fragment-index)').allTextContents();
  const rightTexts=await page.locator('.comparison article').last().locator('section p:not(.fragment-index)').allTextContents();
  expect([...leftTexts].sort()).toEqual([...rightTexts].sort());
  expect(leftTexts).not.toEqual(rightTexts);

  await goToStage(stages,'Inventer');
  await page.locator('#permutation-rule').fill('La dernière phrase révèle le premier lieu.');
  await page.locator('#permutation-writing').fill('Le témoin attendit le bruit de la cloche.');
  await goToStage(stages,'Revenir');
  await expect(page.getByText('L’ordre fabrique une chronologie hypothétique.')).toBeVisible();
  const download=page.waitForEvent('download');
  await page.getByRole('button', {name:'Exporter le texte (TXT)'}).click();
  expect((await download).suggestedFilename()).toBe('poelio-fragments-et-invention.txt');

  await page.waitForFunction(()=>sessionStorage.getItem('poelio:session:v1:permutation:initial')==='L’ordre fabrique une chronologie hypothétique.');
  await page.reload();
  await expect(page.getByRole('heading',{name:'Les Quatre Témoins'})).toBeVisible();
  await goToStage(stages,'Revenir');
  await expect(page.getByText('L’ordre fabrique une chronologie hypothétique.')).toBeVisible();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Recommencer'}).click();
  await goToStage(stages,'Revenir');
  await expect(page.getByText('Aucune réponse.')).toBeVisible();
});

test('facilitator guide is a printable, publicly safe document', async ({page}) => {
  await page.goto('/facilitator.html');
  await expect(page.getByRole('heading', {name:'Guide de séance — 60 minutes'})).toBeVisible();
  await expect(page.getByRole('heading', {name:'Le Registre des clefs'})).toBeVisible();
  await expect(page.getByRole('heading', {name:'Les Quatre Témoins'})).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await expect(page.getByText('Ce parcours propose une heure de lecture', {exact:false})).toBeVisible();
});

test('second mechanism permits English interface and does not overflow on mobile', async ({page}) => {
  await page.goto('/?work=register');
  await page.getByRole('button', {name:/Deuxième expérience/}).click();
  await page.getByRole('button', {name:'Switch to English'}).click();
  await expect(page.getByRole('heading', {name:'Les Quatre Témoins'})).toBeVisible();
  const steps=page.getByRole('navigation', {name:'Experience stages'});
  await goToStage(steps,'Explore');
  await expect(page.locator('#permutation-select option')).toHaveCount(24);
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.client+1);
});
