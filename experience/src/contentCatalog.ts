/**
 * Publication-gated, literary-first catalog of explorable works.
 *
 * This is a STATIC, explicitly allowlisted public registry. It does not read
 * user-supplied JSON, invoke a private importer, or grant publication rights.
 * New works need a separately reviewed authored source, a model validator,
 * a pinned source-identity check, and a deliberate registry change.
 */
import {
  authoredForSchedule, demoEpisode, evidence, validatePublicEpisode,
  type Episode, type Realization, type EvidenceStatus
} from './episode.js';
import {
  FRAGMENT_IDS, ORIGINAL_ORDER, COUNTER_ORDER, authoredFragments,
  allFragmentOrders, isFragmentOrder, orderKey, passagesForOrder,
  questionBeforeLetter, type FragmentOrder, type AuthoredFragment
} from './permutation.js';
import {minimumRepairs, scheduleKey, type Person, type Schedule} from '../../src/model.js';

export const PUBLIC_CATALOG_VERSION=1 as const;
export type WorkId='register'|'permutation';
export type ModelKind='weekly-minimum-repair'|'four-fragment-permutation';

export interface ReleaseRecord{
  readonly channel:'public-demo';
  readonly source:'reviewed-original-fixture';
  readonly audience:'unrestricted-public-demo';
  readonly sourceIdentity:string;
  /** Operator-supplied provenance statement, not legal proof of ownership. */
  readonly editorialNote:string;
}

interface DefinitionBase{
  readonly schemaVersion:typeof PUBLIC_CATALOG_VERSION;
  readonly slug:WorkId;
  readonly title:string;
  readonly language:'fr';
  readonly release:ReleaseRecord;
}

export interface ScheduleDefinition extends DefinitionBase{
  readonly slug:'register';
  readonly kind:'weekly-minimum-repair';
  readonly fixture:Episode;
}

export interface PermutationDefinition extends DefinitionBase{
  readonly slug:'permutation';
  readonly kind:'four-fragment-permutation';
  readonly fragments:Readonly<Record<string,AuthoredFragment>>;
  readonly originalOrder:FragmentOrder;
  readonly comparisonOrder:FragmentOrder;
}

export type PublicWorkDefinition=ScheduleDefinition|PermutationDefinition;

export interface EvidenceClaim{
  readonly id:string;
  readonly status:EvidenceStatus;
  readonly scope:string;
  readonly statement:string;
}

export interface ScheduleWork{
  readonly slug:'register';
  readonly kind:'weekly-minimum-repair';
  readonly title:string;
  readonly language:'fr';
  readonly release:ReleaseRecord;
  readonly episode:Episode;
  readonly reading:Realization;
  readonly repairs:ReturnType<typeof minimumRepairs>;
  readonly evidence:readonly EvidenceClaim[];
  readonly authored:(state:readonly Person[])=>Realization|null;
}

export interface PermutationWork{
  readonly slug:'permutation';
  readonly kind:'four-fragment-permutation';
  readonly title:string;
  readonly language:'fr';
  readonly release:ReleaseRecord;
  readonly fragments:Readonly<Record<string,AuthoredFragment>>;
  readonly originalOrder:FragmentOrder;
  readonly comparisonOrder:FragmentOrder;
  readonly orders:readonly FragmentOrder[];
  readonly evidence:readonly EvidenceClaim[];
  readonly passages:(order:FragmentOrder)=>readonly AuthoredFragment[];
  readonly condition:(order:FragmentOrder)=>boolean;
}

export type PublicWork=ScheduleWork|PermutationWork;

const EXPECTED_RELEASES:Readonly<Record<WorkId,ReleaseRecord>>={
  register:{
    channel:'public-demo',
    source:'reviewed-original-fixture',
    audience:'unrestricted-public-demo',
    sourceIdentity:'experience/src/episode.ts@approved-demo.blobsha',
    editorialNote:'POELIO original teaching prose; not La Relève'
  },
  permutation:{
    channel:'public-demo',
    source:'reviewed-original-fixture',
    audience:'unrestricted-public-demo',
    sourceIdentity:'experience/src/permutation.ts@approved-permutation.blobsha',
    editorialNote:'POELIO original teaching fragments; not La Relève'
  }
};

const KNOWN_IDS:Readonly<Record<WorkId,{title:string;kind:ModelKind}>>={
  register:{title:'Le Registre des clefs',kind:'weekly-minimum-repair'},
  permutation:{title:'Les Quatre Témoins',kind:'four-fragment-permutation'}
};

function fail(message:string):never{throw new Error('Public literary catalog rejected: '+message)}

function exactKeys(value:object,allowed:readonly string[],where:string):void{
  const keys=Object.keys(value).sort();
  if(keys.join('|')!==[...allowed].sort().join('|'))
    fail(where+' contains missing or unexpected fields');
}

function verifyRelease(def:PublicWorkDefinition):void{
  const expected=EXPECTED_RELEASES[def.slug];
  const declared=def.release;
  if(!declared || typeof declared!=='object')fail('missing publication record');
  exactKeys(declared,['channel','source','audience','sourceIdentity','editorialNote'],'release record');
  for(const name of ['channel','source','audience','sourceIdentity','editorialNote'] as const){
    if(declared[name]!==expected[name])fail('unapproved release attribute: '+name);
  }
}

function validateDefinition(def:PublicWorkDefinition):void{
  if(!def || typeof def!=='object')fail('invalid work definition');
  if(def.schemaVersion!==PUBLIC_CATALOG_VERSION)fail('unsupported schema');
  if(def.slug!=='register' && def.slug!=='permutation')fail('unknown public work');
  const expected=KNOWN_IDS[def.slug];
  if(def.kind!==expected.kind || def.title!==expected.title || def.language!=='fr')
    fail('mismatched work or model metadata');
  verifyRelease(def);

  if(def.kind==='weekly-minimum-repair'){
    exactKeys(def,['schemaVersion','slug','kind','title','language','release','fixture'],'schedule definition');
    // Object identity disallows a lookalike manuscript declaring its own rights.
    if(def.fixture!==demoEpisode)fail('unreviewed schedule source; private catalogs are excluded');
    validatePublicEpisode(def.fixture);
    if(def.fixture.id!=='register-of-keys-demo' ||
       def.fixture.title!==def.title || def.fixture.rights.channel!=='public-demo')
      fail('inconsistent schedule provenance');
    if(def.fixture.realizations.length!==2)fail('unexpected number of authored alternatives');
    const repairs=minimumRepairs();
    if(repairs.length!==14 || new Set(repairs.map(r=>scheduleKey(r.schedule))).size!==14)
      fail('canonical schedule model changed');
    return;
  }
  exactKeys(def,['schemaVersion','slug','kind','title','language','release',
                 'fragments','originalOrder','comparisonOrder'],'permutation definition');
  if(def.fragments!==authoredFragments ||
     def.originalOrder!==ORIGINAL_ORDER || def.comparisonOrder!==COUNTER_ORDER)
    fail('unreviewed fragments or reading order');
  if(!isFragmentOrder(def.originalOrder) || !isFragmentOrder(def.comparisonOrder) ||
     orderKey(def.originalOrder)===orderKey(def.comparisonOrder))
    fail('invalid literary reading orders');
  const names=Object.keys(def.fragments).sort();
  if(names.join('|')!==[...FRAGMENT_IDS].sort().join('|'))
    fail('fragment inventory differs from approved source');
  for(const id of FRAGMENT_IDS){
    const source=def.fragments[id];
    if(!source || source.id!==id || !source.text.trim() || !source.title.trim() ||
      source.provenance!=='poelio-original-permutation-demo-v1/'+id)
      fail('invalid fragment provenance');
  }
  const orders=allFragmentOrders();
  if(orders.length!==24 || new Set(orders.map(orderKey)).size!==24 ||
     orders.filter(questionBeforeLetter).length!==12)
    fail('permutation model contract changed');
}

/** Whitelist-resolved public input; no arbitrary authored text is accepted. */
export function createPublicCatalog(definitions:readonly PublicWorkDefinition[]):Readonly<{
  register:ScheduleWork;permutation:PermutationWork;
}>{
  if(definitions.length!==2)fail('expected two explicitly reviewed public works');
  const seen=new Set<WorkId>();
  let register:ScheduleWork|undefined,permutation:PermutationWork|undefined;
  for(const def of definitions){
    validateDefinition(def);
    if(seen.has(def.slug))fail('duplicate work');
    seen.add(def.slug);
    if(def.kind==='weekly-minimum-repair'){
      register={
        slug:def.slug,kind:def.kind,title:def.title,language:def.language,
        release:def.release,episode:def.fixture,
        reading:def.fixture.realizations[0],
        repairs:minimumRepairs(),
        evidence:evidence.map(e=>({...e})),
        authored:(schedule)=>authoredForSchedule(def.fixture,schedule)
      };
    }else{
      permutation={
        slug:def.slug,kind:def.kind,title:def.title,language:def.language,
        release:def.release,fragments:def.fragments,
        originalOrder:def.originalOrder,comparisonOrder:def.comparisonOrder,
        orders:allFragmentOrders(),
        evidence:[
          {id:'permutation-count',status:'EXECUTABLY_CHECKED',
           scope:'Four distinct fixed source fragments',
           statement:'Exactly 24 complete reading orders exist.'},
          {id:'precedence-count',status:'EXECUTABLY_CHECKED',
           scope:'The question fragment before the envelope fragment',
           statement:'Exactly 12 orders satisfy this declared relation.'},
          {id:'literary-reading',status:'NOT_ESTABLISHED',
           scope:'Narrative meaning and artistic value',
           statement:'Enumeration cannot establish the quality or meaning of an arrangement.'}
        ],
        passages:(order)=>passagesForOrder(order),
        condition:(order)=>questionBeforeLetter(order)
      };
    }
  }
  if(!register||!permutation)fail('missing required reviewed public work');
  return Object.freeze({register:Object.freeze(register),permutation:Object.freeze(permutation)});
}

export const approvedPublicDefinitions:readonly PublicWorkDefinition[]=[
  {
    schemaVersion:1,slug:'register',kind:'weekly-minimum-repair',
    title:'Le Registre des clefs',language:'fr',
    release:EXPECTED_RELEASES.register,fixture:demoEpisode
  },
  {
    schemaVersion:1,slug:'permutation',kind:'four-fragment-permutation',
    title:'Les Quatre Témoins',language:'fr',
    release:EXPECTED_RELEASES.permutation,fragments:authoredFragments,
    originalOrder:ORIGINAL_ORDER,comparisonOrder:COUNTER_ORDER
  }
];

export const publicWorks=createPublicCatalog(approvedPublicDefinitions);

/** A missing work is a rejection, not an occasion to synthesize content. */
export function getPublicWork(slug:string):PublicWork{
  if(slug==='register')return publicWorks.register;
  if(slug==='permutation')return publicWorks.permutation;
  return fail('unknown work identifier');
}
