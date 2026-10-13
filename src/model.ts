/**
 * Exhaustive finite model for POELIO's first *mathematical* case study.
 * A and B denote abstract assignments, not literary characters.
 * These executable checks are not Lean proofs or claims about prose.
 */
export type Person = 'A' | 'B';
export type Schedule = readonly [Person, Person, Person, Person, Person, Person, Person, Person];

export interface Repair {
  readonly schedule: Schedule;
  readonly faultEdge: number;
  readonly repeatedCaregiver: Person;
}

/** Enumerate each of the 2^8 possible schedules exactly once. */
export function allSchedules(): Schedule[] {
  const results: Schedule[] = [];
  for (let value = 0; value < 256; value++) {
    const bit = (index: number): Person =>
      (value & (1 << index)) === 0 ? 'A' : 'B';
    const schedule: Schedule = [
      bit(0), bit(1), bit(2), bit(3),
      bit(4), bit(5), bit(6), bit(7)
    ];
    results.push(schedule);
  }
  return results;
}

/** The final position must be assigned to the person at the first. */
export function recurrence(schedule: Schedule): boolean {
  return schedule[0] === schedule[7];
}

/** Indices of successive positions assigned to the same person. */
export function repeatedEdges(schedule: Schedule): number[] {
  const edges: number[] = [];
  for (let index = 0; index < 7; index++) {
    if (schedule[index] === schedule[index + 1]) edges.push(index);
  }
  return edges;
}

/** Derive minimum-repair schedules without reading a manuscript manifest. */
export function minimumRepairs(): Repair[] {
  const recurrent = allSchedules().filter(recurrence);
  const minimum = Math.min(...recurrent.map(s => repeatedEdges(s).length));
  return recurrent
    .filter(s => repeatedEdges(s).length === minimum)
    .map(schedule => {
      const faultEdge = repeatedEdges(schedule)[0];
      return { schedule, faultEdge, repeatedCaregiver: schedule[faultEdge] };
    });
}

/** A stable key for equality checks of finite schedules. */
export function scheduleKey(schedule: readonly Person[]): string {
  return schedule.join('');
}

/** Validate manifest-provided metadata against independent enumeration. */
export function validateCanonical(readings: readonly Repair[]): void {
  if (readings.length !== 14) {
    throw new Error('Expected 14 canonical realizations, got ' + readings.length);
  }
  const expected = new Set(minimumRepairs().map(item => scheduleKey(item.schedule)));
  const actual = new Set(readings.map(item => scheduleKey(item.schedule)));
  if (expected.size !== 14 || actual.size !== 14 ||
      [...expected].some(key => !actual.has(key))) {
    throw new Error('Duplicate, missing or incorrect canonical realization');
  }
  for (const reading of readings) {
    if (reading.faultEdge !== repeatedEdges(reading.schedule)[0] ||
        reading.repeatedCaregiver !== reading.schedule[reading.faultEdge]) {
      throw new Error('Incorrect canonical edge/caregiver metadata');
    }
  }
}
