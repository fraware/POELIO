import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {demoEpisode} from '../src/episode.js';
import {ORIGINAL_ORDER, COUNTER_ORDER, passagesForOrder} from '../src/permutation.js';

test.use({bypassCSP:true});

for(const work of ['register','permutation'] as const){
  test('first-reading packet has exact source prose, no rule reveal: '+work, async ({page})=>{
    await page.goto('/?review='+work);
    const expected=work==='register'
      ? demoEpisode.realizations[0].passages.map(p=>p.text)
      : passagesForOrder(ORIGINAL_ORDER).map(p=>p.text);
    const actual=await page.locator('.review-text p').allTextContents();
    expect(actual).toEqual(expected);
    await expect(page.getByRole('heading',{name:'Une lecture, avant tout commentaire'})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Deuxième lecture — avis éditorial'})).toHaveCount(0);
    await expect(page.getByText('Sept alternances parfaites')).toHaveCount(0);
    await expect(page.getByText('quatre fragments sont déjà écrits')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('lang','fr');
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.map(x=>x.id)).toEqual([]);
    await page.locator('#review-initial').fill('Lecture personnelle : la question persiste.');
    await page.getByRole('button',{name:'Continuer vers la critique éditoriale'}).click();
    await expect(page.getByRole('heading',{name:'Deuxième lecture — avis éditorial'})).toBeFocused();
    await page.locator('#review-second').fill('Une image réussie, mais une transition faible.');
    const download=page.waitForEvent('download');
    await page.getByRole('button',{name:'Exporter mon avis en fichier texte'}).click();
    expect((await download).suggestedFilename()).toBe('poelio-note-de-lecture-'+work+'.txt');
    await page.reload();
    await expect(page.locator('#review-initial')).toHaveValue('');
    await expect(page.getByRole('heading',{name:'Deuxième lecture — avis éditorial'})).toHaveCount(0);
  });

  test('static companion uses approved source and states scope: '+work,async({page})=>{
    await page.goto('/?companion='+work);
    const intro=work==='register'
      ? demoEpisode.realizations[0].passages.map(p=>p.text)
      : passagesForOrder(ORIGINAL_ORDER).map(p=>p.text);
    const second=work==='register'
      ? demoEpisode.realizations[1].passages.map(p=>p.text)
      : passagesForOrder(COUNTER_ORDER).map(p=>p.text);
    const textBlocks=await page.locator('.review-text').allTextContents();
    expect(textBlocks).toHaveLength(2);
    for(const passage of intro)expect(textBlocks[0]).toContain(passage);
    for(const passage of second)expect(textBlocks[1]).toContain(passage);
    await expect(page.getByRole('heading',{name:'Lire, comprendre, interpréter'})).toBeVisible();
    await expect(page.getByText('Cette édition explicative présente un texte littéraire')).toBeVisible();
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.map(x=>x.id)).toEqual([]);
  });
}

test('review packet never posts a response to a server',async({page})=>{
  const unexpected:string[]=[];
  page.on('request',req=>{
    if(!['GET','HEAD'].includes(req.method()))unexpected.push(req.method()+' '+req.url());
  });
  await page.goto('/?review=register');
  await page.locator('#review-initial').fill('Sensitive reviewer notes stay here.');
  await page.getByRole('button',{name:'Continuer vers la critique éditoriale'}).click();
  await page.locator('#review-second').fill('Another private observation.');
  expect(unexpected).toEqual([]);
});
