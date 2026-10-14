import {type ReactNode} from 'react';
import type {Language} from './JourneyControls.js';

/** Reader-authored interpretation, revealed only on request and only in this work. */
export function FirstReadingNote({language,text}:{
  language:Language;
  text:string;
}):ReactNode{
  if(!text.trim())return null;
  const fr=language==='fr';
  return <details className="first-reading-note">
    <summary>{fr?'Relire ma première impression':'Reread my first impression'}</summary>
    <blockquote>{text}</blockquote>
  </details>;
}

/** One local return path, next to the comparison it contextualizes. */
export function ExplorationBridge({language,onReturn,children}:{
  language:Language;
  onReturn:()=>void;
  children:ReactNode;
}):ReactNode{
  const fr=language==='fr';
  return <aside className="exploration-bridge" aria-label={fr?'Depuis l’exploration':'From exploration'}>
    <p>{children}</p>
    <button className="exploration-return" type="button" onClick={onReturn}>
      {fr?'← Reprendre l’exploration':'← Return to exploration'}
    </button>
  </aside>;
}
