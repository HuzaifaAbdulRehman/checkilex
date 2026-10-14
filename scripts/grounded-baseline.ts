import {baselineDraft} from './baseline.ts';import {assertGrounded} from '../src/grounding.ts';import type {DraftCheck} from '../src/checks.ts';
// Evaluation-only comparator. This is never used as an application fallback.
export function groundedBaseline(brief:string):DraftCheck[]{
 return baselineDraft(brief).map(c=>{
  try{assertGrounded(c);return c}catch{return {id:c.id,sourceQuote:c.sourceQuote,kind:'unverified',params:{reason:'Keyword proposal did not pass the same grounding rules.'},reviewNotes:'Evaluation comparator only.'}}
 });
}
