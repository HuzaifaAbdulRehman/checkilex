import {readFile,writeFile} from 'node:fs/promises';import {evaluateCases} from './evaluate.ts';import {groundedBaseline} from './grounded-baseline.ts';
const cases=JSON.parse((await readFile('fixtures/briefs/heldout-v2.json','utf8')).replace(/^\uFEFF/,''));
const result=await evaluateCases(cases,async brief=>({checks:groundedBaseline(brief)}));
await writeFile('docs/evidence/grounded-baseline-v2.json',JSON.stringify({date:new Date().toISOString(),synthetic:true,definition:'English keyword comparator followed by the same assertGrounded veto; rejected checks become explicitly Unverified in this evaluation-only comparator. Never used in app.',...result},null,2));
console.log(JSON.stringify({correct:result.mappingCorrect,total:result.totalCases,baseline:result.baselineCorrect}));
