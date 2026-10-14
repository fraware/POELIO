import { useEffect, useState, type ReactNode } from 'react';
import {JourneyNavigation,JourneyFooter,useLiteraryJourney,type Language} from './JourneyControls.js';
import { useSessionDraft, clearAllPublicDrafts } from './useSessionDraft.js';
import { recurrence, repeatedEdges, scheduleKey, type Person, type Schedule } from '../../src/model.js';
import {
  createChoiceState,setChoice,setChoices,undoChoices,redoChoices,resetChoices
} from './choiceEngine.js';
import {publicWorks} from './contentCatalog.js';
import {type Realization} from './episode.js';
import { PermutationExperience } from './PermutationExperience.js';
import { ReaderHeader } from './ReaderHeader.js';

const DAYS: Record<Language, string[]> = {
  fr: ['Lun₀','Mar','Mer','Jeu','Ven','Sam','Dim','Lun₁'],
  en: ['Mon₀','Tue','Wed','Thu','Fri','Sat','Sun','Mon₁']
};
const PEOPLE: Record<Person, string> = { A:'Mira', B:'Noor' };
const {episode:demoEpisode,repairs:REPAIRS,reading:FIRST}=publicWorks.register;
const SECOND=demoEpisode.realizations[1];

function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type:'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Release the URL after the initiated download has started.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Manuscript({ realization, compareWith }: {
  realization: Realization; compareWith?: Realization
}): ReactNode {
  const otherModules = new Set(compareWith?.passages.map(p => p.sourceModule) ?? []);
  return <article className="manuscript" lang={demoEpisode.literaryLanguage}>
    <div className="page-meta">{demoEpisode.title} · {realization.id===FIRST.id?'Texte I':'Texte II'}</div>
    {realization.passages.map(p =>
      <p key={p.id} className={compareWith && !otherModules.has(p.sourceModule) ? 'changed-passage' : ''}>
        {p.text}
      </p>
    )}

  </article>;
}

function ScheduleView({ schedule, edges, language, onToggle }: {
  schedule: Schedule; edges:readonly number[]; language:Language;
  onToggle:(index:number)=>void;
}):ReactNode {
  return <div className="days" role="list"
    aria-label={language==='fr'?'Modifier les huit affectations':'Edit the eight assignments'}>
    {schedule.map((person,index)=>{
      const repeated=edges.includes(index-1);
      const adjacent=edges.includes(index);
      const changeTo:Person=person==='A'?'B':'A';
      return <div key={index} role="listitem"
        className={'day-card'+(repeated||adjacent?' repeated':'')}>
        <button className="day-toggle" type="button" data-day-index={index}
          aria-label={language==='fr'
            ?'Modifier '+DAYS.fr[index]+' : '+PEOPLE[person]+'. Choisir '+PEOPLE[changeTo]
            :'Change '+DAYS.en[index]+' : '+PEOPLE[person]+'. Choose '+PEOPLE[changeTo]}
          onClick={()=>onToggle(index)}>
          <span className="day-name">{DAYS[language][index]}</span>
          <strong>{PEOPLE[person]}</strong>
          <span className="day-change" aria-hidden="true">↔</span>
        </button>
        {repeated&&<small>{language==='fr'?'Répétition':'Repeated'}</small>}
      </div>;
    })}
  </div>;
}

export function App(): ReactNode {
  const [language,setLanguage] = useState<Language>(new URLSearchParams(window.location.search).get('lang')==='en'?'en':'fr');
  const [activeExperience,setActiveExperience] = useState<'register'|'permutation'>(new URLSearchParams(window.location.search).get('work')==='permutation'?'permutation':'register');
  const {stage,current,mainRef,navigate,move} = useLiteraryJourney();
  const [initial,setInitial] = useSessionDraft('register','initial');
  const [revised,setRevised] = useSessionDraft('register','revised');
  const [writing,setWriting] = useSessionDraft('register','writing');
  const [rule,setRule] = useSessionDraft('register','rule');
  const [scheduleState,setScheduleState]=useState(
    ()=>createChoiceState<Person>(['A','B'],REPAIRS[0].schedule)
  );
  const [scheduleFeedback,setScheduleFeedback]=useState('');
  const [compareLeft,setCompareLeft] = useState(FIRST.id);
  const [compareRight,setCompareRight] = useState(SECOND.id);
  const [projector,setProjector] = useState(false);
  const tr = (fr: string,en: string): string => language === 'fr' ? fr : en;
  function toggleLanguage():void{
    const next=language==='fr'?'en':'fr';
    setLanguage(next);
    const url=new URL(window.location.href);
    if(next==='fr')url.searchParams.delete('lang');
    else url.searchParams.set('lang','en');
    window.history.replaceState(null,'',url.pathname+url.search+url.hash);
  }
  function switchWork(work:'register'|'permutation'):void{
    setActiveExperience(work);
    const url=new URL(window.location.href);
    url.searchParams.set('work',work);
    url.searchParams.delete('view');
    window.history.pushState(null,'',url.pathname+url.search);
  }
  useEffect(()=>{
    const sync=()=>setActiveExperience(new URLSearchParams(window.location.search).get('work')==='permutation'?'permutation':'register');
    window.addEventListener('popstate',sync);
    return ()=>window.removeEventListener('popstate',sync);
  },[]);

  if(scheduleState.values.length!==8 || scheduleState.values.some(value=>value!=='A'&&value!=='B'))
    throw new Error('Invalid controlled eight-day assignment');
  const schedule=scheduleState.values as Schedule;
  const selected=scheduleKey(schedule);
  const edges=repeatedEdges(schedule);
  const recurrent=recurrence(schedule);
  const isMinimum=recurrent&&edges.length===1;
  const selectedRealization=isMinimum?publicWorks.register.authored(schedule):null;
  function updateSchedule(next:typeof scheduleState,description:string):void{
    if(next===scheduleState){
      setScheduleFeedback(tr('L’affectation est déjà identique.','The assignment is already unchanged.'));
      return;
    }
    setScheduleState(next);
    setScheduleFeedback(description);
  }
  function toggleDay(index:number):void{
    const next:Person=schedule[index]==='A'?'B':'A';
    updateSchedule(setChoice(scheduleState,index,next),
      tr('Jour modifié : '+DAYS.fr[index]+'.','Day changed: '+DAYS.en[index]+'.'));
  }
  const left = demoEpisode.realizations.find(r => r.id===compareLeft) ?? FIRST;
  const right = demoEpisode.realizations.find(r => r.id===compareRight) ?? SECOND;

  useEffect(() => {
    if (activeExperience === 'register') document.documentElement.lang = language;
  }, [language, activeExperience]);
  function clearForNextReader():void {
    if(!window.confirm(tr(
      'Effacer les textes et les réponses des deux œuvres de cet onglet ? Exportez d’abord ce que vous souhaitez conserver.',
      'Erase drafts and interpretations for BOTH works in this tab? Export any writing you want to keep first.'
    )))return;
    clearAllPublicDrafts();
    window.location.reload();
  }
  function reset(): void {
    if (!window.confirm(tr('Effacer les réponses de cette œuvre dans cet onglet et recommencer ?','Erase this work’s answers in this tab and restart?'))) return;
    setInitial(''); setRevised(''); setWriting(''); setRule('');
    setScheduleState(createChoiceState<Person>(['A','B'],REPAIRS[0].schedule)); setScheduleFeedback(''); setCompareLeft(FIRST.id); setCompareRight(SECOND.id);
    navigate('read');
  }
  function exportWriting(): void {
    downloadText('poelio-ma-creation.txt',
      ['POELIO — '+demoEpisode.title,
        'Ma contrainte / My rule: '+rule,
        '',writing,'',
        'Première interprétation / First interpretation:',initial,
        'Interprétation révisée / Revised interpretation:',revised
      ].join('\n'));
  }
  if (activeExperience==='permutation') {
    return <PermutationExperience onReturn={()=>switchWork('register')}
      language={language} onToggleLanguage={toggleLanguage}/>;
  }
  return <div className={projector?'app projector':'app'}>
    <a href="#stage-main" className="skip-link">{tr('Aller au texte','Skip to the text')}</a>
    <ReaderHeader language={language} work="register"
      onSwitch={()=>switchWork('permutation')}
      onLanguage={toggleLanguage}
      projector={projector} onProjector={()=>setProjector(v=>!v)}
      onReset={reset} onClear={clearForNextReader}/>
    <JourneyNavigation language={language} stage={stage} onNavigate={navigate}/>
    <main id="stage-main" className="main-content" tabIndex={-1} ref={mainRef}>
      {stage==='read' && <>
        <p className="eyebrow">{tr('01 / Lecture','01 / Reading')}</p>
        <h1 lang="fr">Le Registre des clefs</h1>
        <p className="lede">{tr(
          'Lisez le texte à votre rythme. Vous en explorerez la construction dans la suite du parcours.',
          'Read at your own pace. The next steps explore how the story is constructed.')}</p>
        <div className="reading-column"><Manuscript realization={FIRST}/></div>

      </>}

      {stage==='question' && <>
        <p className="eyebrow">{tr('02 / Votre lecture','02 / Your reading')}</p>
        <h1>{tr('Une première impression','A first impression')}</h1>
        <p className="lede">{tr(
          'Un détail, un geste, un silence vous a-t-il retenu ? Notez votre lecture avant de découvrir la contrainte.',
          'Was there a detail, a gesture, or a silence that stayed with you? Record your reading before exploring the constraint.')}</p>
        <label htmlFor="initial-answer" className="field-label">{tr('Votre première interprétation (facultative)','Your first interpretation (optional)')}</label>
        <textarea id="initial-answer" rows={7} value={initial} onChange={e=>setInitial(e.target.value)}
          placeholder={tr('Décrivez un détail que vous avez remarqué…','Describe a detail you noticed…')}/>
        <p className="discreet">{tr(
          'Votre réponse reste dans cet onglet. Vous pourrez la relire à la fin du parcours.',
          'Your response stays in this tab. You can return to it at the end.')}</p>
      </>}

      {stage==='explore' && <>
        <p className="eyebrow">{tr('03 / La contrainte','03 / The constraint')}</p>
        <h1>{tr('L’alternance impossible','An impossible alternation')}</h1>
        <p className="lede">{tr(
          'Le premier et le dernier lundi doivent revenir à la même personne. Touchez chaque jour pour changer son affectation. Explorez les contradictions, puis les réparations minimales.',
          'The first and last Mondays must belong to the same person. Select any day to change its assignment. Explore the contradictions, then the minimum repairs.')}</p>
        <div className="factline"><span>256 {tr('configurations','configurations')}</span><span>0 {tr('sans exception admissible','admissible without an exception')}</span><span>14 {tr('réparations minimales','minimum repairs')}</span></div>
        <p className="discreet">{tr(
          'Appuyez sur un jour pour choisir Mira ou Noor. Les passages répétés sont mis en évidence.',
          'Select a day to assign Mira or Noor. Repeated handovers are highlighted.'
        )}</p>
        <ScheduleView schedule={schedule} edges={edges} language={language} onToggle={toggleDay}/>
        <div className="schedule-actions" aria-label={tr('Historique des affectations','Assignment history')}>
          <button type="button" className="outline-button" disabled={!scheduleState.past.length}
            onClick={()=>updateSchedule(undoChoices(scheduleState),tr('Dernière modification annulée.','Last change undone.'))}>
            {tr('Annuler','Undo')}
          </button>
          <button type="button" className="outline-button" disabled={!scheduleState.future.length}
            onClick={()=>updateSchedule(redoChoices(scheduleState),tr('Modification rétablie.','Change redone.'))}>
            {tr('Rétablir','Redo')}
          </button>
          <button type="button" className="outline-button"
            onClick={()=>updateSchedule(resetChoices(scheduleState),tr('Configuration de départ rétablie.','Initial assignment restored.'))}>
            {tr('Configuration initiale','Initial configuration')}
          </button>
        </div>
        <p className="schedule-feedback" role="status" aria-live="polite">{scheduleFeedback}</p>
        <section className="schedule-diagnosis" aria-label={tr('Diagnostic du modèle','Model diagnosis')}>
          <h2>{tr('Cette configuration : résultats du calcul','This assignment: computational results')}</h2>
          <p>{recurrent
            ?tr('Récurrence respectée : les deux lundis correspondent.','Recurrence satisfied: both Mondays match.')
            :tr('Récurrence non respectée : les deux lundis diffèrent.','Recurrence violated: the two Mondays differ.')}</p>
          <p>{edges.length===0
            ?tr('Aucun relais répété.','No repeated handover.')
            :tr(edges.length+' relais répété'+(edges.length>1?'s':'')+'.',
                edges.length+' repeated handover'+(edges.length>1?'s':'')+'.')}</p>
          <p>{isMinimum
            ?tr('Réparation minimale : une répétition et la récurrence respectée.',
                'Minimum repair: one repetition with recurrence satisfied.')
            :tr('Hors des 14 réparations minimales.','Outside the 14 minimum repairs.')}</p>
          <p>{selectedRealization
            ?tr('Une réalisation littéraire rédigée existe pour cette configuration.',
                'An authored literary realization exists for this configuration.')
            :tr('Aucun texte littéraire n’a été rédigé pour cette configuration.',
                'No literary realization has been written for this configuration.')}</p>
        </section>
        <label htmlFor="schedule-choice" className="field-label">{tr(
          'Autre méthode : choisir parmi les 14 réparations minimales',
          'Alternative: choose one of the 14 minimum repairs'
        )}</label>
        <select id="schedule-choice" value={selected} onChange={e=>{
          const item=REPAIRS.find(r=>scheduleKey(r.schedule)===e.target.value);
          if(!item)throw new Error('Unknown minimum repair');
          updateSchedule(setChoices(scheduleState,item.schedule),
            tr('Réparation minimale choisie.','Minimum repair selected.'));
        }}>
          {!isMinimum&&<option value={selected}>{tr('Configuration actuelle hors du minimum','Current non-minimum assignment')}</option>}
          {REPAIRS.map(r=><option key={scheduleKey(r.schedule)} value={scheduleKey(r.schedule)}>
            {DAYS[language][r.faultEdge]} → {DAYS[language][r.faultEdge+1]} · {PEOPLE[r.repeatedCaregiver]}
          </option>)}
        </select>
        <details className="details"><summary>{tr('Comprendre le calcul','Understand the calculation')}</summary>
          <p>{tr('Une répétition doit apparaître sur exactement l’un des sept relais ; chacun peut répéter Mira ou Noor. L’énumération vérifie les 256 attributions possibles. Elle ne vérifie ni le sens du récit ni sa valeur littéraire.',
            'Exactly one of seven transitions must repeat a participant; either Mira or Noor can be repeated. Exhaustive enumeration checks all 256 assignments. It does not verify narrative meaning or literary merit.')}</p>

        </details>
      </>}

      {stage==='compare' && <>
        <p className="eyebrow">{tr('04 / Comparaison','04 / Comparison')}</p>
        <h1>{tr('Deux façons de raconter','Two ways to tell it')}</h1>
        <p className="lede">{tr(
          'Lisez ces deux versions du récit. Les passages marqués diffèrent dans leur composition.',
          'Read these two versions of the story. Shaded passages differ in their composition.')}</p>
        <div className="compare-controls">
          <label>{tr('Premier texte','First text')}
            <select value={compareLeft} onChange={e=>setCompareLeft(e.target.value)}>
              {demoEpisode.realizations.map(r=><option value={r.id} key={r.id}>{r.id===FIRST.id?tr('Texte I','Text I'):tr('Texte II','Text II')} · {PEOPLE[r.repeatedCaregiver]}</option>)}
            </select>
          </label>
          <label>{tr('Second texte','Second text')}
            <select value={compareRight} onChange={e=>setCompareRight(e.target.value)}>
              {demoEpisode.realizations.map(r=><option value={r.id} key={r.id}>{r.id===FIRST.id?tr('Texte I','Text I'):tr('Texte II','Text II')} · {PEOPLE[r.repeatedCaregiver]}</option>)}
            </select>
          </label>
        </div>
        {left.id===right.id
          ? <p className="model-result">{tr('Vous avez choisi deux fois le même texte.','You selected the same text twice.')}</p>
          : <div className="comparison"><Manuscript realization={left} compareWith={right}/><Manuscript realization={right} compareWith={left}/></div>}
        <details className="details"><summary>{tr('Différences structurales et limites','Structural differences and limitations')}</summary>
          <p>{tr('Les deux configurations diffèrent dans '+left.schedule.filter((p,i)=>p!==right.schedule[i]).length+' positions sur huit. Les passages aux identifiants de module distincts sont marqués. Le logiciel ne déduit aucune lecture sémantique de ces différences.',
            'The configurations differ in '+left.schedule.filter((p,i)=>p!==right.schedule[i]).length+' of eight positions. Passages with different source-module identifiers are marked. The software does not infer semantic conclusions.')}</p>
        </details>
      </>}

      {stage==='invent' && <>
        <p className="eyebrow">{tr('05 / Écriture','05 / Writing')}</p>
        <h1>{tr('À vous d’écrire','Your turn to write')}</h1>
        <p className="lede">{tr(
          'Choisissez une règle qui guidera votre texte, puis écrivez librement à partir d’elle.',
          'Choose a rule for your piece, then write a passage following it.')}</p>
        <label className="field-label" htmlFor="own-rule">{tr('Nom ou description de votre contrainte','Name or describe your constraint')}</label>
        <input id="own-rule" maxLength={300} value={rule} onChange={e=>setRule(e.target.value)}
          placeholder={tr('Une règle à inventer…','A rule you invent…')}/>
        <label className="field-label" htmlFor="writing">{tr('Votre texte','Your text')}</label>
        <textarea id="writing" rows={9} value={writing} onChange={e=>setWriting(e.target.value)}
          placeholder={tr('Écrivez votre propre passage…','Write your own passage…')}/>
        <div className="editor-footer"><span>{writing.trim()?writing.trim().split(/\s+/u).length:0} {tr('mots','words')}</span>
          <button type="button" className="outline-button" onClick={exportWriting}>{tr('Exporter mon travail','Export my work')}</button></div>
      </>}

      {stage==='reflect' && <>
        <p className="eyebrow">{tr('06 / Relecture','06 / Rereading')}</p>
        <h1>{tr('Relire le récit','Read the story again')}</h1>
        <p className="lede">{tr(
          'Revenez à votre première impression. Qu’est-ce que cette expérience a déplacé dans votre lecture ?',
          'Return to your first impression. What has this experience changed in your reading?')}</p>
        <div className="reflection">
          <section><h2>{tr('Votre première lecture','Your first reading')}</h2>
            <blockquote>{initial||tr('Aucune réponse saisie.','No response entered.')}</blockquote></section>
          <section><label htmlFor="revised" className="field-label">{tr('Votre lecture maintenant','Your reading now')}</label>
            <textarea id="revised" rows={6} value={revised} onChange={e=>setRevised(e.target.value)}/></section>
        </div>
        <div className="history"><h2>{tr('Un héritage à explorer','A tradition to explore')}</h2>
          <p>{tr(
            'Des Cent mille milliards de poèmes de Raymond Queneau (1961) aux expérimentations informatiques, les pratiques oulipiennes interrogent les rapports entre forme et invention. POELIO est un projet indépendant.',
            'From Raymond Queneau’s Cent mille milliards de poèmes (1961) to computational experiments, Oulipian practices investigate form and invention. POELIO is independent.')}</p>
          <p><a href="https://www.oulipo.net/" target="_blank" rel="noopener noreferrer">oulipo.net</a> · <a href="https://digitalhumanities.org/dhq/vol/11/3/000325/000325.html" target="_blank" rel="noopener noreferrer">Natalie Berkman, Digital Oulipo (2017)</a></p>

        </div>
        <button className="primary-button" type="button" onClick={exportWriting}>{tr('Conserver mon travail','Keep my work')}</button>
      </>}
    </main>
    <JourneyFooter language={language} index={current} title={demoEpisode.title} onMove={move}/>
  </div>;
}
