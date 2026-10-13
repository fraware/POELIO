import { describe, expect, it } from 'vitest';
import {
  FRAGMENT_IDS, ORIGINAL_ORDER, COUNTER_ORDER, allFragmentOrders,
  authoredFragments, isFragmentOrder, orderKey, passagesForOrder,
  questionBeforeLetter
} from './permutation.js';

describe('four-fragment compositional mechanism', () => {
  it('enumerates exactly 24 unique arrangements', () => {
    const orders = allFragmentOrders();
    expect(orders).toHaveLength(24);
    expect(new Set(orders.map(orderKey)).size).toBe(24);
    expect(orders.every(isFragmentOrder)).toBe(true);
  });
  it('has exactly twelve arrangements satisfying a declared order rule', () => {
    const admissible = allFragmentOrders().filter(questionBeforeLetter);
    expect(admissible).toHaveLength(12);
    expect(questionBeforeLetter(ORIGINAL_ORDER)).toBe(false);
    expect(questionBeforeLetter(COUNTER_ORDER)).toBe(true);
  });
  it('refuses omissions and duplicate or unknown fragments', () => {
    expect(isFragmentOrder(['door','letter','question'])).toBe(false);
    expect(isFragmentOrder(['door','door','question','bell'])).toBe(false);
    expect(isFragmentOrder(['door','letter','question','unknown'])).toBe(false);
    expect(() => passagesForOrder(['door','door','question','bell'] as never)).toThrow(/Invalid/);
    expect(() => orderKey(['door','door','question','bell'] as never)).toThrow(/Not a permutation/);
  });
  it('preserves exact fragment prose and source identities in every arrangement', () => {
    for (const order of allFragmentOrders()) {
      const passages = passagesForOrder(order);
      expect(passages.map(p => p.id)).toEqual(order);
      expect(passages.map(p => p.text).sort())
        .toEqual(FRAGMENT_IDS.map(id => authoredFragments[id].text).sort());
      expect(passages.every(p => p.provenance.startsWith('poelio-original-permutation-demo-v1/')))
        .toBe(true);
    }
  });
  it('has two genuinely distinct example sequences of the same fixed words', () => {
    expect(ORIGINAL_ORDER).not.toEqual(COUNTER_ORDER);
    expect(passagesForOrder(ORIGINAL_ORDER).map(p => p.text).sort())
      .toEqual(passagesForOrder(COUNTER_ORDER).map(p => p.text).sort());
  });
});
