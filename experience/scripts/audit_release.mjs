/**
 * Deterministic release-evidence audit of a PUBLIC, built POELIO experience.
 *
 * No manuscript is read from anywhere other than the two pinned original
 * public teaching source files. A valid result is a technical build record,
 * NEVER permission or independent editorial acceptance for publication.
 */
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,mkdtempSync,mkdirSync,cpSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {renderOfflineShell} from './create_offline_shell.mjs';

const DEFAULT_EXPERIENCE=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SOURCES=[
  ['src/episode.ts','approved-demo.blobsha'],
  ['src/permutation.ts','approved-permutation.blobsha']
];
const ASSET=/^assets\/index-[A-Za-z0-9_-]+\.(?:js|css)$/;
export const PUBLICATION_STATUS='TECHNICAL_ONLY_NO_PUBLICATION_CLEARANCE';

function fail(message){throw new Error('POELIO release audit rejected: '+message)}
function digest(bytes,algorithm='sha256'){return createHash(algorithm).update(bytes).digest('hex')}
function bytes(path){return readFileSync(path)}
function names(path){return readdirSync(path,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))}
function gitBlob(data){
  return createHash('sha1')
    .update(Buffer.from('blob '+data.byteLength+'\0'))
    .update(data).digest('hex');
}
function inspectFive(dist){
  const root=names(dist);
  if(root.map(x=>x.name).join('|')!=='assets|facilitator.html|index.html|source-sans-3-italic.woff2|source-sans-3.woff2|source-sans-license.txt|sw.js' ||
    root.some(x=>x.name==='assets'?!x.isDirectory():!x.isFile()))
    fail('unexpected root distribution entries');
  const assets=names(join(dist,'assets'));
  if(assets.length!==2 || assets.some(x=>!x.isFile()||!ASSET.test('assets/'+x.name)) ||
    assets.filter(x=>x.name.endsWith('.js')).length!==1 ||
    assets.filter(x=>x.name.endsWith('.css')).length!==1)
    fail('extra, missing or non-regular public assets');
  return ['index.html','facilitator.html','source-sans-3-italic.woff2','source-sans-3.woff2','source-sans-license.txt',...assets.map(x=>'assets/'+x.name),'sw.js'];
}
function verifyDocument(dist,files,base){
  const html=bytes(join(dist,'index.html')).toString('utf8');
  const guide=bytes(join(dist,'facilitator.html')).toString('utf8');
  for(const policy of [
    "default-src 'none'","script-src 'self'","style-src 'self'",
    "connect-src 'none'","worker-src 'self'","object-src 'none'","form-action 'none'"
  ]) if(!html.includes(policy))fail('reader CSP missing '+policy);
  if(!html.includes('<meta name="referrer" content="no-referrer">'))
    fail('reader referrer policy missing');
  if(!guide.includes("default-src 'none'") || !guide.includes('no-referrer') || !guide.includes("font-src 'self'"))
    fail('facilitator CSP or referrer policy missing');
  const js=files.find(x=>x.endsWith('.js'));
  const css=files.find(x=>x.endsWith('.css'));
  if(!html.includes('src="'+base+js+'"') || !html.includes('href="'+base+css+'"'))
    fail('HTML references do not match approved base or hashed assets');
  const stylesheet=bytes(join(dist,css)).toString('utf8');
  if(!stylesheet.includes(base+'source-sans-3.woff2') || !stylesheet.includes(base+'source-sans-3-italic.woff2'))
    fail('Source Sans 3 variable fonts must load from the approved local base');
  const notice=bytes(join(dist,'source-sans-license.txt')).toString('utf8');
  if(!notice.includes('SIL OPEN FONT LICENSE Version 1.1') || !notice.includes('Copyright 2010-2024 Adobe'))
    fail('licensed font notice missing');
  for(const file of ['source-sans-3.woff2','source-sans-3-italic.woff2']) {
    if(bytes(join(dist,file)).subarray(0,4).toString('latin1')!=='wOF2')
      fail('invalid self-hosted font asset');
  }
  if(/(?:src|href)=["']https?:\/\//i.test(html) ||
     /(?:src|href)=["']https?:\/\//i.test(guide))
    fail('remote active asset or hyperlink detected in offline documents');
  if(/<script\b/i.test(guide))fail('facilitator must have no executable scripts');
}
function checkSources(experience){
  return SOURCES.map(([source,pin])=>{
    const data=bytes(join(experience,source));
    const expected=bytes(join(experience,pin)).toString('utf8').trim();
    if(!/^[0-9a-f]{40}$/.test(expected)||gitBlob(data)!==expected)
      fail('reviewed public source pin mismatch: '+source);
    return {source,pin,gitBlobSha1:expected,sha256:digest(data)};
  });
}
function verifyWorker(dist){
  const tmp=mkdtempSync(join(tmpdir(),'poelio-public-evidence-'));
  try{
    mkdirSync(join(tmp,'assets'));
    for(const file of ['index.html','facilitator.html','source-sans-3.woff2','source-sans-3-italic.woff2','source-sans-license.txt']){
      cpSync(join(dist,file),join(tmp,file),{dereference:false});
    }
    for(const entry of names(join(dist,'assets'))){
      cpSync(join(dist,'assets',entry.name),join(tmp,'assets',entry.name),{dereference:false});
    }
    const expected=renderOfflineShell(tmp);
    if(bytes(join(dist,'sw.js')).toString('utf8')!==expected.worker)
      fail('service worker differs from the exact approved public shell');
    return expected.cache;
  }finally{rmSync(tmp,{recursive:true,force:true})}
}

/**
 * Generate a fully deterministic, public-only manifest. The manifest itself
 * is intentionally written OUTSIDE dist/; a build must not silently publish it.
 */
export function auditPublicRelease({experience=DEFAULT_EXPERIENCE,
  dist=join(experience,'dist'),variant='root',root=resolve(experience,'..')}={}){
  if(!['root','subpath'].includes(variant))fail('invalid deployment variant');
  const base=variant==='root'?'/':'/POELIO/';
  const files=inspectFive(dist);
  verifyDocument(dist,files,base);
  const sourcePins=checkSources(experience);
  const cacheIdentity=verifyWorker(dist);
  const rootLock=bytes(join(root,'package-lock.json'));
  const experienceLock=bytes(join(experience,'package-lock.json'));
  const deps=[
    {path:'package-lock.json',sha256:digest(rootLock)},
    {path:'experience/package-lock.json',sha256:digest(experienceLock)}
  ];
  const artifacts=files.map(path=>{
    const content=bytes(join(dist,path));
    return {path,size:content.byteLength,sha256:digest(content)};
  });
  return {
    schemaVersion:1,
    project:'POELIO',
    variant,base,
    publicWorks:['register','permutation'],
    technicalStatus:'PASS',
    publicationStatus:PUBLICATION_STATUS,
    authority:'source-and-build-identity-only',
    sourcePins,dependencyLocks:deps,cacheIdentity,artifacts
  };
}

function cli(){
  const variant=process.argv[2];
  if(variant!=='root'&&variant!=='subpath')fail('Usage: node scripts/audit_release.mjs root|subpath');
  const report=auditPublicRelease({variant});
  const folder=join(DEFAULT_EXPERIENCE,'release-audit');
  mkdirSync(folder,{recursive:true});
  const destination=join(folder,variant+'.json');
  // Prevent stale or surreptitiously overwritten reports in the same job.
  writeFileSync(destination,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log('Audited',report.variant,'public build:',report.artifacts.length,
    'approved files; publication authorization NOT established');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)cli();
