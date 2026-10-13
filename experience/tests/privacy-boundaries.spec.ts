import {expect,test,type BrowserContext,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';

// Privacy tests do NOT bypass CSP. Tests use real public builds and
// ordinary browser facilities, with no mocked backend.
const SENTINEL='POELIO_PRIVATE_TEXT_73B9_NEVER_TRANSMIT';
const APP_ORIGIN='http://127.0.0.1:4177';

type NetworkTrace={foreign:string[];mutations:string[];leaks:string[]};
function watchNetwork(context:BrowserContext):NetworkTrace{
  const record:NetworkTrace={foreign:[],mutations:[],leaks:[]};
  context.on('request',request=>{
    const url=request.url();
    if(!url.startsWith(APP_ORIGIN+'/'))record.foreign.push(url);
    if(!['GET','HEAD'].includes(request.method()))
      record.mutations.push(request.method()+' '+url);
    if(url.includes(SENTINEL) || (request.postData()??'').includes(SENTINEL))
      record.leaks.push(url);
  });
  return record;
}
async function browserStores(page:Page){
  return page.evaluate(async()=>{
    const local=Object.keys(localStorage);
    const session=Object.keys(sessionStorage);
    const cachesAvailable=typeof caches!=='undefined';
    const cacheNames=cachesAvailable?await caches.keys():[];
    const urls=(await Promise.all(cacheNames.map(async name=>{
      const cache=await caches.open(name);
      return (await cache.keys()).map(key=>key.url);
    }))).flat();
    const databases=typeof indexedDB.databases==='function'
      ?(await indexedDB.databases()).map(db=>db.name):[];
    return {local,session,cacheNames,urls,databases,cookies:document.cookie,
      currentUrl:location.href};
  });
}

test('literary reading, interpretation, composition and exports send no participant data',async({page,context})=>{
  const requests=watchNetwork(context);
  await page.goto('/');
  const stages=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await stages.getByRole('button',{name:/Questionner/}).click();
  await page.locator('#initial-answer').fill(SENTINEL+' A');
  await stages.getByRole('button',{name:/Inventer/}).click();
  await page.locator('#own-rule').fill('Write only from human choices.');
  await page.locator('#writing').fill(SENTINEL+' Writer-drafted prose.');
  await stages.getByRole('button',{name:/Revenir/}).click();
  await page.locator('#revised').fill(SENTINEL+' Revision.');
  await page.waitForFunction(s=>sessionStorage.getItem('poelio:session:v1:register:writing')?.includes(s),SENTINEL);
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'Conserver mon travail'}).click();
  const file=await download;
  expect((await readFile(await file.path(),'utf8'))).toContain(SENTINEL);
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:20000});
  let stores=await browserStores(page);
  expect(stores.local).toEqual([]);
  expect(stores.databases).toEqual([]);
  expect(stores.cookies).toBe('');
  expect(stores.session.sort()).toEqual([
    'poelio:session:v1:register:initial','poelio:session:v1:register:revised',
    'poelio:session:v1:register:rule','poelio:session:v1:register:writing'
  ]);
  expect(stores.cacheNames).toHaveLength(1);
  expect(stores.urls).toHaveLength(4);
  expect(stores.urls.every(url=>url.startsWith(APP_ORIGIN+'/'))).toBe(true);
  expect(stores.urls.join(' ')).not.toContain(SENTINEL);
  expect(stores.currentUrl).not.toContain(SENTINEL);

  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  const second=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await second.getByRole('button',{name:/Questionner/}).click();
  await page.locator('#permutation-first').fill(SENTINEL+' B');
  await second.getByRole('button',{name:/Inventer/}).click();
  await page.locator('#permutation-writing').fill(SENTINEL+' Different original writing.');
  await page.waitForFunction(s=>sessionStorage.getItem('poelio:session:v1:permutation:writing')?.includes(s),SENTINEL);
  stores=await browserStores(page);
  expect(stores.local).toEqual([]);
  expect(stores.databases).toEqual([]);
  expect(stores.cookies).toBe('');
  expect(stores.session).toContain('poelio:session:v1:register:writing');
  expect(stores.session).toContain('poelio:session:v1:permutation:writing');
  expect(stores.urls.join(' ')).not.toContain(SENTINEL);
  expect(requests).toEqual({foreign:[],mutations:[],leaks:[]});
});

test('private editorial notes are memory-only, including a subsequent review pass',async({page,context})=>{
  const requests=watchNetwork(context);
  await page.goto('/?review=register');
  await page.locator('#review-initial').fill(SENTINEL+' First impression.');
  await page.getByRole('button',{name:'Continuer vers la critique éditoriale'}).click();
  await page.locator('#review-second').fill(SENTINEL+' Independent critique.');
  const stores=await browserStores(page);
  expect(stores.session).toEqual([]);
  expect(stores.local).toEqual([]);
  expect(stores.databases).toEqual([]);
  expect(stores.cookies).toBe('');
  expect(stores.urls.join(' ')).not.toContain(SENTINEL);
  expect(stores.currentUrl).not.toContain(SENTINEL);
  expect(requests).toEqual({foreign:[],mutations:[],leaks:[]});
  await page.reload();
  await expect(page.locator('#review-initial')).toHaveValue('');
  await expect(page.getByRole('heading',{name:'Deuxième lecture — avis éditorial'})).toHaveCount(0);
});

test('reset clears public writing without deleting the unrelated literary work',async({page})=>{
  await page.goto('/');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await nav.getByRole('button',{name:/Questionner/}).click();
  await page.locator('#initial-answer').fill(SENTINEL+' register');
  await page.getByRole('button',{name:/Deuxième expérience/}).click();
  const second=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await second.getByRole('button',{name:/Questionner/}).click();
  await page.locator('#permutation-first').fill(SENTINEL+' permutation');
  await page.waitForFunction(s=>sessionStorage.getItem('poelio:session:v1:permutation:initial')?.includes(s),SENTINEL);
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Recommencer'}).click();
  await page.waitForFunction(()=>sessionStorage.getItem('poelio:session:v1:permutation:initial')===null);
  const stores=await browserStores(page);
  expect(stores.session).toContain('poelio:session:v1:register:initial');
  expect(stores.session).not.toContain('poelio:session:v1:permutation:initial');
  await page.getByRole('button',{name:/Registre des clefs/}).click();
  await nav.getByRole('button',{name:/Questionner/}).click();
  await expect(page.locator('#initial-answer')).toHaveValue(SENTINEL+' register');
});

test('blocked sessionStorage still permits temporary original composition',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(window,'sessionStorage',{
      configurable:true,
      get(){throw new Error('Storage deliberately unavailable for regression test');}
    });
  });
  await page.goto('/');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await nav.getByRole('button',{name:/Inventer/}).click();
  await page.locator('#writing').fill(SENTINEL+' In-memory-only composition.');
  await expect(page.locator('#writing')).toHaveValue(SENTINEL+' In-memory-only composition.');
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'Conserver ma création'}).click();
  expect((await readFile(await (await download).path(),'utf8'))).toContain(SENTINEL);
  await page.reload();
  await nav.getByRole('button',{name:/Inventer/}).click();
  await expect(page.locator('#writing')).toHaveValue('');
});
