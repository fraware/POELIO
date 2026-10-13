/**
 * Compare the exact-byte technical evidence for reviewed PUBLIC POELIO builds.
 *
 * The comparator checks JSON manifest shape and provenance consistency. It
 * does not authenticate whoever produced a manifest, authorize publication,
 * inspect unpublished prose, or make a statement about literary meaning.
 */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const TECHNICAL_ONLY='TECHNICAL_ONLY_NO_PUBLICATION_CLEARANCE';
const PUBLIC_WORKS=['register','permutation'];
const SOURCE_NAMES=['src/episode.ts','src/permutation.ts'];
const LOCK_NAMES=['package-lock.json','experience/package-lock.json'];
const FIXED_FILES=['index.html','facilitator.html','source-sans-3-italic.woff2','source-sans-3.woff2','source-sans-license.txt','sw.js'];

function reject(message){throw new Error('POELIO release comparison rejected: '+message)}
function plainObject(value){
  return value!==null && typeof value==='object' && !Array.isArray(value);
}
function exactKeys(value,expected,where){
  if(!plainObject(value) || Object.keys(value).sort().join('|')!==[...expected].sort().join('|'))
    reject('unknown, missing or duplicate-meaning fields in '+where);
}
function entries(rows,expected,identity,fields,where){
  if(!Array.isArray(rows)||rows.length!==expected.length)reject(where+' inventory size mismatch');
  const found=new Map();
  for(const row of rows){
    exactKeys(row,fields,where+' entry');
    const name=row[identity];
    if(typeof name!=='string'||found.has(name)||!expected.includes(name))
      reject('unknown or duplicated '+where+' identity');
    found.set(name,row);
  }
  if(found.size!==expected.length)reject('missing '+where+' identity');
  return found;
}
function digest(value,label,len=64){
  if(typeof value!=='string'|| !new RegExp('^[a-f0-9]{'+len+'}$').test(value))
    reject('invalid '+label+' hash');
}
function checkEvidence(value){
  exactKeys(value,[
    'schemaVersion','project','variant','base','publicWorks','technicalStatus',
    'publicationStatus','authority','sourcePins','dependencyLocks','cacheIdentity','artifacts'
  ],'release evidence');
  if(value.schemaVersion!==1||value.project!=='POELIO'||
    !['root','subpath'].includes(value.variant)||
    value.base!==(value.variant==='root'?'/':'/POELIO/')||
    value.technicalStatus!=='PASS'||
    value.publicationStatus!==TECHNICAL_ONLY||
    value.authority!=='source-and-build-identity-only')
    reject('unrecognized or self-authorized technical release');
  if(!Array.isArray(value.publicWorks)||
     value.publicWorks.join('|')!==PUBLIC_WORKS.join('|'))
    reject('unapproved or reordered public literary works');
  const pins=entries(value.sourcePins,SOURCE_NAMES,'source',
    ['source','pin','gitBlobSha1','sha256'],'literary source');
  for(const [name,row] of pins){
    const expectedPin=name==='src/episode.ts'?'approved-demo.blobsha':'approved-permutation.blobsha';
    if(row.pin!==expectedPin)reject('wrong source pin path');
    digest(row.gitBlobSha1,'source Git blob',40);
    digest(row.sha256,'source SHA-256');
  }
  const locks=entries(value.dependencyLocks,LOCK_NAMES,'path',['path','sha256'],'dependency');
  for(const row of locks.values())digest(row.sha256,'dependency SHA-256');
  if(typeof value.cacheIdentity!=='string'||
    !/^poelio-approved-public-v1-[a-f0-9]{24}$/.test(value.cacheIdentity))
    reject('invalid offline cache identity');
  if(!Array.isArray(value.artifacts)||value.artifacts.length!==8)
    reject('exactly eight approved public assets expected');
  const artifacts=new Map();
  for(const row of value.artifacts){
    exactKeys(row,['path','size','sha256'],'public artifact');
    if(typeof row.path!=='string'||artifacts.has(row.path)||
       !FIXED_FILES.includes(row.path)&&
       !/^assets\/index-[A-Za-z0-9_-]+\.(?:js|css)$/.test(row.path))
      reject('unknown or duplicate public artifact');
    if(!Number.isSafeInteger(row.size)||row.size<=0)reject('invalid asset size');
    digest(row.sha256,'public artifact SHA-256');
    artifacts.set(row.path,row);
  }
  if(FIXED_FILES.some(x=>!artifacts.has(x))||
     [...artifacts.keys()].filter(x=>x.endsWith('.js')&&x!=='sw.js').length!==1||
     [...artifacts.keys()].filter(x=>x.endsWith('.css')).length!==1)
    reject('missing or duplicated compiled public assets');
  return {pins,locks,artifacts};
}
function canonicalRow(row){
  if(!row)return null;
  return JSON.stringify(Object.fromEntries(Object.entries(row).sort(([a],[b])=>a.localeCompare(b))));
}
function changesIn(current,candidate,category){
  const result=[];
  for(const name of new Set([...current.keys(),...candidate.keys()])){
    const a=current.get(name),b=candidate.get(name);
    if(!a||!b||canonicalRow(a)!==canonicalRow(b))
      result.push(category+':'+name);
  }
  return result.sort();
}

/**
 * Same deployment variant: any changed byte identity or dependency/source
 * version is review-required, with no automatic promotion exception.
 */
export function compareCandidates(reference,candidate){
  const previous=checkEvidence(reference),next=checkEvidence(candidate);
  if(reference.variant!==candidate.variant||reference.base!==candidate.base)
    reject('compare identical hosting variants, not root against subpath');
  const changes=[
    ...changesIn(previous.pins,next.pins,'literary-source'),
    ...changesIn(previous.locks,next.locks,'dependency'),
    ...changesIn(previous.artifacts,next.artifacts,'public-byte')
  ];
  if(reference.cacheIdentity!==candidate.cacheIdentity)
    changes.push('offline-cache:identity');
  changes.sort();
  return {
    result:changes.length?'CHANGED_REVIEW_REQUIRED':'EXACT_PUBLIC_RELEASE_MATCH',
    variant:reference.variant,
    changes,
    publicationAuthorized:false
  };
}

/**
 * Root/subpath: public sources and locked dependencies MUST be identical.
 * Compiled bytes/cache identity legitimately vary by base URL.
 */
export function compareDeploymentVariants(root,subpath){
  const left=checkEvidence(root),right=checkEvidence(subpath);
  if(root.variant!=='root'||subpath.variant!=='subpath')
    reject('root and subpath evidence must be in the specified order');
  const mismatches=[
    ...changesIn(left.pins,right.pins,'literary-source'),
    ...changesIn(left.locks,right.locks,'dependency')
  ];
  return {
    result:mismatches.length?'INCONSISTENT_PUBLIC_BUILDS':'COHERENT_PUBLIC_VARIANTS',
    compared:['/','/POELIO/'],
    changes:mismatches.sort(),
    publicationAuthorized:false
  };
}

function main(){
  const [mode,first,second]=process.argv.slice(2);
  if(!['candidate','variants'].includes(mode)||!first||!second)
    reject('Usage: node scripts/compare_release.mjs candidate|variants <first.json> <second.json>');
  const load=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
  const result=mode==='candidate'?
    compareCandidates(load(first),load(second)):
    compareDeploymentVariants(load(first),load(second));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.changes.length)process.exitCode=2;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{main()}catch(e){process.stderr.write(String(e.message)+'\n');process.exitCode=2}
}
