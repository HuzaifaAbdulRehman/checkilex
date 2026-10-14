import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {inspectPage} from '../src/inspect.ts';
import {validateReviewed} from '../src/checks.ts';
const first=JSON.parse(await readFile('docs/evidence/first-model-run.json','utf8').then(t=>t.replace(/^\uFEFF/,'')));
const checks=validateReviewed([...first.checks,{id:'fields',sourceQuote:'Synthetic measurement fixture',kind:'form_structure',params:{labels:['Name','Email'],requiredLabels:['Name','Email']}},{id:'overflow',sourceQuote:'Synthetic measurement fixture',kind:'horizontal_overflow',params:{}}]);
const s=createServer(async(req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await readFile('fixtures/sites/'+(req.url==='/defective'?'cafe-defective.html':'cafe.html')))});
await new Promise<void>(r=>s.listen(0,'127.0.0.1',r));
try{for(const [name,route] of [['good','/'],['defective','/defective']]){
 const report=await inspectPage('http://127.0.0.1:'+(s.address() as any).port+route,checks,new AbortController().signal);
 const captures=[];for(const c of report.captures){const file='docs/screenshots/fixture-'+name+'-'+c.width+'.png';await writeFile(file,Buffer.from(c.dataUrl.split(',')[1],'base64'));captures.push({id:c.id,width:c.width,height:c.height,file})}
 await writeFile('docs/evidence/'+name+'-report.json',JSON.stringify({...report,captures,synthetic:true,review:'Synthetic developer-reviewed check data; not a customer acceptance.'},null,2));console.log(name,report.results.map(r=>r.status).join(','));
}}finally{await new Promise<void>(r=>s.close(()=>r()))}
