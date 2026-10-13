import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {JourneyNavigation,JourneyFooter,useLiteraryJourney,type Language} from './JourneyControls.js';
import { useSessionDraft, clearAllPublicDrafts } from './useSessionDraft.js';
import {isFragmentOrder,orderKey,type FragmentOrder} from './permutation.js';
import {publicWorks} from './contentCatalog.js';
import {ReaderHeader} from './ReaderHeader.js';
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
    <div className="page-meta">Les Quatre Témoins · quatre fragments</div>
    {passagesForOrder(order).map((fragment,index)=><section key={fragment.id}
      className={comparedTo && comparedTo[index]!==fragment.id?'changed-passage':'fragment-passage'}>
      <p className="fragment-index">{String(index+1).padStart(2,'0')} / {fragment.title}</p>
      <p>{fragment.text}</p>
    </section>)}
  </article>;
}

export function PermutationExperience({onReturn,language,onToggleLanguage}: {
  onReturn:()=>void;language:Language;onToggleLanguage:()=>void
}): ReactNode {
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
    <ReaderHeader language={language} work="permutation" onSwitch={onReturn}
      onLanguage={onToggleLanguage}
      projector={projector} onProjector={()=>setProjector(v=>!v)}
      onReset={reset} onClear={clearForNextReader}/>
    <JourneyNavigation language={language} stage={stage} onNavigate={navigate}/>
    <main id="permutation-main" className="main-content" tabIndex={-1} ref={main}>
      {stage==='read' && <>
        <p className="eyebrow">{tr('01 / Lecture','01 / Reading')}</p>
        <h1 lang="fr">Les Quatre Témoins</h1>
        <p className="lede">{tr(
          'Lisez ces quatre fragments dans l’ordre présenté. Le parcours vous invitera ensuite à les déplacer.',
          'Read these four fragments in the order presented. You will be able to rearrange them in the next steps.'
        )}</p>
        <div className="reading-column"><Fragments order={ORIGINAL_ORDER}/></div>

      </>}
      {stage==='question' && <>
        <p className="eyebrow">{tr('02 / Votre lecture','02 / Your reading')}</p>
        <h1>{tr('Votre première lecture','Your first reading')}</h1>
        <p className="lede">{tr(
          'Dans quel ordre imaginez-vous les événements ? Notez votre impression avant de déplacer les fragments.',
          'In what sequence do you imagine the events occurred? Record your impression before rearranging the fragments.'
        )}</p>
        <label className="field-label" htmlFor="permutation-first">{tr('Première lecture (facultative)','First reading (optional)')}</label>
        <textarea id="permutation-first" rows={7} value={initial} onChange={e=>setInitial(e.target.value)}/>
        <p className="discreet">{tr('Votre réponse reste dans cet onglet pour la relecture.','Your answer stays in this tab for the final rereading.')}</p>
      </>}
      {stage==='explore' && <>
        <p className="eyebrow">{tr('03 / La contrainte','03 / The constraint')}</p>
        <h1>{tr('Changer l’ordre','Change the order')}</h1>
        <p className="lede">{tr(
          'Les quatre fragments restent identiques. Choisissez un ordre de lecture et observez comment le récit se transforme.',
          'The four fragments stay unchanged. Choose a reading order and consider how the story changes.'
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
        <p className="eyebrow">{tr('04 / Comparaison','04 / Comparison')}</p>
        <h1>{tr('Deux ordres de lecture','Two reading orders')}</h1>
        <p className="lede">{tr(
          'À gauche, l’ordre initial. À droite, votre arrangement. Lisez les deux versions et comparez leurs effets.',
          'The original order is on the left, your arrangement on the right. Read both and compare their effects.'
        )}</p>
        <div className="comparison">
          <Fragments order={ORIGINAL_ORDER} comparedTo={current}/>
          <Fragments order={current} comparedTo={ORIGINAL_ORDER}/>
        </div>

      </>}
      {stage==='invent' && <>
        <p className="eyebrow">{tr('05 / Écriture','05 / Writing')}</p>
        <h1>{tr('Proposer une règle','Propose a rule')}</h1>
        <p className="lede">{tr(
          'Imaginez une nouvelle règle pour disposer les fragments, puis écrivez quelques lignes à partir de ce choix.',
          'Invent an ordering rule for the fragments, then write a short passage inspired by it.'
        )}</p>
        <label htmlFor="permutation-rule" className="field-label">{tr('Votre règle','Your rule')}</label>
        <input id="permutation-rule" value={rule} maxLength={400} onChange={e=>setRule(e.target.value)}
          placeholder={tr('Par exemple : la cloche précède toute question…','For example: the bell precedes every question…')}/>
        <label htmlFor="permutation-writing" className="field-label">{tr('Votre fragment littéraire','Your literary fragment')}</label>
        <textarea id="permutation-writing" rows={9} value={writing} onChange={e=>setWriting(e.target.value)}/>
        <div className="editor-footer">
          <span>{writing.trim()?writing.trim().split(/\s+/u).length:0} {tr('mots','words')}</span>
          <button className="outline-button" type="button" onClick={exportResponse}>{tr('Exporter ma création','Export my writing')}</button>
        </div>
      </>}
      {stage==='reflect' && <>
        <p className="eyebrow">{tr('06 / Relecture','06 / Rereading')}</p>
        <h1>{tr('Revenir aux fragments','Return to the fragments')}</h1>
        <p className="lede">{tr(
          'Relisez votre première impression. Qu’est-ce que le nouvel ordre vous a fait remarquer ?',
          'Read your first impression again. What did a different order bring to your attention?'
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
    <div className="disclaimer">{tr('Vos écrits restent dans cet onglet. Exportez-les pour les conserver.','Your writing stays in this tab. Export it to keep a copy.')}</div>
  </div>;
}
