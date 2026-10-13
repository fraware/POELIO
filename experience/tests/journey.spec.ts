import { test, expect } from '@playwright/test';

test('the full six-stage literary journey preserves authorial provenance and private writing', async ({page}) => {
  await page.goto('/');
  const steps = page.getByRole('navigation', {name:'Étapes de l’expérience'});
  await expect(page.getByRole('heading', {name:'Avant la règle, le récit.'})).toBeVisible();
  await expect(page.getByText('La salle des clefs possédait une table', {exact:false})).toBeVisible();
  await steps.getByRole('button', {name:/Questionner/}).click();
  await page.locator('#initial-answer').fill('Mira peut comparer deux visites.');
  await steps.getByRole('button', {name:/Explorer/}).click();
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
  await steps.getByRole('button', {name:/Comparer/}).click();
  await expect(page.getByText(/Mira inscrivit une question/)).toBeVisible();
  await expect(page.getByText(/Noor trouva une question/)).toBeVisible();
  await steps.getByRole('button', {name:/Inventer/}).click();
  await page.locator('#own-rule').fill('Chaque deuxième jour raconte une contradiction.');
  await page.locator('#writing').fill('Je compose librement une réponse à cette contrainte.');
  await steps.getByRole('button', {name:/Revenir/}).click();
  await expect(page.getByText('Mira peut comparer deux visites.')).toBeVisible();
  await page.locator('#revised').fill('Ma lecture a changé.');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', {name:'Conserver mon travail'}).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('poelio-ma-creation.txt');
  await page.reload();
  await steps.getByRole('button', {name:/Revenir/}).click();
  await expect(page.getByText('Aucune réponse saisie.')).toBeVisible();
});

test('language switching, comparison identity, and mobile dimensions work', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name:'Switch to English'}).click();
  await expect(page.getByRole('heading', {name:'The story comes first.'})).toBeVisible();
  const steps = page.getByRole('navigation', {name:'Experience stages'});
  await steps.getByRole('button', {name:/Compare/}).click();
  await page.getByLabel('Second realization').selectOption('demo-a');
  await expect(page.getByText('You selected the same realization twice: no source difference.')).toBeVisible();
  const width = await page.evaluate(()=>({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport+1);
});
