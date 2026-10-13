/**
 * Audit the actual HTTP response contract of a *future* approved static host.
 * This script never publishes a website and never handles private literature.
 * It compares fetched public bytes to an existing technical release manifest.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,pathToFileURL} from 'node:url';

export const REQUIRED_DIRECTIVES={
  "default-src":"'none'",
  "script-src":"'self'",
  "style-src":"'self'",
  "font-src":"'self'",
  "img-src":"'self'",
  "connect-src":"'none'",
  "worker-src":"'self'",
  "base-uri":"'none'",
  "object-src":"'none'",
  "form-action":"'none'",
  "frame-ancestors":"'none'"
};
export const REQUIRED_POLICIES={
  'referrer-policy':'no-referrer',
  'x-content-type-options':'nosniff',
  'x-frame-options':'DENY',
  'cross-origin-opener-policy':'same-origin',
  'cross-origin-resource-policy':'same-origin'
};
const DISABLED_PERMISSIONS=['camera','microphone','geolocation','payment'];

function fail(message){throw new Error('POELIO hosted-response audit rejected: '+message)}
function sha256(bytes){return createHash('sha256').update(bytes).digest('hex')}
function policyMap(value){
  const map=new Map();
  for(const segment of value.split(';')){
    const tokens=segment.trim().split(/\s+/).filter(Boolean);
    if(!tokens.length)continue;
    const [name,...values]=tokens;
    if(map.has(name))fail('duplicate CSP directive '+name);
    map.set(name,values.join(' '));
  }
  return map;
}
function checkResponseHeaders(headers,url,isHtmlOrWorker,isHttps){
  for(const [key,value] of Object.entries(REQUIRED_POLICIES)){
    if(headers.get(key)?.trim()!==value)fail('missing or weak '+key+' at '+url);
  }
  const directives=policyMap(headers.get('content-security-policy')??'');
  for(const [key,value] of Object.entries(REQUIRED_DIRECTIVES)){
    if(directives.get(key)!==value)fail('missing or weak CSP '+key+' at '+url);
  }
  const permissions=(headers.get('permissions-policy')??'').toLowerCase();
  const entries=new Map(permissions.split(',').map(s=>s.trim()).filter(Boolean).map(s=>{
    const match=/^([a-z-]+)=\(\)$/.exec(s);
    return match?[match[1],'()']:[s,'INVALID'];
  }));
  for(const name of DISABLED_PERMISSIONS){
    if(entries.get(name)!=='()')fail('missing denied permission '+name+' at '+url);
  }
  if(isHttps){
    const hsts=headers.get('strict-transport-security')??'';
    const match=/(?:^|;)\s*max-age\s*=\s*(\d+)/i.exec(hsts);
    if(!match||Number(match[1])<31536000)fail('HSTS too weak at '+url);
  }
  if(isHtmlOrWorker){
    const control=headers.get('cache-control')??'';
    if(!/\b(no-cache|no-store)\b/i.test(control))
      fail('HTML or worker revalidation policy missing at '+url);
  }
}
function mime(path,value){
  const mimeType=(value??'').split(';')[0].trim().toLowerCase();
  if(path.endsWith('.html')||path==='index.html'){
    if(mimeType!=='text/html')fail('invalid HTML Content-Type for '+path);
  }else if(path.endsWith('.css')){
    if(mimeType!=='text/css')fail('invalid CSS Content-Type for '+path);
  }else if(path.endsWith('.js')){
    if(!['text/javascript','application/javascript'].includes(mimeType))
      fail('invalid JS Content-Type for '+path);
  }else fail('unknown public content type '+path);
}
export async function auditHostedRelease({baseUrl,release,fetchImpl=fetch}){
  if(!baseUrl||typeof baseUrl!=='string')fail('missing base URL');
  const base=new URL(baseUrl);
  const localhost=['localhost','127.0.0.1','[::1]'].includes(base.hostname);
  if(base.search||base.hash||base.username||base.password)fail('URL must be a clean origin/path');
  if(base.protocol!=='https:'&&!(localhost&&base.protocol==='http:'))
    fail('Hosted release must be HTTPS (localhost excepted for tests)');
  if(!release||release.technicalStatus!=='PASS'||release.publicationStatus!=='TECHNICAL_ONLY_NO_PUBLICATION_CLEARANCE')
    fail('missing audited technical-only release manifest');
  if(!['/','/POELIO/'].includes(release.base)||!base.pathname.endsWith('/'))
    fail('unsupported base');
  if(base.pathname!==release.base)fail('URL base mismatches release manifest');
  const files=release.artifacts;
  if(!Array.isArray(files)||files.length!==5)fail('release must enumerate five public files');
  const paths=files.map(f=>f.path);
  if(new Set(paths).size!==5 ||
    !paths.includes('index.html')||!paths.includes('facilitator.html')||
    !paths.includes('sw.js')||paths.filter(x=>x.endsWith('.js')&&x!=='sw.js').length!==1||
    paths.filter(x=>x.endsWith('.css')).length!==1)
    fail('invalid artifact inventory');
  const report=[];
  for(const file of files){
    if(typeof file.path!=='string'||!(/^(index\.html|facilitator\.html|sw\.js|assets\/index-[\w-]+\.(?:js|css))$/).test(file.path)
      ||!Number.isSafeInteger(file.size)||file.size<0||!/^[a-f0-9]{64}$/.test(file.sha256))
      fail('untrusted file manifest');
    const target=new URL(file.path,base);
    if(target.origin!==base.origin)fail('cross-origin release asset');
    // A strict host auditor rejects redirects and failures: none of the bytes may be substituted.
    const response=await fetchImpl(target,{method:'GET',redirect:'manual',cache:'no-store'});
    if(response.status!==200||response.redirected)
      fail('non-200 or redirected asset '+file.path);
    const isHtmlOrWorker=file.path==='index.html'||file.path==='facilitator.html'||file.path==='sw.js';
    checkResponseHeaders(response.headers,target.href,isHtmlOrWorker,base.protocol==='https:');
    mime(file.path==='index.html'?'index.html':file.path,response.headers.get('content-type'));
    const raw=Buffer.from(await response.arrayBuffer());
    if(raw.length!==file.size||sha256(raw)!==file.sha256)
      fail('deployed bytes differ from audited build: '+file.path);
    report.push({path:file.path,size:raw.length,sha256:file.sha256});
  }
  return {status:'HOST_RESPONSES_MATCH_APPROVED_PUBLIC_BYTES',base:base.href,
    publicationAuthorized:false,validated:report};
}
async function main(){
  const [url,manifestPath]=process.argv.slice(2);
  if(!url||!manifestPath)fail('Usage: node scripts/audit_host_headers.mjs https://host/path/ release-audit/root.json');
  const release=JSON.parse(readFileSync(resolve(manifestPath),'utf8'));
  const result=await auditHostedRelease({baseUrl:url,release});
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  main().catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1});
}
