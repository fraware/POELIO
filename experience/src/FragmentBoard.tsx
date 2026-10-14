import {useRef,useState,type ReactNode,type PointerEvent} from 'react';
import {
  moveItem,shiftItem,type OrderState,type OrderTransition,type OrderRule
} from './orderEngine.js';

export interface BoardItem<Id extends string> {
  readonly id:Id;
  readonly title:string;
}

/**
 * Content-independent, controlled fragment board.
 * Pointer movement and accessible buttons both use the same validated engine.
 * The parent provides the active rule and owns undo/redo and announced outcomes.
 */
export function FragmentBoard<Id extends string>({items,state,language,rule,onTransition}:{
  items:readonly BoardItem<Id>[];
  state:OrderState<Id>;
  language:'fr'|'en';
  rule?:OrderRule<Id>;
  onTransition:(result:OrderTransition<Id>,description:string)=>void;
}):ReactNode{
  const fr=language==='fr';
  const byId=new Map(items.map(item=>[item.id,item]));
  if(byId.size!==items.length || items.length!==state.order.length ||
      state.order.some(id=>!byId.has(id)))throw new Error('Board inventory mismatch');
  const active=useRef<{id:Id;pointerId:number}|null>(null);
  const [over,setOver]=useState<Id|null>(null);
  const [dragging,setDragging]=useState<Id|null>(null);

  function targetAt(event:PointerEvent<HTMLElement>):Id|null{
    const hit=document.elementFromPoint(event.clientX,event.clientY);
    const card=hit?.closest<HTMLElement>('[data-fragment-id]');
    const id=card?.dataset.fragmentId;
    return state.order.find(candidate=>candidate===id)??null;
  }
  function startDrag(event:PointerEvent<HTMLSpanElement>,id:Id):void{
    if(event.pointerType==='mouse'&&event.button!==0)return;
    active.current={id,pointerId:event.pointerId};
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(id);
    setOver(id);
  }
  function moveDrag(event:PointerEvent<HTMLSpanElement>):void{
    if(active.current?.pointerId!==event.pointerId)return;
    setOver(targetAt(event));
  }
  function endDrag(event:PointerEvent<HTMLSpanElement>):void{
    const origin=active.current;
    if(!origin||origin.pointerId!==event.pointerId)return;
    const destination=targetAt(event);
    active.current=null;setDragging(null);setOver(null);
    if(event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if(destination===null)return;
    const index=state.order.indexOf(destination);
    const result=moveItem(state,origin.id,index,rule);
    onTransition(result,byId.get(origin.id)?.title??origin.id);
  }
  function cancelDrag():void{
    active.current=null;setDragging(null);setOver(null);
  }
  return <ol className="fragment-board" aria-label={fr?'Ordre des quatre fragments':'Order of the four fragments'}>
    {state.order.map((id,index)=>{
      const item=byId.get(id)!;
      const description=item.title;
      return <li key={id} data-fragment-id={id}
        className={'fragment-card'+(over===id&&dragging!==null?' fragment-target':'')}>
        <span className="fragment-position" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
        <span className="fragment-grip" aria-hidden="true"
          title={fr?'Maintenir et glisser':'Hold and drag'}
          onPointerDown={event=>startDrag(event,id)}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={cancelDrag}>⠿</span>
        <span className="fragment-title" lang="fr">{item.title}</span>
        <div className="fragment-move-buttons">
          <button type="button" disabled={index===0}
            aria-label={(fr?'Monter ':'Move up ')+description}
            onClick={()=>onTransition(shiftItem(state,id,-1,rule),description)}>↑</button>
          <button type="button" disabled={index===state.order.length-1}
            aria-label={(fr?'Descendre ':'Move down ')+description}
            onClick={()=>onTransition(shiftItem(state,id,1,rule),description)}>↓</button>
        </div>
      </li>;
    })}
  </ol>;
}
