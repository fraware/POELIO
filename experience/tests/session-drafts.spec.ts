import {expect,test} from '@playwright/test';

test('writing is scoped to its literary work, to its tab, and not to another work',async({page,context})=>{
  await page.goto('/?work=register');
  const steps=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await steps.getByRole('button',{name:/Questionner/}).click();
  await page.locator('#initial-answer').fill('Texte initial du premier récit.');
  await page.waitForFunction(()=>sessionStorage.getItem('poelio:session:v1:register:initial')==='Texte initial du premier récit.');

  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  const other=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await other.getByRole('button',{name:/Questionner/}).click();
  await expect(page.locator('#permutation-first')).toHaveValue('');
  await page.locator('#permutation-first').fill('Seconde lecture dans le même onglet.');
  await page.getByRole('button',{name:/Registre des clefs/}).click();
  await steps.getByRole('button',{name:/Questionner/}).click();
  await expect(page.locator('#initial-answer')).toHaveValue('Texte initial du premier récit.');

  const independent=await context.newPage();
  await independent.goto('/');
  await independent.getByRole('navigation',{name:'Étapes de l’expérience'})
    .getByRole('button',{name:/Questionner/}).click();
  await expect(independent.locator('#initial-answer')).toHaveValue('');
  await independent.close();
});

test('unprimed reviewer notes are deliberately ephemeral and never put into session storage',async({page})=>{
  await page.goto('/?review=register');
  await page.locator('#review-initial').fill('Strictement privée : lecture sans règle.');
  const keys=await page.evaluate(()=>Object.keys(sessionStorage));
  expect(keys.every(key=>!key.includes('review'))).toBe(true);
  await page.reload();
  await expect(page.locator('#review-initial')).toHaveValue('');
});
