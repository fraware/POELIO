/**
 * Verify that GitHub Pages really serves the eight exact public build files.
 *
 * Called only after a successful, SHA-guarded Pages deployment. The manifest
 * originates from the audited build job; it is never read from the site.
 * No reader writing, private source or telemetry belongs to this check.
 */
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {pathToFileURL} from 'node:url';

const FIXED_FILES=[
  'facilitator.html','index.html','source-sans-3-italic.woff2',
  'source-sans-3.woff2','source-sans-license.txt','sw.js'
];
const PUBLIC_ASSET=/^assets\/index-[A-Za-z0-9_-]+\.(?:js|css)$/;

export function validateSiteManifest(manifest){
  if(!manifest||manifest.schemaVersion!==1||manifest.variant!=='subpath'||
    manifest.base!=='/POELIO/'||manifest.technicalStatus!=='PASS'||
    manifest.publicationStatus!=='TECHNICAL_ONLY_NO_PUBLICATION_CLEARANCE'||
    !Array.isArray(manifest.artifacts)||manifest.artifacts.length!==8)
    throw new Error('Live audit requires the exact validated public subpath manifest');
  const paths=manifest.artifacts.map(a=>a?.path).sort();
  const expectedFixed=FIXED_FILES.slice().sort();
  const fixed=paths.filter(p=>!String(p).startsWith('assets/')).sort();
  const assets=paths.filter(p=>String(p).startsWith('assets/'));
  if(JSON.stringify(fixed)!==JSON.stringify(expectedFixed)||
    assets.length!==2||!assets.every(p=>PUBLIC_ASSET.test(p))||
    assets.filter(p=>p.endsWith('.js')).length!==1||
    assets.filter(p=>p.endsWith('.css')).length!==1)
    throw new Error('Unexpected public site file inventory');
  for(const a of manifest.artifacts){
    if(!Number.isSafeInteger(a.size)||a.size<1||!/^[0-9a-f]{64}$/.test(a.sha256))
      throw new Error('Invalid public file size or SHA-256');
  }
  return manifest.artifacts;
}

export async function verifyLiveFiles({manifest,base,fetcher=fetch}){
  const entries=validateSiteManifest(manifest);
  const url=new URL(base);
  if(url.protocol!=='https:'||url.hostname!=='fraware.github.io'||
    url.pathname!=='/POELIO/'||url.search||url.hash)
    throw new Error('Unexpected public site URL or deployment scope');
  const results=await Promise.all(entries.map(async entry=>{
    const target=new URL(entry.path,url);
    // No redirects or cross-site requests, even on a compromised response.
    const response=await fetcher(target.href,{
      redirect:'error',headers:{'Cache-Control':'no-cache'},
      signal:AbortSignal.timeout(15000)
    });
    if(!response.ok||response.url!==target.href)
      throw new Error('Unserved public asset: '+entry.path+' HTTP '+response.status);
    const body=Buffer.from(await response.arrayBuffer());
    const sha256=createHash('sha256').update(body).digest('hex');
    if(body.length!==entry.size||sha256!==entry.sha256)
      throw new Error('Published byte mismatch: '+entry.path);
    return {path:entry.path,size:body.length,sha256};
  }));
  return results;
}

async function main(){
  const encoded=process.env.POELIO_PUBLIC_MANIFEST_B64;
  const base=process.env.POELIO_PUBLIC_SITE_URL;
  if(!encoded||!base)throw new Error('Missing audited manifest or Pages URL');
  const manifest=JSON.parse(Buffer.from(encoded,'base64').toString('utf8'));
  let last;
  // CDN propagation is eventually consistent; no unbounded polling or hidden override.
  for(let attempt=1;attempt<=12;attempt++){
    try{
      const published=await verifyLiveFiles({manifest,base});
      console.log('Live published site byte-verified:',published.length,
        'approved files; technical check only, no editorial/WCAG approval');
      return;
    }catch(error){
      last=error;
      console.error('Live audit attempt '+attempt+'/12:',String(error));
      if(attempt<12)await sleep(5000);
    }
  }
  throw last;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{console.error(error);process.exitCode=1;});
}
