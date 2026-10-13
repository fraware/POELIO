import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { minimumRepairs, repeatedEdges, type Person, type Schedule } from '../../src/model.js';
import { authoredForSchedule, demoEpisode, evidence, type Realization } from './episode.js';
import { PermutationExperience } from './PermutationExperience.js';

type Stage = 'read' | 'question' | 'explore' | 'compare' | 'invent' | 'reflect';
type Language = 'fr' | 'en';
const STAGES: Stage[] = ['read','question','explore','compare','invent','reflect'];
const LABELS: Record<Stage, [string,string]> = {
  read: ['Lire','Read'], question: ['Questionner','Question'],
  explore: ['Explorer','Explore'], compare: ['Comparer','Compare'],
  invent: ['Inventer','Invent'], reflect: ['Revenir','Reflect']
};
const DAYS: Record<Language, string[]> = {
  fr: ['Lun₀','Mar','Mer','Jeu','Ven','Sam','Dim','Lun₁'],
  en: ['Mon₀','Tue','Wed','Thu','Fri','Sat','Sun','Mon₁']
};
const PEOPLE: Record<Person, string> = { A:'Mira', B:'Noor' };
const REPAIRS = minimumRepairs();
const FIRST = demoEpisode.realizations[0];
const SECOND = demoEpisode.realizations[1];

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
    <div className="page-meta">{demoEpisode.title} · {realization.id.toUpperCase()}</div>
    {realization.passages.map(p =>
      <p key={p.id} className={compareWith && !otherModules.has(p.sourceModule) ? 'changed-passage' : ''}>
        {p.text}
      </p>
    )}
    {compareWith && <p className="module-note">
      <small>◦ {realization.passages.filter(p => otherModules.has(p.sourceModule)).length} module(s) commun(s) par identifiant de source. Le sens du texte reste ouvert à l'interprétation.</small>
    </p>}
  </article>;
}

function ScheduleView({ schedule, faultEdge, language }: {
  schedule: Schedule; faultEdge: number | null; language: Language
}): ReactNode {
  return <div className="days" role="list" aria-label={language==='fr'?'Répartition sur huit jours':'Eight-day assignments'}>
    {schedule.map((person,index)=><div
      key={index}
      role="listitem"
      className={'day-card' + (faultEdge !== null && (index === faultEdge || index===faultEdge+1) ? ' repeated' : '')}>
      <span className="day-name">{DAYS[language][index]}</span>
      <strong>{PEOPLE[person]}</strong>
      {faultEdge !== null && index===faultEdge+1 && <small>{language==='fr'?'Répétition':'Repeated'}</small>}
    </div>)}
  </div>;
}

export function App(): ReactNode {
  const [language,setLanguage] = useState<Language>('fr');
  const [activeExperience,setActiveExperience] = useState<'register'|'permutation'>('register');
  const [stage,setStage] = useState<Stage>('read');
  const [initial,setInitial] = useState('');
  const [revised,setRevised] = useState('');
  const [writing,setWriting] = useState('');
  const [rule,setRule] = useState('');
  const [selected,setSelected] = useState(REPAIRS[0].schedule.join(''));
  const [compareLeft,setCompareLeft] = useState(FIRST.id);
  const [compareRight,setCompareRight] = useState(SECOND.id);
  const [projector,setProjector] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const tr = (fr: string,en: string): string => language === 'fr' ? fr : en;
  const current = STAGES.indexOf(stage);

  const selectedRepair = useMemo(() => REPAIRS.find(r => r.schedule.join('')===selected) ?? REPAIRS[0], [selected]);
  const selectedRealization = authoredForSchedule(demoEpisode, selectedRepair.schedule);
  const left = demoEpisode.realizations.find(r => r.id===compareLeft) ?? FIRST;
  const right = demoEpisode.realizations.find(r => r.id===compareRight) ?? SECOND;

  useEffect(() => { document.documentElement.lang=language; }, [language]);
  function navigate(target: Stage): void {
    setStage(target);
    // Focus follows navigation so keyboard and screen-reader users reach the stage heading.
    requestAnimationFrame(()=>mainRef.current?.focus());
  }
  function next(direction: -1|1): void {
    const index = Math.min(STAGES.length-1,Math.max(0,current+direction));
    navigate(STAGES[index]);
  }
  function reset(): void {
    if (!window.confirm(tr('Effacer toutes les réponses de cette session et recommencer ?','Delete all answers in this session and restart?'))) return;
    setInitial(''); setRevised(''); setWriting(''); setRule('');
    setSelected(REPAIRS[0].schedule.join('')); setCompareLeft(FIRST.id); setCompareRight(SECOND.id);
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
    return <PermutationExperience onReturn={()=>setActiveExperience('register')}/>;
  }
  return <div className={projector?'app projector':'app'}>
    <a href="#stage-main" className="skip-link">{tr('Aller au texte','Skip to the text')}</a>
    <header className="topbar">
      <div className="brand-block">
        <span className="brand">POELIO<span className="brand-mark">✳</span></span>
        <span className="brand-desc">{tr('Laboratoire de littérature potentielle','Laboratory for explorable literature')}</span>
      </div>
      <div className="header-actions">
        <span className="edition-flag">{tr('Démonstration publique originale','Original public demonstration')}</span>
        <button className="text-button" type="button" onClick={()=>setActiveExperience('permutation')}>
          {tr('Deuxième expérience : permutations →','Second experience: permutations →')}
        </button>
        <a className="text-button" href="/facilitator.html" target="_blank" rel="noopener noreferrer">
          {tr('Guide d’atelier','Workshop guide')}
        </a>
        <button type="button" className="text-button" onClick={()=>setLanguage(v=>v==='fr'?'en':'fr')}
          aria-label={tr('Switch to English','Passer en français')}>{language==='fr'?'EN':'FR'}</button>
        <button type="button" className="text-button" onClick={()=>setProjector(v=>!v)}
          aria-pressed={projector}>{projector?tr('Normal','Normal'):tr('Projection','Projector')}</button>
        <button type="button" className="text-button" onClick={reset}>{tr('Recommencer','Reset')}</button>
      </div>
    </header>
    <div className="progress-shell">
      <nav aria-label={tr('Étapes de l’expérience','Experience stages')} className="steps">
        {STAGES.map((s,i)=><button
          key={s} type="button" className={s===stage?'step current':'step'}
          aria-current={s===stage?'step':undefined} onClick={()=>navigate(s)}>
          <span className="step-number">{String(i+1).padStart(2,'0')}</span>
          <span>{LABELS[s][language==='fr'?0:1]}</span>
        </button>)}
      </nav>
    </div>
    <main id="stage-main" className="main-content" tabIndex={-1} ref={mainRef}>
      {stage==='read' && <>
        <p className="eyebrow">{tr('01 / RENCONTRER UN TEXTE','01 / ENCOUNTER A WORK')}</p>
        <h1>{tr('Avant la règle, le récit.','The story comes first.')}</h1>
        <p className="lede">{tr(
          'Deux personnes veillent à tour de rôle sur une salle où chaque visite laisse une trace. Lisez sans chercher encore à résoudre le mécanisme.',
          'Two people take turns watching a room where each visit leaves a trace. Read without trying to solve the mechanism yet.')}</p>
        <div className="reading-column"><Manuscript realization={FIRST}/></div>
        <p className="discreet">{tr(
          'Le texte français est une fiction de démonstration distincte de La Relève. Aucun modèle ne produit de phrases pendant votre visite.',
          'This French story is an original demonstration distinct from La Relève. No model generates prose during your visit.')}</p>
      </>}

      {stage==='question' && <>
        <p className="eyebrow">{tr('02 / VOTRE LECTURE','02 / YOUR READING')}</p>
        <h1>{tr('Qui sait quoi ?','Who knows what?')}</h1>
        <p className="lede">{tr(
          'Mira revient deux jours de suite. Que permet cette continuité ? Qu’ignore peut-être Noor ? Aucune interprétation n’est notée.',
          'Mira returns on two consecutive days. What does that continuity make possible? What might Noor not know? Interpretations are not scored.')}</p>
        <label htmlFor="initial-answer" className="field-label">{tr('Votre première interprétation (facultative)','Your first interpretation (optional)')}</label>
        <textarea id="initial-answer" rows={7} value={initial} onChange={e=>setInitial(e.target.value)}
          placeholder={tr('Décrivez un détail que vous avez remarqué…','Describe a detail you noticed…')}/>
        <p className="discreet">{tr(
          'Cette réponse reste dans la mémoire de votre navigateur pendant la session. Elle n’est ni envoyée ni enregistrée sur un serveur.',
          'This response stays in your browser memory during the session. It is neither sent nor stored on a server.')}</p>
      </>}

      {stage==='explore' && <>
        <p className="eyebrow">{tr('03 / LES RÈGLES','03 / THE RULES')}</p>
        <h1>{tr('Une semaine impossible.','An impossible week.')}</h1>
        <p className="lede">{tr(
          'Les deux lundis doivent revenir à la même personne. Sept relais parfaitement alternés conduisent pourtant à la personne opposée. Choisissez où placer l’unique exception.',
          'Both Mondays must belong to the same person. Seven perfect alternations instead lead to the opposite person. Choose where to place the single exception.')}</p>
        <div className="factline"><span>256 {tr('configurations','configurations')}</span><span>0 {tr('sans exception admissible','admissible without an exception')}</span><span>14 {tr('réparations minimales','minimum repairs')}</span></div>
        <label htmlFor="schedule-choice" className="field-label">{tr('Choisissez l’une des quatorze répartitions','Choose one of fourteen schedules')}</label>
        <select id="schedule-choice" value={selected} onChange={e=>setSelected(e.target.value)}>
          {REPAIRS.map(r=><option key={r.schedule.join('')} value={r.schedule.join('')}>
            {DAYS[language][r.faultEdge]} → {DAYS[language][r.faultEdge+1]} · {PEOPLE[r.repeatedCaregiver]}
          </option>)}
        </select>
        <ScheduleView schedule={selectedRepair.schedule} faultEdge={selectedRepair.faultEdge} language={language}/>
        <p className="model-result">{selectedRealization
          ?tr('Cette configuration possède un passage littéraire rédigé dans cette démonstration.','This configuration has an authored literary passage in this demonstration.')
          :tr('Cette configuration est mathématiquement admissible. Aucun texte n’a été rédigé pour elle dans cette démonstration.','This configuration is mathematically admissible. No literary passage was authored for it in this demonstration.')}</p>
        <details className="details"><summary>{tr('Pourquoi quatorze ? Qu’établit le calcul ?','Why fourteen? What does the computation establish?')}</summary>
          <p>{tr('Une répétition doit apparaître sur exactement l’un des sept relais ; chacun peut répéter Mira ou Noor. L’énumération vérifie les 256 attributions possibles. Elle ne vérifie ni le sens du récit ni sa valeur littéraire.',
            'Exactly one of seven transitions must repeat a participant; either Mira or Noor can be repeated. Exhaustive enumeration checks all 256 assignments. It does not verify narrative meaning or literary merit.')}</p>
          <ul className="evidence-list">{evidence.map(x=><li key={x.id}><strong>{x.status}</strong> · {x.statement}<br/><small>{x.scope}</small></li>)}</ul>
        </details>
      </>}

      {stage==='compare' && <>
        <p className="eyebrow">{tr('04 / LES TEXTES','04 / THE TEXTS')}</p>
        <h1>{tr('Le même lieu, une autre histoire.','The same room, another story.')}</h1>
        <p className="lede">{tr(
          'Comparez deux passages réellement rédigés. Le surlignage suit l’identité des modules, et non une prétendue équivalence de sens.',
          'Compare two passages that were actually written. Highlights follow source-module identity, not a claimed equivalence of meaning.')}</p>
        <div className="compare-controls">
          <label>{tr('Première réalisation','First realization')}
            <select value={compareLeft} onChange={e=>setCompareLeft(e.target.value)}>
              {demoEpisode.realizations.map(r=><option value={r.id} key={r.id}>{r.id} · {PEOPLE[r.repeatedCaregiver]}</option>)}
            </select>
          </label>
          <label>{tr('Seconde réalisation','Second realization')}
            <select value={compareRight} onChange={e=>setCompareRight(e.target.value)}>
              {demoEpisode.realizations.map(r=><option value={r.id} key={r.id}>{r.id} · {PEOPLE[r.repeatedCaregiver]}</option>)}
            </select>
          </label>
        </div>
        {left.id===right.id
          ? <p className="model-result">{tr('Vous avez choisi deux fois la même réalisation : aucune différence de source.','You selected the same realization twice: no source difference.')}</p>
          : <div className="comparison"><Manuscript realization={left} compareWith={right}/><Manuscript realization={right} compareWith={left}/></div>}
        <details className="details"><summary>{tr('Différences structurales et limites','Structural differences and limitations')}</summary>
          <p>{tr('Les deux configurations diffèrent dans '+left.schedule.filter((p,i)=>p!==right.schedule[i]).length+' positions sur huit. Les passages aux identifiants de module distincts sont marqués. Le logiciel ne déduit aucune lecture sémantique de ces différences.',
            'The configurations differ in '+left.schedule.filter((p,i)=>p!==right.schedule[i]).length+' of eight positions. Passages with different source-module identifiers are marked. The software does not infer semantic conclusions.')}</p>
        </details>
      </>}

      {stage==='invent' && <>
        <p className="eyebrow">{tr('05 / INVENTER','05 / INVENT')}</p>
        <h1>{tr('Déplacez la règle.','Change the rule.')}</h1>
        <p className="lede">{tr(
          'Inventez une contrainte pour une nouvelle histoire. Par exemple, deux personnes s’écrivent sans avoir le droit de relire leur propre message. Puis écrivez quelques lignes.',
          'Invent a constraint for another story. For example, two people exchange notes but cannot reread their own message. Then write a few lines.')}</p>
        <label className="field-label" htmlFor="own-rule">{tr('Nom ou description de votre contrainte','Name or describe your constraint')}</label>
        <input id="own-rule" maxLength={300} value={rule} onChange={e=>setRule(e.target.value)}
          placeholder={tr('Une règle à inventer…','A rule you invent…')}/>
        <label className="field-label" htmlFor="writing">{tr('Votre texte','Your text')}</label>
        <textarea id="writing" rows={9} value={writing} onChange={e=>setWriting(e.target.value)}
          placeholder={tr('Écrivez votre propre passage…','Write your own passage…')}/>
        <div className="editor-footer"><span>{writing.trim()?writing.trim().split(/\s+/u).length:0} {tr('mots','words')} · {tr('non évalués','unscored')}</span>
          <button type="button" className="outline-button" onClick={exportWriting}>{tr('Exporter mon travail','Export my work')}</button></div>
      </>}

      {stage==='reflect' && <>
        <p className="eyebrow">{tr('06 / REVENIR','06 / REFLECT')}</p>
        <h1>{tr('Que voyez-vous autrement ?','What do you see differently?')}</h1>
        <p className="lede">{tr(
          'La structure détermine certaines possibilités ; elle ne détermine pas toutes les lectures. Revenez à votre première impression.',
          'Structure determines some possibilities, not every interpretation. Return to your first impression.')}</p>
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
          <p className="discreet">{demoEpisode.rights.notice}</p>
        </div>
        <button className="primary-button" type="button" onClick={exportWriting}>{tr('Conserver mon travail','Keep my work')}</button>
      </>}
    </main>
    <footer className="journey-footer">
      <button type="button" className="outline-button" onClick={()=>next(-1)} disabled={current===0}>{tr('← Retour','← Back')}</button>
      <span className="position">{String(current+1).padStart(2,'0')} / 06 · {demoEpisode.title}</span>
      <button type="button" className="primary-button" onClick={()=>next(1)} disabled={current===5}>{tr('Continuer →','Continue →')}</button>
    </footer>
    <div className="disclaimer">{tr(
      'Démonstration littéraire originale · Aucun contenu inédit de La Relève · Sans IA ni compte · Projet indépendant de l’Oulipo',
      'Original literary demonstration · No unpublished La Relève text · No AI or accounts · Independent from Oulipo'
    )}</div>
  </div>;
}
