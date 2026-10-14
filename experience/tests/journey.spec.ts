import {goToStage} from './stage-navigation.js';
import { test, expect } from '@playwright/test';

test('the full six-stage literary journey preserves authorial provenance and private writing', async ({page}) => {
  await page.goto('/?work=register');
  const steps = page.getByRole('navigation', {name:'Étapes de l’expérience'});
  await expect(page.getByRole('heading', {name:'Le Registre des clefs'})).toBeVisible();
  await expect(page.getByText('La salle des clefs possédait une table', {exact:false})).toBeVisible();
  await goToStage(steps,'Questionner');
  await page.locator('#initial-answer').fill('Mira peut comparer deux visites.');
  await goToStage(steps,'Explorer');
  await expect(page.locator('#schedule-choice option')).toHaveCount(14);
  const values = await page.locator('#schedule-choice option').evaluateAll(options => options.map(o => (o as HTMLOptionElement).value));
  const choices = new Set(values);
  expect(choices.size).toBe(14);
  await expect(page.getByText('Cette configuration', {exact:false})).toBeVisible();
  // Pick an un-authored state to verify that the application refuses to invent prose.
  const optionLabels = await page.locator('#schedule-choice option').allTextContents();
  const index = optionLabels.findIndex(x=>x.includes('Mer') && x.includes('Jeu'));
  expect(index).toBeGreaterThanOrEqual(0);
  await page.locator('#schedule-choice').selectOption({index});
  await expect(page.getByText(/Aucun texte n’a été rédigé/)).toBeVisible();
  await goToStage(steps,'Comparer');
  await expect(page.getByText(/Mira inscrivit une question/)).toBeVisible();
  await expect(page.getByText(/Noor trouva une question/)).toBeVisible();
  await goToStage(steps,'Inventer');
  await page.locator('#own-rule').fill('Chaque deuxième jour raconte une contradiction.');
  await page.locator('#writing').fill('Je compose librement une réponse à cette contrainte.');
  await goToStage(steps,'Revenir');
  await expect(page.getByText('Mira peut comparer deux visites.')).toBeVisible();
  await page.locator('#revised').fill('Ma lecture a changé.');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', {name:'Exporter le texte (TXT)'}).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('poelio-ma-creation.txt');
  await page.waitForFunction(()=>sessionStorage.getItem('poelio:session:v1:register:initial')==='Mira peut comparer deux visites.');
  await page.reload();
  await goToStage(steps,'Revenir');
  await expect(page.getByText('Mira peut comparer deux visites.')).toBeVisible();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Recommencer'}).click();
  await goToStage(steps,'Revenir');
  await expect(page.getByText('Aucune réponse saisie.')).toBeVisible();
});

test('language switching, comparison identity, and mobile dimensions work', async ({page}) => {
  await page.goto('/?work=register');
  await page.getByRole('button', {name:'Switch to English'}).click();
  await expect(page.getByRole('heading', {name:'Le Registre des clefs'})).toBeVisible();
  const steps = page.getByRole('navigation', {name:'Experience stages'});
  await goToStage(steps,'Compare');
  await page.getByLabel('Second text').selectOption('demo-a');
  await expect(page.getByText('You selected the same text twice.')).toBeVisible();
  const width = await page.evaluate(()=>({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport+1);
});
