import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {compareCandidates,compareDeploymentVariants} from './compare_release.mjs';

const h=char=>char.repeat(64);
const gh=char=>char.repeat(40);
function fixture(variant='root'){
  const subpath=variant==='subpath';
  return {
    schemaVersion:1,project:'POELIO',variant,base:subpath?'/POELIO/':'/',
    publicWorks:['register','permutation'],
    technicalStatus:'PASS',publicationStatus:'TECHNICAL_ONLY_NO_PUBLICATION_CLEARANCE',
    authority:'source-and-build-identity-only',
    sourcePins:[
      {source:'src/episode.ts',pin:'approved-demo.blobsha',gitBlobSha1:gh('a'),sha256:h('a')},
      {source:'src/permutation.ts',pin:'approved-permutation.blobsha',gitBlobSha1:gh('b'),sha256:h('b')}
    ],
    dependencyLocks:[
      {path:'package-lock.json',sha256:h('c')},
      {path:'experience/package-lock.json',sha256:h('d')}
    ],
    cacheIdentity:'poelio-approved-public-v1-'+(subpath?'b':'a').repeat(24),
    artifacts:[
      {path:'index.html',size:110,sha256:h(subpath?'e':'1')},
      {path:'facilitator.html',size:128,sha256:h('2')},
      {path:'assets/index-SYNTH123.js',size:210,sha256:h(subpath?'f':'3')},
      {path:'assets/index-SYNTH123.css',size:150,sha256:h('4')},
      {path:'sw.js',size:230,sha256:h(subpath?'e':'5')}
    ]
  };
}
const clone=value=>structuredClone(value);

test('exact same release is identical without authorizing publication',()=>{
  const a=fixture(),b=clone(a);
  assert.deepEqual(compareCandidates(a,b),{
    result:'EXACT_PUBLIC_RELEASE_MATCH',variant:'root',changes:[],publicationAuthorized:false
  });
});
test('artifact identity and cache modification always require independent review',()=>{
  const a=fixture(),b=clone(a);
  b.artifacts[2].sha256=h('9');
  b.cacheIdentity='poelio-approved-public-v1-'+'e'.repeat(24);
  assert.deepEqual(compareCandidates(a,b).changes,
    ['offline-cache:identity','public-byte:assets/index-SYNTH123.js']);
  assert.equal(compareCandidates(a,b).result,'CHANGED_REVIEW_REQUIRED');
});
test('literary source, dependency and asset-file changes are never auto-approved',()=>{
  const a=fixture(),b=clone(a);
  b.sourcePins[0].sha256=h('9');
  b.dependencyLocks[1].sha256=h('8');
  b.artifacts[2].path='assets/index-ANOTHER123.js';
  assert.deepEqual(compareCandidates(a,b).changes,[
    'dependency:experience/package-lock.json',
    'literary-source:src/episode.ts',
    'public-byte:assets/index-ANOTHER123.js',
    'public-byte:assets/index-SYNTH123.js'
  ]);
});
test('two deployment layouts with identical public source and locks are coherent',()=>{
  const a=fixture('root'),b=fixture('subpath');
  const result=compareDeploymentVariants(a,b);
  assert.equal(result.result,'COHERENT_PUBLIC_VARIANTS');
  assert.deepEqual(result.changes,[]);
  assert.equal(result.publicationAuthorized,false);
  b.sourcePins[1].sha256=h('9');
  assert.deepEqual(compareDeploymentVariants(a,b).changes,['literary-source:src/permutation.ts']);
  assert.equal(compareDeploymentVariants(a,b).result,'INCONSISTENT_PUBLIC_BUILDS');
});
test('mismatched variants are rejected rather than spuriously declared equal',()=>{
  assert.throws(()=>compareCandidates(fixture('root'),fixture('subpath')),/identical hosting variants/);
  assert.throws(()=>compareDeploymentVariants(fixture('subpath'),fixture('root')),/specified order/);
});
test('tampered/unreviewed publication claims, strange works and extra metadata are rejected',()=>{
  const a=fixture();
  const failures=[
    b=>{b.publicationStatus='PUBLICATION_APPROVED';},
    b=>{b.publicWorks.push('private-la-releve');},
    b=>{b.importedManuscript='unpublished';},
    b=>{b.schemaVersion=2;},
    b=>{b.sourcePins[1].source='src/episode.ts';},
    b=>{b.dependencyLocks[1].path='package-lock.json';},
    b=>{b.artifacts[4].path='catalog.json';},
    b=>{b.artifacts[0].size=-1;},
    b=>{b.cacheIdentity='user-provided-value';}
  ];
  for(const change of failures){
    const bad=clone(a);change(bad);
    assert.throws(()=>compareCandidates(a,bad));
    assert.throws(()=>compareDeploymentVariants(bad,fixture('subpath')));
  }
});
test('CLI exits unsuccessfully on changed builds and never prints private source text',()=>{
  const dir=mkdtempSync(join(tmpdir(),'poelio-compare-synthetic-'));
  try{
    const first=join(dir,'baseline.json'),second=join(dir,'candidate.json');
    const a=fixture(),b=clone(a);
    writeFileSync(first,JSON.stringify(a));
    writeFileSync(second,JSON.stringify(b));
    const cmd=['scripts/compare_release.mjs','candidate',first,second];
    let result=spawnSync(process.execPath,cmd,{cwd:new URL('..',import.meta.url),encoding:'utf8'});
    assert.equal(result.status,0);
    assert.match(result.stdout,/EXACT_PUBLIC_RELEASE_MATCH/);
    b.artifacts[0].sha256=h('9');
    writeFileSync(second,JSON.stringify(b));
    result=spawnSync(process.execPath,cmd,{cwd:new URL('..',import.meta.url),encoding:'utf8'});
    assert.equal(result.status,2);
    assert.match(result.stdout,/CHANGED_REVIEW_REQUIRED/);
    assert.doesNotMatch(result.stdout,/unpublished manuscript text/);
  }finally{rmSync(dir,{recursive:true,force:true})}
});
