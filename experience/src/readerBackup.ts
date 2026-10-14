/**
 * A strict, versioned *reader-owned* backup format. Input never grants
 * publication rights, registers a work, executes code or touches the network.
 * Approved literary prose is deliberately omitted from portable backups.
 */
import registerPin from '../approved-demo.blobsha?raw';
import permutationPin from '../approved-permutation.blobsha?raw';
import {PUBLIC_CATALOG_VERSION,publicWorks} from './contentCatalog.js';
import {isFragmentOrder,type FragmentOrder} from './permutation.js';
import type {Person,Schedule} from '../../src/model.js';
import type {DraftField,WorkScope} from './useSessionDraft.js';

export const BACKUP_VERSION=1 as const;
export const MAX_BACKUP_BYTES=512*1024;
export const BACKUP_FORMAT='poelio-reader-backup' as const;
export type ReaderDrafts=Readonly<Record<DraftField,string>>;
export type BackupConfiguration=
  |{readonly kind:'register';readonly values:Schedule}
  |{readonly kind:'permutation';readonly order:FragmentOrder;readonly limited:boolean};
export interface ReaderBackupV1{
  readonly format:typeof BACKUP_FORMAT;
  readonly version:typeof BACKUP_VERSION;
  readonly catalogVersion:typeof PUBLIC_CATALOG_VERSION;
  readonly work:WorkScope;
  readonly sourceRevision:string;
  readonly drafts:ReaderDrafts;
  readonly configuration:BackupConfiguration;
}

const FIELDS=['initial','revised','rule','writing'] as const;
const FIELD_LIMITS:Readonly<Record<DraftField,number>>={
  initial:100000,revised:100000,rule:400,writing:150000
};
function exactObject(value:unknown,keys:readonly string[],at:string):Record<string,unknown>{
  if(!value||typeof value!=='object'||Array.isArray(value)||
    Object.getPrototypeOf(value)!==Object.prototype)
    throw new Error('Invalid '+at);
  const obj=value as Record<string,unknown>;
  if(Object.keys(obj).sort().join('|')!==[...keys].sort().join('|'))
    throw new Error('Unexpected or missing fields in '+at);
  return obj;
}
function validateDrafts(value:unknown):ReaderDrafts{
  const draft=exactObject(value,FIELDS,'draft fields');
  for(const field of FIELDS){
    const text=draft[field];
    if(typeof text!=='string'||text.length>FIELD_LIMITS[field])
      throw new Error('Invalid or oversized '+field+' response');
  }
  return {initial:draft.initial as string,revised:draft.revised as string,
    rule:draft.rule as string,writing:draft.writing as string};
}
function validateConfig(work:WorkScope,value:unknown):BackupConfiguration{
  if(work==='register'){
    const object=exactObject(value,['kind','values'],'schedule configuration');
    const values=object.values;
    if(object.kind!=='register'||!Array.isArray(values)||values.length!==8||
      !values.every(v=>v==='A'||v==='B'))
      throw new Error('Invalid eight-day configuration');
    return {kind:'register',values:values as unknown as Schedule};
  }
  const object=exactObject(value,['kind','order','limited'],'fragment configuration');
  if(object.kind!=='permutation'||!Array.isArray(object.order)||
    !isFragmentOrder(object.order)||typeof object.limited!=='boolean')
    throw new Error('Invalid four-fragment configuration');
  return {kind:'permutation',order:object.order,limited:object.limited};
}
/** Pin identities are verified by the existing approved-fixture build gate. */
export function sourceRevision(work:WorkScope):string{
  const pin=(work==='register'?registerPin:permutationPin).trim();
  if(!/^[0-9a-f]{40}$/.test(pin))throw new Error('Invalid public source pin');
  return publicWorks[work].release.sourceIdentity+'#'+pin;
}
function validate(input:unknown,expectedWork:WorkScope):ReaderBackupV1{
  const o=exactObject(input,[
    'format','version','catalogVersion','work','sourceRevision','drafts','configuration'
  ],'reader backup');
  if(o.format!==BACKUP_FORMAT||o.version!==BACKUP_VERSION)
    throw new Error('Unsupported backup format or version');
  if(o.work!==expectedWork)
    throw new Error('Backup belongs to another literary work');
  if(o.catalogVersion!==PUBLIC_CATALOG_VERSION||
     o.sourceRevision!==sourceRevision(expectedWork))
    throw new Error('Backup source revision differs from this public edition');
  const drafts=validateDrafts(o.drafts);
  const configuration=validateConfig(expectedWork,o.configuration);
  return {
    format:BACKUP_FORMAT,version:BACKUP_VERSION,
    catalogVersion:PUBLIC_CATALOG_VERSION,work:expectedWork,
    sourceRevision:sourceRevision(expectedWork),drafts,configuration
  };
}
export function createReaderBackup(
  work:WorkScope,drafts:ReaderDrafts,configuration:BackupConfiguration
):ReaderBackupV1{
  return validate({
    format:BACKUP_FORMAT,version:BACKUP_VERSION,
    catalogVersion:PUBLIC_CATALOG_VERSION,work,
    sourceRevision:sourceRevision(work),drafts,configuration
  },work);
}
/** Refuse oversized exports before triggering any download. */
export function serializeReaderBackup(backup:ReaderBackupV1):string{
  const safe=validate(backup,backup.work);
  const text=JSON.stringify(safe,null,2)+'\n';
  if(new TextEncoder().encode(text).byteLength>MAX_BACKUP_BYTES)
    throw new Error('Backup exceeds the maximum permitted file size');
  return text;
}
/** Strict parsing: unknown properties, changed sources and other work IDs fail closed. */
export function parseReaderBackup(content:string,expectedWork:WorkScope):ReaderBackupV1{
  if(typeof content!=='string'||new TextEncoder().encode(content).byteLength>MAX_BACKUP_BYTES)
    throw new Error('Backup exceeds the maximum permitted file size');
  let value:unknown;
  try{value=JSON.parse(content);}catch{throw new Error('Malformed JSON backup');}
  return validate(value,expectedWork);
}
/** Merge only blank answers. Never change configuration or overwrite writing. */
export function mergeReaderDrafts(current:ReaderDrafts,incoming:ReaderDrafts):ReaderDrafts{
  return validateDrafts({
    initial:current.initial!==''?current.initial:incoming.initial,
    revised:current.revised!==''?current.revised:incoming.revised,
    rule:current.rule!==''?current.rule:incoming.rule,
    writing:current.writing!==''?current.writing:incoming.writing
  });
}
