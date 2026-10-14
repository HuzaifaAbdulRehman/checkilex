import { createHash } from 'node:crypto';
export type CheckSpec = { id: string; sourceQuote: string } & (
 | {kind:'visible_text';params:{text:string}}
 | {kind:'link_destination';params:{label:string;hrefPrefix:string}}
 | {kind:'form_structure';params:{labels:string[];requiredLabels:string[]}}
 | {kind:'horizontal_overflow';params:Record<string,never>}
 | {kind:'unverified';params:{reason:string}});
export type DraftCheck = CheckSpec & {reviewNotes:string};
export type CheckResult = {checkId:string;status:'Verified'|'Failed'|'Unverified';measuredFacts:string[];limitations:string[];evidenceIds:string[]};
export type Capture = {id:string;width:number;height:number;dataUrl:string};
export type InspectionReport = {checks:CheckSpec[];results:CheckResult[];captures:Capture[];targetUrl:string;timestamp:string;versions:Record<string,string>;fingerprint:string;notices:string[]};
function object(value:unknown):Record<string,unknown> {
 if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Expected check object');
 return value as Record<string,unknown>;
}
function text(value:unknown,name:string,max=500):string {
 if (typeof value !== 'string' || !value.trim() || value.length>max) throw Error('Invalid '+name);
 return value;
}
function keys(value:Record<string,unknown>,allowed:string[]) {
 if(Object.keys(value).some(k=>!allowed.includes(k))) throw Error('Unexpected check field');
}
function strings(value:unknown):string[] {
 if(!Array.isArray(value)||value.length>12) throw Error('Invalid field labels');
 return value.map(v=>text(v,'field label',100));
}
export function validateBrief(brief:unknown):asserts brief is string {text(brief,'brief',4000);}
function parse(raw:unknown,draft:boolean):DraftCheck[] {
 if(!Array.isArray(raw)||raw.length>8) throw Error('Expected at most eight checks');
 const ids=new Set<string>();
 return raw.map(value=>{
  const c=object(value); keys(c,['id','sourceQuote','kind','params',...(draft?['reviewNotes']:[])]);
  const id=text(c.id,'id',64);
  if(!/^[a-zA-Z0-9_-]+$/.test(id)||ids.has(id)) throw Error('Invalid or duplicate check id');
  ids.add(id);
  const sourceQuote=text(c.sourceQuote,'quote',1000), p=object(c.params);
  let check:CheckSpec;
  switch(c.kind){
   case 'visible_text':keys(p,['text']);check={id,sourceQuote,kind:c.kind,params:{text:text(p.text,'text')}};break;
   case 'link_destination':keys(p,['label','hrefPrefix']);check={id,sourceQuote,kind:c.kind,params:{label:text(p.label,'label'),hrefPrefix:text(p.hrefPrefix,'destination')}};break;
   case 'form_structure':keys(p,['labels','requiredLabels']);{
    const labels=strings(p.labels), requiredLabels=strings(p.requiredLabels);
    if(!labels.length||requiredLabels.some(l=>!labels.includes(l)))throw Error('Invalid required labels');
    check={id,sourceQuote,kind:c.kind,params:{labels,requiredLabels}};break;
   }
   case 'horizontal_overflow':keys(p,[]);check={id,sourceQuote,kind:c.kind,params:{}};break;
   case 'unverified':keys(p,['reason']);check={id,sourceQuote,kind:c.kind,params:{reason:text(p.reason,'reason')}};break;
   default:throw Error('Unsupported check kind');
  }
  return {...check,reviewNotes:draft?(typeof c.reviewNotes==='string'&&c.reviewNotes.length<=1000?c.reviewNotes:(()=>{throw Error('Invalid review notes')})()):''};
 });
}
export function validateDraft(brief:string,raw:unknown):DraftCheck[] {
 validateBrief(brief);const checks=parse(raw,true);
 if(checks.some(c=>!brief.includes(c.sourceQuote)))throw Error('Source quote must occur verbatim in brief');
 return checks;
}
export function validateReviewed(raw:unknown):CheckSpec[] {
 // UI may retain review notes; they are excluded from the executable specification.
 if(!Array.isArray(raw))throw Error('Expected checks');
 return parse(raw.map(value=>{const c={...object(value)};delete c.reviewNotes;return c}),false).map(({reviewNotes,...c})=>c);
}
export function fingerprint(brief:string,targetUrl:string,checks:CheckSpec[]):string {
 return createHash('sha256').update(JSON.stringify([brief,targetUrl,checks])).digest('hex');
}
