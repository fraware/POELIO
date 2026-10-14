import {expect,test} from '@playwright/test';
import {readFile} from 'node:fs/promises';

for(const [work,count] of [['register',3],['permutation',4]] as const){
  test('first-reading '+work+' conceals the mechanism until the reader chooses to continue',async({page})=>{
    await page.goto('/?review='+work);
    const reader=page.locator('#review-main');
    await expect(reader.locator('.review-text p')).toHaveCount(count);
    await expect(page.getByRole('heading',{name:'Une lecture, avant tout commentaire'})).toBeVisible();
    await expect(reader.locator('.review-second')).toHaveCount(0);
    await expect(reader.locator('.review-explanation')).toHaveCount(0);
    await expect(reader.getByRole('link')).toHaveCount(0);
    const preReveal=await reader.innerText();
    expect(preReveal).not.toMatch(/256|24 permutations|14 réparations|règle de précédence|modèle fini|contrainte de relais|alternances parfaites/iu);
    await expect(page.getByRole('button',{name:'Continuer vers la critique éditoriale'})).toBeVisible();

    const sentinel='NOTE_LOCALE_DE_LECTEUR_TEST_81C9';
    const requests:string[]=[];
    page.on('request',request=>{
      if(!['GET','HEAD'].includes(request.method())||request.url().includes(sentinel))
        requests.push(request.method()+' '+request.url());
    });
    await page.locator('#review-initial').fill(sentinel+' première impression.');
    await page.getByRole('button',{name:'Continuer vers la critique éditoriale'}).click();
    await expect(page.getByRole('heading',{name:'Deuxième lecture — avis éditorial'})).toBeFocused();
    await expect(reader.locator('.review-explanation')).toHaveCount(0);
    await page.locator('#review-second').fill('Une réserve sur le rythme.');

    const download=page.waitForEvent('download');
    await page.getByRole('button',{name:'Exporter mon avis en fichier texte'}).click();
    const file=await download;
    const txt=await readFile(await file.path(),'utf8');
    expect(txt).toContain(sentinel);
    expect(txt).toContain('Une réserve sur le rythme.');
    expect(requests).toEqual([]);
    expect(await page.evaluate(()=>Object.keys(localStorage))).toEqual([]);
    expect(await page.evaluate(()=>Object.keys(sessionStorage))).toEqual([]);
    await page.reload();
    await expect(page.locator('#review-initial')).toHaveValue('');
    await expect(reader.locator('.review-second')).toHaveCount(0);
  });

  test('explicit explanatory companion '+work+' stays a separate route',async({page})=>{
    await page.goto('/?companion='+work);
    await expect(page.locator('.review-explanation')).toBeVisible();
    await expect(page.locator('.review-text')).toHaveCount(2);
    await expect(page.getByRole('heading',{name:'Lire, comprendre, interpréter'})).toBeVisible();
  });
}
