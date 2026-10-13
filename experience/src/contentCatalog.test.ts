import {describe,it,expect} from 'vitest';
import {
  createPublicCatalog,approvedPublicDefinitions,publicWorks,getPublicWork,
  type PublicWorkDefinition
} from './contentCatalog.js';
import {demoEpisode} from './episode.js';
import {authoredFragments,allFragmentOrders,passagesForOrder,orderKey} from './permutation.js';
import {minimumRepairs} from '../../src/model.js';

function altered(index:0|1,patch:Record<string,unknown>):PublicWorkDefinition[]{
  const all=[...approvedPublicDefinitions];
  all[index]={...all[index],...patch} as PublicWorkDefinition;
  return all;
}

describe('publication-gated literary content registry',()=>{
  it('accepts exactly two pinned, original public works with independent models',()=>{
    expect(createPublicCatalog(approvedPublicDefinitions).register.title).toBe('Le Registre des clefs');
    expect(publicWorks.register.episode).toBe(demoEpisode);
    expect(publicWorks.register.repairs).toHaveLength(14);
    expect(publicWorks.permutation.orders).toHaveLength(24);
    expect(publicWorks.permutation.orders.filter(publicWorks.permutation.condition)).toHaveLength(12);
    expect(getPublicWork('register').kind).toBe('weekly-minimum-repair');
    expect(getPublicWork('permutation').kind).toBe('four-fragment-permutation');
    expect(()=>getPublicWork('private-la-releve')).toThrow(/unknown work/);
  });

  it('treats only two states as authored alternatives, never generating missing prose',()=>{
    const authored=minimumRepairs().map(r=>publicWorks.register.authored(r.schedule));
    expect(authored.filter(Boolean)).toHaveLength(2);
    expect(authored.filter(x=>x===null)).toHaveLength(12);
    expect(publicWorks.register.reading.passages).toBe(demoEpisode.realizations[0].passages);
    for(const r of demoEpisode.realizations){
      expect(publicWorks.register.authored(r.schedule)?.passages).toBe(r.passages);
    }
  });

  it('preserves every authored fragment byte-for-byte under all 24 arrangements',()=>{
    for(const order of allFragmentOrders()){
      const fragments=publicWorks.permutation.passages(order);
      expect(fragments).toEqual(passagesForOrder(order));
      expect(fragments.map(x=>x.id)).toEqual(order);
      expect(fragments.map(x=>x.text).sort())
        .toEqual(Object.values(authoredFragments).map(x=>x.text).sort());
      expect(orderKey(order)).toBe(order.join('/'));
    }
  });

  it('rejects self-asserted release claims and every unexpected release-channel field',()=>{
    const base=approvedPublicDefinitions[0].release;
    for(const patch of [
      {channel:'private-local'},{audience:'invited-only'},
      {sourceIdentity:'unaudited.zip'}, {source:'unverified-manuscript'}
    ]){
      expect(()=>createPublicCatalog(altered(0,{release:{...base,...patch}})))
        .toThrow(/unapproved release attribute/);
    }
    expect(()=>createPublicCatalog(altered(0,{release:{...base,override:true}})))
      .toThrow(/missing or unexpected fields/);
    expect(()=>createPublicCatalog(altered(0,{release:null}))).toThrow(/missing publication record/);
  });

  it('rejects an identical-looking manuscript object without an approved identity',()=>{
    expect(()=>createPublicCatalog(altered(0,{fixture:structuredClone(demoEpisode)})))
      .toThrow(/unreviewed schedule source/);
    expect(()=>createPublicCatalog(altered(1,{fragments:{...authoredFragments}})))
      .toThrow(/unreviewed fragments/);
  });

  it('rejects a wrong model, mismatched metadata, unknown extra keys and duplicates',()=>{
    expect(()=>createPublicCatalog(altered(0,{kind:'four-fragment-permutation'})))
      .toThrow(/mismatched work or model/);
    expect(()=>createPublicCatalog(altered(1,{title:'An Unapproved Text'})))
      .toThrow(/mismatched work or model/);
    expect(()=>createPublicCatalog(altered(0,{unverifiedRawText:'PRIVATE'})))
      .toThrow(/missing or unexpected fields/);
    expect(()=>createPublicCatalog([approvedPublicDefinitions[0],approvedPublicDefinitions[0]]))
      .toThrow(/duplicate work/);
    expect(()=>createPublicCatalog([approvedPublicDefinitions[0]]))
      .toThrow(/expected two/);
  });

  it('ties public provenance to a pinned named source, not a generic permission boolean',()=>{
    for(const work of Object.values(publicWorks)){
      expect(work.release.channel).toBe('public-demo');
      expect(work.release.source).toBe('reviewed-original-fixture');
      expect(work.release.sourceIdentity).toContain('.blobsha');
      expect(work.evidence.every(x=>['COMPUTED_IN_SESSION','EXECUTABLY_CHECKED','EDITORIAL_INTERPRETATION','NOT_ESTABLISHED'].includes(x.status))).toBe(true);
      expect(work.evidence.find(x=>x.status==='NOT_ESTABLISHED')).toBeDefined();
    }
  });
});
