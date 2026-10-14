import {useEffect,useRef,type ReactNode} from 'react';
import {type Language} from './JourneyControls.js';
import {SiteHeader} from './SiteHeader.js';

type Work='register'|'permutation';

export function ReaderHeader({language,work,onSwitch,onLanguage,projector,onProjector,onReset,onClear,onBackup}:{
  language:Language;work:Work;onSwitch:()=>void;onLanguage:()=>void;
  projector:boolean;onProjector:()=>void;onReset:()=>void;onClear:()=>void;onBackup:()=>void;
}):ReactNode{
  const fr=language==='fr';
  const menuRef=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    const dismiss=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!menuRef.current?.contains(event.target))
        menuRef.current?.removeAttribute('open');
    };
    document.addEventListener('pointerdown',dismiss);
    return ()=>document.removeEventListener('pointerdown',dismiss);
  },[]);
  function closeMenu():void{menuRef.current?.removeAttribute('open');}
  return <>
    <SiteHeader language={language} active="works" onLanguage={onLanguage}/>
    <div className="reader-toolbar">
      <div className="reader-toolbar-inner">
        <nav className="work-nav" aria-label={fr?'Choisir une œuvre':'Choose a work'}>
          {work==='register'?<>
            <span aria-current="page">Le Registre des clefs</span>
            <button type="button" onClick={onSwitch}
              aria-label={fr?'Deuxième expérience : Les Quatre Témoins':'Second experience: The Four Witnesses'}>Les Quatre Témoins ↗</button>
          </>:<>
            <button type="button" onClick={onSwitch}
              aria-label={fr?'← Registre des clefs':'← Register of Keys'}>Le Registre des clefs ↗</button>
            <span aria-current="page">Les Quatre Témoins</span>
          </>}
        </nav>
        <div className="reader-tools">
          <a className="header-link" href={import.meta.env.BASE_URL+'facilitator.html'} target="_blank" rel="noopener noreferrer">
            {fr?'Guide d’atelier':'Workshop guide'}
          </a>
          <details className="reader-options" ref={menuRef} onKeyDown={event=>{
            if(event.key==='Escape'){
              closeMenu();
              event.currentTarget.querySelector('summary')?.focus();
              event.stopPropagation();
            }
          }}>
            <summary>{fr?'Options':'Options'}</summary>
            <div className="options-panel">
              <a className="menu-guide" href={import.meta.env.BASE_URL+'facilitator.html'} target="_blank" rel="noopener noreferrer">{fr?'Guide d’atelier':'Workshop guide'}</a>
              <button type="button" onClick={()=>{closeMenu();onProjector();}} aria-pressed={projector}>
                {projector?(fr?'Mode normal':'Normal view'):(fr?'Mode projection':'Projector mode')}
              </button>
              <button type="button" onClick={()=>{closeMenu();onBackup();}}>
                {fr?'Sauvegarder ou restaurer':'Back up or restore'}
              </button>
              <button type="button" onClick={()=>{closeMenu();onReset();}}>{fr?'Recommencer':'Reset'}</button>
              <button type="button" className="danger-action" onClick={()=>{closeMenu();onClear();}}>
                {fr?'Effacer toutes mes réponses':'Erase all my drafts'}
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  </>;
}
