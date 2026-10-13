/**
 * A distinct compositional mechanism: permutation of four fixed, authored fragments.
 *
 * The computation changes only fragment order. It does not rewrite sentences,
 * establish chronology, prove narrative meaning, or certify literary quality.
 * The fragments here are an independent, public demonstration; no unpublished
 * La Relève material is used.
 */
export const FRAGMENT_IDS = ['door', 'letter', 'question', 'bell'] as const;
export type FragmentId = typeof FRAGMENT_IDS[number];
export type FragmentOrder = readonly [FragmentId, FragmentId, FragmentId, FragmentId];

export interface AuthoredFragment {
  readonly id: FragmentId;
  readonly title: string;
  readonly text: string;
  readonly provenance: string;
}

export const authoredFragments: Readonly<Record<FragmentId, AuthoredFragment>> = {
  door: {
    id: 'door',
    title: 'Le seuil',
    provenance: 'poelio-original-permutation-demo-v1/door',
    text: 'La porte des Archives demeurait ouverte depuis l’aube. Les autres boutiques avaient tiré leurs rideaux, et la rue n’abritait plus que le bruit des balais contre les pavés. Sur le seuil, quelqu’un avait dessiné une flèche blanche. Elle indiquait l’intérieur, sauf pour ceux qui arrivaient en suivant le mur opposé.'
  },
  letter: {
    id: 'letter',
    title: 'L’enveloppe',
    provenance: 'poelio-original-permutation-demo-v1/letter',
    text: 'Dans un tiroir, une enveloppe portait trois dates et aucune adresse. Le papier avait jauni le long du pli, là où un doigt l’avait tenu suffisamment longtemps pour laisser une trace. À l’intérieur, une page blanche. Au verso, une seule phrase était inscrite au crayon, si pâle qu’il fallait l’approcher de la fenêtre pour la lire.'
  },
  question: {
    id: 'question',
    title: 'La question',
    provenance: 'poelio-original-permutation-demo-v1/question',
    text: 'Au bas du registre, une écriture différente demandait qui était venu en premier. Les noms avaient été soigneusement alignés sur la page précédente ; aucune heure ne figurait dans la marge. La question avait été soulignée deux fois, comme si son auteur avait voulu attirer l’attention du prochain lecteur sans lui révéler ce qu’il savait déjà.'
  },
  bell: {
    id: 'bell',
    title: 'La cloche',
    provenance: 'poelio-original-permutation-demo-v1/bell',
    text: 'À dix-huit heures, la cloche du bâtiment sonna quatre coups. Personne ne se présenta pour fermer la salle. Dans la cour, une femme s’arrêta devant les fenêtres éclairées, chercha quelque chose dans sa poche, puis repartit sans traverser la grille. Le gardien inscrivit « rien à signaler » dans son propre carnet et rentra chez lui.'
  }
} as const;

export const ORIGINAL_ORDER: FragmentOrder = ['door','letter','question','bell'];
export const COUNTER_ORDER: FragmentOrder = ['question','bell','door','letter'];

export function isFragmentOrder(value: readonly string[]): value is FragmentOrder {
  return value.length === 4 &&
    value.every((id) => (FRAGMENT_IDS as readonly string[]).includes(id)) &&
    new Set(value).size === 4;
}

/** Generate the entire 4! family once, without probabilistic sampling. */
export function allFragmentOrders(): FragmentOrder[] {
  const results: FragmentOrder[] = [];
  function visit(prefix: FragmentId[], available: FragmentId[]): void {
    if (available.length === 0) {
      if (!isFragmentOrder(prefix)) throw new Error('Invalid permutation');
      results.push([...prefix]);
      return;
    }
    for (const id of available) {
      visit([...prefix,id], available.filter(other => other !== id));
    }
  }
  visit([], [...FRAGMENT_IDS]);
  return results;
}

/** A sample order constraint: the question must precede the envelope. */
export function questionBeforeLetter(order: FragmentOrder): boolean {
  return order.indexOf('question') < order.indexOf('letter');
}

export function orderKey(order: readonly FragmentId[]): string {
  if (!isFragmentOrder(order)) throw new Error('Not a permutation of all four fragment IDs');
  return order.join('/');
}

/** Reassemble only the originally authored fragments, unedited, in a given order. */
export function passagesForOrder(order: FragmentOrder): AuthoredFragment[] {
  if (!isFragmentOrder(order)) throw new Error('Invalid fragment order');
  return order.map(id => authoredFragments[id]);
}
