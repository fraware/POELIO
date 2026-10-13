import {test, expect} from '@playwright/test';

/**
 * Structural and responsive design regressions for the editorial interface.
 *
 * Computed-style checks are not substitutes for visual review, screen-reader
 * testing, contrast measurements, or independent literary editorial judgment.
 */
test('both public works use the same literary masthead and readable paper', async ({page}) => {
  await page.goto('/');
  const masthead = page.locator('.topbar');
  await expect(masthead).toBeVisible();
  await expect(page.locator('.brand')).toContainText('POELIO');
  await expect(page.locator('.manuscript')).toHaveCount(1);

  const tokens = await page.evaluate(() => ({
    masthead: getComputedStyle(document.querySelector('.topbar')!).backgroundColor,
    heading: getComputedStyle(document.querySelector('h1')!).fontFamily,
    manuscript: getComputedStyle(document.querySelector('.manuscript')!).backgroundColor,
    meta: document.querySelector('meta[name="theme-color"]')?.getAttribute('content')
  }));
  expect(tokens.masthead).toBe('rgb(25, 58, 49)');
  expect(tokens.heading).toMatch(/Georgia/i);
  expect(tokens.manuscript).toBe('rgb(255, 253, 250)');
  expect(tokens.meta).toBe('#193a31');

  await page.getByRole('button', {name:/Deuxième expérience/}).click();
  await expect(page.locator('.brand')).toContainText('POELIO');
  await expect(page.locator('.edition-flag')).toContainText('Démonstration publique originale');
  await expect(page.locator('.manuscript')).toHaveCount(1);
});

test('mobile navigation, reading and writing affordances remain usable at 320 pixels', async ({page}) => {
  await page.setViewportSize({width:320,height:640});
  await page.goto('/');
  const steps=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await expect(steps.getByRole('button',{name:/Lire/})).toBeVisible();

  for(const target of ['Questionner','Explorer','Comparer','Inventer','Revenir']){
    await steps.getByRole('button',{name:new RegExp(target)}).click();
    await expect(steps.getByRole('button',{name:new RegExp(target)})).toHaveAttribute('aria-current','step');
    const {viewport,scroll}=await page.evaluate(()=>({
      viewport:document.documentElement.clientWidth,
      scroll:document.documentElement.scrollWidth
    }));
    expect(scroll,target+' overflow').toBeLessThanOrEqual(viewport+1);
  }
  await steps.getByRole('button',{name:/Inventer/}).click();
  const input=page.locator('#writing');
  await expect(input).toBeVisible();
  await input.fill('Une réponse que je conserve moi-même.');

  const smallTargets=await page.locator('.topbar button, .topbar a.text-button, .journey-footer button')
    .evaluateAll(elements=>elements.filter(el=>getComputedStyle(el).display!=='none')
      .map(el=>({name:el.textContent?.trim(),height:el.getBoundingClientRect().height})));
  for(const target of smallTargets){
    expect(target.height, 'Tap target: '+target.name).toBeGreaterThanOrEqual(44);
  }
});

test('editorial reading packets retain first-reading separation and narrow reflow', async ({page}) => {
  await page.setViewportSize({width:320,height:640});
  await page.goto('/?review=register');
  await expect(page.locator('.review-text')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Une lecture, avant tout commentaire'})).toBeVisible();
  const dimensions=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    page:document.documentElement.scrollWidth
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport+1);
});
