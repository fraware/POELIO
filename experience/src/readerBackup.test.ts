import {describe,expect,it} from 'vitest';
import {
  createReaderBackup,serializeReaderBackup,parseReaderBackup,
  mergeReaderDrafts,sourceRevision,MAX_BACKUP_BYTES,
  type ReaderBackupV1,type ReaderDrafts
} from './readerBackup.js';
import {publicWorks} from './contentCatalog.js';

const drafts:ReaderDrafts={
  initial:'D’abord\nun détail.\nΩ 😀',revised:'Deuxième regard',rule:'Une règle',
  writing:'Ligne 1\n\nLigne 3\n'
};
function reg():ReaderBackupV1{
  return createReaderBackup('register',drafts,{
    kind:'register',values:publicWorks.register.repairs[0].schedule
  });
}
function perm():ReaderBackupV1{
  return createReaderBackup('permutation',drafts,{
    kind:'permutation',order:publicWorks.permutation.comparisonOrder,limited:true
  });
}
function corrupt(base:ReaderBackupV1,fn:(value:Record<string,any>)=>void):string{
  const json=JSON.parse(serializeReaderBackup(base));
  fn(json);
  return JSON.stringify(json);
}
describe('reader-owned backup format v1',()=>{
  it('round-trips four fields, Unicode, multiline writing and both model configurations',()=>{
    for(const original of [reg(),perm()]){
      const text=serializeReaderBackup(original);
      const copy=parseReaderBackup(text,original.work);
      expect(copy).toEqual(original);
      expect(copy.drafts).toEqual(drafts);
      expect(copy.sourceRevision).toBe(sourceRevision(original.work));
      expect(text).not.toContain('sourceModule');
      expect(text).not.toContain('passages');
      expect(text).not.toContain('realizations');
    }
  });
  it('prevents crossover between the two public works and mismatched source editions',()=>{
    expect(()=>parseReaderBackup(serializeReaderBackup(reg()),'permutation')).toThrow(/another literary work/);
    expect(()=>parseReaderBackup(serializeReaderBackup(perm()),'register')).toThrow(/another literary work/);
    expect(()=>parseReaderBackup(corrupt(reg(),j=>{j.sourceRevision+='tampered';}),'register'))
      .toThrow(/source revision/);
    expect(()=>parseReaderBackup(corrupt(perm(),j=>{j.catalogVersion=2;}),'permutation'))
      .toThrow(/source revision/);
  });
  it('rejects unknown fields, incomplete records, and unsupported schema versions',()=>{
    const mutations=[
      (j:Record<string,any>)=>{j.injected='text';},
      (j:Record<string,any>)=>{delete j.drafts;},
      (j:Record<string,any>)=>{j.version=2;},
      (j:Record<string,any>)=>{j.format='other-format';},
      (j:Record<string,any>)=>{j.drafts.bad='ignored';},
      (j:Record<string,any>)=>{delete j.drafts.rule;},
      (j:Record<string,any>)=>{j.drafts.initial=12;},
      (j:Record<string,any>)=>{j.drafts.writing={nested:'bad'};},
      (j:Record<string,any>)=>{j.configuration.kind='permutation';},
      (j:Record<string,any>)=>{j.configuration.values[0]='unknown';},
      (j:Record<string,any>)=>{j.configuration.values.pop();},
      (j:Record<string,any>)=>{j.configuration.extra=true;}
    ];
    for(const mutate of mutations)
      expect(()=>parseReaderBackup(corrupt(reg(),mutate),'register')).toThrow();
    for(const mutate of [
      (j:Record<string,any>)=>{j.configuration.order=['door','door','bell','question'];},
      (j:Record<string,any>)=>{j.configuration.order=['door','letter','question'];},
      (j:Record<string,any>)=>{j.configuration.limited='true';},
      (j:Record<string,any>)=>{j.configuration.script='alert(1)';}
    ])expect(()=>parseReaderBackup(corrupt(perm(),mutate),'permutation')).toThrow();
    expect(()=>parseReaderBackup('{malformed','register')).toThrow(/Malformed/);
    expect(()=>parseReaderBackup('null','register')).toThrow(/reader backup/);
    expect(()=>parseReaderBackup('[]','register')).toThrow(/reader backup/);
  });
  it('enforces byte-size and text limits with no silent truncation',()=>{
    expect(()=>parseReaderBackup('x'.repeat(MAX_BACKUP_BYTES+1),'register')).toThrow(/maximum/);
    expect(()=>parseReaderBackup(corrupt(reg(),j=>{j.drafts.rule='a'.repeat(401);}),
      'register')).toThrow(/oversized/);
    expect(()=>parseReaderBackup(corrupt(reg(),j=>{j.drafts.writing='a'.repeat(150001);}),
      'register')).toThrow(/oversized/);
    expect(()=>serializeReaderBackup(createReaderBackup('register',{
      ...drafts,initial:'😀'.repeat(50000),revised:'😀'.repeat(50000),writing:'😀'.repeat(75000)
    },{kind:'register',values:publicWorks.register.repairs[0].schedule}))).toThrow(/maximum/);
  });
  it('merge preserves all existing text and never changes either configuration',()=>{
    const incoming:ReaderDrafts={
      initial:'imported initial',revised:'imported revised',rule:'imported rule',writing:'imported writing'
    };
    const existing:ReaderDrafts={
      initial:'present first answer',revised:'',rule:'my rule',writing:''
    };
    const merged=mergeReaderDrafts(existing,incoming);
    expect(merged).toEqual({
      initial:'present first answer',revised:'imported revised',
      rule:'my rule',writing:'imported writing'
    });
    expect(existing.initial).toBe('present first answer');
    expect(incoming.writing).toBe('imported writing');
    expect(mergeReaderDrafts(drafts,incoming)).toEqual(drafts);
  });
});
