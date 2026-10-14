import {get} from 'node:http';import test from 'node:test';import assert from 'node:assert/strict';import {createServer} from '../src/server.ts';
import type {ModelDraft} from '../src/model.ts';
const brief='Show "Hours".',checks=[{id:'hours',sourceQuote:brief,kind:'visible_text',params:{text:'Hours'},reviewNotes:''}];
const draft:ModelDraft={checks:checks as any,raw:JSON.stringify(checks),model:'fixture',elapsedMs:1,runtimeMs:1,settings:{temperature:0,num_ctx:4096,num_predict:1400}};
async function app(run:(base:string)=>Promise<void>,drafter=async()=>draft){
 const s=createServer({draftChecks:drafter,inspectPage:async()=>{throw Error('not expected')}});await new Promise<void>(r=>s.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+(s.address() as any).port;try{await run(url)}finally{s.closeAllConnections();await new Promise<void>(r=>s.close(()=>r()))}
}
const post=(url:string,route:string,data:unknown,origin=url)=>fetch(url+route,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(data)});
test('rejectsUnreviewedChecks and fabricated source quotes',async()=>app(async url=>{
 assert.equal((await post(url,'/api/inspect',{brief,targetUrl:'http://127.0.0.1:4319/',checks})).status,400);
 assert.equal((await post(url,'/api/inspect',{brief,targetUrl:'http://127.0.0.1:4319/',checks:[{...checks[0],sourceQuote:'fabricated'}],reviewed:true,owned:true})).status,400);
}));
test('rejectsForeignOrigin, malformed bodies and excessive bodies',async()=>app(async url=>{
 assert.equal((await post(url,'/api/draft',{brief},'https://evil.test')).status,403);
 assert.equal((await fetch(url+'/api/draft',{method:'POST',headers:{Origin:url,'Content-Type':'application/json'},body:'{bad'})).status,400);
 assert.equal((await post(url,'/api/draft',{brief:'x'.repeat(40000)})).status,413);
 const status=await new Promise<number|undefined>(resolve=>{get(url+'/api/health',{headers:{Host:'evil.test'}},res=>{res.resume();resolve(res.statusCode)})});assert.equal(status,403);
}));
test('preservesBriefOnBusy and releases the job after failure',async()=>{
 let release!:()=>void;const pending=new Promise<void>(r=>release=r);
 await app(async url=>{const first=post(url,'/api/draft',{brief});await new Promise(r=>setTimeout(r,60));const busy=await post(url,'/api/draft',{brief});assert.equal(busy.status,409);release();assert.equal((await first).status,502);assert.equal((await post(url,'/api/draft',{brief})).status,502);assert.equal(brief,'Show "Hours".')},async()=>{await pending;throw Error('model timed out')});
});
test('client cancellation aborts the job and allows later work',async()=>{
 let started!:()=>void,aborted!:()=>void;const ready=new Promise<void>(r=>started=r),done=new Promise<void>(r=>aborted=r);
 const s=createServer({draftChecks:async(_,signal)=>{started();await new Promise<void>((_,reject)=>signal.addEventListener('abort',()=>{aborted();reject(Error('aborted'))},{once:true}));return draft},inspectPage:async()=>{throw Error('unused')}});
 await new Promise<void>(r=>s.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+(s.address() as any).port,c=new AbortController();
 try{const call=fetch(base+'/api/draft',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({brief}),signal:c.signal}).catch(()=>null);await ready;c.abort();await done;await call;assert.equal((await fetch(base+'/api/health')).status,200)}finally{s.closeAllConnections();await new Promise<void>(r=>s.close(()=>r()))}
});
