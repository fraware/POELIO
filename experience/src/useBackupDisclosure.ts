import {useRef,useState} from 'react';

/**
 * Keep backup restoration local to the current work and return keyboard focus
 * to the command that opened it. The Options summary is used if the command
 * was inside the now-collapsed menu.
 */
export function useBackupDisclosure(){
  const [backupOpen,setBackupOpen]=useState(false);
  const returnFocus=useRef<HTMLElement|null>(null);

  function openBackup():void{
    const active=document.activeElement;
    returnFocus.current=active instanceof HTMLElement
      ?(active.closest('details.reader-options')?.querySelector<HTMLElement>('summary')??active)
      :null;
    setBackupOpen(true);
  }

  function closeBackup():void{
    setBackupOpen(false);
    const target=returnFocus.current;
    requestAnimationFrame(()=>{
      if(target?.isConnected)target.focus();
      else document.querySelector<HTMLElement>('details.reader-options > summary')?.focus();
    });
  }

  return {backupOpen,openBackup,closeBackup,dismissBackup:()=>setBackupOpen(false)} as const;
}
