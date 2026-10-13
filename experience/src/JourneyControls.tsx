import {useEffect,useRef,useState,type ReactNode} from 'react';

/** Fixed literary progression; each work retains control of its authored content. */
export type Stage = 'read'|'question'|'explore'|'compare'|'invent'|'reflect';
export type Language = 'fr'|'en';
export const STAGES:readonly Stage[]=['read','question','explore','compare','invent','reflect'];
const LABELS:Readonly<Record<Stage,readonly [string,string]>>={
  read:['Lire','Read'],question:['Questionner','Question'],
  explore:['Explorer','Explore'],compare:['Comparer','Compare'],
  invent:['Inventer','Invent'],reflect:['Revenir','Reflect']
};

export function useLiteraryJourney(){
  const [stage,setStage]=useState<Stage>('read');
  const mainRef=useRef<HTMLElement>(null);
  const current=STAGES.indexOf(stage);
  function navigate(target:Stage):void{
    setStage(target);
    requestAnimationFrame(()=>mainRef.current?.focus());
  }
  function move(direction:-1|1):void{
    navigate(STAGES[Math.min(STAGES.length-1,Math.max(0,current+direction))]);
  }
  return {stage,current,mainRef,navigate,move} as const;
}

export function JourneyNavigation({language,stage,onNavigate}:{
  language:Language;stage:Stage;onNavigate:(target:Stage)=>void;
}):ReactNode{
  const activeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const button=activeRef.current;
    const track=button?.parentElement;
    if(!track || !button)return;
    const viewport=track.getBoundingClientRect();
    const selected=button.getBoundingClientRect();
    if(selected.left<viewport.left)track.scrollLeft-=viewport.left-selected.left+12;
    else if(selected.right>viewport.right)track.scrollLeft+=selected.right-viewport.right+12;
  },[stage]);
  return <nav className="progress-shell" aria-label={language==='fr'?'Étapes de l’expérience':'Experience stages'}>
    <div className="steps">{STAGES.map((s,i)=><button key={s} type="button"
      ref={s===stage?activeRef:undefined}
      className={s===stage?'step current':'step'}
      aria-current={s===stage?'step':undefined} onClick={()=>onNavigate(s)}>
      <span className="step-number">{String(i+1).padStart(2,'0')}</span>
      <span>{LABELS[s][language==='fr'?0:1]}</span>
    </button>)}</div>
  </nav>;
}

export function JourneyFooter({language,index,title,onMove}:{
  language:Language;index:number;title:string;onMove:(direction:-1|1)=>void;
}):ReactNode{
  return <footer className="journey-footer">
    <button type="button" className="outline-button" onClick={()=>onMove(-1)} disabled={index===0}>
      {language==='fr'?'← Retour':'← Back'}
    </button>
    <span className="position"><span className="position-count">{String(index+1).padStart(2,'0')} / 06</span><span className="position-title"> · {title}</span></span>
    <button type="button" className="primary-button" onClick={()=>onMove(1)} disabled={index===STAGES.length-1}>
      {language==='fr'?'Continuer →':'Continue →'}
    </button>
  </footer>;
}
