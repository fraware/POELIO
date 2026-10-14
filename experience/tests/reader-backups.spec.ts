import {expect,test,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const SENTINEL='POELIO_PORTABLE_LOCAL_87EC_NEVER_SEND';

async function openBackup(page:Page):Promise<void>{
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Sauvegarder ou restaurer'}).click();
  await expect(page.getByRole('heading',{name:'Sauvegarder mon travail'})).toBeVisible();
}
async function saveBackup(page:Page):Promise<{text:string;name:string}>{
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'Exporter la sauvegarde JSON'}).click();
  const file=await download;
  return {text:await readFile(await file.path(),'utf8'),name:file.suggestedFilename()};
}
async function uploadBackup(page:Page,text:string):Promise<void>{
  await page.locator('input[type=file][id^=backup-file]').setInputFiles({
    name:'poelio-local.json',mimeType:'application/json',buffer:Buffer.from(text,'utf8')
  });
}

test('register JSON backup restores writing and chosen eight-day arrangement, no server',async({page,context})=>{
  const requests:string[]=[];
  context.on('request',request=>{
    if(!['GET','HEAD'].includes(request.method()) || request.url().includes(SENTINEL))
      requests.push(request.method()+' '+request.url());
  });
  await page.goto('/?work=register');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await nav.getByRole('button',{name:/Questionner/}).click();
  await page.locator('#initial-answer').fill(SENTINEL+' première lecture\nΩ');
  await nav.getByRole('button',{name:/Inventer/}).click();
  await page.locator('#own-rule').fill('Une règle inédite');
  await page.locator('#writing').fill('Premier vers\n\nSecond vers 😀');
  await nav.getByRole('button',{name:/Explorer/}).click();
  await page.locator('.day-toggle[data-day-index="7"]').click();
  const chosen=await page.locator('.day-toggle strong').allTextContents();
  await openBackup(page);
  const backup=await saveBackup(page);
  expect(backup.name).toBe('poelio-register-backup-v1.json');
  const json=JSON.parse(backup.text);
  expect(json.version).toBe(1);
  expect(json.work).toBe('register');
  expect(json.sourceRevision).toMatch(/#[a-f0-9]{40}$/);
  expect(json.configuration.kind).toBe('register');
  expect(json.drafts.initial).toContain(SENTINEL);
  expect(backup.text).not.toContain('La salle des clefs');
  await page.getByRole('button',{name:'Fermer',exact:true}).click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Recommencer'}).click();
  await nav.getByRole('button',{name:/Explorer/}).click();
  expect(await page.locator('.day-toggle strong').allTextContents()).not.toEqual(chosen);
  await openBackup(page);
  await uploadBackup(page,backup.text);
  await expect(page.getByText('Sauvegarde vérifiée.',{exact:false})).toBeVisible();
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Remplacer cette œuvre'}).click();
  await expect(page.getByText('Sauvegarde restaurée', {exact:false})).toBeVisible();
  expect(await page.locator('.day-toggle strong').allTextContents()).toEqual(chosen);
  await nav.getByRole('button',{name:/Questionner/}).click();
  await expect(page.locator('#initial-answer')).toHaveValue(SENTINEL+' première lecture\nΩ');
  await nav.getByRole('button',{name:/Inventer/}).click();
  await expect(page.locator('#writing')).toHaveValue('Premier vers\n\nSecond vers 😀');
  await page.waitForFunction(s=>sessionStorage.getItem('poelio:session:v1:register:initial')?.includes(s),SENTINEL);
  expect(requests).toEqual([]);
  expect(await page.evaluate(()=>Object.keys(localStorage))).toEqual([]);
  expect(await page.evaluate(async()=>typeof indexedDB.databases==='function'?
    (await indexedDB.databases()).length:0)).toBe(0);
});

test('merge never overwrites existing responses or arrangement, replacement asks first',async({page})=>{
  await page.goto('/?work=register');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await nav.getByRole('button',{name:/Questionner/}).click();
  await page.locator('#initial-answer').fill('Réponse importée');
  await nav.getByRole('button',{name:/Inventer/}).click();
  await page.locator('#writing').fill('Poème venu du fichier');
  await nav.getByRole('button',{name:/Explorer/}).click();
  await openBackup(page);
  const saved=await saveBackup(page);
  await page.getByRole('button',{name:'Fermer',exact:true}).click();
  await nav.getByRole('button',{name:/Questionner/}).click();
  await page.locator('#initial-answer').fill('Texte actuel à conserver');
  await nav.getByRole('button',{name:/Inventer/}).click();
  await page.locator('#writing').fill('');
  await nav.getByRole('button',{name:/Explorer/}).click();
  await page.locator('.day-toggle[data-day-index="3"]').click();
  const before=await page.locator('.day-toggle strong').allTextContents();
  await openBackup(page);
  await uploadBackup(page,saved.text);
  await page.getByRole('button',{name:'Fusionner sans écraser'}).click();
  expect(await page.locator('.day-toggle strong').allTextContents()).toEqual(before);
  await nav.getByRole('button',{name:/Questionner/}).click();
  await expect(page.locator('#initial-answer')).toHaveValue('Texte actuel à conserver');
  await nav.getByRole('button',{name:/Inventer/}).click();
  await expect(page.locator('#writing')).toHaveValue('Poème venu du fichier');
  await uploadBackup(page,saved.text);
  page.once('dialog',dialog=>dialog.dismiss());
  await page.getByRole('button',{name:'Remplacer cette œuvre'}).click();
  await nav.getByRole('button',{name:/Questionner/}).click();
  await expect(page.locator('#initial-answer')).toHaveValue('Texte actuel à conserver');
  await nav.getByRole('button',{name:/Explorer/}).click();
  expect(await page.locator('.day-toggle strong').allTextContents()).toEqual(before);
});

test('permutation backup restores chosen order and active precedence filter',async({page})=>{
  await page.goto('/?work=permutation');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await nav.getByRole('button',{name:/Explorer/}).click();
  await page.locator('#permutation-select').selectOption('question/bell/door/letter');
  await page.locator('#order-filter').check();
  await nav.getByRole('button',{name:/Inventer/}).click();
  await page.locator('#permutation-writing').fill(SENTINEL+' fragment original');
  await openBackup(page);
  const saved=await saveBackup(page);
  expect(saved.name).toBe('poelio-permutation-backup-v1.json');
  const backup=JSON.parse(saved.text);
  expect(backup.configuration).toEqual({
    kind:'permutation',order:['question','bell','door','letter'],limited:true
  });
  await page.getByRole('button',{name:'Fermer',exact:true}).click();
  await nav.getByRole('button',{name:/Explorer/}).click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Recommencer'}).click();
  await openBackup(page);
  await uploadBackup(page,saved.text);
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Remplacer cette œuvre'}).click();
  await nav.getByRole('button',{name:/Explorer/}).click();
  await expect(page.locator('#order-filter')).toBeChecked();
  await expect(page.locator('#permutation-select')).toHaveValue('question/bell/door/letter');
  await nav.getByRole('button',{name:/Inventer/}).click();
  await expect(page.locator('#permutation-writing')).toHaveValue(SENTINEL+' fragment original');
});

test('corrupt and cross-work imports are refused with no mutation',async({page})=>{
  await page.goto('/?work=register');
  const nav=page.getByRole('navigation',{name:'Étapes de l’expérience'});
  await nav.getByRole('button',{name:/Questionner/}).click();
  await page.locator('#initial-answer').fill('Texte à conserver');
  await openBackup(page);
  const saved=await saveBackup(page);
  for(const mutate of [
    (v:any)=>{v.work='permutation';},
    (v:any)=>{v.version=99;},
    (v:any)=>{v.sourceRevision='unapproved';},
    (v:any)=>{v.drafts.initial={evil:'nested'};},
    (v:any)=>{v.configuration.values[0]='Z';},
    (v:any)=>{v.unexpected='<script>';},
  ]){
    const data=JSON.parse(saved.text);mutate(data);
    await uploadBackup(page,JSON.stringify(data));
    await expect(page.getByRole('alert')).toContainText('Fichier refusé');
    await expect(page.getByRole('button',{name:'Remplacer cette œuvre'})).toHaveCount(0);
  }
  await page.locator('input[type=file][id^=backup-file]').setInputFiles({
    name:'bad.json',mimeType:'application/json',buffer:Buffer.from([0xff,0xfe,0xfd])
  });
  await expect(page.getByRole('alert')).toContainText('Fichier refusé');
  await page.locator('input[type=file][id^=backup-file]').setInputFiles({
    name:'large.json',mimeType:'application/json',buffer:Buffer.alloc(512*1024+1,97)
  });
  await expect(page.getByRole('alert')).toContainText('Fichier refusé');
  await nav.getByRole('button',{name:/Questionner/}).click();
  await expect(page.locator('#initial-answer')).toHaveValue('Texte à conserver');
});

test('at 320 pixels the backup panel reflows with English controls and blocked storage',async({page})=>{
  await page.setViewportSize({width:320,height:680});
  await page.addInitScript(()=>{
    Object.defineProperty(window,'sessionStorage',{configurable:true,
      get(){throw new Error('Storage intentionally blocked');}});
  });
  await page.goto('/?work=register');
  await page.getByRole('button',{name:'Switch to English'}).click();
  await page.getByRole('navigation',{name:'Experience stages'})
    .getByRole('button',{name:/Invent/}).click();
  await page.locator('#writing').fill(SENTINEL+' memory only');
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Back up or restore'}).click();
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export JSON backup'}).click();
  const file=await download;
  const text=await readFile(await file.path(),'utf8');
  expect(text).toContain(SENTINEL);
  const w=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(w.scroll).toBeLessThanOrEqual(w.viewport+1);
  await page.reload();
  await page.getByRole('navigation',{name:'Experience stages'})
    .getByRole('button',{name:/Invent/}).click();
  await expect(page.locator('#writing')).toHaveValue('');
});
