import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {evaluateCases,evaluateDefects} from './evaluate.ts';import type {EvaluationCase} from './evaluate.ts';import {draftChecks} from '../src/model.ts';import {inspectPage} from '../src/inspect.ts';import type {CheckSpec} from '../src/checks.ts';
const read=async(p:string)=>JSON.parse((await readFile(p,'utf8')).replace(/^\uFEFF/,''));
const hashes:Record<string,string>={};
for(const p of ['src/model.ts','scripts/baseline.ts','fixtures/briefs/development.json','fixtures/briefs/heldout.json'])hashes[p]=createHash('sha256').update(await readFile(p)).digest('hex');
await writeFile('docs/evidence/evaluation-freeze.json',JSON.stringify({frozenAt:new Date().toISOString(),hashes,rule:'No held-out prompt/label tuning; extraction failures remain denominator; per-case kind and named literal constraints must all match.'},null,2));
const output:any={date:new Date().toISOString(),synthetic:true,hashes};
for(const split of ['development','heldout']){
 const cases:EvaluationCase[]=await read('fixtures/briefs/'+split+'.json');
 output[split]=await evaluateCases(cases,brief=>draftChecks(brief,new AbortController().signal),async rows=>{const row=rows.at(-1);console.log(split,rows.length+'/'+cases.length,row.id,row.mappingCorrect?'correct':row.error||'mapping miss',row.draft?.elapsedMs||'');await writeFile('docs/evidence/evaluation-progress.json',JSON.stringify({split,rows},null,2))});
 await writeFile('docs/evidence/evaluation.json',JSON.stringify(output,null,2));
}
const checks:CheckSpec[]=[
 {id:'hours',sourceQuote:'Show opening hours',kind:'visible_text',params:{text:'Open daily, 8am–6pm'}},
 {id:'contact',sourceQuote:'Email link',kind:'link_destination',params:{label:'Email',hrefPrefix:'mailto:hello@junipercafe.test'}},
 {id:'form',sourceQuote:'Name and Email required',kind:'form_structure',params:{labels:['Name','Email'],requiredLabels:['Name','Email']}},
 {id:'mobile',sourceQuote:'No mobile horizontal scrolling',kind:'horizontal_overflow',params:{}},
 {id:'delivery',sourceQuote:'Deliver email',kind:'unverified',params:{reason:'Not submitted; real delivery proof needed'}}
];
output.defects=await evaluateDefects([{id:'defective-cafe',targetUrl:'http://127.0.0.1:4319/defective',checks,expectedStatuses:{hours:'Failed',contact:'Failed',form:'Failed',mobile:'Failed',delivery:'Unverified'}}],(url,c)=>inspectPage(url,c,new AbortController().signal));
const eightBrief='Show "Open daily". Show "Fresh coffee". Show "Visit us". Show "Made locally". Add a link labelled "Email" to hello@example.test. Add a link labelled "Call" to tel:+12025550123. The form has a field labelled "Name", required. No horizontal scrolling on mobile.';
try{output.eightCheckLatency={brief:eightBrief,...await draftChecks(eightBrief,new AbortController().signal)}}catch(e){output.eightCheckLatency={brief:eightBrief,error:e instanceof Error?e.message:String(e)}}
await writeFile('docs/evidence/evaluation.json',JSON.stringify(output,null,2));
console.log('DONE',JSON.stringify({development:output.development.mappingCorrect+'/'+output.development.totalCases,heldout:output.heldout.mappingCorrect+'/'+output.heldout.totalCases,falseVerified:output.defects.falseVerified,eightCheckMs:output.eightCheckLatency.elapsedMs,eightCheckError:output.eightCheckLatency.error}));
