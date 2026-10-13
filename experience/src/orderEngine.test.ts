import {describe,expect,it} from 'vitest';
import {
  createOrderState,isOrderOf,satisfiesOrderRule,reorderItems,moveItem,
  shiftItem,resetOrder,undoOrder,redoOrder,type OrderState,type OrderTransition
} from './orderEngine.js';

const IDS=['red','blue','yellow','white'] as const;
type Id=typeof IDS[number];
const before=(items:readonly Id[])=>items.indexOf('red')<items.indexOf('white');
function accepted(result:OrderTransition<Id>):OrderState<Id>{
  expect(result.accepted).toBe(true);
  if(!result.accepted)throw Error('Expected accepted transition');
  return result.state;
}
function arrangements<T>(xs:readonly T[]):T[][]{
  if(!xs.length)return [[]];
  return xs.flatMap((x,i)=>arrangements([...xs.slice(0,i),...xs.slice(i+1)])
    .map(tail=>[x,...tail]));
}

describe('pure item-ordering transitions',()=>{
  it('accepts only exact item inventories and validated initial states',()=>{
    const original=createOrderState(IDS);
    expect(original.order).toEqual(IDS);
    expect(isOrderOf(IDS,IDS)).toBe(true);
    for(const invalid of [['red','blue'],['red','red','yellow','white'],
      ['red','blue','yellow','stranger'],['red','blue','yellow','white','extra'],
      [1,2,3,4],null,{},'red']){
      expect(isOrderOf(IDS,invalid)).toBe(false);
      expect(()=>reorderItems(original,invalid as never)).toThrow(/permutation/);
    }
    expect(()=>createOrderState(['red','red'])).toThrow(/distinct/);
    expect(()=>createOrderState(['red',' '] )).toThrow(/distinct/);
    expect(()=>createOrderState(IDS,['blue','red','yellow'] as never)).toThrow(/Initial order/);
    for(const limit of [-1,1.1,Infinity,257,NaN])
      expect(()=>createOrderState(IDS,IDS,limit)).toThrow(/history limit/);
    expect(createOrderState(IDS,IDS,0).historyLimit).toBe(0);
  });

  it('is immutable, detached from callers and free of content/persistence',()=>{
    const mutable=['red','blue','yellow','white'] as Id[];
    const state=createOrderState(mutable);
    mutable.reverse();
    expect(state.universe).toEqual(IDS);
    expect(state.order).toEqual(IDS);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.order)).toBe(true);
    const proposed=['blue','red','yellow','white'] as Id[];
    const next=accepted(reorderItems(state,proposed));
    proposed.reverse();
    expect(next.order).toEqual(['blue','red','yellow','white']);
    expect(state.order).toEqual(IDS);
    expect(Object.isFrozen(next.past)).toBe(true);
    expect(Object.isFrozen(next.past[0])).toBe(true);
  });

  it('enumerates all 24 states and validates all 16 possible moves from each',()=>{
    const variants=arrangements(IDS);
    expect(variants).toHaveLength(24);
    expect(variants.filter(before)).toHaveLength(12);
    for(const order of variants){
      const state=createOrderState(IDS,order);
      expect(isOrderOf(IDS,state.order)).toBe(true);
      expect(satisfiesOrderRule(state,before)).toBe(before(order));
      for(const id of IDS)for(let target=0;target<IDS.length;target++){
        const res=moveItem(state,id,target);
        expect(res.accepted).toBe(true);
        if(!res.accepted)continue;
        const expected=[...order];expected.splice(expected.indexOf(id),1);expected.splice(target,0,id);
        expect(res.state.order).toEqual(expected);
        expect(isOrderOf(IDS,res.state.order)).toBe(true);
        expect(res.state.order.filter(x=>x===id)).toHaveLength(1);
        expect(state.order).toEqual(order);
      }
    }
  });

  it('keeps rule evaluation separate from changes, never silently repairs a state',()=>{
    const state=createOrderState(IDS,['white','red','blue','yellow']);
    expect(satisfiesOrderRule(state,before)).toBe(false);
    expect(state.order).toEqual(['white','red','blue','yellow']);
    const blocked=moveItem(state,'blue',0,before);
    expect(blocked).toEqual({accepted:false,changed:false,reason:'constraint',state});
    const valid=accepted(moveItem(state,'red',0,before));
    expect(satisfiesOrderRule(valid,before)).toBe(true);
    expect(valid.order).toEqual(['red','white','blue','yellow']);
    const invalidReset=resetOrder(valid,before);
    expect(invalidReset.accepted).toBe(false);
    expect(invalidReset.state).toBe(valid);
    const invalidUndo=undoOrder(valid,before);
    expect(invalidUndo.accepted).toBe(false);
    expect(invalidUndo.state).toBe(valid);
    expect(accepted(undoOrder(valid)).order).toEqual(state.order);
  });

  it('implements adjacent keyboard movements and safe boundary no-ops',()=>{
    const state=createOrderState(IDS);
    expect(shiftItem(state,'red',-1)).toEqual({accepted:true,changed:false,state});
    expect(shiftItem(state,'white',1)).toEqual({accepted:true,changed:false,state});
    expect(accepted(shiftItem(state,'red',1)).order).toEqual(['blue','red','yellow','white']);
    expect(()=>shiftItem(state,'red',0 as never)).toThrow(/direction/);
    expect(()=>shiftItem(state,'unlisted' as never,1)).toThrow(/Unknown/);
    for(const target of [-1,4,NaN,0.2,Infinity])
      expect(()=>moveItem(state,'red',target)).toThrow(/index/);
  });

  it('supports undo, redo, reset, branch invalidation and no-op identity',()=>{
    const s0=createOrderState(IDS);
    const s1=accepted(moveItem(s0,'red',2));
    const s2=accepted(moveItem(s1,'white',0));
    expect(accepted(undoOrder(s2)).order).toEqual(s1.order);
    const undone=accepted(undoOrder(s2));
    expect(accepted(redoOrder(undone)).order).toEqual(s2.order);
    expect(undoOrder(s0)).toEqual({accepted:true,changed:false,state:s0});
    expect(redoOrder(s2)).toEqual({accepted:true,changed:false,state:s2});
    expect(moveItem(s2,'white',0)).toEqual({accepted:true,changed:false,state:s2});
    const reset=accepted(resetOrder(s2));
    expect(reset.order).toEqual(IDS);
    expect(accepted(undoOrder(reset)).order).toEqual(s2.order);
    const branched=accepted(moveItem(undone,'blue',3));
    expect(branched.future).toHaveLength(0);
    expect(redoOrder(branched)).toEqual({accepted:true,changed:false,state:branched});
  });

  it('bounds history deterministically, including when history is disabled',()=>{
    let state=createOrderState(IDS,IDS,2);
    for(let i=0;i<50;i++){
      state=accepted(moveItem(state,'red',i%2===0?3:0));
      expect(state.past.length+state.future.length).toBeLessThanOrEqual(2);
    }
    expect(state.past).toHaveLength(2);
    state=accepted(undoOrder(state));
    state=accepted(undoOrder(state));
    expect(undoOrder(state).changed).toBe(false);
    const withoutHistory=accepted(moveItem(createOrderState(IDS,IDS,0),'red',2));
    expect(withoutHistory.past).toHaveLength(0);
    expect(undoOrder(withoutHistory).changed).toBe(false);
  });

  it('does not allow a newly active constraint to be bypassed through redo',()=>{
    const s0=createOrderState(IDS);
    const bad=accepted(reorderItems(s0,['white','blue','yellow','red']));
    const restored=accepted(undoOrder(bad));
    const blocked=redoOrder(restored,before);
    expect(blocked.accepted).toBe(false);
    expect(blocked.state).toBe(restored);
    expect(restored.future).toHaveLength(1);
    expect(accepted(redoOrder(restored)).order).toEqual(bad.order);
  });
});
