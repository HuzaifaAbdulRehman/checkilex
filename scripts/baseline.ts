import { validateBrief } from '../src/checks.ts';
import type { DraftCheck } from '../src/checks.ts';
// Explicit English keyword comparator. It deliberately has no language model.
export function baselineDraft(brief:string):DraftCheck[]{
 validateBrief(brief);
 return brief.split(/[.!?\n]+/).map(s=>s.trim()).filter(Boolean).slice(0,8).map((sourceQuote,i):DraftCheck=>{
 const base={id:'b'+i,sourceQuote,reviewNotes:'Keyword baseline; review before measuring.'};
 const quoted=sourceQuote.match(/"([^"]+)"/)?.[1];
 const mail=sourceQuote.match(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i)?.[0];
 if(/deliver|send|optional|maybe|don't|do not|not sure|payment/i.test(sourceQuote))return {...base,kind:'unverified',params:{reason:'Requires manual evidence or clarification.'}};
 if(/mobile|overflow|responsive/i.test(sourceQuote))return {...base,kind:'horizontal_overflow',params:{}};
 if(mail&&/email|contact/i.test(sourceQuote))return {...base,kind:'link_destination',params:{label:'Email',hrefPrefix:'mailto:'+mail}};
 if(quoted)return {...base,kind:'visible_text',params:{text:quoted}};
 return {...base,kind:'unverified',params:{reason:'Keyword baseline cannot map this requirement.'}};
 });
}
