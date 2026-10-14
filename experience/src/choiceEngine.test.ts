import {describe,expect,it} from 'vitest';
import {
  createChoiceState,setChoices,setChoice,undoChoices,redoChoices,resetChoices
} from './choiceEngine.js';
import {allSchedules,minimumRepairs,recurrence,repeatedEdges,scheduleKey,type Person,type Schedule} from '../../src/model.js';
import {publicWorks} from './contentCatalog.js';

const OPTIONS=['A','B'] as const;
const first:Schedule=['A','A','B','A','B','A','B','A'];

describe('generic finite-choice engine',()=>{
  it('validates options, positions and finite values without leaking caller mutations',()=>{
    const mutable:Person[]=[...first];
    const state=createChoiceState(OPTIONS,mutable);
    mutable[0]='B';
    expect(state.values).toEqual(first);
    expect(Object.isFrozen(state.values)).toBe(true);
    expect(Object.isFrozen(state)).toBe(true);
    expect(()=>createChoiceState(['A','A'],first)).toThrow(/options/);
    expect(()=>createChoiceState(['A',' '],first)).toThrow(/options/);
    expect(()=>createChoiceState(OPTIONS,[])).toThrow(/nonempty/);
    expect(()=>createChoiceState(OPTIONS,['A','C'] as never)).toThrow(/sequence/);
    for(const value of [-1,1.5,257,NaN,Infinity])
      expect(()=>createChoiceState(OPTIONS,first,value)).toThrow(/history limit/);
    expect(()=>setChoices(state,['A','B'] as never)).toThrow(/sequence/);
    expect(()=>setChoice(state,-1,'A')).toThrow(/index/);
    expect(()=>setChoice(state,8,'A')).toThrow(/index/);
    expect(()=>setChoice(state,0,'C' as never)).toThrow(/value/);
  });

  it('reaches every one of the 256 assignments through explicit position edits',()=>{
    const initial=createChoiceState(OPTIONS,first);
    const schedules=allSchedules();
    expect(schedules).toHaveLength(256);
    expect(new Set(schedules.map(scheduleKey)).size).toBe(256);
    for(const target of schedules){
      const next=setChoices(initial,target);
      expect(next.values).toEqual(target);
      for(let index=0;index<8;index++){
        const flipped:Person=target[index]==='A'?'B':'A';
        const changed=setChoice(next,index,flipped);
        expect(changed.values[index]).toBe(flipped);
        expect(changed.values.filter((v,i)=>i!==index))
          .toEqual(target.filter((v,i)=>i!==index));
      }
      expect(initial.values).toEqual(first);
    }
  });

  it('preserves the original finite-model 14/256 result and exactly two authored mappings',()=>{
    const repairs=minimumRepairs();
    expect(repairs).toHaveLength(14);
    const keys=new Set(repairs.map(item=>scheduleKey(item.schedule)));
    const computed=allSchedules().filter(s=>recurrence(s)&&repeatedEdges(s).length===1);
    expect(new Set(computed.map(scheduleKey))).toEqual(keys);
    expect(computed).toHaveLength(14);
    let authored=0;
    for(const schedule of allSchedules()){
      const state=setChoices(createChoiceState(OPTIONS,first),schedule);
      const values=state.values as Schedule;
      const isMinimum=recurrence(values)&&repeatedEdges(values).length===1;
      expect(isMinimum).toBe(keys.has(scheduleKey(values)));
      const text=publicWorks.register.authored(values);
      if(text){
        authored++;
        expect(isMinimum).toBe(true);
        expect(text.schedule).toEqual(values);
      }
    }
    expect(authored).toBe(2);
  });

  it('maintains bounded history, branching, and an undoable initial reset',()=>{
    const start=createChoiceState(OPTIONS,first,3);
    expect(setChoice(start,0,'A')).toBe(start);
    const changed=setChoice(start,0,'B');
    expect(changed.values[0]).toBe('B');
    expect(undoChoices(changed).values).toEqual(first);
    expect(redoChoices(undoChoices(changed)).values).toEqual(changed.values);
    expect(resetChoices(changed).values).toEqual(first);
    expect(undoChoices(resetChoices(changed)).values).toEqual(changed.values);
    let state=start;
    for(let i=0;i<50;i++){
      state=setChoice(state,0,i%2===0?'B':'A');
      expect(state.past.length+state.future.length).toBeLessThanOrEqual(3);
    }
    const undone=undoChoices(state);
    const branched=setChoice(undone,1,undone.values[1]==='A'?'B':'A');
    expect(branched.future).toHaveLength(0);
    expect(redoChoices(branched)).toBe(branched);
    const disabled=setChoice(createChoiceState(OPTIONS,first,0),0,'B');
    expect(disabled.past).toHaveLength(0);
    expect(undoChoices(disabled)).toBe(disabled);
  });
});
