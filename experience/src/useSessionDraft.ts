/**
 * Voluntary writing stays within this tab's sessionStorage, never in a
 * server, service worker cache, URL, or cross-tab persistent localStorage.
 *
 * A failed/blocked Storage API silently falls back to React memory.
 * This is ephemeral private convenience, not encryption or data collection.
 */
import {useEffect,useState,type Dispatch,type SetStateAction} from 'react';

export type WorkScope = 'register'|'permutation';
export type DraftField = 'initial'|'revised'|'rule'|'writing';
export const DRAFT_PREFIX = 'poelio:session:v1:';

export function useSessionDraft(
  scope: WorkScope, field: DraftField
): readonly [string, Dispatch<SetStateAction<string>>] {
  const key=DRAFT_PREFIX+scope+':'+field;
  const [value,setValue]=useState<string>(()=>{
    try {return window.sessionStorage.getItem(key)??'';}
    catch {return '';}
  });
  useEffect(()=>{
    try {
      if(value.length === 0) window.sessionStorage.removeItem(key);
      else window.sessionStorage.setItem(key,value);
    }catch{
      // Storage can be disabled or full; editing still works in memory.
    }
  },[key,value]);
  return [value,setValue] as const;
}
