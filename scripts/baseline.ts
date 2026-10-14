import { validateBrief } from '../src/checks.ts';
import type { DraftCheck } from '../src/checks.ts';
// Explicit English keyword comparator. No language model or learned rules.
export function baselineDraft(brief:string):DraftCheck[]{
 validateBrief(brief);
 return brief.split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim()).filter(Boolean).slice(0,8).map((sourceQuote,i):DraftCheck=>{
 const base={id:'b'+i,sourceQuote,reviewNotes:'Keyword baseline; review before measuring.'};
 const labels=[...sourceQuote.matchAll(/"([^"]+)"/g)].map(m=>m[1]),quoted=labels[0];
 const mail=sourceQuote.match(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i)?.[0];
 if(/deliver|send|optional|maybe|don't|do not|not sure|payment/i.test(sourceQuote))return {...base,kind:'unverified',params:{reason:'Requires manual evidence or clarification.'}};
 if(/mobile|overflow|responsive/i.test(sourceQuote))return {...base,kind:'horizontal_overflow',params:{}};
 if(/form/i.test(sourceQuote)&&labels.length)return {...base,kind:'form_structure',params:{labels,requiredLabels:/required/i.test(sourceQuote)?labels:[]}};
 if(mail&&/email|contact|mailto/i.test(sourceQuote)&&quoted)return {...base,kind:'link_destination',params:{label:quoted,hrefPrefix:'mailto:'+mail}};
 const phone=sourceQuote.match(/tel:\+?[0-9-]+/)?.[0];
 if(phone&&/call|phone/i.test(sourceQuote)&&quoted)return {...base,kind:'link_destination',params:{label:quoted,hrefPrefix:phone}};
 if(quoted)return {...base,kind:'visible_text',params:{text:quoted}};
 return {...base,kind:'unverified',params:{reason:'Keyword baseline cannot map this requirement.'}};
 });
}

