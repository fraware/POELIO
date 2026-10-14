/**
 * Reusable, immutable state for a fixed sequence of finite choices.
 *
 * Unlike orderEngine (permutations of unique IDs), positions here are stable
 * and choices can repeat. Domain rules belong to the caller.
 * No manuscript, browser storage, networking or React dependency.
 */
const choiceTag:unique symbol=Symbol('POELIO finite-choice state');

export interface ChoiceState<T extends string>{
  readonly [choiceTag]:true;
  readonly options:readonly T[];
  readonly initial:readonly T[];
  readonly values:readonly T[];
  readonly past:readonly (readonly T[])[];
  readonly future:readonly (readonly T[])[];
  readonly historyLimit:number;
}
const DEFAULT_LIMIT=32;
const MAX_LIMIT=256;
function frozen<T>(values:readonly T[]):readonly T[]{return Object.freeze([...values]);}
function validateOptions<T extends string>(options:readonly T[]):void{
  if(!Array.isArray(options)||options.length<2||
      options.some(v=>typeof v!=='string'||!v||v.trim()!==v)||
      new Set(options).size!==options.length)throw new Error('Invalid finite choice options');
}
function validateValues<T extends string>(options:readonly T[],values:readonly T[],length:number):void{
  if(!Array.isArray(values)||values.length!==length||!values.every(v=>options.includes(v)))
    throw new Error('Invalid finite choice sequence');
}
function stateOf<T extends string>(
  options:readonly T[],initial:readonly T[],values:readonly T[],
  past:readonly (readonly T[])[],future:readonly (readonly T[])[],historyLimit:number
):ChoiceState<T>{
  return Object.freeze({
    [choiceTag]:true as const,options,initial,values,
    past:frozen(past),future:frozen(future),historyLimit
  });
}
function validateState<T extends string>(s:ChoiceState<T>):void{
  if(!s||s[choiceTag]!==true)throw new Error('Invalid finite choice state');
  validateOptions(s.options);
  validateValues(s.options,s.initial,s.initial.length);
  validateValues(s.options,s.values,s.initial.length);
  if(!Number.isSafeInteger(s.historyLimit)||s.historyLimit<0||s.historyLimit>MAX_LIMIT||
      !Array.isArray(s.past)||!Array.isArray(s.future)||
      s.past.length+s.future.length>s.historyLimit)
    throw new Error('Invalid finite choice history');
  for(const entry of [...s.past,...s.future])
    validateValues(s.options,entry,s.initial.length);
}
export function createChoiceState<T extends string>(
  options:readonly T[],initial:readonly T[],historyLimit=DEFAULT_LIMIT
):ChoiceState<T>{
  validateOptions(options);
  if(!Array.isArray(initial)||initial.length<1)throw new Error('Finite choice sequence must be nonempty');
  validateValues(options,initial,initial.length);
  if(!Number.isSafeInteger(historyLimit)||historyLimit<0||historyLimit>MAX_LIMIT)
    throw new Error('Invalid history limit');
  return stateOf(frozen(options),frozen(initial),frozen(initial),[],[],historyLimit);
}
export function setChoices<T extends string>(
  state:ChoiceState<T>,values:readonly T[]
):ChoiceState<T>{
  validateState(state);
  validateValues(state.options,values,state.initial.length);
  if(values.every((value,i)=>value===state.values[i]))return state;
  const past=state.historyLimit===0?[]:[...state.past,state.values].slice(-state.historyLimit);
  return stateOf(state.options,state.initial,frozen(values),past,[],state.historyLimit);
}
/** Change one stable position, leaving all other positions untouched. */
export function setChoice<T extends string>(
  state:ChoiceState<T>,index:number,value:T
):ChoiceState<T>{
  validateState(state);
  if(!Number.isSafeInteger(index)||index<0||index>=state.values.length)
    throw new Error('Invalid choice index');
  if(!state.options.includes(value))throw new Error('Invalid choice value');
  if(state.values[index]===value)return state;
  const updated=[...state.values];updated[index]=value;
  return setChoices(state,updated);
}
export function undoChoices<T extends string>(state:ChoiceState<T>):ChoiceState<T>{
  validateState(state);
  if(state.past.length===0)return state;
  return stateOf(state.options,state.initial,state.past[state.past.length-1],
    state.past.slice(0,-1),[...state.future,state.values],state.historyLimit);
}
export function redoChoices<T extends string>(state:ChoiceState<T>):ChoiceState<T>{
  validateState(state);
  if(state.future.length===0)return state;
  return stateOf(state.options,state.initial,state.future[state.future.length-1],
    [...state.past,state.values],state.future.slice(0,-1),state.historyLimit);
}
/** Reset returns to the initial selection and is itself undoable. */
export function resetChoices<T extends string>(state:ChoiceState<T>):ChoiceState<T>{
  return setChoices(state,state.initial);
}
