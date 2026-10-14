import {useRef,useState} from 'react';
import type {DraftCheck,InspectionReport,CheckSpec} from './checks.ts';
import type {ModelDraft} from './model.ts';
import {renderMarkdown} from './report.ts';
const SAMPLE='Show "Open daily, 8am–6pm". Add a link labelled "Email" to hello@junipercafe.test. Mobile par horizontal scroll nahi hona chahiye. Contact form must deliver email.';
const KINDS={visible_text:'Visible text',link_destination:'Link destination',form_structure:'Form structure',horizontal_overflow:'Horizontal overflow',unverified:'Manual proof needed'} as const;
function saveFile(name:string,content:Blob|string){
 const url=typeof content==='string'?content:URL.createObjectURL(content),link=document.createElement('a');
 link.href=url;link.download=name;link.click();if(typeof content!=='string')setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function inputHash(brief:string,target:string,checks:DraftCheck[]){
 const specs=checks.map(({reviewNotes,...c})=>c);
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([brief,new URL(target).href,specs])));
 return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export default function App(){
 const [brief,setBrief]=useState(''),[target,setTarget]=useState('http://127.0.0.1:4319/');
 const [checks,setChecks]=useState<DraftCheck[]>([]),[reviewed,setReviewed]=useState(false),[owned,setOwned]=useState(false);
 const [report,setReport]=useState<InspectionReport|null>(null),[busy,setBusy]=useState<'draft'|'inspect'|null>(null),[error,setError]=useState(''),[modelInfo,setModelInfo]=useState(''),[attempted,setAttempted]=useState(false);
 const controller=useRef<AbortController|null>(null),reportHeading=useRef<HTMLHeadingElement|null>(null),reviewHeading=useRef<HTMLHeadingElement|null>(null);
 function invalidate(){setReport(null);setReviewed(false)}
 function changeBrief(value:string){setBrief(value);setChecks([]);setAttempted(false);setModelInfo('');invalidate()}
 function edit(index:number,check:DraftCheck){setChecks(old=>old.map((c,i)=>i===index?check:c));invalidate()}
 function addManual(){setChecks(old=>[...old,{id:'manual-'+crypto.randomUUID(),sourceQuote:brief.slice(0,1000),kind:'unverified',params:{reason:'Add the missing requirement and choose a supported measurement, or keep it for manual proof.'},reviewNotes:'Added by reviewer.'}]);setAttempted(true);invalidate()}
 async function run(kind:'draft'|'inspect'){
  const abort=new AbortController();controller.current=abort;setBusy(kind);setError('');setReport(null);
  if(kind==='draft'){setChecks([]);setReviewed(false);setAttempted(true)}
  try{
   const expected=kind==='inspect'?await inputHash(brief,target,checks):null;
   const response=await fetch('/api/'+kind,{method:'POST',signal:abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(kind==='draft'?{brief}:{brief,targetUrl:target,checks,reviewed,owned})});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Local job failed');
   if(kind==='draft'){const draft=data as ModelDraft;setChecks(draft.checks);setModelInfo(draft.model+' · '+(draft.elapsedMs/1000).toFixed(1)+'s');setTimeout(()=>reviewHeading.current?.focus(),0)}
   else{if(data.fingerprint!==expected)throw Error('Inputs changed. Review and inspect again.');setReport(data);setTimeout(()=>reportHeading.current?.focus(),0)}
  }catch(e){setError(abort.signal.aborted?'Job cancelled. Your brief is still here.':e instanceof Error?e.message:'Local job failed')}
  finally{setBusy(null);controller.current=null}
 }
 function reset(){controller.current?.abort();setBrief('');setChecks([]);setReport(null);setError('');setReviewed(false);setOwned(false);setAttempted(false);setModelInfo('')}
 const counts=report?['Failed','Unverified','Verified'].map(status=>({status,count:report.results.filter(r=>r.status===status).length})):[];
 return <div className="app">
  <header className="masthead"><a className="brand" href="/" aria-label="Site Delivery Check home"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 12 4 4 8-9"/></svg></span><span>Site Delivery Check<span className="brand-sub">A clearer handoff.</span></span></a><span className="local"><span/> Local model. Local evidence.</span></header>
  <main>
   <section className="intro"><div><p className="eyebrow">THE LAST CHECK BEFORE YOU SEND THE LINK</p><h1>Deliver the page.<br/><span>Keep the proof.</span></h1><p className="lede">Turn a client brief into a checklist you can review. Then collect evidence from the page you actually built.</p></div><aside className="scope-note"><span className="small-label">BUILT FOR THE FINAL MILE</span><p>One landing page.<br/>Eight focused checks.<br/>Two measured viewports.</p><a href="#how-it-works">What a check can prove <span aria-hidden="true">↗</span></a></aside></section>
   <ol className="steps" aria-label="Workflow"><li className="current"><span>01</span> Describe the promise</li><li className={checks.length?'current':''}><span>02</span> Review the checks</li><li className={report?'current':''}><span>03</span> Collect the evidence</li></ol>
   {error&&<div className="error" role="alert">{error}</div>}
   <div className="workspace">
    <section className="panel brief-panel"><div className="panel-title"><div><span className="small-label">01 / THE BRIEF</span><h2>What did you promise?</h2></div><button className="text-button" disabled={!!busy} onClick={()=>changeBrief(SAMPLE)}>Use café example</button></div>
     <label htmlFor="brief">Client brief <span className="muted">English or Roman Urdu</span></label>
     <textarea id="brief" className="brief-input" value={brief} maxLength={4000} disabled={!!busy} placeholder={'Paste the client’s words here.\n\nFor example: Show “Open daily”. Add a link labelled “Email” to hello@example.test.'} onChange={e=>changeBrief(e.target.value)} aria-describedby="brief-help"/>
     <div className="field-foot"><span id="brief-help">Keep labels and destinations explicit.</span><span>{brief.length.toLocaleString()} / 4,000</span></div>
     <button className="primary wide" disabled={!!busy||!brief.trim()} onClick={()=>void run('draft')}>{busy==='draft'?'Drafting with local Qwen…':'Draft checks'}<span aria-hidden="true">↗</span></button>
     <p className="quiet">Qwen suggests checks. You decide what belongs. A model draft is never a verdict.</p>
     <div className="target"><label htmlFor="target">Your local page</label><input id="target" value={target} disabled={!!busy} onChange={e=>{setTarget(e.target.value);setOwned(false);invalidate()}} aria-describedby="target-help"/><p id="target-help" className="quiet">Use an explicit http://127.0.0.1 port. App and model ports are excluded.</p><label className="checkbox"><input type="checkbox" checked={owned} disabled={!!busy} onChange={e=>{setOwned(e.target.checked);setReport(null)}}/>I control this local page</label></div>
     <div className="session-actions"><button className="text-button" disabled={!!busy} onClick={reset}>Clear this session</button>{busy&&<button className="text-button" onClick={()=>controller.current?.abort()}>Cancel job</button>}</div>
    </section>
    <section className="panel review-panel" aria-busy={busy==='draft'}><div className="panel-title"><div><span className="small-label">02 / HUMAN REVIEW</span><h2 tabIndex={-1} ref={reviewHeading}>Make the checks yours.</h2></div><span className="count">{checks.length} / 8</span></div>
     {checks.length===0?<div className="empty"><span className="empty-mark" aria-hidden="true">“ ”</span><h3>{attempted?'No usable checks yet.':'Start with the client’s words.'}</h3><p>{attempted?'Check the error above or add a requirement manually. An empty checklist proves nothing.':'The local model will suggest a short checklist, with the original wording beside every check.'}</p><span className="empty-detail">No brief history is saved by this app.</span></div>:<><p className="review-hint">Compare this list with the full brief. Fix mistakes, add omissions, and keep unsupported promises for manual proof.</p><div className="check-list">{checks.map((c,i)=><CheckEditor key={c.id} check={c} index={i} disabled={!!busy} onChange={value=>edit(i,value)} onRemove={()=>{setChecks(old=>old.filter((_,n)=>n!==i));invalidate()}}/>)}</div><p className="quiet model-info">{modelInfo}</p></>}
     {!!brief.trim()&&<button className="text-button add-check" disabled={!!busy||checks.length>=8} onClick={addManual}>+ Add a manual check</button>}
     <div className="review-actions"><label className="checkbox"><input type="checkbox" checked={reviewed} disabled={!!busy||!checks.length} onChange={e=>{setReviewed(e.target.checked);setReport(null)}}/>I reviewed every check against the brief</label><button className="primary" disabled={!!busy||!checks.length||!reviewed||!owned} onClick={()=>void run('inspect')}>{busy==='inspect'?'Collecting evidence…':'Inspect reviewed page'}<span aria-hidden="true">→</span></button></div>
    </section>
   </div>
   <p className="job-status" role="status" aria-live="polite">{busy==='draft'?'Local inference is running. The first call may take up to 45 seconds.':busy==='inspect'?'Inspecting desktop and mobile in fresh browser contexts. No forms are submitted.':''}</p>
   {report&&<section className="report" aria-label="Inspection report"><div className="report-header"><div><span className="small-label">03 / MEASURED RESULTS</span><h2 ref={reportHeading} tabIndex={-1}>Delivery evidence</h2><p>{report.targetUrl} · {new Date(report.timestamp).toLocaleString()}</p></div><button className="secondary" onClick={()=>saveFile('site-delivery-report.md',new Blob([renderMarkdown(report)],{type:'text/markdown;charset=utf-8'}))}>Export Markdown ↓</button></div>
    <div className="result-counts">{counts.map(c=><span key={c.status} className={'summary '+c.status.toLowerCase()}><strong>{c.count}</strong>{c.status}</span>)}<p>Scoped measurements, with limits.<br/>No overall acceptance verdict.</p></div>
    {report.notices.length>0&&<div className="notice">{report.notices.join(' ')} Affected measurements remain Unverified.</div>}
    <div className="results">{[...report.results].sort((a,b)=>['Failed','Unverified','Verified'].indexOf(a.status)-['Failed','Unverified','Verified'].indexOf(b.status)).map(r=>{const c=report.checks.find(c=>c.id===r.checkId)!;return <article className="result" key={r.checkId}><div className="result-top"><span className={'badge '+r.status.toLowerCase()}>{r.status}</span><span className="small-label">{KINDS[c.kind]}</span></div><blockquote>{c.sourceQuote}</blockquote><ul>{r.measuredFacts.map((f,i)=><li key={i}>{f}</li>)}</ul><div className="limitations">{r.limitations.map((l,i)=><p key={i}>{l}</p>)}</div></article>})}</div>
    <div className="captures">{report.captures.map(c=><figure key={c.id}><a href={c.dataUrl} download={'evidence-'+c.width+'.png'}><img src={c.dataUrl} alt={'Inspected local page at '+c.width+' by '+c.height+' pixels'}/></a><figcaption>{c.width} × {c.height}<button className="text-button" onClick={()=>saveFile('evidence-'+c.width+'.png',c.dataUrl)}>Download PNG ↓</button></figcaption></figure>)}</div><p className="quiet">Input fingerprint: {report.fingerprint}. Keep PNG downloads beside the exported report.</p>
   </section>}
   <section className="explainer" id="how-it-works"><div><span className="small-label">KNOW THE BOUNDARY</span><h2>Evidence you can explain.</h2></div><p>Fixed checks measure visible text, exact link destinations, specified form fields, and horizontal overflow at 1366 × 900 and 390 × 844. They do not certify security, design quality, form delivery, or all devices. Blocked resources and ambiguous matches remain Unverified.</p></section>
  </main><footer><span>Site Delivery Check / local prototype</span><span>Fresh browser contexts. No forms submitted.</span></footer>
 </div>;
}
function CheckEditor({check:c,index,disabled,onChange,onRemove}:{check:DraftCheck;index:number;disabled:boolean;onChange:(c:DraftCheck)=>void;onRemove:()=>void}){
 function kindChange(kind:CheckSpec['kind']){
  const params=kind==='visible_text'?{text:''}:kind==='link_destination'?{label:'',hrefPrefix:''}:kind==='form_structure'?{labels:[],requiredLabels:[]}:kind==='unverified'?{reason:'Manual evidence needed.'}:{};
  onChange({...c,kind,params} as DraftCheck);
 }
 function params(p:unknown){onChange({...c,params:p} as DraftCheck)}
 return <article className="check-editor"><div className="check-top"><span className="check-number">{String(index+1).padStart(2,'0')}</span><select aria-label={'Check '+(index+1)+' type'} disabled={disabled} value={c.kind} onChange={e=>kindChange(e.target.value as CheckSpec['kind'])}>{Object.entries(KINDS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select><button className="text-button remove" disabled={disabled} onClick={onRemove} aria-label={'Remove check '+(index+1)}>Remove</button></div>
  <label>Original wording<textarea aria-label={'Check '+(index+1)+' source quote'} maxLength={1000} disabled={disabled} rows={2} value={c.sourceQuote} onChange={e=>onChange({...c,sourceQuote:e.target.value})}/></label>
  {c.kind==='visible_text'&&<label>Exact visible text<input disabled={disabled} maxLength={500} value={c.params.text} onChange={e=>params({text:e.target.value})}/></label>}
  {c.kind==='link_destination'&&<div className="paired"><label>Link label<input disabled={disabled} value={c.params.label} maxLength={500} onChange={e=>params({...c.params,label:e.target.value})}/></label><label>Exact destination<input disabled={disabled} value={c.params.hrefPrefix} maxLength={500} onChange={e=>params({...c.params,hrefPrefix:e.target.value})}/></label></div>}
  {c.kind==='form_structure'&&<div className="paired"><label>Field labels (comma separated)<input disabled={disabled} value={c.params.labels.join(', ')} onChange={e=>params({...c.params,labels:e.target.value.split(',').map(v=>v.trim())})}/></label><label>Required labels<input disabled={disabled} value={c.params.requiredLabels.join(', ')} onChange={e=>params({...c.params,requiredLabels:e.target.value.split(',').map(v=>v.trim()).filter(Boolean)})}/></label></div>}
  {c.kind==='horizontal_overflow'&&<p className="scope-inline">Measures horizontal overflow at the two stated viewports. Review broader responsive requirements separately.</p>}
  {c.kind==='unverified'&&<label>What needs manual proof?<textarea disabled={disabled} rows={2} maxLength={500} value={c.params.reason} onChange={e=>params({reason:e.target.value})}/></label>}
  <p className="check-note">{c.reviewNotes}</p>
 </article>;
}
