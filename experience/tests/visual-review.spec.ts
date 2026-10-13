import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

/** Public authored text only. Stable screenshots for human editorial review. */
test('capture desktop and mobile literary reading, structure and writing',async({page},info)=>{
  if(info.project.name!=='chromium-desktop')return;
  const dir=resolve('visual-review');
  mkdirSync(dir,{recursive:true});
  async function capture(name:string,width:number,height:number){
    await page.setViewportSize({width,height});
    await expect(page.locator('.main-content')).toBeVisible();
    await page.screenshot({path:resolve(dir,name+'.png'),fullPage:true,animations:'disabled'});
  }
  await page.goto('/');
  await capture('register-reading-desktop',1440,900);
  await capture('register-reading-mobile',375,812);
  await capture('register-reading-320',320,720);
  await page.getByRole('navigation',{name:'Étapes de l’expérience'})
    .getByRole('button',{name:/Explorer/}).click();
  await capture('register-explore-mobile',375,812);
  await page.getByRole('navigation',{name:'Étapes de l’expérience'})
    .getByRole('button',{name:/Comparer/}).click();
  await capture('register-compare-desktop',1440,900);
  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  await capture('permutation-reading-desktop',1440,900);
  await capture('permutation-reading-mobile',375,812);
}
