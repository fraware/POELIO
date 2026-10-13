import {expect,test} from '@playwright/test';

test('previously loaded approved literary readings and facilitator survive disconnection',async({page,context})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Avant la règle, le récit.'})).toBeVisible();
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:20000});
  const urls=await page.evaluate(async()=>{
    const keys=(await caches.keys()).filter(x=>x.startsWith('poelio-approved-public-v1-'));
    const all=(await Promise.all(keys.map(async key=>(await (await caches.open(key)).keys()).map(r=>r.url)))).flat();
    return {keys,all};
  });
  expect(urls.keys).toHaveLength(1);
  expect(urls.all).toHaveLength(4);
  for(const url of urls.all)expect(url).not.toMatch(/catalog\.json|private-runtime|reading_\d\d\.md/i);
  await context.setOffline(true);
  try {
    await page.goto('/?review=register');
    await expect(page.getByRole('heading',{name:'Une lecture, avant tout commentaire'})).toBeVisible();
    await page.goto('/?companion=permutation');
    await expect(page.getByRole('heading',{name:'Lire, comprendre, interpréter'})).toBeVisible();
    await page.goto('/facilitator.html');
    await expect(page.getByRole('heading',{name:'Guide de séance — 60 minutes'})).toBeVisible();
    await page.goto('/');
    await page.getByRole('button',{name:/Deuxième expérience/}).click();
    await expect(page.getByRole('heading',{name:'La porte était ouverte.'})).toBeVisible();
  } finally {await context.setOffline(false);}
});
