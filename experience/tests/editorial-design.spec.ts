import {goToStage} from './stage-navigation.js';
import {test,expect} from '@playwright/test';

/**
 * Editorial interaction regressions, not aesthetic certification.
 * Retain human review of typography, reading rhythm, and assistive technology.
 */
test('both works use a restrained book-like layout and correct literary titles',async({page})=>{
  await page.goto('/?work=register');
  await expect(page.locator('.brand')).toHaveText('POELIO');
  await expect(page.getByRole('heading',{level:1,name:'Le Registre des clefs'})).toBeVisible();
  await expect(page.locator('.manuscript')).toHaveCount(1);
  const style=await page.evaluate(()=>{
    const manuscript=document.querySelector('.manuscript')!;
    const title=document.querySelector('h1')!;
    const header=document.querySelector('.topbar')!;
    return {
      header:getComputedStyle(header).backgroundColor,
      manuscript:getComputedStyle(manuscript).backgroundColor,
      serif:getComputedStyle(title).fontFamily,
      imageCount:document.querySelectorAll('main img').length,
      privateReference:document.body.textContent?.includes('La Relève')
    };
  });
  expect(style.header).toBe('rgb(255, 255, 255)');
  expect(style.manuscript).toBe('rgb(255, 255, 255)');
  expect(style.serif).toMatch(/Source Sans 3/);
  expect(style.imageCount).toBe(0);
  expect(style.privateReference).toBe(false);

  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  await expect(page.getByRole('heading',{level:1,name:'Les Quatre Témoins'})).toBeVisible();
  await expect(page.locator('.brand')).toHaveText('POELIO');
  await expect(page.locator('.manuscript')).toHaveCount(1);
  await expect(page.getByRole('navigation',{name:'Choisir une œuvre'})).toBeVisible();
});

test('mobile reader keeps its content and controls legible at 320px',async({page})=>{
  await page.setViewportSize({width:320,height:640});
  await page.goto('/?work=register');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  for(const name of ['Lire','Questionner','Explorer','Comparer','Inventer','Revenir']){
    await goToStage(nav,name);
    const values=await page.evaluate(()=>({
      viewport:document.documentElement.clientWidth,
      scroll:document.documentElement.scrollWidth,
      body:document.body.scrollWidth
    }));
    expect(values.scroll,'document overflow on '+name).toBeLessThanOrEqual(values.viewport+1);
    expect(values.body,'body overflow on '+name).toBeLessThanOrEqual(values.viewport+1);
  }
  await goToStage(nav,'Inventer');
  await page.locator('#writing').fill('Une lecture engage une autre phrase.');

  const taps=await page.locator('.topbar button, .topbar summary, .journey-footer button')
    .evaluateAll(els=>els.filter(el=>el.getClientRects().length>0)
      .map(el=>({text:el.textContent?.trim(),height:el.getBoundingClientRect().height})));
  for(const target of taps) expect(target.height,target.text).toBeGreaterThanOrEqual(44);

  await page.locator('details.reader-options > summary').click();
  await expect(page.getByRole('link',{name:'Guide d’atelier'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Recommencer'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Effacer toutes mes réponses'})).toBeVisible();
});

test('first-reading packets still separate literature from later explanation',async({page})=>{
  await page.setViewportSize({width:320,height:640});
  await page.goto('/?review=register');
  await expect(page.getByRole('heading',{name:'Une lecture, avant tout commentaire'})).toBeVisible();
  await expect(page.locator('.review-text')).toBeVisible();
  const values=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth
  }));
  expect(values.scroll).toBeLessThanOrEqual(values.viewport+1);
});

test('printable facilitator guide uses only the locally hosted Source Sans 3 typographic family',async({page})=>{
  const remote:string[]=[];
  page.on('request',r=>{
    if(!r.url().startsWith('http://127.0.0.1:4177/'))remote.push(r.url());
  });
  await page.goto('/facilitator.html');
  await page.evaluate(()=>document.fonts.ready);
  for(const tag of ['h1','h2','h3','p','th','td']){
    const families=await page.locator(tag).first().evaluate(el=>getComputedStyle(el).fontFamily);
    expect(families).toMatch(/^["']?Source Sans 3/);
    expect(families).not.toMatch(/Iowan|Baskerville|Palatino/i);
  }
  await page.emulateMedia({media:'print'});
  await expect(page.locator('.controls')).toBeHidden();
  const titleFamily=await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily);
  expect(titleFamily).toContain('Source Sans 3');
  expect(remote).toEqual([]);
});
