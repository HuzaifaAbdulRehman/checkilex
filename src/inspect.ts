import { launchBrowser } from '../scripts/browser.mjs';
import { validateReviewed } from './checks.ts';
import type { CheckSpec,CheckResult,InspectionReport,Capture } from './checks.ts';
import type { Page, Locator } from 'playwright';
export function validateTargetUrl(raw:string,reservedPorts=[4318,11434]):URL {
 if(typeof raw!=='string'||raw.length>2000||/[\s\\]/.test(raw)||!/^http:\/\/127\.0\.0\.1:\d{4,5}(?:[/?#]|$)/.test(raw))throw Error('Invalid target: use http://127.0.0.1:PORT');
 const url=new URL(raw),port=Number(url.port);
 if(url.hostname!=='127.0.0.1'||url.protocol!=='http:'||url.username||url.password||port<1024||port>65535||reservedPorts.includes(port))throw Error('Invalid target port');
 return url;
}
async function perceptible(el:Locator):Promise<boolean>{
 if(!await el.isVisible())return false;
 return el.evaluate(node=>{
  for(let current:Element|null=node;current;current=current.parentElement){
   const style=getComputedStyle(current);
   if(Number(style.opacity)===0||style.visibility==='hidden'||style.visibility==='collapse'||/opacity\(0(?:[.0%]*)\)/.test(style.filter))return false;
  }
  return true;
 });
}
async function measure(page:Page,c:CheckSpec):Promise<Omit<CheckResult,'checkId'|'evidenceIds'>>{
 const result=(status:CheckResult['status'],fact:string,limitation:string)=>({status,measuredFacts:[fact],limitations:[limitation]});
 switch(c.kind){
 case 'unverified':return result('Unverified','No automated measurement supports this promise.',c.params.reason);
 case 'visible_text':{
  const matches=page.getByText(c.params.text,{exact:true}), visible=[];
  for(const el of await matches.all())if(await perceptible(el))visible.push(el);
  return result(visible.length===1?'Verified':visible.length===0?'Failed':'Unverified',visible.length+' visible exact text matches: '+JSON.stringify(c.params.text),'Visible text only; this does not prove correctness of the underlying claim.');
 }
 case 'link_destination':{
  const matches=await page.getByRole('link',{name:c.params.label,exact:true}).all(),visible=[];
  for(const el of matches)if(await perceptible(el))visible.push(el);
  if(visible.length!==1)return result(visible.length?'Unverified':'Failed',visible.length+' visible links labelled '+JSON.stringify(c.params.label),'Requires one unambiguous visible link; destination is not visited.');
  const href=await visible[0].getAttribute('href');let matchesHref=false;
  try{matchesHref=href!==null&&new URL(href,page.url()).href===new URL(c.params.hrefPrefix,page.url()).href}catch{}
  return result(matchesHref?'Verified':'Failed','Observed href: '+JSON.stringify(href)+'; expected: '+JSON.stringify(c.params.hrefPrefix),'Exact normalized destination only; clicking or downstream delivery is not tested.');
 }
 case 'form_structure':{
  const facts:string[]=[];const forms=new Set<number>();let status:CheckResult['status']='Verified';
  for(const label of c.params.labels){
   const all=await page.getByLabel(label,{exact:true}).all(),visible=[];
   for(const el of all)if(await perceptible(el))visible.push(el);
   if(visible.length!==1){facts.push(label+': '+visible.length+' visible fields');if(status!=='Failed')status=visible.length?'Unverified':'Failed';continue}
   const data=await visible[0].evaluate(el=>({tag:el.tagName,required:(el as HTMLInputElement).required,disabled:(el as HTMLInputElement).disabled,form:Boolean((el as HTMLInputElement).form),formIndex:Array.from(document.forms).indexOf((el as HTMLInputElement).form!)}));
   forms.add(data.formIndex);
   const ok=['INPUT','TEXTAREA','SELECT'].includes(data.tag)&&data.form&&!data.disabled&&(!c.params.requiredLabels.includes(label)||data.required);
   facts.push(label+': '+JSON.stringify(data));if(!ok)status='Failed';
  }
  if(forms.size>1){status='Failed';facts.push('Fields belong to different forms.')}
  return {status,measuredFacts:facts,limitations:['Visible enabled labelled form fields and native required attributes only. No submission or email delivery was tested.']};
 }
 case 'horizontal_overflow':{
  const size=await page.evaluate(()=>({content:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  return result(size.content<=size.viewport+1?'Verified':'Failed','Content '+size.content+'px; viewport '+size.viewport+'px.','Horizontal overflow only at this viewport; not a general responsive-design assessment.');
 }
 }
}
export async function inspectPage(targetUrl:string,rawChecks:CheckSpec[],signal:AbortSignal):Promise<InspectionReport>{
 signal.throwIfAborted();const url=validateTargetUrl(targetUrl),checks=validateReviewed(rawChecks);
 if(!checks.length)throw Error('Review at least one check');
 const deadline=AbortSignal.any([signal,AbortSignal.timeout(25000)]),browser=await launchBrowser();
 let aborted=false;const abort=()=>{aborted=true;void browser.close()};deadline.addEventListener('abort',abort,{once:true});
 if(deadline.aborted)abort();
 const notices=new Set<string>(),captures:Capture[]=[],byCheck=new Map<string,CheckResult[]>();let requests=0,totalBytes=0;
 try{
  for(const viewport of [{width:1366,height:900},{width:390,height:844}]){
   deadline.throwIfAborted();
   const context=await browser.newContext({viewport,serviceWorkers:'block',acceptDownloads:false});
   try{
    await context.routeWebSocket('**/*',ws=>{notices.add('WebSocket blocked.');ws.close()});
    await context.route('**/*',async route=>{
     const req=route.request();let u:URL;try{u=new URL(req.url())}catch{await route.abort();return}
     if(u.origin!==url.origin||!['GET','HEAD'].includes(req.method())||++requests>60){notices.add('Blocked an out-of-bound request or request limit.');await route.abort();return}
     try{
      const response=await fetch(u,{method:req.method(),redirect:'manual',signal:AbortSignal.any([deadline,AbortSignal.timeout(5000)])});
      if((response.status>=300&&response.status<400)||response.headers.has('content-disposition')||Number(response.headers.get('content-length'))>2000000){notices.add('Redirect, download or oversized resource blocked.');await response.body?.cancel();await route.abort();return}
      const chunks:Uint8Array[]=[];let bytes=0;const reader=response.body?.getReader();
      if(reader){try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;totalBytes+=value.length;if(bytes>2000000||totalBytes>8000000)throw Error('Resource byte limit');chunks.push(value)}}finally{await reader.cancel()}}
      const headers=Object.fromEntries([...response.headers].filter(([k])=>!['content-length','content-encoding','transfer-encoding','set-cookie'].includes(k)));
      await route.fulfill({status:response.status,headers,body:Buffer.concat(chunks)});
     }catch{notices.add('Resource unavailable or resource limit reached.');await route.abort().catch(()=>{})}
    });
    const page=await context.newPage();page.on('popup',p=>{notices.add('Popup blocked.');void p.close()});page.on('dialog',d=>void d.dismiss());page.on('download',d=>{notices.add('Download blocked.');void d.cancel()});
    const response=await page.goto(url.href,{waitUntil:'networkidle',timeout:12000});
    if(!response?.ok()||page.url()!==url.href)throw Error('Target page unavailable or redirected');
    await page.evaluate(()=>document.fonts.ready);
    for(const c of checks){const m=await measure(page,c);const rows=byCheck.get(c.id)||[];rows.push({checkId:c.id,...m,measuredFacts:m.measuredFacts.map(f=>viewport.width+'px: '+f),evidenceIds:[String(viewport.width)]});byCheck.set(c.id,rows)}
    const shot=await page.screenshot({type:'png',animations:'disabled',timeout:5000});
    captures.push({id:String(viewport.width),...viewport,dataUrl:'data:image/png;base64,'+shot.toString('base64')});
   }finally{await context.close()}
  }
  const results=checks.map(c=>{
   const rows=byCheck.get(c.id)!;
   const status=notices.size||c.kind==='unverified'?'Unverified':rows.some(r=>r.status==='Failed')?'Failed':rows.some(r=>r.status==='Unverified')?'Unverified':'Verified';
   return {checkId:c.id,status,measuredFacts:rows.flatMap(r=>r.measuredFacts),limitations:[...new Set(rows.flatMap(r=>r.limitations)),...(notices.size?['Blocked or unavailable resources may affect this measurement.']:[])],evidenceIds:rows.flatMap(r=>r.evidenceIds)} as CheckResult;
  });
  return {checks,results,captures,targetUrl:url.href,timestamp:new Date().toISOString(),versions:{chromium:browser.version(),playwright:'1.63.0'},fingerprint:'',notices:[...notices]};
 }catch(error){if(aborted)throw Error('Inspection aborted or timed out');throw error}
 finally{deadline.removeEventListener('abort',abort);await browser.close()}
}
