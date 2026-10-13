import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {auditHostedRelease,REQUIRED_DIRECTIVES,REQUIRED_POLICIES} from './audit_host_headers.mjs';

const files={
  'index.html':'<!doctype html><title>Approved public fixture</title>',
  'facilitator.html':'<!doctype html><title>Approved facilitator</title>',
  'sw.js':'self.addEventListener("fetch",()=>{});',
  'assets/index-DEMO123.js':'console.log("approved public test");',
  'assets/index-DEMO123.css':'body { color: black; }'
};
const sha=s=>createHash('sha256').update(s).digest('hex');
function release(base='/'){
  return {
    technicalStatus:'PASS',publicationStatus:'TECHNICAL_ONLY_NO_PUBLICATION_CLEARANCE',base,
    artifacts:Object.entries(files).map(([path,content])=>({
      path,size:Buffer.byteLength(content),sha256:sha(content)
    }))
  };
}
function policy(){
  return Object.entries(REQUIRED_DIRECTIVES).map(([key,val])=>key+' '+val).join('; ');
}
function responseHeaders(path,https=true){
  const h=new Headers();
  for(const [key,val]of Object.entries(REQUIRED_POLICIES))h.set(key,val);
  h.set('content-security-policy',policy());
  h.set('permissions-policy','camera=(), microphone=(), geolocation=(), payment=()');
  h.set('cache-control','no-cache, must-revalidate');
  if(https)h.set('strict-transport-security','max-age=31536000; includeSubDomains');
  if(path.endsWith('.html'))h.set('content-type','text/html; charset=utf-8');
  else if(path.endsWith('.css'))h.set('content-type','text/css');
  else h.set('content-type','text/javascript');
  return h;
}
function mockFetch({base='https://example.org/POELIO/',mutate=(path,body,h)=>({body,h}),status=200}={}){
  const requests=[];
  const fn=async(url,options)=>{
    requests.push({url:url.href,options});
    const path=url.pathname.slice(new URL(base).pathname.length);
    if(!(path in files))throw Error('unknown synthetic path: '+path);
    const original=files[path];
    const {body,h}=mutate(path,original,responseHeaders(path,url.protocol==='https:'));
    return new Response(body,{status,headers:h});
  };
  return {fn,requests};
}
test('checks all five approved bytes and hardened HTTPS headers under subpath',async()=>{
  const mock=mockFetch();
  const result=await auditHostedRelease({
    baseUrl:'https://example.org/POELIO/',release:release('/POELIO/'),fetchImpl:mock.fn
  });
  assert.equal(result.status,'HOST_RESPONSES_MATCH_APPROVED_PUBLIC_BYTES');
  assert.equal(result.publicationAuthorized,false);
  assert.equal(result.validated.length,5);
  assert.equal(mock.requests.length,5);
  assert.ok(mock.requests.every(x=>x.options.cache==='no-store'&&x.options.redirect==='manual'));
});
test('accepts localhost HTTP only for non-production tests',async()=>{
  const mock=mockFetch({base:'http://127.0.0.1:4177/'});
  const result=await auditHostedRelease({
    baseUrl:'http://127.0.0.1:4177/',release:release('/'),fetchImpl:mock.fn
  });
  assert.equal(result.validated.length,5);
  await assert.rejects(auditHostedRelease({
    baseUrl:'http://example.org/POELIO/',release:release('/POELIO/'),fetchImpl:mock.fn
  }),/HTTPS/);
});
test('rejects host base drift even if files appear to load',async()=>{
  const mock=mockFetch();
  await assert.rejects(auditHostedRelease({
    baseUrl:'https://example.org/',release:release('/POELIO/'),fetchImpl:mock.fn
  }),/base mismatches/);
});
test('rejects tampered deployed bytes',async()=>{
  const mock=mockFetch({mutate:(path,body,h)=>({h,body:path==='index.html'?body+' altered':body})});
  await assert.rejects(auditHostedRelease({
    baseUrl:'https://example.org/POELIO/',release:release('/POELIO/'),fetchImpl:mock.fn
  }),/deployed bytes differ/);
});
test('rejects missing enforced CSP header and weaker policy',async()=>{
  for(const altered of [
    h=>h.delete('content-security-policy'),
    h=>h.set('content-security-policy',policy().replace("script-src 'self'","script-src 'self' 'unsafe-inline'")),
    h=>h.set('content-security-policy',policy().replace("frame-ancestors 'none'","frame-ancestors *"))
  ]){
    const mock=mockFetch({mutate:(_,body,h)=>{altered(h);return {body,h}}});
    await assert.rejects(auditHostedRelease({
      baseUrl:'https://example.org/POELIO/',release:release('/POELIO/'),fetchImpl:mock.fn
    }),/CSP/);
  }
});
test('rejects missing browser isolation, HSTS, permissions and MIME protections',async()=>{
  const cases=[
    [h=>h.delete('cross-origin-opener-policy'),/cross-origin-opener-policy/],
    [h=>h.set('x-content-type-options',''),/x-content-type-options/],
    [h=>h.set('strict-transport-security','max-age=60'),/HSTS/],
    [h=>h.set('permissions-policy','camera=*'),/permission/],
    [h=>h.set('content-type','application/octet-stream'),/Content-Type/]
  ];
  for(const [change,expected]of cases){
    const mock=mockFetch({mutate:(_,body,h)=>{change(h);return {body,h}}});
    await assert.rejects(auditHostedRelease({
      baseUrl:'https://example.org/POELIO/',release:release('/POELIO/'),fetchImpl:mock.fn
    }),expected);
  }
});
test('rejects redirects, unapproved inventory and false publication evidence',async()=>{
  const mock=mockFetch({status:302});
  await assert.rejects(auditHostedRelease({
    baseUrl:'https://example.org/POELIO/',release:release('/POELIO/'),fetchImpl:mock.fn
  }),/non-200/);
  const bad=release('/POELIO/');bad.artifacts.push({...bad.artifacts[0],path:'catalog.json'});
  await assert.rejects(auditHostedRelease({
    baseUrl:'https://example.org/POELIO/',release:bad,fetchImpl:mock.fn
  }),/five public files/);
  const falseApproval=release('/POELIO/');falseApproval.publicationStatus='PUBLICATION_APPROVED';
  await assert.rejects(auditHostedRelease({
    baseUrl:'https://example.org/POELIO/',release:falseApproval,fetchImpl:mock.fn
  }),/technical-only/);
});
