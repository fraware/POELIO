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
  await page.goto('/');
  const stages=['Lire','Questionner','Explorer','Comparer','Inventer','Revenir'];
  const first=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  for(const stage of stages){
    await first.getByRole('button',{name:new RegExp(stage)}).click();
    await noHorizontalOverflow(page,'Register stage '+stage);
  }
  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  const second=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  for(const stage of stages){
    await second.getByRole('button',{name:new RegExp(stage)}).click();
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

test('keyboard-only entry preserves meaningful skip link and focus progression',async({page})=>{
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('a.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#stage-main')).toBeFocused();
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await nav.getByRole('button',{name:/Questionner/}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#stage-main')).toBeFocused();
  await expect(nav.getByRole('button',{name:/Questionner/})).toHaveAttribute('aria-current','step');
  await nav.getByRole('button',{name:/Inventer/}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#stage-main')).toBeFocused();
  await expect(page.locator('#writing')).toBeVisible();
});

test('forced-colors and reduced-motion preferences preserve visible keyboard focus',async({page})=>{
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await page.goto('/');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  const question=nav.getByRole('button',{name:/Questionner/});
  await question.focus();
  const focus=await question.evaluate((el)=>{
    const style=getComputedStyle(el);
    return {outlineStyle:style.outlineStyle,outlineWidth:style.outlineWidth};
  });
  expect(focus.outlineStyle).not.toBe('none');
  expect(parseFloat(focus.outlineWidth)).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('Enter');
  await expect(page.locator('#stage-main')).toBeFocused();
  await expect(question).toHaveAttribute('aria-current','step');
});
