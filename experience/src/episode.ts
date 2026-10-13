/**
 * Rights-aware, content-neutral model of an explorable literary episode.
 *
 * For this milestone a curated, original teaching fixture is bundled publicly.
 * No La Relève manuscript is imported into the public application.
 * A future edition must provide its own rights-cleared content adapter.
 */
import { minimumRepairs, repeatedEdges, recurrence, scheduleKey, type Person, type Schedule } from '../../src/model.js';

export type EvidenceStatus =
  | 'COMPUTED_IN_SESSION'
  | 'EXECUTABLY_CHECKED'
  | 'EDITORIAL_INTERPRETATION'
  | 'NOT_ESTABLISHED';

export interface Passage {
  readonly id: string;
  readonly sourceModule: string;
  readonly text: string;
}

export interface Realization {
  readonly id: string;
  readonly faultEdge: number;
  readonly repeatedCaregiver: Person;
  readonly schedule: Schedule;
  readonly passages: readonly Passage[];
}

export interface Episode {
  readonly id: string;
  readonly title: string;
  readonly authorCredit: string;
  readonly literaryLanguage: 'fr';
  readonly edition: string;
  readonly rights: {
    readonly channel: 'public-demo';
    readonly provenance: 'original-teaching-fixture';
    readonly notice: string;
  };
  readonly realizations: readonly Realization[];
}

const repairs = minimumRepairs();

function scheduleFor(edge: number, caregiver: Person): Schedule {
  const found = repairs.find(r => r.faultEdge === edge && r.repeatedCaregiver === caregiver);
  if (!found) throw new Error('No canonical finite-model schedule for fixture');
  return found.schedule;
}

const sharedText = 'La salle des clefs possédait une table, une fenêtre et un carnet relié de toile. Chaque passage laissait une ligne dans ce carnet. Il était interdit de déplacer le livre.';

export const demoEpisode: Episode = {
  id: 'register-of-keys-demo',
  title: 'Le Registre des clefs',
  authorCredit: 'POELIO — texte de démonstration original',
  literaryLanguage: 'fr',
  edition: 'Public teaching fixture v0.2',
  rights: {
    channel: 'public-demo',
    provenance: 'original-teaching-fixture',
    notice: 'Fiction créée pour éprouver le logiciel. Ce texte ne provient pas de La Relève et ne constitue pas une publication de cette œuvre.'
  },
  realizations: [
    {
      id: 'demo-a',
      faultEdge: 0,
      repeatedCaregiver: 'A',
      schedule: scheduleFor(0, 'A'),
      passages: [
        { id: 'a-0', sourceModule: 'room-common', text: sharedText },
        { id: 'a-1', sourceModule: 'mira-monday-tuesday', text: 'Lundi, Mira inscrivit une question dans la marge. Mardi, elle retrouva la même table et la même lumière. Personne n’avait touché à la page. Elle ajouta la réponse juste en dessous, puis s’aperçut que personne, hormis elle, ne connaissait encore la question.' },
        { id: 'a-2', sourceModule: 'closure-a', text: 'À la fin de la semaine, le cahier pesait exactement le même poids. Pourtant Mira ne le lisait plus de la même manière.' }
      ]
    },
    {
      id: 'demo-b',
      faultEdge: 6,
      repeatedCaregiver: 'B',
      schedule: scheduleFor(6, 'B'),
      passages: [
        { id: 'b-0', sourceModule: 'room-common', text: sharedText },
        { id: 'b-1', sourceModule: 'noor-sunday-monday', text: 'Dimanche, Noor trouva une question inscrite au milieu du carnet. Le lendemain, il revint devant la même page. Il écrivit une réponse au crayon sans savoir qui avait interrogé le silence de la pièce. La phrase, seule, ne disait pas si la question était encore ouverte.' },
        { id: 'b-2', sourceModule: 'closure-b', text: 'Le registre avait tenu les comptes avec exactitude. Personne ne savait s’il avait raconté la même histoire.' }
      ]
    }
  ]
};

/** Rejection at the content boundary, before any public UI receives the episode. */
export function validatePublicEpisode(value: Episode): void {
  if (!value.id.trim() || !value.title.trim() || !value.edition.trim() ||
      value.literaryLanguage !== 'fr' ||
      value.rights.channel !== 'public-demo' ||
      value.rights.provenance !== 'original-teaching-fixture') {
    throw new Error('Episode is not explicitly cleared as an original public demonstration');
  }
  if (value.realizations.length < 2) throw new Error('Comparison requires two authored realizations');
  const ids = new Set<string>();
  const schedules = new Set<string>();
  const canonical = new Set(repairs.map(r => scheduleKey(r.schedule)));
  for (const r of value.realizations) {
    const key = scheduleKey(r.schedule);
    if (ids.has(r.id) || schedules.has(key) || !canonical.has(key) ||
        !recurrence(r.schedule) || repeatedEdges(r.schedule).length !== 1 ||
        repeatedEdges(r.schedule)[0] !== r.faultEdge ||
        r.schedule[r.faultEdge] !== r.repeatedCaregiver) {
      throw new Error('Invalid or duplicated authored realization mapping');
    }
    if (r.passages.length === 0 ||
        r.passages.some(p => !p.id || !p.sourceModule || !p.text.trim())) {
      throw new Error('Missing provenance or source text');
    }
    ids.add(r.id);
    schedules.add(key);
  }
}

/** A missing authored realization stays missing; never invent replacement prose. */
export function authoredForSchedule(
  episode: Episode, schedule: readonly Person[]
): Realization | null {
  const key = scheduleKey(schedule);
  return episode.realizations.find(r => scheduleKey(r.schedule) === key) ?? null;
}

/** Separate formal facts from the interpretation of an authored passage. */
export const evidence: ReadonlyArray<{
  id: string; status: EvidenceStatus; scope: string; statement: string;
}> = [
  {
    id: 'seven-transitions',
    status: 'COMPUTED_IN_SESSION',
    scope: 'Eight-position binary recurrence/alternation model',
    statement: 'No eight-position binary assignment simultaneously has seven alternations and Monday recurrence.'
  },
  {
    id: 'fourteen-repairs',
    status: 'EXECUTABLY_CHECKED',
    scope: 'Exhaustive TypeScript enumeration over 256 assignments; repository CI tests',
    statement: 'Fourteen labelled schedules satisfy recurrence with exactly one repeated transition.'
  },
  {
    id: 'meaning-open',
    status: 'NOT_ESTABLISHED',
    scope: 'Interpretation of French prose',
    statement: 'The finite-model computation neither certifies character knowledge nor evaluates literary quality.'
  }
];

validatePublicEpisode(demoEpisode);
