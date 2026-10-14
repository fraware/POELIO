import {useId,useState,type CSSProperties,type ReactNode} from 'react';

/**
 * A reader-controlled two-text comparison.
 *
 * The proportions affect presentation only. Neither the authored passages nor
 * their order is modified. Below the desktop breakpoint the texts stack in
 * document order and the width control is hidden.
 */
export function ComparisonSpace({language,children}:{
  language:'fr'|'en';
  children:ReactNode;
}):ReactNode{
  const id=useId();
  const [leftWidth,setLeftWidth]=useState(50);
  const fr=language==='fr';
  const columns={
    '--comparison-left':String(leftWidth)+'fr',
    '--comparison-right':String(100-leftWidth)+'fr'
  } as CSSProperties;

  return <section className="comparison-space"
    aria-label={fr?'Comparaison des deux textes':'Two-text comparison'}>
    <div className="comparison-adjust">
      <label htmlFor={id}>
        {fr?'Largeur du premier texte':'First text width'}
        <output htmlFor={id}>{leftWidth} %</output>
      </label>
      <input id={id} type="range" min={35} max={65} step={5}
        value={leftWidth} onChange={event=>setLeftWidth(Number(event.currentTarget.value))}/>
    </div>
    <div className="comparison" style={columns}>{children}</div>
  </section>;
}
