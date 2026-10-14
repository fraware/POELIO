import {expect,test} from '@playwright/test';
import {goToStage} from './stage-navigation.js';

for(const width of [320,1120]){
  test('Back and Forward reconcile work, language, focus and private drafts at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:760});
    await page.goto('/?work=register');
    const register=page.getByRole('navigation',{name:'Étapes de l’expérience'});
    await goToStage(register,'Questionner');
    await page.locator('#initial-answer').fill('Lecture privée dans la première œuvre.');
    await page.waitForFunction(()=>sessionStorage.getItem('poelio:session:v1:register:initial')===
      'Lecture privée dans la première œuvre.');

    await page.getByRole('button',{name:/Deuxième expérience/}).click();
    await expect(page).toHaveURL(/\?work=permutation$/);
    await expect(page.locator('html')).toHaveAttribute('lang','fr');
    await page.getByRole('button',{name:'Switch to English'}).click();
    await expect(page).toHaveURL(/work=permutation&lang=en/);
    await expect(page.getByRole('navigation',{name:'Experience stages'})).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang','en');
    await goToStage(page.getByRole('navigation',{name:'Experience stages'}),'Question');
    await page.locator('#permutation-first').fill('Second private thought.');

    await page.goBack();
    await expect(page).toHaveURL(/\?work=register$/);
    await expect(page.getByRole('navigation',{name:'Étapes de l’expérience'})).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang','fr');
    await expect(page.getByRole('button',{name:'Switch to English'})).toBeVisible();
    await goToStage(page.getByRole('navigation',{name:'Étapes de l’expérience'}),'Questionner');
    await expect(page.locator('#initial-answer')).toHaveValue('Lecture privée dans la première œuvre.');

    await page.goForward();
    await expect(page).toHaveURL(/work=permutation&lang=en/);
    await expect(page.locator('html')).toHaveAttribute('lang','en');
    await expect(page.getByRole('navigation',{name:'Experience stages'})).toBeVisible();
    await goToStage(page.getByRole('navigation',{name:'Experience stages'}),'Question');
    await expect(page.locator('#permutation-first')).toHaveValue('Second private thought.');

    const data=await page.evaluate(()=>({
      location:location.href,
      localKeys:Object.keys(localStorage),
      sessionKeys:Object.keys(sessionStorage)
    }));
    expect(data.location).not.toContain('private');
    expect(data.localKeys).toEqual([]);
    expect(data.sessionKeys.sort()).toEqual([
      'poelio:session:v1:permutation:initial',
      'poelio:session:v1:register:initial'
    ]);
  });
}
