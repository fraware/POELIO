import {useEffect,useRef,useState,type ReactNode} from 'react';
import {
  createReaderBackup,parseReaderBackup,serializeReaderBackup,MAX_BACKUP_BYTES,
  type BackupConfiguration,type ReaderBackupV1,type ReaderDrafts
} from './readerBackup.js';
import type {WorkScope} from './useSessionDraft.js';
import type {Language} from './JourneyControls.js';

export type RestoreMode='merge'|'replace';

export function PortableBackupPanel({work,language,drafts,configuration,onRestore,onClose}:{
  work:WorkScope;language:Language;drafts:ReaderDrafts;configuration:BackupConfiguration;
  onRestore:(backup:ReaderBackupV1,mode:RestoreMode)=>void;onClose:()=>void;
}):ReactNode{
  const fr=language==='fr';
  const heading=useRef<HTMLHeadingElement>(null);
  const [pending,setPending]=useState<ReaderBackupV1|null>(null);
  const [status,setStatus]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{heading.current?.focus();},[]);
  function finish():void{
    onClose();
    requestAnimationFrame(()=>document.querySelector<HTMLElement>('details.reader-options > summary')?.focus());
  }
  function exportBackup():void{
    setError('');setStatus('');
    try{
      const content=serializeReaderBackup(createReaderBackup(work,drafts,configuration));
      const blob=new Blob([content],{type:'application/json;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;
      link.download='poelio-'+work+'-backup-v1.json';
      document.body.appendChild(link);link.click();link.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setStatus(fr?'Sauvegarde préparée pour le téléchargement.':'Backup prepared for download.');
    }catch{
      setError(fr?'Sauvegarde impossible : texte trop long ou données invalides.':
        'Backup unavailable: writing too long or invalid data.');
    }
  }
  async function stageFile(file:File|undefined):Promise<void>{
    setError('');setStatus('');setPending(null);
    if(!file)return;
    try{
      if(file.size>MAX_BACKUP_BYTES)throw new Error('File too large');
      // Invalid UTF-8 cannot be silently replaced; source text must survive byte-for-byte.
      const text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());
      const backup=parseReaderBackup(text,work);
      setPending(backup);
      setStatus(fr?'Sauvegarde vérifiée. Choisissez comment restaurer les réponses.':
        'Backup validated. Choose how to restore your answers.');
    }catch{
      setError(fr
        ?'Fichier refusé. Vérifiez le format, la version, l’œuvre, la source et la taille.'
        :'File rejected. Check the format, version, work, source and size.');
    }
  }
  function apply(mode:RestoreMode):void{
    if(!pending)return;
    if(mode==='replace'&&!window.confirm(fr
      ?'Remplacer les quatre réponses et la configuration actuelle de cette œuvre ? Cette action ne modifie pas l’autre œuvre. Exportez votre travail auparavant si nécessaire.'
      :'Replace all four answers and this work’s current configuration? The other work is unaffected. Export your current writing first if needed.'))return;
    try{
      onRestore(pending,mode);
      setPending(null);setError('');
      setStatus(mode==='merge'
        ?(fr?'Fusion terminée. Les réponses existantes et la configuration actuelle sont conservées.':
          'Merge completed. Existing answers and the current configuration were preserved.')
        :(fr?'Sauvegarde restaurée pour cette œuvre.':'Backup restored for this work.'));
    }catch{
      setError(fr?'Restauration refusée : les réponses actuelles dépassent les limites autorisées.':
        'Restore rejected: the current answers exceed supported limits.');
    }
  }
  const answered=(['initial','revised','rule','writing'] as const).filter(key=>drafts[key].length>0).length;
  return <section className="backup-panel" aria-labelledby="backup-title" data-work={work}>
    <div className="backup-header">
      <h2 id="backup-title" ref={heading} tabIndex={-1}>{fr?'Sauvegarder mon travail':'Save my writing'}</h2>
      <button type="button" className="outline-button" onClick={finish}>{fr?'Fermer':'Close'}</button>
    </div>
    <p>{fr
      ?'Les réponses restent dans cet onglet et risquent de disparaître à sa fermeture. Exportez une sauvegarde JSON pour les reprendre ailleurs. Aucun fichier n’est transmis à POELIO.'
      :'Your answers are stored in this tab and may disappear when it closes. Export a JSON backup to continue elsewhere. No file is uploaded to POELIO.'}</p>
    <p className="backup-summary">{fr?'Réponses non vides':'Nonempty answers'} : {answered} / 4.
      {' '}{fr?'Sauvegarde réservée à cette œuvre et à cette édition.':'Backup is specific to this work and edition.'}</p>
    <div className="backup-actions">
      <button type="button" className="primary-button" onClick={exportBackup}>
        {fr?'Exporter la sauvegarde JSON':'Export JSON backup'}
      </button>
    </div>
    <div className="backup-import">
      <label htmlFor={'backup-file-'+work} className="field-label">
        {fr?'Restaurer depuis un fichier JSON':'Restore from a JSON file'}
      </label>
      <input id={'backup-file-'+work} type="file" accept=".json,application/json"
        onChange={event=>{
          const file=event.currentTarget.files?.[0];
          event.currentTarget.value='';
          void stageFile(file);
        }}/>
      {pending&&<div className="backup-confirm">
        <p>{fr
          ?'Le fichier est valide. La fusion remplit uniquement les réponses vides et conserve l’arrangement actuel. Le remplacement rétablit toutes les réponses ainsi que la configuration du fichier.'
          :'The file is valid. Merge fills only blank answers and keeps your current arrangement. Replace restores all answers and the configuration in the file.'}</p>
        <div className="backup-actions">
          <button type="button" className="outline-button" onClick={()=>apply('merge')}>
            {fr?'Fusionner sans écraser':'Merge without overwriting'}
          </button>
          <button type="button" className="outline-button" onClick={()=>apply('replace')}>
            {fr?'Remplacer cette œuvre':'Replace this work'}
          </button>
          <button type="button" className="outline-button" onClick={()=>{setPending(null);setStatus('');}}>
            {fr?'Annuler l’import':'Cancel import'}
          </button>
        </div>
      </div>}
    </div>
    {status&&<p className="backup-status" role="status">{status}</p>}
    {error&&<p className="backup-error" role="alert">{error}</p>}
  </section>;
}
