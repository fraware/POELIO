import {expect,test} from '@playwright/test';
import {goToStage} from './stage-navigation.js';

/** Session Storage's opener-copy semantics are a browser boundary, not a POELIO feature. */
test('an opener-created tab initially copies drafts, and handoff in one tab cannot erase the copy',async({page})=>{
  await page.goto('/?work=register');
  await goToStage(page.getByRole('navigation',{name:'Étapes de l’expérience'}),'Questionner');
  const sentinel='COPIED_TAB_WARNING_TEST_618D';
  await page.locator('#initial-answer').fill(sentinel);
  await page.waitForFunction(v=>sessionStorage.getItem('poelio:session:v1:register:initial')===v,sentinel);
  const popupEvent=page.waitForEvent('popup');
  await page.evaluate(()=>window.open(location.href,'_blank'));
  const copy=await popupEvent;
  await copy.waitForLoadState();
  const copyValue=await copy.evaluate(()=>sessionStorage.getItem('poelio:session:v1:register:initial'));
  expect(copyValue).toBe(sentinel);
  await goToStage(copy.getByRole('navigation',{name:'Étapes de l’expérience'}),'Questionner');
  await expect(copy.locator('#initial-answer')).toHaveValue(sentinel);

  let confirmation='';
  page.once('dialog',async dialog=>{
    confirmation=dialog.message();
    await dialog.accept();
  });
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Effacer toutes mes réponses'}).click();
  await expect(page.getByRole('heading',{name:'Le Registre des clefs'})).toBeVisible();
  expect(confirmation).toContain('Les autres onglets et les fichiers déjà exportés ne seront pas effacés.');
  expect(await page.evaluate(()=>sessionStorage.getItem('poelio:session:v1:register:initial'))).toBeNull();
  expect(await copy.evaluate(()=>sessionStorage.getItem('poelio:session:v1:register:initial'))).toBe(sentinel);
  await expect(copy.locator('#initial-answer')).toHaveValue(sentinel);
  await copy.close();
});

test('declined English handoff warns clearly about other tabs and retains writing',async({page})=>{
  await page.goto('/?work=register&lang=en');
  await goToStage(page.getByRole('navigation',{name:'Experience stages'}),'Question');
  await page.locator('#initial-answer').fill('Do not erase this draft');
  let confirmation='';
  page.once('dialog',async dialog=>{
    confirmation=dialog.message();
    await dialog.dismiss();
  });
  await page.locator('details.reader-options > summary').click();
  await page.getByRole('button',{name:'Erase all my drafts'}).click();
  expect(confirmation).toContain('Other tabs and previously exported files will not be erased.');
  await expect(page.locator('#initial-answer')).toHaveValue('Do not erase this draft');
});
