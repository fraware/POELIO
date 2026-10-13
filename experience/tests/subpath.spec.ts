import {expect,test} from '@playwright/test';

async function openWorkshopGuide(page:import('@playwright/test').Page){
  const link=page.getByRole('link',{name:'Guide d’atelier'});
  if(!await link.isVisible())await page.locator('details.reader-options > summary').click();
  await link.click();
}

// CSP is bypassed only within this browser-test context for service-worker inspection.
test.use({bypassCSP:true});

test('complete six-stage experience, guide and reviewer paths work below /POELIO/',async({page,context})=>{
  await page.goto('./?work=register');
  await expect(page.getByRole('heading',{name:'Le Registre des clefs'})).toBeVisible();
  const guidePromise=page.waitForEvent('popup');
  await openWorkshopGuide(page);
  const guide=await guidePromise;
  await expect(guide).toHaveURL(/\/POELIO\/facilitator\.html$/);
  await expect(guide.getByRole('heading',{name:'Guide de séance — 60 minutes'})).toBeVisible();
  await guide.close();

  await page.goto('./?review=register');
  await expect(page.getByRole('heading',{name:'Une lecture, avant tout commentaire'})).toBeVisible();
  await page.goto('./?companion=permutation');
  await expect(page.getByRole('heading',{name:'Lire, comprendre, interpréter'})).toBeVisible();

  await page.goto('./?work=register');
  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  await expect(page.getByRole('heading',{name:'Les Quatre Témoins'})).toBeVisible();
  const secondGuidePromise=page.waitForEvent('popup');
  await openWorkshopGuide(page);
  const secondGuide=await secondGuidePromise;
  await expect(secondGuide).toHaveURL(/\/POELIO\/facilitator\.html$/);
  await secondGuide.close();
});

test('offline cache is scoped to the repository subpath',async({page,context})=>{
  await page.goto('./?work=register');
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:20000});
  const check=await page.evaluate(async()=>{
    const registration=await navigator.serviceWorker.getRegistration();
    const ids=(await caches.keys()).filter(key=>key.startsWith('poelio-approved-public-v1-'));
    const entries=await Promise.all(ids.map(async key=>(await (await caches.open(key)).keys()).map(x=>x.url)));
    return {scope:registration?.scope,ids,entries:entries.flat()};
  });
  expect(check.scope).toMatch(/\/POELIO\/$/);
  expect(check.ids).toHaveLength(1);
  expect(check.entries).toHaveLength(7);
  for(const url of check.entries)expect(url).toMatch(/\/POELIO\/(index\.html|facilitator\.html|source-sans-3\.woff2|source-sans-3-italic\.woff2|source-sans-license\.txt|assets\/index-[^/]+\.(js|css))$/);
  await context.setOffline(true);
  try{
    await page.goto('./?review=permutation');
    await expect(page.getByRole('heading',{name:'Une lecture, avant tout commentaire'})).toBeVisible();
    await page.goto('./facilitator.html');
    await expect(page.getByRole('heading',{name:'Guide de séance — 60 minutes'})).toBeVisible();
  }finally{await context.setOffline(false)}
});
