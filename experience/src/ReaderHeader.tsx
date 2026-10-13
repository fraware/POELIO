import {type ReactNode} from 'react';
import {type Language} from './JourneyControls.js';

type Work = 'register'|'permutation';

export function ReaderHeader({language,work,onSwitch,onLanguage,projector,onProjector,onReset,onClear}:{
  language:Language;
  work:Work;
  onSwitch:()=>void;
  onLanguage:()=>void;
  projector:boolean;
  onProjector:()=>void;
  onReset:()=>void;
  onClear:()=>void;
}):ReactNode{
  const fr=language==='fr';
  return <header className="topbar">
    <div className="topbar-inner">
      <div className="topline">
        <div className="brand-block">
          <span className="brand">POELIO</span>
          <span className="brand-desc">{fr?'Atelier de lecture et d’écriture':'Reading and writing atelier'}</span>
        </div>
        <div className="header-actions">
          <a className="header-link" href={import.meta.env.BASE_URL+'facilitator.html'} target="_blank" rel="noopener noreferrer">
            {fr?'Guide d’atelier':'Workshop guide'}
          </a>
          <button type="button" className="language-button" onClick={onLanguage}
            aria-label={fr?'Switch to English':'Passer en français'}>{fr?'EN':'FR'}</button>
          <details className="reader-options">
            <summary>{fr?'Options':'Options'}</summary>
            <div className="options-panel">
              <a className="menu-guide" href={import.meta.env.BASE_URL+'facilitator.html'} target="_blank" rel="noopener noreferrer">{fr?'Guide d’atelier':'Workshop guide'}</a>
              <button type="button" onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");onProjector();}} aria-pressed={projector}>
                {projector?'Mode normal':fr?'Mode projection':'Projector mode'}
              </button>
              <button type="button" onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");onReset();}}>{fr?'Recommencer':'Reset'}</button>
              <button type="button" className="danger-action" onClick={e=>{e.currentTarget.closest("details")?.removeAttribute("open");onClear();}}>
                {fr?'Effacer toutes mes réponses':'Erase all my drafts'}
              </button>
            </div>
          </details>
        </div>
      </div>
      <nav className="work-nav" aria-label={fr?'Choisir une œuvre':'Choose a work'}>
        {work==='register'
          ? <>
              <span aria-current="page">Le Registre des clefs</span>
              <button type="button" aria-label={fr?'Deuxième expérience : Les Quatre Témoins':'Second experience: The Four Witnesses'}
                onClick={onSwitch}>Les Quatre Témoins <span aria-hidden="true">↗</span></button>
            </>
          : <>
              <button type="button" aria-label={fr?'← Registre des clefs':'← Register of Keys'}
                onClick={onSwitch}>Le Registre des clefs <span aria-hidden="true">↗</span></button>
              <span aria-current="page">Les Quatre Témoins</span>
            </>}
      </nav>
    </div>
  </header>;
}
