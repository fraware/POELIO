import {expect,test} from '@playwright/test';

test('both works expose the same six literary stages with bounded navigation',async({page})=>{
  await page.goto('/');
  const stages=['Lire','Questionner','Explorer','Comparer','Inventer','Revenir'];
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  for(const label of stages){
    await expect(nav.getByRole('button',{name:new RegExp(label)})).toBeVisible();
  }
  expect(await nav.getByRole('button').count()).toBe(6);
  await expect(page.getByRole('button',{name:'← Retour'})).toBeDisabled();
  await page.getByRole('button',{name:'Continuer →'}).click();
  await expect(page.locator('#stage-main')).toBeFocused();
  await expect(nav.getByRole('button',{name:/Questionner/})).toHaveAttribute('aria-current','step');
  await nav.getByRole('button',{name:/Revenir/}).click();
  await expect(page.getByRole('button',{name:'Continuer →'})).toBeDisabled();

  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  const second=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  expect(await second.getByRole('button').count()).toBe(6);
  await expect(page.getByRole('button',{name:'← Retour'})).toBeDisabled();
  await second.getByRole('button',{name:/Comparer/}).click();
  await expect(page.locator('#permutation-main')).toBeFocused();
  await expect(second.getByRole('button',{name:/Comparer/})).toHaveAttribute('aria-current','step');
  await page.getByRole('button',{name:'Continuer →'}).click();
  await expect(second.getByRole('button',{name:/Inventer/})).toHaveAttribute('aria-current','step');
});

test('French and English stage labels are centralized and consistent',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Switch to English'}).click();
  let nav=page.getByRole('navigation',{name:'Experience stages'});
  for(const label of ['Read','Question','Explore','Compare','Invent','Reflect'])
    await expect(nav.getByRole('button',{name:new RegExp(label)})).toBeVisible();
  await page.getByRole('button',{name:/Second experience/}).click();
  nav=page.getByRole('navigation',{name:'Experience stages'});
  await expect(page.getByRole('button',{name:'Passer en français'})).toBeVisible();
  for(const label of ['Read','Question','Explore','Compare','Invent','Reflect'])
    await expect(nav.getByRole('button',{name:new RegExp(label)})).toBeVisible();
});
