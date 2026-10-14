import {createServer as httpServer} from 'node:http';
import type {IncomingMessage,ServerResponse} from 'node:http';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {draftChecks} from './model.ts';
import {inspectPage,validateTargetUrl} from './inspect.ts';
import {validateBrief,validateDraft,validateReviewed,fingerprint} from './checks.ts';
type Dependencies={draftChecks:typeof draftChecks;inspectPage:typeof inspectPage};
type UiHandler=(req:IncomingMessage,res:ServerResponse)=>void;
class HttpError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status}}
async function readBody(req:IncomingMessage):Promise<any>{
 if(req.headers['content-type']!=='application/json')throw new HttpError(415,'Send application/json');
 let length=0;const chunks:Buffer[]=[];
 for await(const chunk of req){length+=chunk.length;if(length>32000)throw new HttpError(413,'Request body too large');chunks.push(chunk)}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw new HttpError(400,'Invalid JSON body')}
}
export function createServer(dependencies:Dependencies={draftChecks,inspectPage},ui?:UiHandler){
 let active=false;
 const server=httpServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  const port=(server.address() as {port:number}|null)?.port,origin='http://127.0.0.1:'+port;
  const send=(status:number,value:unknown)=>{if(res.destroyed)return;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value))};
  if(req.headers.host!=='127.0.0.1:'+port||(req.headers.origin&&req.headers.origin!==origin)){send(403,{error:'Only same-origin local access is allowed'});return}
  if(req.method==='GET'&&req.url==='/api/health'){send(200,{status:'ready',busy:active,model:'qwen3:1.7b',targetBoundary:'127.0.0.1 explicit port'});return}
  if(!req.url?.startsWith('/api/')){if(req.method==='GET'&&ui){ui(req,res);return}send(404,{error:'Not found'});return}
  if(req.method!=='POST'||!['/api/draft','/api/inspect'].includes(req.url)){send(404,{error:'Not found'});return}
  if(req.headers.origin!==origin){send(403,{error:'Same-origin browser request required'});return}
  if(active){send(409,{error:'Another local job is running. Your input is unchanged.'});return}
  const controller=new AbortController();const onClose=()=>{if(!res.writableEnded)controller.abort()};res.on('close',onClose);
  // Reserve before reading so two slow uploads cannot launch simultaneous jobs.
  active=true;
  try{
   const body=await readBody(req);if(!body||typeof body!=='object'||Array.isArray(body))throw new HttpError(400,'Expected request object');
   try{validateBrief(body.brief)}catch(e){throw new HttpError(400,e instanceof Error?e.message:'Invalid brief')}
   if(req.url==='/api/draft'){send(200,await dependencies.draftChecks(body.brief,controller.signal));return}
   let target:URL,checks;
   try{
    if(body.reviewed!==true||body.owned!==true)throw Error('Confirm checklist review and control of the local page');
    target=validateTargetUrl(body.targetUrl,[port!,11434]);
    checks=validateReviewed(body.checks);
    if(!checks.length)throw Error('Review at least one check');
    validateDraft(body.brief,checks.map(c=>({...c,reviewNotes:''})));
   }catch(e){throw new HttpError(400,e instanceof Error?e.message:'Invalid reviewed checks')}
   const report=await dependencies.inspectPage(target.href,checks,controller.signal);
   report.fingerprint=fingerprint(body.brief,target.href,checks);
   send(200,report);
  }catch(e){send(e instanceof HttpError?e.status:502,{error:e instanceof Error?e.message:'Local job failed'})}
  finally{active=false;res.off('close',onClose)}
 });
 server.requestTimeout=15000;server.headersTimeout=10000;
 return server;
}
export async function startApp(production=process.argv.includes('--production')){
 let closeUi=async()=>{};
 let ui:UiHandler;
 if(production){
  ui=(req,res)=>{void(async()=>{
   try{
    const url=new URL(req.url!,'http://127.0.0.1'),name=url.pathname==='/'?'index.html':url.pathname.slice(1);
    if(!/^(index\.html|assets\/[\w.-]+\.(js|css))$/.test(name)){res.writeHead(404);res.end();return}
    const body=await readFile(path.join('dist',name));res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.end(body);
   }catch{res.writeHead(404);res.end()}
  })()};
 }else{
  const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true,hmr:false},appType:'spa'});ui=(req,res)=>vite.middlewares(req,res);closeUi=()=>vite.close();
 }
 const server=createServer({draftChecks,inspectPage},ui);await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(4318,'127.0.0.1',resolve)});
 console.log('Site Delivery Check: http://127.0.0.1:4318');
 const close=()=>{server.closeAllConnections();server.close();void closeUi()};
 process.once('SIGINT',close);process.once('SIGTERM',close);
 return {server,close};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await startApp();
