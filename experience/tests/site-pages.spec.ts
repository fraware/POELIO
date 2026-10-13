import {test,expect} from '@playwright/test';

test('landing page explains the project and provides a direct path to each literary work',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{level:1,name:'Lire. Explorer. Écrire.'})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Navigation principale'}).getByRole('link')).toHaveCount(4);
  await expect(page.locator('.work-entry')).toHaveCount(2);
  await page.getByRole('link',{name:'Découvrir les œuvres'}).click();
  await expect(page).toHaveURL(/\?view=works/);
  await expect(page.getByRole('heading',{level:1,name:'Les œuvres'})).toBeVisible();
  await page.locator('.work-entry').first().locator('.work-entry-link').click();
  await expect(page).toHaveURL(/\?work=register/);
  await expect(page.getByRole('heading',{level:1,name:'Le Registre des clefs'})).toBeVisible();
  await page.getByRole('link',{name:'POELIO, accueil'}).click();
  await expect(page.getByRole('heading',{level:1,name:'Lire. Explorer. Écrire.'})).toBeVisible();
});

test('French and English navigation remain coherent across page changes',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Switch to English'}).click();
  await expect(page.getByRole('heading',{level:1,name:'Read. Explore. Write.'})).toBeVisible();
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About'}).click();
  await expect(page).toHaveURL(/view=about.*lang=en/);
  await expect(page.getByRole('heading',{level:1,name:'About'})).toBeVisible();
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Works'}).click();
  await expect(page.getByRole('heading',{level:1,name:'Works'})).toBeVisible();
  await page.locator('.work-entry').last().locator('.work-entry-link').click();
  await expect(page.getByRole('heading',{level:1,name:'Les Quatre Témoins'})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Experience stages'})).toBeVisible();
});

test('site uses one local font family, no remote assets and a neutral palette',async({page})=>{
  const network:string[]=[];
  page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:4177/'))network.push(request.url());});
  await page.goto('/');
  await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
    const h=getComputedStyle(document.querySelector('h1')!);
    const body=getComputedStyle(document.body);
    const logo=getComputedStyle(document.querySelector('.brand')!);
    const localFonts=Array.from(document.fonts).filter(font=>font.family==='Source Sans 3');
    return {head:h.fontFamily,body:body.fontFamily,logo:logo.fontFamily,
      fonts:localFonts.length,loaded:localFonts.filter(x=>x.status==='loaded').length,
      background:body.backgroundColor,headline:h.color};
  });
  expect(result.head).toContain('Source Sans 3');
  expect(result.body).toContain('Source Sans 3');
  expect(result.logo).toContain('Source Sans 3');
  expect(result.fonts).toBeGreaterThanOrEqual(2);
  expect(result.loaded).toBeGreaterThanOrEqual(1);
  expect(result.background).toBe('rgb(255, 255, 255)');
  const rgb=result.headline.match(/\d+/g)!.map(Number);
  expect(rgb[0]).toBe(rgb[1]);expect(rgb[1]).toBe(rgb[2]);
  expect(network).toEqual([]);
});

test('homepage, catalogue, workshop and about reflow at narrow mobile widths',async({page})=>{
  await page.setViewportSize({width:320,height:720});
  for(const route of ['/','/?view=works','/?view=atelier','/?view=about']){
    await page.goto(route);
    const sizes=await page.evaluate(()=>({
      viewport:document.documentElement.clientWidth,
      document:document.documentElement.scrollWidth,
      body:document.body.scrollWidth
    }));
    expect(sizes.document,route).toBeLessThanOrEqual(sizes.viewport+1);
    expect(sizes.body,route).toBeLessThanOrEqual(sizes.viewport+1);
    await expect(page.getByRole('navigation',{name:'Navigation principale'})).toBeVisible();
  }
  await page.getByRole('link',{name:'Licence de la police'}).click();
  await expect(page).toHaveURL(/source-sans-license\.txt$/);
});
