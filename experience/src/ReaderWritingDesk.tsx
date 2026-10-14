import {type ReactNode} from 'react';
import type {Language} from './JourneyControls.js';

/**
 * Explicit exports for a reader's own work.
 *
 * TXT is a human-readable record. The separately validated JSON backup
 * preserves draft fields and the selected formal configuration for this
 * approved edition. Neither operation uploads writing to a server.
 */
export function ReaderArchiveActions({language,onExport,onBackup}:{
  language:Language;
  onExport:()=>void;
  onBackup:()=>void;
}):ReactNode{
  const fr=language==='fr';
  return <div className="reader-archive">
    <div className="reader-archive-actions">
      <button type="button" className="primary-button" onClick={onBackup}>
        {fr?'Sauvegarder ou restaurer (JSON)':'Back up or restore (JSON)'}
      </button>
      <button type="button" className="outline-button" onClick={onExport}>
        {fr?'Exporter le texte (TXT)':'Export text (TXT)'}
      </button>
    </div>
    <p className="discreet">{fr
      ?'TXT pour conserver un texte lisible. JSON pour reprendre vos réponses et votre configuration.'
      :'TXT for a readable copy. JSON to resume your answers and selected configuration.'}</p>
  </div>;
}

/**
 * Shared, browser-local composition surface used by both original works.
 * The character limit matches the version-1 portable backup contract.
 */
export function ReaderWritingDesk({language,id,label,value,onChange,onExport,onBackup}:{
  language:Language;
  id:string;
  label:string;
  value:string;
  onChange:(value:string)=>void;
  onExport:()=>void;
  onBackup:()=>void;
}):ReactNode{
  const words=value.trim()?value.trim().split(/\s+/u).length:0;
  return <section className="reader-writing-desk" aria-label={language==='fr'?'Espace d’écriture':'Writing space'}>
    <label htmlFor={id} className="field-label">{label}</label>
    <textarea id={id} rows={12} maxLength={150000} value={value}
      onChange={event=>onChange(event.currentTarget.value)}/>
    <div className="reader-writing-count" aria-live="off">
      {words} {language==='fr'?(words===1?'mot':'mots'):(words===1?'word':'words')}
    </div>
    <ReaderArchiveActions language={language} onExport={onExport} onBackup={onBackup}/>
  </section>;
}
