import {goToStage} from './stage-navigation.js';
import {expect, test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Bypass CSP only in the test harness to inject axe. The deployed site
// retains its strict CSP; this does not certify screen-reader behavior.
test.use({bypassCSP:true});

const tags = ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'];

async function audit(page: import('@playwright/test').Page, context: string): Promise<void> {
  const results=await new AxeBuilder({page}).withTags(tags).analyze();
  const details=results.violations.map(v=>({
    id:v.id,impact:v.impact,
    nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))
  }));
  expect(details, context).toEqual([]);
}

test('register stages: reading, formal exploration, comparison and invention', async ({page}) => {
  await page.goto('/?work=register');
  await audit(page,'Register initial reading');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  for (const [stage, label] of [
    ['Questionner','Register first interpretation'],
    ['Explorer','Register finite-model exploration'],
    ['Comparer','Register authored comparison'],
    ['Inventer','Register creative response'],
    ['Revenir','Register reflection']
  ] as const) {
    await goToStage(nav,stage);
    await audit(page,label);
  }
});

test('permutation reading, alternate rule, comparison and reflection', async ({page}) => {
  await page.goto('/?work=register');
  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  await audit(page,'Permutation initial reading');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await goToStage(nav,'Questionner');
  await audit(page,'Permutation first interpretation');
  await goToStage(nav,'Explorer');
  await page.locator('#order-filter').check();
  await audit(page,'Filtered permutation exploration');
  await goToStage(nav,'Comparer');
  await audit(page,'Permutation comparison');
  await goToStage(nav,'Inventer');
  await audit(page,'Permutation creative response');
  await goToStage(nav,'Revenir');
  await audit(page,'Permutation reflection');
});

test('facilitator document passes automated accessibility checks',async ({page})=>{
  await page.goto('/facilitator.html');
  await audit(page,'Facilitator print guide');
});

test('navigation returns focus to the active literary reading stage', async ({page}) => {
  await page.goto('/?work=register');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await goToStage(nav,'Questionner');
  await expect(page.locator('#stage-main')).toBeFocused();
  await expect(page.getByRole('heading',{level:1,name:'Une première impression'})).toBeVisible();
  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  const permNav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await goToStage(permNav,'Questionner');
  await expect(page.locator('#permutation-main')).toBeFocused();
});

test('document language tracks the currently mounted reading experience', async ({page}) => {
  await page.goto('/?work=register');
  await page.getByRole('button',{name:'Switch to English'}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.getByRole('button',{name:/Second experience/}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.getByRole('button',{name:'Passer en français'}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','fr');
  await page.getByRole('button',{name:/Registre des clefs/}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','fr');
  await expect(page.getByRole('heading',{name:'Le Registre des clefs'})).toBeVisible();
});
