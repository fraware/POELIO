import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {JourneyNavigation,JourneyFooter,useLiteraryJourney,type Language} from './JourneyControls.js';
import { useSessionDraft, clearAllPublicDrafts } from './useSessionDraft.js';
import {isFragmentOrder,orderKey,type FragmentOrder} from './permutation.js';
import {publicWorks} from './contentCatalog.js';
const {orders:ALL,originalOrder:ORIGINAL_ORDER,comparisonOrder:COUNTER_ORDER,
  fragments:authoredFragments}=publicWorks.permutation;
const passagesForOrder=publicWorks.permutation.passages;
const questionBeforeLetter=publicWorks.permutation.condition;

const BY_KEY = new Map(ALL.map(order=>[orderKey(order), order]));
if (BY_KEY.size !== 24) throw new Error('Invalid permutation catalogue');

function saveLocally(content: string): void {
  const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href=url;
  anchor.download='poelio-fragments-et-invention.txt';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/** Reading view preserves each attributed fragment's exact string. */
function Fragments({order, comparedTo}: {
  order:FragmentOrder; comparedTo?:FragmentOrder;
}): ReactNode {
  return <article className="manuscript" lang="fr">
    <div className="page-meta">Les Quatre Témoins · démonstration originale · ordre construit</div>
    {passagesForOrder(order).map((fragment,index)=><section key={fragment.id}
      className={comparedTo && comparedTo[index]!==fragment.id?'changed-passage':'fragment-passage'}>
      <p className="fragment-index">{String(index+1).padStart(2,'0')} / {fragment.title}</p>
      <p>{fragment.text}</p>
    </section>)}
  </article>;
}

export function PermutationExperience({onReturn}: {onReturn:()=>void}): ReactNode {
  const [language,setLanguage]=useState<Language>('fr');
  const {stage,current:index,mainRef:main,navigate,move:step}=useLiteraryJourney();
  const [selected,setSelected]=useState(orderKey(COUNTER_ORDER));
  const [limited,setLimited]=useState(false);
  const [initial,setInitial]=useSessionDraft('permutation','initial');
  const [revised,setRevised]=useSessionDraft('permutation','revised');
  const [rule,setRule]=useSessionDraft('permutation','rule');
  const [writing,setWriting]=useSessionDraft('permutation','writing');
  const [projector,setProjector]=useState(false);
  const tr=(fr:string,en:string)=>language==='fr'?fr:en;
  const orders=useMemo(()=>limited?ALL.filter(questionBeforeLetter):ALL,[limited]);
  const current=BY_KEY.get(selected)??COUNTER_ORDER;
  const permitted=questionBeforeLetter(current);

  useEffect(()=>{document.documentElement.lang=language;},[language]);
  function setConstraint(enabled:boolean):void {
    setLimited(enabled);
    if(enabled && !permitted){
      const next=ALL.find(questionBeforeLetter);
      if(!next)throw new Error('Expected a valid constrained arrangement');
      setSelected(orderKey(next));
    }
  }
  function clearForNextReader():void {
    if(!window.confirm(tr(
      'Effacer les textes et les réponses des deux œuvres de cet onglet ? Exportez d’abord ce que vous souhaitez conserver.',
      'Erase drafts and interpretations for BOTH works in this tab? Export any writing you want to keep first.'
    )))return;
    clearAllPublicDrafts();
    window.location.reload();
  }
  function reset():void {
    if(!window.confirm(tr('Effacer les réponses de cette œuvre dans cet onglet et recommencer ?','Erase this work’s answers in this tab and restart?')))return;
    setInitial('');setRevised('');setRule('');setWriting('');
    setSelected(orderKey(COUNTER_ORDER));setLimited(false);
    navigate('read');
  }
  function exportResponse():void {
    saveLocally([
      'POELIO — Les Quatre Témoins',
      'Ordre choisi / Selected order: '+current.join(' → '),
      'Règle inventée / Invented rule: '+rule,
      '','Texte / Writing:',writing,
      '','Première interprétation / First interpretation:',initial,
      '','Interprétation révisée / Revised interpretation:',revised
    ].join('\n'));
  }
  return <div className={projector?'app projector':'app'}>
    <a className="skip-link" href="#permutation-main">{tr('Aller au texte','Skip to text')}</a>
    <header className="topbar">
      <div className="brand-block">
        <span className="brand">POELIO<span className="brand-mark">✳</span></span>
        <span className="brand-desc">{tr('Un autre mécanisme littéraire','Another literary mechanism')}</span>
      </div>
      <div className="header-actions">
        <button type="button" className="text-button" onClick={onReturn}>{tr('← Registre des clefs','← Register of Keys')}</button>
        <a className="text-button" href={import.meta.env.BASE_URL + 'facilitator.html'} target="_blank" rel="noopener noreferrer">{tr('Guide d’atelier','Workshop guide')}</a>
        <button type="button" className="text-button" onClick={()=>setLanguage(v=>v==='fr'?'en':'fr')}
          aria-label={tr('Switch to English','Passer en français')}>{language==='fr'?'EN':'FR'}</button>
        <button type="button" className="text-button" aria-pressed={projector}
          onClick={()=>setProjector(v=>!v)}>{projector?tr('Normal','Normal'):tr('Projection','Projector')}</button>
        <button type="button" className="text-button" onClick={reset}>{tr('Recommencer','Reset')}</button>
        <button type="button" className="text-button" onClick={clearForNextReader}>{tr('Effacer toutes mes réponses','Erase all my drafts')}</button>
      </div>
    </header>
    <JourneyNavigation language={language} stage={stage} onNavigate={navigate}/>
    <main id="permutation-main" className="main-content" tabIndex={-1} ref={main}>
      {stage==='read' && <>
        <p className="eyebrow">{tr('01 / PREMIÈRE LECTURE','01 / FIRST READING')}</p>
        <h1>{tr('La porte était ouverte.','The door stood open.')}</h1>
        <p className="lede">{tr(
          'Une porte, une enveloppe, une question. Lisez ce récit et imaginez ce qui a précédé chacun de ces événements. Le procédé de composition apparaîtra plus tard.',
          'A door, an envelope, a question. Read this story and imagine what preceded each event. Its compositional procedure will emerge later.'
        )}</p>
        <div className="reading-column"><Fragments order={ORIGINAL_ORDER}/></div>
        <p className="discreet">{tr(
          'Fiction expérimentale originale. Cette œuvre et ses fragments ne proviennent pas de La Relève.',
          'Original experimental fiction. This work and its fragments are not from La Relève.'
        )}</p>
      </>}
      {stage==='question' && <>
        <p className="eyebrow">{tr('02 / INTERPRÉTATION','02 / INTERPRETATION')}</p>
        <h1>{tr('Qui est venu en premier ?','Who arrived first?')}</h1>
        <p className="lede">{tr(
          'Qu’est-ce qui vous fait croire à un ordre des événements ? Notez une hypothèse avant de modifier le texte.',
          'What makes you believe in an order of events? Record a hypothesis before changing the text.'
        )}</p>
        <label className="field-label" htmlFor="permutation-first">{tr('Première lecture (facultative)','First reading (optional)')}</label>
        <textarea id="permutation-first" rows={7} value={initial} onChange={e=>setInitial(e.target.value)}/>
        <p className="discreet">{tr('Votre réponse reste dans cet onglet pendant la session, y compris après actualisation. « Recommencer » l’efface.','Your response stays in this tab during the session, even after refresh. Reset clears it.')}</p>
      </>}
      {stage==='explore' && <>
        <p className="eyebrow">{tr('03 / MÉCANISME','03 / THE MECHANISM')}</p>
        <h1>{tr('Déplacer sans réécrire.','Reorder without rewriting.')}</h1>
        <p className="lede">{tr(
          'Quatre fragments fixes admettent 24 ordres possibles. Aucun mot de chaque fragment ne change. Le choix de la succession appartient au lecteur.',
          'Four fixed fragments admit 24 possible orders. Not a word within a fragment changes. The reader chooses the sequence.'
        )}</p>
        <div className="factline">
          <span>4 {tr('fragments attribués','attributed fragments')}</span>
          <span>24 {tr('permutations complètes','complete permutations')}</span>
          <span>12 {tr('si la question précède l’enveloppe','if the question precedes the envelope')}</span>
        </div>
        <label className="field-label" htmlFor="order-filter">
          <input id="order-filter" type="checkbox" checked={limited} onChange={e=>setConstraint(e.target.checked)}
            className="inline-checkbox"/>
          {tr('Imposer que la question précède l’enveloppe','Require the question to precede the envelope')}
        </label>
        <label htmlFor="permutation-select" className="field-label">{tr('Choisir un ordre de lecture','Choose a reading order')}</label>
        <select id="permutation-select" value={selected} onChange={e=>{
          if(!BY_KEY.has(e.target.value))throw new Error('Unrecognized literary arrangement');
          setSelected(e.target.value);
        }}>
          {orders.map(o=><option key={orderKey(o)} value={orderKey(o)}>
            {o.map(id=>authoredFragments[id].title).join(' → ')}
          </option>)}
        </select>
        <p className="model-result" aria-live="polite">{limited
          ?tr('12 ordres satisfont la contrainte.','12 orders satisfy the chosen constraint.')
          :tr('24 ordres constituent l’espace exhaustif.','24 orders form the complete possibility space.')}
        </p>
        <div className="reading-column"><Fragments order={current}/></div>
        <details className="details"><summary>{tr('Que prouve le calcul ?','What does the computation establish?')}</summary>
          <p>{tr(
            'La liste des 24 ordres est exhaustive, et exactement 12 placent le fragment de la question avant celui de l’enveloppe. Le programme ne déduit aucune chronologie certaine ni interprétation littéraire.',
            'The list of 24 orders is exhaustive, and exactly 12 put the question fragment before the envelope fragment. The program does not establish a real chronology or a literary interpretation.'
          )}</p>
        </details>
      </>}
      {stage==='compare' && <>
        <p className="eyebrow">{tr('04 / DEUX LECTURES','04 / TWO READINGS')}</p>
        <h1>{tr('Les mêmes mots, un autre commencement.','The same words, a different beginning.')}</h1>
        <p className="lede">{tr(
          'La colonne de gauche conserve le premier ordre. À droite, votre ordre actuel. Les fragments déplacés sont signalés par leur nouvelle position. Comparez les interprétations possibles.',
          'The left column retains the first order. On the right is your selected order. Moved fragments are marked by their positions. Compare possible interpretations.'
        )}</p>
        <div className="comparison">
          <Fragments order={ORIGINAL_ORDER} comparedTo={current}/>
          <Fragments order={current} comparedTo={ORIGINAL_ORDER}/>
        </div>
        <p className="discreet">{tr(
          'Les quatre paragraphes sont des fragments fixes écrits pour cette démonstration. Leur permutation est calculée ; aucun passage de transition n’est généré.',
          'All four paragraphs are fixed fragments written for this demonstration. Their permutation is computed; no transitions or alternative prose are generated.'
        )}</p>
      </>}
      {stage==='invent' && <>
        <p className="eyebrow">{tr('05 / VOTRE CONTRAINTE','05 / YOUR CONSTRAINT')}</p>
        <h1>{tr('Inventez un nouvel ordre.','Invent a new ordering rule.')}</h1>
        <p className="lede">{tr(
          'Énoncez votre propre règle pour organiser ces fragments, puis écrivez quelques lignes qui en explorent une conséquence. Le logiciel ne juge pas votre réponse.',
          'Describe your own rule for ordering these fragments, then write a short passage exploring its consequences. The software does not score your response.'
        )}</p>
        <label htmlFor="permutation-rule" className="field-label">{tr('Votre règle','Your rule')}</label>
        <input id="permutation-rule" value={rule} maxLength={400} onChange={e=>setRule(e.target.value)}
          placeholder={tr('Par exemple : la cloche précède toute question…','For example: the bell precedes every question…')}/>
        <label htmlFor="permutation-writing" className="field-label">{tr('Votre fragment littéraire','Your literary fragment')}</label>
        <textarea id="permutation-writing" rows={9} value={writing} onChange={e=>setWriting(e.target.value)}/>
        <div className="editor-footer">
          <span>{writing.trim()?writing.trim().split(/\s+/u).length:0} {tr('mots · non évalués','words · unscored')}</span>
          <button className="outline-button" type="button" onClick={exportResponse}>{tr('Exporter ma création','Export my writing')}</button>
        </div>
      </>}
      {stage==='reflect' && <>
        <p className="eyebrow">{tr('06 / REVENIR AU TEXTE','06 / RETURN TO THE TEXT')}</p>
        <h1>{tr('Où commence une histoire ?','Where does a story begin?')}</h1>
        <p className="lede">{tr(
          'Quels faits appartenaient au texte ? Lesquels provenaient de l’ordre de lecture ou de votre imagination ?',
          'Which facts belonged to the text? Which arose from reading order or your imagination?'
        )}</p>
        <div className="reflection">
          <section><h2>{tr('Votre première hypothèse','Your first hypothesis')}</h2><blockquote>{initial||tr('Aucune réponse.','No response.')}</blockquote></section>
          <section><label className="field-label" htmlFor="permutation-revised">{tr('Votre interprétation maintenant','Your interpretation now')}</label>
            <textarea id="permutation-revised" rows={6} value={revised} onChange={e=>setRevised(e.target.value)}/></section>
        </div>
        <div className="history">
          <h2>{tr('Une méthode, plusieurs écritures','One method, multiple forms')}</h2>
          <p>{tr(
            'Permuter des fragments constitue ici une expérience originale avec des textes explicitement attribués. Cela appartient à une tradition plus vaste d’invention combinatoire ; cette démonstration ne revendique ni nouveauté historique ni affiliation avec l’Oulipo.',
            'Permuting fixed, attributed fragments is an original demonstration within a much older tradition of combinatorial invention. It claims neither historical priority nor Oulipo affiliation.'
          )}</p>
        </div>
        <button className="primary-button" type="button" onClick={exportResponse}>{tr('Conserver ma création','Keep my writing')}</button>
      </>}
    </main>
    <JourneyFooter language={language} index={index} title="Les Quatre Témoins" onMove={step}/>
    <div className="disclaimer">{tr(
      'Démonstration expérimentale · 24 arrangements vérifiés par tests · Écriture locale · Pas de génération de prose',
      'Experimental demonstration · 24 orders checked by tests · Local writing · No prose generation'
    )}</div>
  </div>;
}
