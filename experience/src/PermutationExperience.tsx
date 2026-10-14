import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {JourneyNavigation,JourneyFooter,useLiteraryJourney,type Language} from './JourneyControls.js';
import { useSessionDraft, clearAllPublicDrafts } from './useSessionDraft.js';
import {FRAGMENT_IDS,isFragmentOrder,orderKey,type FragmentOrder,type FragmentId} from './permutation.js';
import {
  createOrderState,reorderItems,undoOrder,redoOrder,resetOrder,type OrderTransition,
  type OrderRule
} from './orderEngine.js';
import {FragmentBoard} from './FragmentBoard.js';
import {publicWorks} from './contentCatalog.js';
import {ReaderHeader} from './ReaderHeader.js';
import {PortableBackupPanel,type RestoreMode} from './PortableBackupPanel.js';
import {ComparisonSpace} from './ComparisonSpace.js';
import {FirstReadingNote,ExplorationBridge} from './ReaderContinuity.js';
import {ReaderWritingDesk,ReaderArchiveActions} from './ReaderWritingDesk.js';
import {useBackupDisclosure} from './useBackupDisclosure.js';
import {mergeReaderDrafts,type ReaderBackupV1,type ReaderDrafts} from './readerBackup.js';
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
  const [orderState,setOrderState]=useState(()=>createOrderState(FRAGMENT_IDS,COUNTER_ORDER));
  const [feedback,setFeedback]=useState('');
  const [limited,setLimited]=useState(false);
  const [initial,setInitial]=useSessionDraft('permutation','initial');
  const [revised,setRevised]=useSessionDraft('permutation','revised');
  const [rule,setRule]=useSessionDraft('permutation','rule');
  const [writing,setWriting]=useSessionDraft('permutation','writing');
  const [projector,setProjector]=useState(false);
  const {backupOpen,openBackup,closeBackup,dismissBackup}=useBackupDisclosure();
  const drafts:ReaderDrafts={initial,revised,rule,writing};
  const tr=(fr:string,en:string)=>language==='fr'?fr:en;
  const orders=useMemo(()=>limited?ALL.filter(questionBeforeLetter):ALL,[limited]);
  if(!isFragmentOrder(orderState.order))throw new Error('Invalid controlled fragment order');
  const current=orderState.order;
  const selected=orderKey(current);
  const permitted=questionBeforeLetter(current);
  const activeRule:OrderRule<FragmentId>|undefined=limited
    ?candidate=>isFragmentOrder(candidate)&&questionBeforeLetter(candidate)
    :undefined;

  useEffect(()=>{document.documentElement.lang=language;},[language]);
  function setConstraint(enabled:boolean):void {
    setLimited(enabled);
    setFeedback(enabled
      ?(permitted
        ?tr('Contrainte activée. Les déplacements contraires à la règle sont refusés.',
            'Rule enabled. Moves that break it are rejected.')
        :tr('Cet ordre ne satisfait pas la règle. Déplacez la question avant l’enveloppe.',
            'This order does not satisfy the rule. Move the question before the envelope.'))
      :tr('Contrainte désactivée. Les 24 ordres sont accessibles.',
          'Rule disabled. All 24 arrangements are available.'));
  }
  function applyTransition(result:OrderTransition<FragmentId>,description:string):void {
    if(!result.accepted){
      setFeedback(tr('Déplacement refusé : la question doit précéder l’enveloppe.',
        'Move rejected: the question must precede the envelope.'));
      return;
    }
    if(!result.changed){
      setFeedback(tr('L’ordre est déjà ainsi.','The order is already in this position.'));
      return;
    }
    setOrderState(result.state);
    setFeedback(tr('Ordre modifié : '+description+'.','Order changed: '+description+'.'));
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
    setOrderState(createOrderState(FRAGMENT_IDS,COUNTER_ORDER));setLimited(false);setFeedback('');
    dismissBackup();
    navigate('read');
  }
  function restoreReaderBackup(backup:ReaderBackupV1,mode:RestoreMode):void {
    if(backup.work!=='permutation'||backup.configuration.kind!=='permutation')
      throw new Error('Wrong backup work');
    const next=mode==='merge'?mergeReaderDrafts(drafts,backup.drafts):backup.drafts;
    setInitial(next.initial);setRevised(next.revised);setRule(next.rule);setWriting(next.writing);
    if(mode==='replace'){
      setOrderState(createOrderState(FRAGMENT_IDS,backup.configuration.order));
      setLimited(backup.configuration.limited);
      setFeedback('');
    }
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
      onReset={reset} onClear={clearForNextReader} onBackup={openBackup}/>
    <JourneyNavigation language={language} stage={stage} onNavigate={navigate}/>
    {backupOpen&&<PortableBackupPanel work="permutation" language={language}
      drafts={drafts} configuration={{kind:'permutation',order:current,limited}}
      onRestore={restoreReaderBackup} onClose={closeBackup}/>}
    <main id="permutation-main" className="main-content" tabIndex={-1} ref={main}>
      {stage==='read' && <>
        <p className="eyebrow">{tr('01 / Lecture','01 / Reading')}</p>
        <h1 lang="fr">Les Quatre Témoins</h1>
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
        <textarea id="permutation-first" rows={7} maxLength={100000} value={initial} onChange={e=>setInitial(e.target.value)}/>
        <p className="discreet">{tr('Votre réponse reste dans cet onglet pour la relecture.','Your answer stays in this tab for the final rereading.')}</p>
      </>}
      {stage==='explore' && <>
        <p className="eyebrow">{tr('03 / La contrainte','03 / The constraint')}</p>
        <h1>{tr('Changer l’ordre','Change the order')}</h1>
        <p className="lede">{tr(
          'Les quatre fragments restent identiques. Choisissez un ordre de lecture et observez comment le récit se transforme.',
          'The four fragments stay unchanged. Choose a reading order and consider how the story changes.'
        )}</p>
        <FirstReadingNote language={language} text={initial}/>
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
        <p className="discreet">{tr(
          'Glissez les fragments par la poignée ou utilisez les flèches pour changer leur ordre.',
          'Drag fragments by their handle or use the arrow buttons to change their order.'
        )}</p>
        <FragmentBoard items={FRAGMENT_IDS.map(id=>authoredFragments[id])}
          state={orderState} language={language} rule={activeRule} onTransition={applyTransition}/>
        <div className="board-actions" aria-label={tr('Historique de l’ordre','Order history')}>
          <button type="button" className="outline-button"
            disabled={orderState.past.length===0}
            onClick={()=>applyTransition(undoOrder(orderState,activeRule),tr('Annuler','Undo'))}>
            {tr('Annuler','Undo')}
          </button>
          <button type="button" className="outline-button"
            disabled={orderState.future.length===0}
            onClick={()=>applyTransition(redoOrder(orderState,activeRule),tr('Rétablir','Redo'))}>
            {tr('Rétablir','Redo')}
          </button>
          <button type="button" className="outline-button"
            onClick={()=>applyTransition(resetOrder(orderState,activeRule),tr('Ordre initial','Initial order'))}>
            {tr('Ordre initial','Initial order')}
          </button>
        </div>
        <p className="board-feedback" role="status" aria-live="polite">{feedback ||
          tr('Les mots du texte restent inchangés.','The words of the text remain unchanged.')}</p>
        <label htmlFor="permutation-select" className="field-label">{tr('Autre méthode : choisir un ordre dans la liste','Alternative: choose an order from the list')}</label>
        <select id="permutation-select" value={selected} onChange={e=>{
          const order=BY_KEY.get(e.target.value);
          if(!order)throw new Error('Unrecognized literary arrangement');
          applyTransition(reorderItems(orderState,order,activeRule),tr('Sélection directe','Direct selection'));
        }}>
          {limited&&!permitted&&<option value={selected}>{tr('Ordre actuel, hors contrainte','Current order, outside the rule')}</option>}
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
        <ExplorationBridge language={language} onReturn={()=>navigate('explore')}>
          {selected===orderKey(ORIGINAL_ORDER)
            ?tr('Vous avez conservé l’ordre initial. Les deux colonnes présentent le même texte.',
                'You retained the original order. Both columns present the same text.')
            :tr('À droite figure l’ordre que vous avez choisi dans Explorer. Les quatre fragments sont inchangés.',
                'The right column shows the order you chose in Explore. All four fragments are unchanged.')}
        </ExplorationBridge>
        <FirstReadingNote language={language} text={initial}/>
        <ComparisonSpace language={language}>
          <Fragments order={ORIGINAL_ORDER} comparedTo={current}/>
          <Fragments order={current} comparedTo={ORIGINAL_ORDER}/>
        </ComparisonSpace>

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
        <ReaderWritingDesk language={language} id="permutation-writing"
          label={tr('Votre fragment littéraire','Your literary fragment')}
          value={writing} onChange={setWriting} onExport={exportResponse} onBackup={openBackup}/>
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
            <textarea id="permutation-revised" rows={6} maxLength={100000} value={revised} onChange={e=>setRevised(e.target.value)}/></section>
        </div>
        <div className="history">
          <h2>{tr('Une méthode, plusieurs écritures','One method, multiple forms')}</h2>
          <p>{tr(
            'Réorganiser des fragments sans toucher à leurs mots appartient à une longue histoire de la littérature combinatoire. POELIO explore ici ce procédé à partir de quatre passages originaux.',
            'Reordering fragments without changing their words belongs to a long tradition of combinatorial literature. POELIO explores that practice through four original passages.'
          )}</p>
        </div>
        <ReaderArchiveActions language={language} onExport={exportResponse} onBackup={openBackup}/>
      </>}
    </main>
    <JourneyFooter language={language} index={index} title="Les Quatre Témoins" onMove={step}/>
  </div>;
}
