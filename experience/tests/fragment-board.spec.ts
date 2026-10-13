import {expect,test,type Page} from '@playwright/test';

async function openBoard(page:Page):Promise<void>{
  await page.goto('/?work=permutation');
  await page.getByRole('navigation',{name:'Étapes de l’expérience'})
    .getByRole('button',{name:/Explorer/}).click();
  await expect(page.locator('.fragment-board .fragment-card')).toHaveCount(4);
}

async function ids(page:Page):Promise<string[]>{
  return page.locator('.fragment-board .fragment-card').evaluateAll(
    nodes=>nodes.map(node=>(node as HTMLElement).dataset.fragmentId??''));
}

test('arrow movement, instant literary preview, undo and redo preserve exact prose',async({page})=>{
  await openBoard(page);
  expect(await ids(page)).toEqual(['question','bell','door','letter']);
  const before=await page.locator('.reading-column .fragment-passage p:not(.fragment-index)').allTextContents();
  await page.getByRole('button',{name:'Descendre La question'}).click();
  expect(await ids(page)).toEqual(['bell','question','door','letter']);
  const next=await page.locator('.reading-column .fragment-passage p:not(.fragment-index)').allTextContents();
  expect(next).not.toEqual(before);
  expect([...next].sort()).toEqual([...before].sort());
  await page.getByRole('button',{name:'Annuler',exact:true}).click();
  expect(await ids(page)).toEqual(['question','bell','door','letter']);
  await page.getByRole('button',{name:'Rétablir',exact:true}).click();
  expect(await ids(page)).toEqual(['bell','question','door','letter']);
  await page.getByRole('button',{name:'Ordre initial'}).click();
  expect(await ids(page)).toEqual(['question','bell','door','letter']);
  await page.getByRole('button',{name:'Annuler',exact:true}).click();
  expect(await ids(page)).toEqual(['bell','question','door','letter']);
});

test('turning on a rule does not silently replace an existing nonconforming arrangement',async({page})=>{
  await openBoard(page);
  await page.locator('#permutation-select').selectOption('door/letter/question/bell');
  expect(await ids(page)).toEqual(['door','letter','question','bell']);
  await page.locator('#order-filter').check();
  expect(await ids(page)).toEqual(['door','letter','question','bell']);
  await expect(page.locator('#permutation-select option')).toHaveCount(13);
  await page.getByRole('button',{name:'Monter La question'}).click();
  expect(await ids(page)).toEqual(['door','question','letter','bell']);
  await expect(page.locator('#permutation-select option')).toHaveCount(12);
  await page.getByRole('button',{name:'Annuler',exact:true}).click();
  expect(await ids(page)).toEqual(['door','question','letter','bell']);
  await expect(page.getByRole('status')).toContainText('refusé');
  await page.locator('#order-filter').uncheck();
  await page.getByRole('button',{name:'Annuler',exact:true}).click();
  expect(await ids(page)).toEqual(['door','letter','question','bell']);
});

test('pointer reordering follows the same validated operations as arrow controls',async({page})=>{
  await openBoard(page);
  const start=await page.locator('[data-fragment-id="question"] .fragment-grip').boundingBox();
  const destination=await page.locator('[data-fragment-id="bell"] .fragment-title').boundingBox();
  expect(start).toBeTruthy();expect(destination).toBeTruthy();
  if(!start||!destination)return;
  await page.mouse.move(start.x+start.width/2,start.y+start.height/2);
  await page.mouse.down();
  await page.mouse.move(destination.x+destination.width/2,destination.y+destination.height/2,{steps:6});
  await page.mouse.up();
  expect(await ids(page)).toEqual(['bell','question','door','letter']);
});

test('touch gesture and 320px reflow keep the board usable',async({page,isMobile})=>{
  test.skip(!isMobile,'Touch gesture needs a mobile touch-enabled project');
  await page.setViewportSize({width:320,height:720});
  await openBoard(page);
  const start=await page.locator('[data-fragment-id="question"] .fragment-grip').boundingBox();
  const dest=await page.locator('[data-fragment-id="bell"] .fragment-title').boundingBox();
  expect(start).toBeTruthy();expect(dest).toBeTruthy();
  if(!start||!dest)return;
  const cdp=await page.context().newCDPSession(page);
  const a={x:Math.round(start.x+start.width/2),y:Math.round(start.y+start.height/2)};
  const b={x:Math.round(dest.x+dest.width/2),y:Math.round(dest.y+dest.height/2)};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[b]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect(await ids(page)).toEqual(['bell','question','door','letter']);
  const width=await page.evaluate(()=>({body:document.body.scrollWidth,viewport:document.documentElement.clientWidth}));
  expect(width.body).toBeLessThanOrEqual(width.viewport+1);
});
