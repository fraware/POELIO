# Reusable ordering engine

The engine in [`experience/src/orderEngine.ts`](../experience/src/orderEngine.ts) provides deterministic, immutable ordering transitions for interface components. It is designed to be reused by interactive literary works, sequencing exercises and workshop tools. Its input consists **only of stable item IDs**. It has no access to prose, publication rights, browser storage or the network.

Status: **core library integrated into the public four-fragment interaction board**. `experience/src/FragmentBoard.tsx` provides pointer/touch movement and visible keyboard-operable up/down controls. The literary experience owns undo/redo. Automated browser tests are present; independent assistive-technology review and novice-reader testing remain pending.

## Invariants

- Every state contains exactly the IDs declared in its original inventory, once each.
- IDs must be distinct nonempty strings without leading/trailing whitespace.
- The initial order, current order and undo/redo snapshots are copied, frozen and separate from the caller's mutable arrays.
- `moveItem(state, id, toIndex)` moves one ID to its **final zero-based index**; remaining IDs retain relative order.
- `shiftItem(state,id,-1|1)` moves one position, suitable for visible keyboard- and screen-reader-accessible buttons. Out-of-bound moves do nothing.
- `reorderItems` accepts any complete explicit ordering, subject to an optional caller-provided constraint.
- `resetOrder` is undoable. Undo and redo are bounded, defaulting to 32 snapshots (configurable 0–256); new accepted edits discard the redo branch.
- A rejected operation returns `{accepted:false,changed:false,reason:'constraint',state}` and **preserves both the order and history**. Invalid IDs, non-permutations or invalid indices throw; UI consumers must handle these failures deliberately.
- A no-op returns the **same** state reference with `changed:false`. Neither history nor the redo branch is altered.
- Applying a constraint to an existing order is observational: `satisfiesOrderRule` reports the result and **never changes the state**. Transition functions optionally reject proposed moves that break an active constraint, including undo/redo. The UI must explain this to readers.

`OrderRule` is a synchronous predicate over a readonly ID sequence. The caller owns its mathematical meaning, accuracy, trust boundary and error-handling policy. The engine itself makes no claims about chronology, semantic consistency or literary quality. These functions are **not** a sandbox for untrusted executable predicates.

## Example with synthetic IDs

```ts
import {
  createOrderState, moveItem, shiftItem, satisfiesOrderRule, undoOrder
} from './orderEngine.js';

const inventory = ['alpha', 'beta', 'gamma', 'delta'] as const;
const precedes = (order: readonly string[]) =>
  order.indexOf('alpha') < order.indexOf('delta');

const initial = createOrderState(inventory);
const moved = shiftItem(initial, 'alpha', 1);
if (moved.accepted && moved.changed) {
  const current = moved.state;
  const valid = satisfiesOrderRule(current, precedes);
  const previous = undoOrder(current); // Returns the original order if accepted
}
const denied = moveItem(initial, 'alpha', 3, precedes);
// denied.accepted === false; initial is unchanged and no order is substituted.
```

The engine has **no React dependency**. A React board owns its `OrderState`, calls transitions from direct input gestures or accessible buttons, and updates state only for accepted changes. For UI feedback, translate `reason:'constraint'` and announce the attempted operation; do not bury the rejection or silently select another ordering.

## Integration boundaries

For *Les Quatre Témoins*, use the existing `experience/src/permutation.ts` and `publicWorks.permutation` as the authority for the 24 distinct orders, the twelve arrangements satisfying the precedence rule, and the verbatim authored fragments. The generic engine supplies transitions and history, **not** those facts or passages.

For *Le Registre des clefs*, keep `src/model.ts` responsible for the 256 schedules and the fourteen minimum repairs. Reuse only the UI/state primitives that match that mechanism. A model configuration without an authored realization does not acquire new literary text.

The content catalog's publication allowlist, pinned source identities and separate software/literary licenses remain mandatory for every public work. This API is not a content-registration or manuscript-import route.

## Validation and limitations

`experience/src/orderEngine.test.ts` enumerates all 24 permutations of four **synthetic** IDs and checks all 16 per-item destination operations per permutation, constraint filtering, validation failures, undo/redo, immutability and bounded history. Integration tests verify that the engine's orders agree with the existing four-fragment model.

This library does not independently establish WCAG conformance, keyboard operability of future user interfaces or human literary value. The fragment board has been implemented and browser-tested; actual-device accessibility review and independent reading pilots are still pending.
