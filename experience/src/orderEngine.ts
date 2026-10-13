/**
 * Immutable, content-independent ordering transitions for editorial interfaces.
 *
 * Items are opaque stable IDs. No prose, release records, models, network calls,
 * DOM, persistence or timers enter this module. The caller owns all meaning.
 */
const stateTag: unique symbol = Symbol('POELIO order state');

export type OrderRule<Id extends string> = (order: readonly Id[]) => boolean;

export interface OrderState<Id extends string> {
  readonly [stateTag]: true;
  readonly universe: readonly Id[];
  readonly initial: readonly Id[];
  readonly order: readonly Id[];
  /** Oldest snapshot first. */
  readonly past: readonly (readonly Id[])[];
  /** Last entry is the next redo state. */
  readonly future: readonly (readonly Id[])[];
  readonly historyLimit: number;
}

export type OrderTransition<Id extends string> =
  | {readonly accepted: true; readonly changed: boolean; readonly state: OrderState<Id>}
  | {readonly accepted: false; readonly changed: false; readonly reason: 'constraint'; readonly state: OrderState<Id>};

const DEFAULT_HISTORY_LIMIT = 32;
const MAX_HISTORY_LIMIT = 256;

function assertIds(value: readonly string[], description: string): void {
  if (!Array.isArray(value) || value.length===0 ||
      value.some(id=>typeof id!=='string' || id.length===0 || id.trim()!==id) ||
      new Set(value).size!==value.length) {
    throw new Error('Invalid '+description+': expected distinct, nonempty, trimmed item IDs');
  }
}

/** True only for an exact permutation of a declared ID inventory. */
export function isOrderOf<Id extends string>(universe: readonly Id[], candidate: unknown): candidate is readonly Id[] {
  if (!Array.isArray(universe) || universe.length===0 ||
      universe.some(id=>typeof id!=='string' || !id || id.trim()!==id) ||
      new Set(universe).size!==universe.length || !Array.isArray(candidate) ||
      candidate.length!==universe.length) return false;
  const available=new Set<string>(universe);
  for (const id of candidate) {
    if (typeof id!=='string' || !available.delete(id)) return false;
  }
  return available.size===0;
}

function snapshot<Id extends string>(order: readonly Id[]): readonly Id[] {
  return Object.freeze([...order]);
}

function makeState<Id extends string>(
  universe: readonly Id[], initial: readonly Id[], order: readonly Id[],
  past: readonly (readonly Id[])[], future: readonly (readonly Id[])[], historyLimit: number
): OrderState<Id> {
  return Object.freeze({
    [stateTag]:true as const,
    universe,initial,order,
    past:Object.freeze([...past]),future:Object.freeze([...future]),historyLimit
  });
}

function assertState<Id extends string>(state: OrderState<Id>): void {
  if (!state || state[stateTag]!==true ||
      !isOrderOf(state.universe,state.initial) || !isOrderOf(state.universe,state.order) ||
      !Number.isSafeInteger(state.historyLimit) || state.historyLimit<0 ||
      state.historyLimit>MAX_HISTORY_LIMIT ||
      !Array.isArray(state.past) || !Array.isArray(state.future) ||
      state.past.length+state.future.length>state.historyLimit ||
      [...state.past,...state.future].some(order=>!isOrderOf(state.universe,order))) {
    throw new Error('Invalid ordering state');
  }
}

/** Snapshots are copied and frozen. The initial configuration is the reset target. */
export function createOrderState<Id extends string>(
  universe: readonly Id[], initial: readonly Id[]=universe,
  historyLimit=DEFAULT_HISTORY_LIMIT
): OrderState<Id> {
  assertIds(universe,'item inventory');
  if (!isOrderOf(universe,initial)) throw new Error('Initial order must contain each declared ID exactly once');
  if (!Number.isSafeInteger(historyLimit) || historyLimit<0 || historyLimit>MAX_HISTORY_LIMIT) {
    throw new Error('Invalid history limit (expected an integer from 0 to 256)');
  }
  return makeState(snapshot(universe),snapshot(initial),snapshot(initial),[],[],historyLimit);
}

/** A rule is a caller-owned predicate, not a claim about literary meaning. */
export function satisfiesOrderRule<Id extends string>(
  state: OrderState<Id>, rule: OrderRule<Id>
): boolean {
  assertState(state);
  return rule(state.order)===true;
}

function unchanged<Id extends string>(state: OrderState<Id>): OrderTransition<Id> {
  return {accepted:true,changed:false,state};
}

function rejected<Id extends string>(state: OrderState<Id>): OrderTransition<Id> {
  return {accepted:false,changed:false,reason:'constraint',state};
}

function transition<Id extends string>(
  state: OrderState<Id>, proposed: readonly Id[], rule?: OrderRule<Id>
): OrderTransition<Id> {
  assertState(state);
  if (!isOrderOf(state.universe,proposed)) throw new Error('Proposed order is not a permutation of the item inventory');
  if (proposed.every((id,i)=>id===state.order[i])) return unchanged(state);
  const next=snapshot(proposed);
  if (rule && rule(next)!==true) return rejected(state);
  const past=state.historyLimit===0?[]:[...state.past,state.order].slice(-state.historyLimit);
  return {accepted:true,changed:true,state:makeState(state.universe,state.initial,next,past,[],state.historyLimit)};
}

/** Replace an order explicitly. Constraints reject changes; they never auto-repair them. */
export function reorderItems<Id extends string>(
  state: OrderState<Id>, order: readonly Id[], rule?: OrderRule<Id>
): OrderTransition<Id> {
  return transition(state,order,rule);
}

/** Move an ID to its final zero-based position. All other IDs keep relative order. */
export function moveItem<Id extends string>(
  state: OrderState<Id>, id: Id, toIndex: number, rule?: OrderRule<Id>
): OrderTransition<Id> {
  assertState(state);
  const current=state.order.indexOf(id);
  if (current<0) throw new Error('Unknown item ID');
  if (!Number.isSafeInteger(toIndex) || toIndex<0 || toIndex>=state.order.length)
    throw new Error('Invalid destination index');
  if (current===toIndex) return unchanged(state);
  const next=[...state.order];
  next.splice(current,1);
  next.splice(toIndex,0,id);
  return transition(state,next,rule);
}

/** Adjacent move for keyboard/button interfaces; boundaries are harmless no-ops. */
export function shiftItem<Id extends string>(
  state: OrderState<Id>, id: Id, direction: -1|1, rule?: OrderRule<Id>
): OrderTransition<Id> {
  assertState(state);
  if (direction!==-1 && direction!==1) throw new Error('Shift direction must be -1 or 1');
  const index=state.order.indexOf(id);
  if (index<0) throw new Error('Unknown item ID');
  const nextIndex=index+direction;
  return nextIndex<0 || nextIndex>=state.order.length
    ?unchanged(state):moveItem(state,id,nextIndex,rule);
}

/** Reset is itself undoable; a conflicting active rule rejects the reset. */
export function resetOrder<Id extends string>(
  state: OrderState<Id>, rule?: OrderRule<Id>
): OrderTransition<Id> {
  return transition(state,state.initial,rule);
}

/** Undo and redo preserve an active constraint or reject without mutating history. */
export function undoOrder<Id extends string>(
  state: OrderState<Id>, rule?: OrderRule<Id>
): OrderTransition<Id> {
  assertState(state);
  if (state.past.length===0) return unchanged(state);
  const prior=state.past[state.past.length-1];
  if (rule && rule(prior)!==true) return rejected(state);
  return {accepted:true,changed:true,state:makeState(
    state.universe,state.initial,prior,state.past.slice(0,-1),
    [...state.future,state.order],state.historyLimit
  )};
}

export function redoOrder<Id extends string>(
  state: OrderState<Id>, rule?: OrderRule<Id>
): OrderTransition<Id> {
  assertState(state);
  if (state.future.length===0) return unchanged(state);
  const next=state.future[state.future.length-1];
  if (rule && rule(next)!==true) return rejected(state);
  return {accepted:true,changed:true,state:makeState(
    state.universe,state.initial,next,[...state.past,state.order],
    state.future.slice(0,-1),state.historyLimit
  )};
}
