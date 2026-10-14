import {goToStage} from './stage-navigation.js';
import {expect,test,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const SENTINEL='POELIO_READER_LOCAL_8B53_NEVER_UPLOAD';

async function openStage(page:Page,stage:'Inventer'|'Revenir'):Promise<void>{
  await goToStage(page.getByRole('navigation',{name:'Étapes de l’expérience'}),stage);
}

for(const work of ['register','permutation'] as const){
  const writingId=work==='register'?'#writing':'#permutation-writing';
  const revisedId=work==='register'?'#revised':'#permutation-revised';

  test(work+' exposes TXT export and locally restorable JSON in writing and rereading',async({page})=>{
    const leaked:string[]=[];
    page.on('request',request=>{
      if(!['GET','HEAD'].includes(request.method())||request.url().includes(SENTINEL))
        leaked.push(request.method()+' '+request.url());
    });
    await page.goto('/?work='+work);
    await openStage(page,'Inventer');
    const editor=page.locator(writingId);
    await editor.fill('Un texte écrit ici. '+SENTINEL);
    await expect(editor).toHaveAttribute('maxlength','150000');
    await expect(page.locator('.reader-writing-count')).toContainText('5 mots');

    const backupTrigger=page.getByRole('button',{name:'Sauvegarder ou restaurer (JSON)'});
    await backupTrigger.click();
    const heading=page.getByRole('heading',{name:'Sauvegarder mon travail'});
    await expect(heading).toBeFocused();

    const download=page.waitForEvent('download');
    await page.getByRole('button',{name:'Exporter la sauvegarde JSON'}).click();
    const file=await download;
    const json=JSON.parse(await readFile(await file.path(),'utf8'));
    expect(json.work).toBe(work);
    expect(json.drafts.writing).toContain(SENTINEL);
    await page.getByRole('button',{name:'Fermer',exact:true}).click();
    await expect(backupTrigger).toBeFocused();

    const txtDownload=page.waitForEvent('download');
    await page.getByRole('button',{name:'Exporter le texte (TXT)'}).click();
    const txt=await txtDownload;
    expect(await readFile(await txt.path(),'utf8')).toContain(SENTINEL);

    await openStage(page,'Revenir');
    await page.locator(revisedId).fill('Nouvelle lecture '+SENTINEL);
    const reflectBackup=page.getByRole('button',{name:'Sauvegarder ou restaurer (JSON)'});
    await reflectBackup.click();
    const again=page.waitForEvent('download');
    await page.getByRole('button',{name:'Exporter la sauvegarde JSON'}).click();
    const latest=await again;
    expect(JSON.parse(await readFile(await latest.path(),'utf8')).drafts.revised)
      .toBe('Nouvelle lecture '+SENTINEL);
    await page.getByRole('button',{name:'Fermer',exact:true}).click();
    await expect(reflectBackup).toBeFocused();

    await openStage(page,'Inventer');
    await expect(page.locator(writingId)).toHaveValue('Un texte écrit ici. '+SENTINEL);
    expect(leaked).toEqual([]);
  });

  test(work+' writing controls reflow at 320px and menu returns focus to Options',async({page})=>{
    await page.setViewportSize({width:320,height:720});
    await page.goto('/?work='+work);
    await openStage(page,'Inventer');
    const dimensions=await page.evaluate(()=>({
      document:document.documentElement.scrollWidth,
      viewport:document.documentElement.clientWidth
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport+1);
    const archive=page.locator('.reader-archive');
    await expect(archive.getByRole('button')).toHaveCount(2);
    for(const button of await archive.getByRole('button').all()){
      const rect=await button.boundingBox();
      expect(rect).not.toBeNull();
      expect(rect!.height).toBeGreaterThanOrEqual(44);
    }

    const summary=page.locator('details.reader-options > summary');
    await summary.click();
    await page.getByRole('button',{name:'Sauvegarder ou restaurer',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Sauvegarder mon travail'})).toBeFocused();
    await page.getByRole('button',{name:'Fermer',exact:true}).click();
    await expect(summary).toBeFocused();
  });
}
