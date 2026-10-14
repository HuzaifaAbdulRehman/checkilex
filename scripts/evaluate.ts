import {baselineDraft} from './baseline.ts';
import type {DraftCheck,CheckSpec,InspectionReport,CheckResult} from '../src/checks.ts';
export type EvaluationCase={id:string;language:string;brief:string;expectedKinds:string[];expectedText?:string;expectedLabel?:string;expectedHref?:string;expectedLabels?:string[];expectedRequiredLabels?:string[]};
type Extractor=(brief:string)=>Promise<{checks:DraftCheck[];elapsedMs?:number;raw?:string}>;
function same(a:string[],b:string[]){return JSON.stringify([...a].sort())===JSON.stringify([...b].sort())}
function matches(c:EvaluationCase,checks:DraftCheck[]):boolean{
 if(!same(checks.map(c=>c.kind),c.expectedKinds))return false;
 if(c.expectedText&&!checks.some(row=>row.kind==='visible_text'&&row.params.text===c.expectedText))return false;
 if(c.expectedHref&&!checks.some(row=>row.kind==='link_destination'&&row.params.label===c.expectedLabel&&row.params.hrefPrefix===c.expectedHref))return false;
 if(c.expectedLabels&&!checks.some(row=>row.kind==='form_structure'&&same(row.params.labels,c.expectedLabels!)&&same(row.params.requiredLabels,c.expectedRequiredLabels||[])))return false;
 return true;
}
export async function evaluateCases(cases:EvaluationCase[],extractor:Extractor,onProgress:(rows:any[])=>Promise<void>=async()=>{}){
 const rows:any[]=[];
 for(const c of cases){
  const baseline=baselineDraft(c.brief),baselineCorrect=matches(c,baseline);
  try{const draft=await extractor(c.brief);rows.push({...c,draft,mappingCorrect:matches(c,draft.checks),baselineCorrect,baseline})}
  catch(e){rows.push({...c,mappingCorrect:false,baselineCorrect,baseline,error:e instanceof Error?e.message:String(e),raw:(e as {raw?:string})?.raw})}
  await onProgress(rows);
 }
 return {totalCases:cases.length,mappingCorrect:rows.filter(r=>r.mappingCorrect).length,baselineCorrect:rows.filter(r=>r.baselineCorrect).length,extractionErrors:rows.filter(r=>r.error).length,rows};
}
type DefectCase={id:string;targetUrl:string;checks:CheckSpec[];expectedStatuses:Record<string,CheckResult['status']>};
export async function evaluateDefects(cases:DefectCase[],inspector:(url:string,checks:CheckSpec[])=>Promise<InspectionReport>){
 let falseVerified=0,totalAssertions=0,correct=0;const rows:any[]=[];
 for(const c of cases){
  totalAssertions+=Object.keys(c.expectedStatuses).length;
  try{
   const report=await inspector(c.targetUrl,c.checks);
   for(const [id,expected] of Object.entries(c.expectedStatuses)){
    const actual=report.results.find(r=>r.checkId===id)?.status;
    if(actual==='Verified'&&expected!=='Verified')falseVerified++;
    if(actual===expected)correct++;
   }
   rows.push({id:c.id,expectedStatuses:c.expectedStatuses,results:report.results});
  }catch(e){rows.push({id:c.id,error:e instanceof Error?e.message:String(e)})}
 }
 return {totalAssertions,correct,falseVerified,rows};
}
