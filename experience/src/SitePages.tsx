import {useEffect,useState,type ReactNode} from 'react';
import {type Language} from './JourneyControls.js';
import {SiteHeader,SiteFooter,siteHref,workHref,type Section} from './SiteHeader.js';

type Work='register'|'permutation';
const WORKS:{id:Work;name:string;count:string;descriptionFr:string;descriptionEn:string;mechanicFr:string;mechanicEn:string}[]=[
  {id:'register',name:'Le Registre des clefs',count:'01',
   descriptionFr:'Un récit de relais entre deux personnages. Une contradiction dans les règles ouvre quatorze arrangements possibles.',
   descriptionEn:'Two characters take turns keeping watch. A contradiction in their rules leads to fourteen possible arrangements.',
   mechanicFr:'Explorer huit jours et comparer deux textes.',
   mechanicEn:'Explore eight days and compare two texts.'},
  {id:'permutation',name:'Les Quatre Témoins',count:'02',
   descriptionFr:'Quatre fragments d’un récit. Leur ordre transforme la lecture sans modifier un seul mot.',
   descriptionEn:'Four narrative fragments. Their order changes the reading without changing a word.',
   mechanicFr:'Réorganiser les quatre fragments.',
   mechanicEn:'Rearrange the four fragments.'}
];

function WorkList({language}: {language:Language}):ReactNode{
  const fr=language==='fr';
  return <div className="work-list">
    {WORKS.map(work=><article className="work-entry" key={work.id}>
      <span className="work-index">{work.count}</span>
      <div className="work-description">
        <h3>{work.name}</h3>
        <p>{fr?work.descriptionFr:work.descriptionEn}</p>
        <p className="work-method">{fr?work.mechanicFr:work.mechanicEn}</p>
      </div>
      <a className="work-entry-link" href={workHref(work.id,language)}>
        {fr?'Commencer':'Begin'} <span aria-hidden="true">↗</span>
        <span className="sr-only"> — {work.name}</span>
      </a>
    </article>)}
  </div>;
}

export function SitePages({view}: {view:Section}):ReactNode{
  const initialLang:Language=new URLSearchParams(window.location.search).get('lang')==='en'?'en':'fr';
  const [language,setLanguage]=useState<Language>(initialLang);
  const fr=language==='fr';
  useEffect(()=>{document.documentElement.lang=language;},[language]);
  const toggle=()=>{
    const next=language==='fr'?'en':'fr';
    setLanguage(next);
    const url=new URL(window.location.href);
    if(next==='fr')url.searchParams.delete('lang');
    else url.searchParams.set('lang','en');
    window.history.replaceState(null,'',url.pathname+url.search+url.hash);
  };
  return <div className="site-shell">
    <a href="#site-content" className="skip-link">{fr?'Aller au contenu':'Skip to content'}</a>
    <SiteHeader language={language} active={view} onLanguage={toggle}/>
    <main id="site-content" className="site-content" tabIndex={-1}>
      {view==='home'&&<>
        <section className="intro" aria-labelledby="intro-title">
          <p className="section-index">{fr?'Littérature et contraintes':'Literature and constraints'}</p>
          <h1 id="intro-title">{fr?'Lire. Explorer. Écrire.':'Read. Explore. Write.'}</h1>
          <p className="intro-copy">{fr
            ?'POELIO propose des textes à lire et des contraintes à expérimenter. Chaque parcours associe lecture, manipulation et écriture.'
            :'POELIO presents literary works and constraints to explore. Each experience brings together reading, experimentation and writing.'}</p>
          <div className="intro-actions">
            <a className="primary-button" href={siteHref('works',language)}>{fr?'Découvrir les œuvres':'Explore the works'} <span aria-hidden="true">↗</span></a>
            <a className="text-link" href={siteHref('about',language)}>{fr?'Le projet':'The project'}</a>
          </div>
        </section>
        <section className="site-section" aria-labelledby="works-preview-title">
          <div className="section-heading">
            <span className="section-index">01</span>
            <h2 id="works-preview-title">{fr?'Deux œuvres à explorer':'Two works to explore'}</h2>
          </div>
          <WorkList language={language}/>
        </section>
        <section className="site-section process-section" aria-labelledby="method-title">
          <div className="section-heading">
            <span className="section-index">02</span>
            <h2 id="method-title">{fr?'Comment se déroule une expérience ?':'How does an experience work?'}</h2>
          </div>
          <div className="process-grid">
            <div><span>01</span><h3>{fr?'Lire':'Read'}</h3><p>{fr?'Découvrir le texte sans explication préalable.':'Encounter the text before its rules.'}</p></div>
            <div><span>02</span><h3>{fr?'Manipuler':'Explore'}</h3><p>{fr?'Modifier une contrainte et observer ses conséquences.':'Change a constraint and observe the result.'}</p></div>
            <div><span>03</span><h3>{fr?'Écrire':'Write'}</h3><p>{fr?'Composer une réponse à partir de ses propres choix.':'Compose a response from your own choices.'}</p></div>
          </div>
        </section>
      </>}
      {view==='works'&&<>
        <section className="page-intro">
          <p className="section-index">{fr?'Catalogue':'Catalogue'}</p>
          <h1>{fr?'Les œuvres':'Works'}</h1>
          <p>{fr?'Choisissez un texte. Chaque parcours commence par la lecture, puis introduit une contrainte à expérimenter.':'Choose a text. Each experience begins with reading, then introduces a constraint to explore.'}</p>
        </section>
        <WorkList language={language}/>
      </>}
      {view==='atelier'&&<>
        <section className="page-intro">
          <p className="section-index">{fr?'Pratique':'Practice'}</p>
          <h1>{fr?'Atelier':'Workshop'}</h1>
          <p>{fr?'Deux propositions pour lire, transformer et écrire. La création se fait dans le parcours de chaque œuvre.':'Two exercises in reading, transformation and writing. Composition takes place within each literary experience.'}</p>
        </section>
        <section className="site-section" aria-labelledby="atelier-one">
          <div className="atelier-row">
            <span className="work-index">01</span>
            <div><h2 id="atelier-one">{fr?'Écrire avec une contrainte':'Write with a constraint'}</h2>
              <p>{fr?'Lisez Le Registre des clefs, explorez ses huit jours, puis imaginez une nouvelle règle pour votre texte.':'Read Le Registre des clefs, explore its eight days, and invent a rule for your own writing.'}</p></div>
            <a href={workHref('register',language)}>{fr?'Ouvrir le parcours':'Open experience'} ↗</a>
          </div>
          <div className="atelier-row">
            <span className="work-index">02</span>
            <div><h2>{fr?'Changer l’ordre d’un récit':'Reorder a narrative'}</h2>
              <p>{fr?'Lisez Les Quatre Témoins. Recomposez les fragments puis écrivez votre propre variation.':'Read Les Quatre Témoins. Rearrange its fragments, then write your own variation.'}</p></div>
            <a href={workHref('permutation',language)}>{fr?'Ouvrir le parcours':'Open experience'} ↗</a>
          </div>
        </section>
        <p className="guide-link"><a href={import.meta.env.BASE_URL+'facilitator.html'}>{fr?'Guide pour animer un atelier':'Guide for group workshops'} ↗</a></p>
      </>}
      {view==='about'&&<>
        <section className="page-intro">
          <p className="section-index">POELIO</p>
          <h1>{fr?'À propos':'About'}</h1>
          <p>{fr?'POELIO est un atelier numérique consacré aux relations entre littérature et contraintes de composition.':'POELIO is a digital workshop exploring literary composition under constraints.'}</p>
        </section>
        <div className="about-content">
          <section><h2>{fr?'La méthode':'The method'}</h2><p>{fr
            ?'On commence par lire. Une contrainte est ensuite dévoilée, explorée et comparée à des textes effectivement rédigés. Le parcours se termine par une proposition d’écriture et une nouvelle lecture.'
            :'The reader first encounters the text. A compositional constraint is then explained and explored, with comparisons grounded in existing, authored writing. The reader is invited to compose and reread.'}</p></section>
          <section><h2>{fr?'Textes et calcul':'Text and computation'}</h2><p>{fr
            ?'Les possibilités formelles sont calculées. Les textes littéraires ont été rédigés séparément. Un résultat mathématique ne constitue pas une interprétation littéraire.'
            :'Formal possibilities are computed. Literary passages were written separately. A mathematical result is not a literary interpretation.'}</p></section>
          <section><h2>{fr?'Écrits personnels':'Personal writing'}</h2><p>{fr
            ?'Les réponses restent dans l’onglet du navigateur. Pour conserver son travail, il faut l’exporter. Le site ne demande pas de compte.'
            :'Responses stay in the browser tab. Export your writing to keep a copy. No account is needed.'}</p></section>
          <section><h2>{fr?'Références et indépendance':'References and independence'}</h2><p>{fr
            ?'Le projet s’inscrit dans l’histoire des pratiques littéraires à contraintes. Il est indépendant de l’Oulipo.'
            :'The project draws on the history of constrained literature and is independent of Oulipo.'}</p><p><a href="https://www.oulipo.net/" target="_blank" rel="noopener noreferrer">Oulipo</a> · <a href="https://github.com/fraware/POELIO" target="_blank" rel="noopener noreferrer">{fr?'Code et documentation':'Code and documentation'}</a></p></section>
          <section><h2>{fr?'Typographie':'Typography'}</h2><p>{fr?'Source Sans 3, dessinée par Paul D. Hunt pour Adobe, est distribuée sous licence SIL Open Font License 1.1.':'Source Sans 3, designed by Paul D. Hunt for Adobe, is distributed under the SIL Open Font License 1.1.'} <a href={import.meta.env.BASE_URL+'source-sans-license.txt'}>{fr?'Licence de la police':'Font license'}</a>.</p></section>
        </div>
      </>}
    </main>
    <SiteFooter language={language}/>
  </div>;
}
