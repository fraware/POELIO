import {goToStage,expectStageActive} from './stage-navigation.js';
import {expect,test} from '@playwright/test';

/**
 * 320 CSS pixels approximate the reflow width of a 1280px desktop viewport
 * at 400% zoom. Browser zoom behavior and assistive technology still need
 * manual verification; these tests only enforce measurable DOM behavior.
 */
async function noHorizontalOverflow(page:import('@playwright/test').Page,scenario:string){
  const widths=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    document:document.documentElement.scrollWidth,
    body:document.body.scrollWidth
  }));
  expect(widths.document,scenario).toBeLessThanOrEqual(widths.viewport+1);
  expect(widths.body,scenario).toBeLessThanOrEqual(widths.viewport+1);
}

test('both six-stage works and the literary-only packets reflow at 320 CSS pixels',async({page})=>{
  await page.setViewportSize({width:320,height:640});
  await page.goto('/?work=register');
  const stages=['Lire','Questionner','Explorer','Comparer','Inventer','Revenir'];
  const first=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  for(const stage of stages){
    await goToStage(first,stage);
    await noHorizontalOverflow(page,'Register stage '+stage);
  }
  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  const second=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  for(const stage of stages){
    await goToStage(second,stage);
    await noHorizontalOverflow(page,'Permutation stage '+stage);
  }
  for(const route of [
    '/?review=register','/?review=permutation',
    '/?companion=register','/?companion=permutation','/facilitator.html'
  ]){
    await page.goto(route);
    await noHorizontalOverflow(page,'Static reader '+route);
  }
});

test('keyboard-only entry preserves skip-link focus and navigates both layouts',async({page})=>{
  await page.goto('/?work=register');
  await page.keyboard.press('Tab');
  await expect(page.locator('a.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#stage-main')).toBeFocused();

  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  const select=nav.locator('.mobile-stage-select');
  if(await select.isVisible()){
    await select.focus();
    await page.keyboard.press('ArrowDown');
    await expectStageActive(nav,'Questionner');
    await expect(page.locator('#stage-main')).toBeFocused();
    await goToStage(nav,'Inventer');
  } else {
    await nav.getByRole('button',{name:/Questionner/}).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#stage-main')).toBeFocused();
    await expectStageActive(nav,'Questionner');
    await nav.getByRole('button',{name:/Inventer/}).focus();
    await page.keyboard.press('Enter');
  }
  await expect(page.locator('#stage-main')).toBeFocused();
  await expect(page.locator('#writing')).toBeVisible();
});

test('forced-colors and reduced-motion preferences preserve visible keyboard focus',async({page})=>{
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await page.goto('/?work=register');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  const select=nav.locator('.mobile-stage-select');
  const mobile=await select.isVisible();
  const control=mobile?select:nav.getByRole('button',{name:/Questionner/});
  await control.focus();
  const focus=await control.evaluate(el=>{
    const style=getComputedStyle(el);
    return {outlineStyle:style.outlineStyle,outlineWidth:style.outlineWidth};
  });
  expect(focus.outlineStyle).not.toBe('none');
  expect(parseFloat(focus.outlineWidth)).toBeGreaterThanOrEqual(2);
  await page.keyboard.press(mobile?'ArrowDown':'Enter');
  await expect(page.locator('#stage-main')).toBeFocused();
  await expectStageActive(nav,'Questionner');
});
