import {expect,type Locator} from '@playwright/test';

const STAGE_IDS:Record<string,string>={
  Lire:'read',Read:'read',Questionner:'question',Question:'question',
  Explorer:'explore',Explore:'explore',Comparer:'compare',Compare:'compare',
  Inventer:'invent',Invent:'invent',Revenir:'reflect',Reflect:'reflect'
};

function idFor(label:string):string{
  const id=STAGE_IDS[label];
  if(!id)throw new Error('Unknown literary stage '+label);
  return id;
}

/** Exercise the visible navigation mechanism, desktop buttons or native mobile select. */
export async function goToStage(nav:Locator,label:string):Promise<void>{
  const select=nav.locator('.mobile-stage-select');
  if(await select.isVisible())await select.selectOption(idFor(label));
  else await nav.getByRole('button',{name:new RegExp(label)}).click();
}

export async function expectSixStages(nav:Locator):Promise<void>{
  const select=nav.locator('.mobile-stage-select');
  if(await select.isVisible())await expect(select.locator('option')).toHaveCount(6);
  else await expect(nav.getByRole('button')).toHaveCount(6);
}

export async function expectStageReachable(nav:Locator,label:string):Promise<void>{
  const select=nav.locator('.mobile-stage-select');
  if(await select.isVisible())
    await expect(select.locator('option[value="'+idFor(label)+'"]')).toHaveCount(1);
  else await expect(nav.getByRole('button',{name:new RegExp(label)})).toBeVisible();
}

export async function expectStageActive(nav:Locator,label:string):Promise<void>{
  const select=nav.locator('.mobile-stage-select');
  if(await select.isVisible())await expect(select).toHaveValue(idFor(label));
  else await expect(nav.getByRole('button',{name:new RegExp(label)})).toHaveAttribute('aria-current','step');
}
