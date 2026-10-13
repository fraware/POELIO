import { describe, expect, test } from 'vitest';
import { allSchedules, minimumRepairs, repeatedEdges, recurrence } from '../../src/model.js';
import { authoredForSchedule, demoEpisode, validatePublicEpisode } from './episode.js';

describe('public demonstration contract', () => {
  test('enumeration is exhaustive and no strict recurrent assignment exists', () => {
    expect(allSchedules()).toHaveLength(256);
    expect(allSchedules().filter(s => recurrence(s) && repeatedEdges(s).length === 0)).toHaveLength(0);
    expect(minimumRepairs()).toHaveLength(14);
  });
  test('every authored demo is attached to the declared canonical schedule', () => {
    expect(() => validatePublicEpisode(demoEpisode)).not.toThrow();
    for (const r of demoEpisode.realizations) {
      expect(authoredForSchedule(demoEpisode, r.schedule)?.id).toBe(r.id);
    }
  });
  test('the other twelve mathematical arrangements have no invented prose', () => {
    const authored = new Set(demoEpisode.realizations.map(r => r.schedule.join('')));
    expect(minimumRepairs().filter(r => !authored.has(r.schedule.join('')))).toHaveLength(12);
    for (const r of minimumRepairs()) {
      if (!authored.has(r.schedule.join(''))) expect(authoredForSchedule(demoEpisode, r.schedule)).toBeNull();
    }
  });
  test('unknown rights, duplicate states, and incorrect metadata fail closed', () => {
    expect(() => validatePublicEpisode({...demoEpisode, rights: {...demoEpisode.rights, channel: 'private'} as never})).toThrow(/cleared/);
    expect(() => validatePublicEpisode({...demoEpisode, realizations: [demoEpisode.realizations[0], demoEpisode.realizations[0]]})).toThrow(/duplicated/);
    const [first, second] = demoEpisode.realizations;
    expect(() => validatePublicEpisode({
      ...demoEpisode,
      realizations: [{...first, faultEdge: 2}, second]
    })).toThrow(/mapping/);
  });
  test('module provenance makes common versus variant-specific passages explicit', () => {
    const [a, b] = demoEpisode.realizations;
    expect(a.passages[0].text).toBe(b.passages[0].text);
    expect(a.passages[0].sourceModule).toBe(b.passages[0].sourceModule);
    expect(a.passages[1].sourceModule).not.toBe(b.passages[1].sourceModule);
  });
});
