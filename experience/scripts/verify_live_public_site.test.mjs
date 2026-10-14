import {createHash} from 'node:crypto';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateSiteManifest,verifyLiveFiles} from './verify_live_public_site.mjs';
const base='https://fraware.github.io/POELIO/';
const paths=['index.html','facilitator.html','source-sans-3.woff2',
  'source-sans-3-italic.woff2','source-sans-license.txt','sw.js',
  'assets/index-abC3.js','assets/index-rB8T.css'];
const records=Object.fromEntries(paths.map(p=>[p,Buffer.from('PUBLIC FIXTURE '+p)]));
const entries=paths.map(path=>({path,size:records[path].length,
  sha256:createHash('sha256').update(records[path]).digest('hex')}));
const manifest={schemaVersion:1,variant:'subpath',base:'/POELIO/',
  technicalStatus:'PASS',publicationStatus:'TECHNICAL_ONLY_NO_PUBLICATION_CLEARANCE',
  artifacts:entries};
function serve(url){
  const file=decodeURI(new URL(url).pathname).replace('/POELIO/','');
  const bytes=records[file];
  return Promise.resolve(new Response(bytes??'not found',{
    status:bytes?200:404,headers:{'content-type':'application/octet-stream'}
  }));
}
test('exact public bytes pass, never inspecting a reader response',async()=>{
  const files=await verifyLiveFiles({manifest,base,fetcher:async url=>{
    const r=await serve(url);
    return {...r,url,ok:r.ok,status:r.status,
      arrayBuffer:()=>r.arrayBuffer()};
  }});
  assert.equal(files.length,8);
});
test('tampered bytes and missing assets fail closed',async()=>{
  await assert.rejects(verifyLiveFiles({manifest,base,fetcher:async url=>{
    const r=await serve(url);
    return {ok:r.ok,status:r.status,url,
      arrayBuffer:async()=>{
        const b=Buffer.from(await r.arrayBuffer());
        return url.includes('index-abC3.js')?Buffer.from('TAMPERED'):b;
      }};
  }}),/Published byte mismatch/);
  await assert.rejects(verifyLiveFiles({manifest,base,fetcher:async url=>({
    ok:false,status:404,url,arrayBuffer:async()=>new ArrayBuffer(0)
  })}),/Unserved public asset/);
});
test('unexpected paths, scope, metadata and digest are rejected',async()=>{
  assert.throws(()=>validateSiteManifest({...manifest,base:'/private/'}),/exact validated/);
  assert.throws(()=>validateSiteManifest({...manifest,artifacts:entries.slice(0,7)}),/exact validated/);
  assert.throws(()=>validateSiteManifest({...manifest,artifacts:entries.map((x,i)=>
    i===0?{...x,path:'private.txt'}:x)}),/inventory/);
  assert.throws(()=>validateSiteManifest({...manifest,artifacts:entries.map((x,i)=>
    i===0?{...x,sha256:'invalid'}:x)}),/size or SHA/);
  await assert.rejects(verifyLiveFiles({manifest,base:'https://attacker.invalid/POELIO/'}),
    /Unexpected public site URL/);
  await assert.rejects(verifyLiveFiles({manifest,base:'http://fraware.github.io/POELIO/'}),
    /Unexpected public site URL/);
});
