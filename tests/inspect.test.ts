import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { inspectPage,validateTargetUrl } from '../src/inspect.ts';
import type {CheckSpec} from '../src/checks.ts';
const checks:CheckSpec[]=[
 {id:'hours',sourceQuote:'Show opening hours',kind:'visible_text',params:{text:'Open daily, 8amâ€“6pm'}},
 {id:'contact',sourceQuote:'Email link',kind:'link_destination',params:{label:'Email',hrefPrefix:'mailto:hello@junipercafe.test'}},
 {id:'form',sourceQuote:'Name and Email required',kind:'form_structure',params:{labels:['Name','Email'],requiredLabels:['Name','Email']}},
 {id:'mobile',sourceQuote:'No overflow',kind:'horizontal_overflow',params:{}},
 {id:'email-delivery',sourceQuote:'Deliver email',kind:'unverified',params:{reason:'Needs real delivery proof'}}
];
async function serve(body:string,run:(url:string)=>Promise<void>){const s=createServer((_,res)=>{res.setHeader('Content-Type','text/html');res.end(body)});await new Promise<void>(r=>s.listen(0,'127.0.0.1',r));try{await run('http://127.0.0.1:'+ (s.address() as any).port+'/')}finally{await new Promise<void>(r=>s.close(()=>r()))}}
test('rejects targets outside the explicit boundary',()=>{
 for(const u of ['https://127.0.0.1:4319','http://localhost:4319','http://127.1:4319','http://2130706433:4319','http://127.0.0.1:11434','http://127.0.0.1:4318','http://127.0.0.1','http://user@127.0.0.1:4319','http://127.0.0.1:80']) assert.throws(()=>validateTargetUrl(u,[4318,11434]),/target/i);
 assert.equal(validateTargetUrl('http://127.0.0.1:4319/',[4318,11434]).port,'4319');
});
test('verifies good fixture but refusesEmailDeliveryProof',async()=>{
 await serve(await readFile('fixtures/sites/cafe.html','utf8'),async url=>{
 const report=await inspectPage(url,checks,new AbortController().signal);
 assert.deepEqual(report.results.map(r=>r.status),['Verified','Verified','Verified','Verified','Unverified']);assert.equal(report.captures.length,2);
 });
});
test('detectsWrongContact, detectsHiddenHours and mobile/form defects',async()=>{
 await serve(await readFile('fixtures/sites/cafe-defective.html','utf8'),async url=>{
 const report=await inspectPage(url,checks,new AbortController().signal);
 assert.deepEqual(report.results.map(r=>r.status),['Failed','Failed','Failed','Failed','Unverified']);
 });
});
test('duplicate text/link and unsupported broad promises cannot pass',async()=>{
 await serve('<p>Hours</p><p>Hours</p><a href="mailto:x@y.test">Email</a><a href="mailto:x@y.test">Email</a>',async url=>{
 const report=await inspectPage(url,[{...checks[0],kind:'visible_text',params:{text:'Hours'}},{...checks[1],kind:'link_destination',params:{label:'Email',hrefPrefix:'mailto:x@y.test'}}],new AbortController().signal);
 assert.deepEqual(report.results.map(r=>r.status),['Unverified','Unverified']);
 });
});
test('blocksOtherOrigin, redirects, non-read methods, sockets and popups',async()=>{
 let escaped=0,posts=0;const trap=createServer((_,res)=>{escaped++;res.end('oops')});await new Promise<void>(r=>trap.listen(0,'127.0.0.1',r));
 const trapUrl='http://127.0.0.1:'+(trap.address() as any).port;
 const s=createServer((req,res)=>{if(req.method==='POST')posts++;if(req.url==='/redirect'){res.writeHead(302,{Location:trapUrl});res.end();return}res.setHeader('Content-Type','text/html');res.end('<p>Hours</p><img src="'+trapUrl+'/image"><script>fetch("/post",{method:"POST"});fetch("/redirect");new WebSocket("'+trapUrl.replace('http:','ws:')+'");window.open("'+trapUrl+'")</script>')});
 await new Promise<void>(r=>s.listen(0,'127.0.0.1',r));
 try{const report=await inspectPage('http://127.0.0.1:'+(s.address() as any).port,[{...checks[0],kind:'visible_text',params:{text:'Hours'}}],new AbortController().signal);assert.equal(report.results[0].status,'Unverified');assert.ok(report.notices.length>0);assert.equal(escaped,0);assert.equal(posts,0)}finally{await Promise.all([new Promise<void>(r=>s.close(()=>r())),new Promise<void>(r=>trap.close(()=>r()))])}
});
test('closesOnAbort and reports unreachable pages',async()=>{
 const c=new AbortController();c.abort();await assert.rejects(inspectPage('http://127.0.0.1:4319',checks,c.signal));
 await assert.rejects(inspectPage('http://127.0.0.1:65534',checks,new AbortController().signal),/page|connect|ERR/i);
});

test('opacity-hidden text and fields split across forms cannot pass',async()=>{
 await serve('<div style="opacity:0"><p>Hours</p></div><form><label>Name<input required></label></form><form><label>Email<input required></label></form>',async url=>{
 const report=await inspectPage(url,[{...checks[0],kind:'visible_text',params:{text:'Hours'}},checks[2]],new AbortController().signal);
 assert.deepEqual(report.results.map(r=>r.status),['Failed','Failed']);
 });
});
