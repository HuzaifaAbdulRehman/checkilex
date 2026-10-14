import { readFile,writeFile } from 'node:fs/promises';
import { draftChecks } from '../src/model.ts';
const cases=JSON.parse(await readFile('fixtures/briefs/development.json','utf8').then(t=>t.replace(/^\uFEFF/,'')));
const results: any[]=process.argv.includes('--retry-failed')?JSON.parse(await readFile('docs/evidence/development-runs.json','utf8')):[];
for(const c of cases){if(process.argv.includes('--retry-failed')){const at=results.findIndex(r=>r.id===c.id&&r.error);if(at<0)continue;results.splice(at,1)}try{const draft=await draftChecks(c.brief,new AbortController().signal);results.push({...c,...draft});console.log(c.id,draft.elapsedMs,draft.checks.map(c=>c.kind).join(','))}catch(e){results.push({...c,error:e instanceof Error?e.message:String(e),raw:(e as any).raw});console.log(c.id,e instanceof Error?e.message:String(e))}await writeFile('docs/evidence/development-runs.json',JSON.stringify(results,null,2));}
