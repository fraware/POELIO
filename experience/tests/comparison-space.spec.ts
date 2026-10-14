import {expect,test} from '@playwright/test';

for(const work of ['register','permutation'] as const){
  test(work+' opens on the literary work without instructions about its mechanism',async({page})=>{
    await page.goto('/?work='+work);
    await expect(page.locator('.main-content > .lede')).toHaveCount(0);
    await expect(page.locator('.main-content .manuscript')).toBeVisible();
  });

  test(work+' comparison adjusts by keyboard and stacks cleanly on mobile',async({page,isMobile})=>{
    await page.goto('/?work='+work);
    await page.getByRole('navigation',{name:'Étapes de l’expérience'})
      .getByRole('button',{name:/Comparer/}).click();

    const comparison=page.locator('.comparison-space .comparison');
    await expect(comparison.locator('article.manuscript')).toHaveCount(2);
    if(!isMobile){
      const slider=page.getByRole('slider',{name:'Largeur du premier texte'});
      await expect(slider).toHaveValue('50');
      const initial=await comparison.evaluate(el=>getComputedStyle(el).gridTemplateColumns);
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await expect(slider).toHaveValue('55');
      const adjusted=await comparison.evaluate(el=>getComputedStyle(el).gridTemplateColumns);
      expect(adjusted).not.toEqual(initial);
    }

    await page.setViewportSize({width:375,height:760});
    await expect(page.locator('.comparison-adjust')).toBeHidden();
    const layout=await page.evaluate(()=>{
      const element=document.querySelector<HTMLElement>('.comparison');
      if(!element)throw new Error('Comparison missing');
      return {
        columns:getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
        scroll:document.documentElement.scrollWidth,
        viewport:document.documentElement.clientWidth
      };
    });
    expect(layout.columns).toBe(1);
    expect(layout.scroll).toBeLessThanOrEqual(layout.viewport+1);
    await expect(comparison.locator('article.manuscript')).toHaveCount(2);
  });
}
