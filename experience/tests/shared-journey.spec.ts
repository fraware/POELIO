import {goToStage,expectSixStages,expectStageReachable,expectStageActive} from './stage-navigation.js';
import {expect,test} from '@playwright/test';

test('both works expose the same six literary stages with bounded navigation',async({page})=>{
  await page.goto('/?work=register');
  const stages=['Lire','Questionner','Explorer','Comparer','Inventer','Revenir'];
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  for(const label of stages){
    await expectStageReachable(nav,label);
  }
  await expectSixStages(nav);
  await expect(page.getByRole('button',{name:'← Retour'})).toBeDisabled();
  await page.getByRole('button',{name:'Continuer →'}).click();
  await expect(page.locator('#stage-main')).toBeFocused();
  await expectStageActive(nav,'Questionner');
  await goToStage(nav,'Revenir');
  await expect(page.getByRole('button',{name:'Continuer →'})).toBeDisabled();

  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  const second=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await expectSixStages(second);
  await expect(page.getByRole('button',{name:'← Retour'})).toBeDisabled();
  await goToStage(second,'Comparer');
  await expect(page.locator('#permutation-main')).toBeFocused();
  await expectStageActive(second,'Comparer');
  await page.getByRole('button',{name:'Continuer →'}).click();
  await expectStageActive(second,'Inventer');
});

test('French and English stage labels are centralized and consistent',async({page})=>{
  await page.goto('/?work=register');
  await page.getByRole('button',{name:'Switch to English'}).click();
  let nav=page.getByRole('navigation',{name:'Experience stages'});
  for(const label of ['Read','Question','Explore','Compare','Invent','Reflect'])
    await expectStageReachable(nav,label);
  await page.getByRole('button',{name:/Second experience/}).click();
  nav=page.getByRole('navigation',{name:'Experience stages'});
  await expect(page.getByRole('button',{name:'Passer en français'})).toBeVisible();
  for(const label of ['Read','Question','Explore','Compare','Invent','Reflect'])
    await expectStageReachable(nav,label);
});
