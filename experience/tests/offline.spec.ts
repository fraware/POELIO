import {expect,test} from '@playwright/test';

test('previously loaded approved literary readings and facilitator survive disconnection',async({page,context})=>{
  const failures:string[]=[];
  page.on('pageerror',e=>failures.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error')failures.push('console: '+m.text())});
  page.on('requestfailed',r=>failures.push('request: '+r.url()+' '+r.failure()?.errorText));
  async function assertOfflineHeading(name:string):Promise<void>{
    try {
      await expect(page.getByRole('heading',{name})).toBeVisible({timeout:4000});
    }catch(err){
      const diagnostics=await page.evaluate(async()=>{
        let cache:any=[];
        try{cache=(await caches.keys()).filter(k=>k.startsWith('poelio-approved-public-v1-'));}catch(e){cache=String(e)}
        return {url:location.href,body:document.body?.innerText?.slice(0,800),
          title:document.title,controller:navigator.serviceWorker?.controller?.scriptURL,
          cache,navigatorOnline:navigator.onLine,
          scripts:[...document.querySelectorAll('script[src]')].map(x=>x.getAttribute('src'))};
      }).catch(e=>({evaluationError:String(e)}));
      console.log('OFFLINE_READ_DIAGNOSTIC',JSON.stringify({expected:name,diagnostics,failures}));
      throw err;
    }
  }
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Le Registre des clefs'})).toBeVisible();
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
    await assertOfflineHeading('Une lecture, avant tout commentaire');
    await page.goto('/?companion=permutation');
    await assertOfflineHeading('Lire, comprendre, interpréter');
    await page.goto('/facilitator.html');
    await expect(page.getByRole('heading',{name:'Guide de séance — 60 minutes'})).toBeVisible();
    await page.goto('/');
    await page.getByRole('button',{name:/Deuxième expérience/}).click();
    await expect(page.getByRole('heading',{name:'Les Quatre Témoins'})).toBeVisible();
  } finally {await context.setOffline(false);}
});
