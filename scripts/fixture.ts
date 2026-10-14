import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const server=createServer(async(req,res)=>{
 const file=req.url==='/defective'?'cafe-defective.html':req.url==='/'?'cafe.html':null;
 if(!file){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await readFile('fixtures/sites/'+file));
});
server.listen(4319,'127.0.0.1',()=>console.log('Fictional cafe: http://127.0.0.1:4319/ or /defective'));
