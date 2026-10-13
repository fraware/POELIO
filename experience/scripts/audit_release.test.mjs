import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {renderOfflineShell} from './create_offline_shell.mjs';
import {auditPublicRelease,PUBLICATION_STATUS} from './audit_release.mjs';

function put(root,path,content){writeFileSync(join(root,path),content)}
function gitHash(bytes){
  return createHash('sha1')
    .update(Buffer.from('blob '+bytes.byteLength+'\0'))
    .update(bytes).digest('hex');
}
function build(variant='root'){
  const root=mkdtempSync(join(tmpdir(),'poelio-release-test-'));
  const exp=join(root,'experience');
  const dist=join(exp,'dist');
  mkdirSync(join(exp,'src'),{recursive:true});
  mkdirSync(join(dist,'assets'),{recursive:true});
  put(root,'package-lock.json','{"lockfileVersion":3,"name":"root"}');
  put(exp,'package-lock.json','{"lockfileVersion":3,"name":"experience"}');
  for(const [source,pin] of [
    ['episode.ts','approved-demo.blobsha'],
    ['permutation.ts','approved-permutation.blobsha']
  ]){
    const content=Buffer.from('// Synthetic public text fixture '+source+'\n');
    put(exp,'src/'+source,content);
    put(exp,pin,gitHash(content)+'\n');
  }
  const prefix=variant==='root'?'/':'/POELIO/';
  const html='<!doctype html><meta name="referrer" content="no-referrer">'
   +'<meta http-equiv="Content-Security-Policy" content="default-src \'none\';'
   +' script-src \'self\'; style-src \'self\'; connect-src \'none\';'
   +' worker-src \'self\'; object-src \'none\'; form-action \'none\'">'
   +'<script src="'+prefix+'assets/index-AAA123.js"></script>'
   +'<link href="'+prefix+'assets/index-BBB123.css" rel="stylesheet">';
  put(dist,'index.html',html);
  put(dist,'facilitator.html','<meta name="referrer" content="no-referrer">'
    +'<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; font-src \'self\'">Public facilitator');
  put(dist,'source-sans-3.woff2','wOF2TEST');
  put(dist,'source-sans-3-italic.woff2','wOF2TEST');
  put(dist,'source-sans-license.txt','Copyright 2010-2024 Adobe, SIL OPEN FONT LICENSE Version 1.1');
  put(dist,'assets/index-AAA123.js','console.log("test-only")');
  put(dist,'assets/index-BBB123.css','body{color:#000;src:url('+prefix+'source-sans-3.woff2) url('+prefix+'source-sans-3-italic.woff2)}');
  put(dist,'sw.js',renderOfflineShell(dist).worker);
  return {root,experience:exp,dist,variant,run:()=>auditPublicRelease({root,experience:exp,dist,variant})};
}
function withBuild(fn,variant='root'){
  const x=build(variant);
  try{fn(x)}finally{rmSync(x.root,{recursive:true,force:true})}
}

test('records deterministic source, npm lock and eight-artifact identities',()=>{
  withBuild(x=>{
    const a=x.run(),b=x.run();
    assert.deepEqual(a,b);
    assert.equal(a.technicalStatus,'PASS');
    assert.equal(a.publicationStatus,PUBLICATION_STATUS);
    assert.equal(a.artifacts.length,8);
    assert.equal(a.sourcePins.length,2);
    assert.equal(a.dependencyLocks.length,2);
    for(const item of a.artifacts)assert.match(item.sha256,/^[0-9a-f]{64}$/);
    for(const source of a.sourcePins)assert.match(source.gitBlobSha1,/^[0-9a-f]{40}$/);
  });
});
test('same evidence works for explicitly configured repository subpath',()=>{
  withBuild(x=>{
    const a=x.run();
    assert.equal(a.variant,'subpath');
    assert.equal(a.base,'/POELIO/');
  },'subpath');
});
test('rejects a mismatched compiled base path',()=>{
  withBuild(x=>{
    assert.throws(()=>auditPublicRelease({...x,variant:'subpath'}),/HTML references/);
  });
});
test('rejects added private catalogs and unexpected asset inventory',()=>{
  withBuild(x=>{
    put(x.dist,'catalog.json','{"manuscript":"unpublished"}');
    assert.throws(x.run,/unexpected root/);
  });
  withBuild(x=>{
    put(x.dist,'assets/reading_01.md','Private');
    assert.throws(x.run,/extra, missing/);
  });
});
test('rejects an altered source without a corresponding reviewed source pin',()=>{
  withBuild(x=>{
    put(x.experience,'src/episode.ts','// altered source content');
    assert.throws(x.run,/reviewed public source pin mismatch/);
  });
});
test('rejects a modified worker or an artifact tampered after its cache was produced',()=>{
  withBuild(x=>{
    put(x.dist,'sw.js',readFileSync(join(x.dist,'sw.js'),'utf8')+'\nfetch("https://example.com");');
    assert.throws(x.run,/service worker differs/);
  });
  withBuild(x=>{
    put(x.dist,'assets/index-AAA123.js','console.log("changed after cache")');
    assert.throws(x.run,/service worker differs/);
  });
});
test('rejects weakening CSP, remote links, or missing referrer policy',()=>{
  withBuild(x=>{
    const html=readFileSync(join(x.dist,'index.html'),'utf8');
    put(x.dist,'index.html',html.replace("connect-src 'none'","connect-src *"));
    assert.throws(x.run,/reader CSP missing/);
  });
  withBuild(x=>{
    const guide=readFileSync(join(x.dist,'facilitator.html'),'utf8');
    put(x.dist,'facilitator.html',guide+'<script src="https://bad.example/script.js"></script>');
    assert.throws(x.run,/remote active asset|executable scripts/);
  });
});
