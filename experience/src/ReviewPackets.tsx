/**
 * Editor-ready, pre-reveal source readings and a noninteractive companion.
 *
 * Both derive prose directly from the reviewed, pinned public fixtures.
 * No unpublished La Relève prose, automated rating, or response upload.
 * A first-reading packet must never include a compositional explanation.
 */
import {useRef, useState, type ReactNode} from 'react';
import {publicWorks} from './contentCatalog.js';
const {episode:demoEpisode}=publicWorks.register;
const {originalOrder:ORIGINAL_ORDER,comparisonOrder:COUNTER_ORDER,
  passages:passagesForOrder}=publicWorks.permutation;

export type ReviewWork = 'register'|'permutation';
export type PacketKind = 'first-reading'|'static-companion';

export interface ReadingPacket {
  readonly slug: ReviewWork;
  readonly label: string;
  readonly paragraphs: readonly string[];
  readonly notice: string;
}

const register = demoEpisode.realizations[0];
export const packets: Readonly<Record<ReviewWork,ReadingPacket>> = {
  register: {
    slug: 'register',
    label: 'Texte A',
    paragraphs: register.passages.map(p=>p.text),
    notice: 'Texte original composé pour cet atelier.'
  },
  permutation: {
    slug: 'permutation',
    label: 'Texte B',
    paragraphs: passagesForOrder(ORIGINAL_ORDER).map(p=>p.text),
    notice: 'Quatre fragments originaux composés pour cet atelier.'
  }
};

export function isReviewWork(value: string|null): value is ReviewWork {
  return value==='register'||value==='permutation';
}

function PlainReading({packet}: {packet:ReadingPacket}): ReactNode {
  return <article lang="fr" className="review-text" aria-label={'Texte de lecture '+packet.label}>
    {packet.paragraphs.map((text,i)=><p key={i}>{text}</p>)}
  </article>;
}

function saveReview(work:ReviewWork,first:string,critique:string):void {
  const data=[
    'POELIO — Note de lecture indépendante (non envoyée)',
    'Texte : '+packets[work].label,
    '',
    'Première lecture avant contexte',
    first,
    '',
    'Deuxième lecture et critique littéraire',
    critique,
    '',
    'Réponses privées. Partage uniquement par décision du lecteur.'
  ].join('\n');
  const url=URL.createObjectURL(new Blob([data],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');
  a.href=url;
  a.download='poelio-note-de-lecture-'+work+'.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/** Pre-reveal page: zero names or structural explanations in the initial text. */
export function FirstReadingPacket({work}: {work:ReviewWork}): ReactNode {
  const packet=packets[work];
  const [first,setFirst]=useState('');
  const [second,setSecond]=useState('');
  const [phase,setPhase]=useState<'unprimed'|'editorial'>('unprimed');
  const stageRef=useRef<HTMLHeadingElement>(null);
  function reveal():void {
    setPhase('editorial');
    requestAnimationFrame(()=>stageRef.current?.focus());
  }
  return <div className="review-shell">
    <a className="skip-link" href="#review-main">Aller au texte</a>
    <main id="review-main" className="review-main">
      <header className="review-top">
        <span className="review-code">{packet.label}</span>
        <span className="review-private">Lecture personnelle · aucune transmission</span>
      </header>
      <h1 className="review-head">Une lecture, avant tout commentaire</h1>
      <p className="review-intro">
        Lisez sans consulter d’explication sur la fabrication du texte.
        Consignez votre impression initiale, même si elle vous paraît incertaine.
      </p>
      <PlainReading packet={packet}/>
      <section className="review-response" aria-labelledby="first-review-heading">
        <h2 id="first-review-heading">Première impression</h2>
        <p>Quels mots, images, relations ou questions retiennent votre attention ?
          Qu’est-ce qui vous semble réussi, problématique ou inexpliqué ?</p>
        <label className="review-label" htmlFor="review-initial">Votre lecture personnelle (facultative)</label>
        <textarea id="review-initial" rows={8} value={first}
          onChange={e=>setFirst(e.target.value)}/>
        <p className="review-footnote">Votre réponse reste dans cet onglet. Elle est perdue à la fermeture
          ou à l’actualisation, sauf si vous choisissez de la conserver.</p>
      </section>
      {phase==='unprimed'
        ? <div className="review-actions no-print">
            <button type="button" className="primary-button" onClick={reveal}>
              Continuer vers la critique éditoriale
            </button>
            <button type="button" className="outline-button"
              onClick={()=>saveReview(work,first,second)}>Conserver ma première lecture</button>
          </div>
        : <section className="review-second" aria-labelledby="editorial-review-heading">
            <h2 id="editorial-review-heading" tabIndex={-1} ref={stageRef}>Deuxième lecture — avis éditorial</h2>
            <p>Relisez librement. Évaluez le texte <em>comme œuvre littéraire</em>, avant de juger
              l’intérêt de son éventuel dispositif technique. Les désaccords argumentés ont autant
              de valeur que les appréciations favorables.</p>
            <ol>
              <li>Où réside l’intérêt propre de la prose, de sa diction et de son rythme ?</li>
              <li>Quelles images, ambiguïtés ou décisions narratives portent réellement le texte ?</li>
              <li>Quels passages paraissent forcés, faibles ou privés de nécessité littéraire ?</li>
              <li>Quelle révision concrète proposeriez-vous, et avec quel risque pour la composition ?</li>
              <li>Le texte mérite-t-il d’être lu indépendamment d’une démonstration informatique ? Pourquoi ?</li>
            </ol>
            <label htmlFor="review-second" className="review-label">Notes critiques et propositions (facultatives)</label>
            <textarea id="review-second" rows={9} value={second} onChange={e=>setSecond(e.target.value)}/>
            <div className="review-actions no-print">
              <button type="button" className="primary-button"
                onClick={()=>saveReview(work,first,second)}>Exporter mon avis en fichier texte</button>
            </div>
          </section>
      }
      <footer className="review-footer">
        <p>{packet.notice} Document de lecture, non affilié à l’Oulipo.</p>
        <p>Aucune réponse enregistrée sur serveur, aucun jugement littéraire automatique.</p>
      </footer>
    </main>
  </div>;
}

function StaticInterpretation({work}:{work:ReviewWork}):ReactNode {
  if (work==='register') {
    return <>
      <h2>Une contrainte de relais</h2>
      <p>Deux personnes se relaient sur huit positions, du lundi initial au lundi suivant.
        Le retour attribue les deux lundis à la même personne. Sept alternances parfaites
        conduisent pourtant à deux personnes différentes. Les deux obligations sont incompatibles.</p>
      <p>Parmi les 256 attributions binaires possibles, aucune ne satisfait la récurrence
        et les sept alternances à la fois. Si l’on maintient la récurrence et autorise exactement
        un relais répété, il existe quatorze configurations, soit sept passages possibles
        multipliés par deux personnes. Cette affirmation porte sur le modèle fini, non sur le récit.</p>
      <p>La première réalisation attribue la répétition à Mira entre les deux premiers jours.
        Un autre passage original, présenté ci-dessous, attribue la répétition à Noor entre
        le dimanche et le lundi final. Les douze autres configurations n’ont pas de texte
        rédigé dans cette édition de démonstration.</p>
      <h3>Deuxième réalisation, rédigée et attribuée</h3>
      <PlainReading packet={{
        slug:'register',label:'Texte A — seconde réalisation',
        paragraphs:demoEpisode.realizations[1].passages.map(p=>p.text),
        notice:packets.register.notice
      }}/>
      <h3>Questions pour la lecture</h3>
      <p>La présence de deux jours consécutifs change le point d’observation du personnage.
        Quel effet cela produit-il effectivement dans les phrases ? Comment distinguer
        cette observation d’une interprétation supposée sur ce que le personnage comprend ?</p>
    </>;
  }
  return <>
    <h2>Un dispositif de permutation</h2>
    <p>Quatre fragments de prose sont déjà écrits. La construction ne modifie aucun
      mot à l’intérieur de ces passages ; elle en modifie exclusivement la succession.
      Il existe 4 × 3 × 2 × 1 = 24 ordres distincts. Une règle supplémentaire,
      « la question avant l’enveloppe », est satisfaite dans douze de ces ordres.</p>
    <p>Une permutation n’est ni une nouvelle phrase générée ni une preuve d’une
      chronologie véritable. Les informations que le lecteur considère comme des causes
      ou des conséquences appartiennent à l’interprétation.</p>
    <h3>Les mêmes fragments dans un autre ordre</h3>
    <PlainReading packet={{
      slug:'permutation',label:'Texte B — autre arrangement',
      paragraphs:passagesForOrder(COUNTER_ORDER).map(p=>p.text),
      notice:packets.permutation.notice
    }}/>
    <h3>Questions pour la lecture</h3>
    <p>Que devient le sens de « qui est venu en premier » si le passage contenant
      cette question ouvre le texte ? Quels rapports temporels le texte établit-il,
      et lesquels le lecteur invente-t-il ? Quelles séquences semblent moins convaincantes ?</p>
  </>;
}

/** A complete, noninteractive interpretive companion for future static comparisons. */
export function StaticReadingCompanion({work}:{work:ReviewWork}):ReactNode {
  const packet=packets[work];
  return <div className="review-shell">
    <a className="skip-link" href="#static-main">Aller au document</a>
    <main id="static-main" className="review-main">
      <header className="review-top">
        <span className="review-code">{packet.label}</span>
        <span className="review-private">Édition de lecture statique</span>
      </header>
      <h1 className="review-head">Lire, comprendre, interpréter</h1>
      <p className="review-intro">Cette édition explicative présente un texte littéraire,
        son mécanisme et une autre lecture sans interaction informatique. Elle sert
        de comparaison éditoriale possible, pas de condition expérimentale déjà validée.</p>
      <PlainReading packet={packet}/>
      <section className="review-explanation">
        <StaticInterpretation work={work}/>
        <h2>Pour inventer à votre tour</h2>
        <p>Imaginez une règle formelle différente. Décrivez-la en quelques phrases,
          puis composez un texte bref. Discutez de ce que cette règle rend intéressant,
          de ce qu’elle empêche et des situations dans lesquelles la transgresser
          serait artistiquement fécond.</p>
        <h2>Revenir au premier texte</h2>
        <p>Reprenez votre impression initiale. Qu’avez-vous appris sur la construction ?
          En quoi cela modifie-t-il votre lecture ? Les choix de l’auteur ne se réduisent
          pas aux propriétés du modèle.</p>
      </section>
      <footer className="review-footer">
        <p>Exemplaire original de démonstration POELIO · textes existants et attribués ·
          calcul fini vérifié par tests · interprétation ouverte.</p>
        <p>Projet indépendant, sans affiliation ni endorsement de l’Oulipo.</p>
      </footer>
    </main>
  </div>;
}
