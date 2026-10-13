/**
 * A publication-safe, text-free public mathematical explorer.
 * It is not a digital literary edition and does not load manuscripts.
 */
import { minimumRepairs, repeatedEdges, type Person, type Schedule } from './model.js';

type Language = 'en' | 'fr';
type Mode = 'strict' | 'repair';
const repairs = minimumRepairs();
if (repairs.length !== 14) throw new Error('Unexpected finite solution family');

const dayNames: Record<Language, string[]> = {
  en: ['Mon₀', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon₁'],
  fr: ['Lun₀', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim', 'Lun₁']
};
let language: Language = 'en';
let mode: Mode = 'strict';
let fault = 0;
let person: Person = 'A';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing application root');

function choice(): Schedule {
  const item = repairs.find(r => r.faultEdge === fault && r.repeatedCaregiver === person);
  if (!item) throw new Error('Missing canonical repair');
  return item.schedule;
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K, classes: string, text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = classes;
  if (text !== undefined) node.textContent = text;
  return node;
}

function translate(en: string, fr: string): string {
  return language === 'en' ? en : fr;
}

function button(label: string, action: string, active = false): HTMLButtonElement {
  const result = element('button', active ? 'button active' : 'button', label);
  result.type = 'button';
  result.dataset.action = action;
  result.setAttribute('aria-pressed', String(active));
  return result;
}

function render(): void {
  const focused = document.activeElement?.getAttribute('data-action');
  root.replaceChildren();
  document.documentElement.lang = language;
  const header = element('header', 'header');
  header.append(
    element('div', 'brand', 'POELIO'),
    button(translate('Français', 'English'), 'language')
  );
  root.append(header);

  const main = element('main', 'main');
  main.append(
    element('p', 'eyebrow', translate('An experiment in possibility', 'Une expérience des possibles')),
    element('h1', 'heading', translate(
      'An impossible rule. Fourteen possibilities.',
      'Une règle impossible. Quatorze possibles.'
    )),
    element('p', 'introduction', translate(
      'Explore an eight-day arrangement for two abstract participants, A and B. The last Monday must return to the same participant as the first. But what if every handover must alternate?',
      'Explorez huit positions de jours entre deux personnes abstraites, A et B. Le dernier lundi doit revenir à la personne du premier. Mais si chaque relais devait alterner ?'
    ))
  );
  const toolbar = element('section', 'toolbar');
  toolbar.setAttribute('aria-label', translate('Constraint choices', 'Choix des contraintes'));
  toolbar.append(
    button(translate('Strict alternation', 'Alternance stricte'), 'strict', mode === 'strict'),
    button(translate('One exception', 'Une exception'), 'repair', mode === 'repair')
  );
  main.append(toolbar);

  const schedule = mode === 'strict'
    ? (['A','B','A','B','A','B','A','B'] as Schedule)
    : choice();
  const grid = element('div', 'schedule');
  grid.setAttribute('role', 'list');
  for (let index = 0; index < 8; index++) {
    const cell = element('div', 'cell');
    cell.setAttribute('role', 'listitem');
    cell.append(
      element('span', 'day', dayNames[language][index]),
      element('strong', 'person', schedule[index])
    );
    if (mode === 'repair' && index === fault + 1) {
      cell.classList.add('exception');
      cell.append(element('small', 'flag', translate('Repeated', 'Répétition')));
    }
    grid.append(cell);
  }
  main.append(grid);

  const explanation = element('section', 'explanation');
  explanation.setAttribute('aria-live', 'polite');
  if (mode === 'strict') {
    explanation.append(
      element('h2', '', translate('The contradiction', 'La contradiction')),
      element('p', '', translate(
        'Seven alternating transitions reverse the assignment. Thus Monday₀ and Monday₁ are different, violating recurrence. Among the 256 binary schedules, none satisfies both rules.',
        'Sept alternances inversent la personne. Les deux lundis sont donc différents, en contradiction avec le retour imposé. Aucune des 256 configurations ne satisfait les deux règles.'
      ))
    );
  } else {
    explanation.append(
      element('h2', '', translate('A minimum repair', 'Une réparation minimale')),
      element('p', '', translate(
        'Allow exactly one repeated transition. The two Mondays now agree, and all other transitions alternate. Exhaustive enumeration gives seven possible repetition positions and two choices of participant: 14 solutions.',
        'Autorisez exactement une répétition. Les deux lundis coïncident et tous les autres relais alternent. L’énumération exhaustive donne sept positions possibles et deux choix de personne : 14 solutions.'
      ))
    );
    const controls = element('div', 'controls');
    controls.append(
      element('p', 'control-label', translate('Repeat on transition', 'Répéter au passage'))
    );
    const edges = element('div', 'edge-buttons');
    for (let index = 0; index < 7; index++) {
      edges.append(button(
        dayNames[language][index] + ' → ' + dayNames[language][index + 1],
        'edge-' + index,
        fault === index
      ));
    }
    controls.append(edges, element('p', 'control-label', translate('Repeated participant', 'Personne répétée')));
    const people = element('div', 'toolbar');
    people.append(button('A', 'person-A', person === 'A'), button('B', 'person-B', person === 'B'));
    controls.append(people);
    explanation.append(controls);
    const invariant = repeatedEdges(schedule);
    const report = element('p', 'result',
      translate('Recurrent: ', 'Retour respecté : ') +
      String(schedule[0] === schedule[7]) +
      translate(' · Repeated edges: ', ' · Répétitions : ') +
      invariant.join(', ')
    );
    explanation.append(report);
  }
  main.append(explanation);
  const footer = element('footer', 'footer', translate(
    'This is an open mathematical demonstration, not the unpublished literary edition. No AI, accounts, tracking, literary scoring or Lean execution.',
    'Ceci est une démonstration mathématique ouverte, non l’édition littéraire inédite. Sans IA, comptes, suivi, évaluation littéraire ni exécution de Lean.'
  ));
  main.append(footer);
  root.append(main);
  if (focused) {
    const target = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-action]'))
      .find(item => item.dataset.action === focused);
    target?.focus({ preventScroll: true });
  }
}

root.addEventListener('click', event => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const clicked = target.closest<HTMLButtonElement>('button[data-action]');
  const action = clicked?.dataset.action;
  if (!action) return;
  if (action === 'language') language = language === 'en' ? 'fr' : 'en';
  else if (action === 'strict' || action === 'repair') mode = action;
  else if (action.startsWith('edge-')) {
    const value = Number(action.slice(5));
    if (Number.isInteger(value) && value >= 0 && value < 7) fault = value;
  } else if (action === 'person-A' || action === 'person-B') {
    person = action === 'person-A' ? 'A' : 'B';
  }
  render();
});
render();
