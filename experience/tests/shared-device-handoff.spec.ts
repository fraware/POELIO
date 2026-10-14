import {goToStage} from './stage-navigation.js';
import {expect,test} from '@playwright/test';

test('facilitator handoff removes both public drafts without erasing unrelated same-origin storage',async({page})=>{
  await page.goto('/?work=register');
  await page.evaluate(()=>sessionStorage.setItem('independent:test-key','retain'));
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await goToStage(nav,'Questionner');
  await page.locator('#initial-answer').fill('Participant A original reading');
  await goToStage(nav,'Inventer');
  await page.locator('#writing').fill('Participant A original writing');
  await page.waitForFunction(()=>sessionStorage.getItem('poelio:session:v1:register:writing')==='Participant A original writing');

  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  const other=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await goToStage(other,'Questionner');
  await page.locator('#permutation-first').fill('Participant A second literary interpretation');
  await page.waitForFunction(()=>sessionStorage.getItem('poelio:session:v1:permutation:initial')==='Participant A second literary interpretation');

  page.once('dialog',dialog=>dialog.accept());
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Effacer toutes mes réponses'}).click();
  await expect(page.getByRole('heading',{name:'Les Quatre Témoins'})).toBeVisible();
  const remaining=await page.evaluate(()=>({
    poelio:Object.keys(sessionStorage).filter(k=>k.startsWith('poelio:session:v1:')),
    unrelated:sessionStorage.getItem('independent:test-key')
  }));
  expect(remaining.poelio).toEqual([]);
  expect(remaining.unrelated).toBe('retain');
  await page.getByRole('button',{name:/Registre des clefs/}).click();
  await goToStage(nav,'Questionner');
  await expect(page.locator('#initial-answer')).toHaveValue('');
  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  await goToStage(page.getByRole('navigation',{name:'Étapes de l’expérience'}),'Questionner');
  await expect(page.locator('#permutation-first')).toHaveValue('');
});

test('declining shared-device handoff keeps writing without a reload',async({page})=>{
  await page.goto('/?work=register');
  await goToStage(page.getByRole('navigation',{name:'Étapes de l’expérience'}),'Questionner');
  await page.locator('#initial-answer').fill('Keep this reader’s text');
  page.once('dialog',dialog=>dialog.dismiss());
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Effacer toutes mes réponses'}).click();
  await expect(page.locator('#initial-answer')).toHaveValue('Keep this reader’s text');
  await page.reload();
  await goToStage(page.getByRole('navigation',{name:'Étapes de l’expérience'}),'Questionner');
  await expect(page.locator('#initial-answer')).toHaveValue('Keep this reader’s text');
});
