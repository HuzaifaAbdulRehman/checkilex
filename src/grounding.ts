import type {CheckSpec} from './checks.ts';
export function groundingOptions(quote:string){
 const literals=[...quote.matchAll(/["“]([^"“”]+)["”]/g)].map(m=>m[1]).filter(s=>s.length<=500);
 const destinations=[...quote.matchAll(/\b(?:https?:\/\/|mailto:|tel:)[^\s"“”<>]+/g)].map(m=>m[0].replace(/[.,;!?]+$/,''));
 for(const m of quote.matchAll(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi))destinations.push('mailto:'+m[0]);
 const optional=/optional|maybe|might|shayad|lazmi nahi|zaroori nahi|agar waqt|would be nice/i.test(quote);
 const negated=/do not|don't|\bmat\b|bilkul.*nahi|nahi dikh/i.test(quote);
 return {literals:[...new Set(literals)],destinations:[...new Set(destinations)],concrete:!optional&&!negated,overflow:!optional&&/mobile|phone|screen|scroll|responsive|overflow/i.test(quote),allRequired:/(?:both|all|dono|sab)\s+(?:are\s+|hon\s+)?required|required.*(?:both|all|dono|sab)/i.test(quote)};
}
export function assertGrounded(check:CheckSpec){
 const o=groundingOptions(check.sourceQuote);
 if(check.kind==='unverified')return;
 if(check.kind==='horizontal_overflow'){if(!o.overflow)throw Error('Grounding: overflow needs explicit viewport/scroll wording');return}
 if(!o.concrete)throw Error('Grounding: optional or negated wording needs manual proof');
 if(check.kind==='visible_text'&&!o.literals.includes(check.params.text))throw Error('Grounding: visible text must be a quoted literal');
 if(check.kind==='link_destination'&&(!o.literals.includes(check.params.label)||!o.destinations.includes(check.params.hrefPrefix)))throw Error('Grounding: link label and destination must occur in the requirement');
 if(check.kind==='form_structure'){
  const equal=(a:string[],b:string[])=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
  if(!equal(check.params.labels,o.literals))throw Error('Grounding: form fields must retain all quoted labels');
  if(o.allRequired&&!equal(check.params.requiredLabels,o.literals))throw Error('Grounding: both/all required must retain every required label');
 }
}

