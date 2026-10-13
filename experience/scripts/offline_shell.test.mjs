import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inspectBuild,renderOfflineShell} from './create_offline_shell.mjs';

function fixture(){
  const root=mkdtempSync(join(tmpdir(),'poelio-public-test-'));
  mkdirSync(join(root,'assets'));
  for(const [name,content] of [
    ['index.html','<html>Public reader only</html>'],
    ['facilitator.html','<html>Facilitator</html>'],
    ['assets/index-DEMO123.js','console.log("public");'],
    ['assets/index-DEMO123.css','body {margin:0}']
  ])writeFileSync(join(root,name),content);
  return root;
}

test('only the approved public shell is accepted',()=>{
  const dir=fixture();
  try{
    assert.equal(inspectBuild(dir).length,4);
    const result=renderOfflineShell(dir);
    assert.match(result.cache,/^poelio-approved-public-v1-[0-9a-f]{24}$/);
    assert.match(result.worker,/caches\.open\(CACHE\)/);
    assert.match(result.worker,/request\.mode === 'navigate'/);
    assert.match(result.worker,/cache\.match\(isGuide \? GUIDE : INDEX\)/);
    assert.match(result.worker,/return approved \|\| fetch\(request\)/);
    assert.doesNotMatch(result.worker,/fetch\(request\)\.catch/);
    assert.equal(result.inventory.filter(x=>x.endsWith('.js')).length,1);
  }finally{rmSync(dir,{recursive:true,force:true})}
});

test('unexpected private file or extra asset fails closed',()=>{
  const a=fixture();
  try{
    writeFileSync(join(a,'catalog.json'),'{"private":true}');
    assert.throws(()=>inspectBuild(a),/Unexpected root/);
  }finally{rmSync(a,{recursive:true,force:true})}
  const b=fixture();
  try{
    writeFileSync(join(b,'assets','secret-manuscript.md'),'unreleased');
    assert.throws(()=>inspectBuild(b),/Unexpected public asset/);
  }finally{rmSync(b,{recursive:true,force:true})}
});

test('new approved content changes the offline cache version',()=>{
  const dir=fixture();
  try{
    const a=renderOfflineShell(dir).cache;
    writeFileSync(join(dir,'assets','index-DEMO123.js'),'console.log("changed");');
    const b=renderOfflineShell(dir).cache;
    assert.notEqual(a,b);
  }finally{rmSync(dir,{recursive:true,force:true})}
});
