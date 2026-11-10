import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createLocalExodiaAdapter} from './exodia-local.mjs';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const gate=process.env.JUHUA_PREVIEW_GATE==='b'?'b':'a';
const port=Number(gate==='b'?(process.env.GATE_B_PORT||4184):(process.env.GATE_A_PORT||4183));
const allowed=new Set(['.html','.css','.mjs','.js','.jpg','.png','.webp','.json']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.json':'application/json'};
const adapter=gate==='b'?createLocalExodiaAdapter():null;
const hosts=new Set(['127.0.0.1:'+port,'localhost:'+port]);
const origins=new Set(['http://127.0.0.1:'+port,'http://localhost:'+port]);
const apiReply=(res,status,data)=>{
 res.writeHead(status,{'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
 res.end(JSON.stringify(data));
};
async function localApi(req,res,path){
 if(!adapter)return apiReply(res,404,{error:'Unavailable in Gate A'});
 if(path==='/api/local-exodia/status'&&req.method==='GET'){
  let reachable=false;
  try{
   // Status must mean the local model service actually responds, not simply
   // that a proxy adapter was instantiated. A 1.2s bounded probe keeps CI
   // and offline review on the honestly labeled scripted path.
   const url=new URL(process.env.EXODIA_URL||'http://127.0.0.1:8765');
   const health=await fetch(url.origin+'/api/command/tasks',
    {signal:AbortSignal.timeout(1200)});
   reachable=health.ok;
  }catch{}
  return apiReply(res,200,{...adapter.status(),available:reachable});
 }
 if(path!=='/api/local-exodia/reading'||req.method!=='POST')
  return apiReply(res,405,{error:'Method not allowed'});
 if(!req.headers.origin||!origins.has(req.headers.origin)||
    req.headers['x-juhua-local-client']!=='1'||
    !/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))
  return apiReply(res,403,{error:'Same-origin request required'});
 try{
  let size=0;const chunks=[];
  for await(const part of req){size+=part.length;if(size>16000)
   throw Object.assign(new Error('Payload too large'),{status:413});chunks.push(part);}
  const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  return apiReply(res,200,await adapter.generate(body));
 }catch(e){return apiReply(res,e.status||502,{error:e.message||'Local generation failed'});}
}
const server=createServer(async(req,res)=>{
 try{
  if(!hosts.has(req.headers.host)){res.writeHead(403);res.end();return}
  const route=new URL(req.url||'/', 'http://127.0.0.1:'+port);
  if(route.pathname.startsWith('/api/'))return localApi(req,res,route.pathname);
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return}
  const url=new URL(req.url||'/',`http://127.0.0.1:${port}`),path=decodeURIComponent(url.pathname);
  const pathname=path==='/'?'/preview/gate-'+gate+'/index.html':path.endsWith('/')?path+'index.html':path;
  // Gate B preview may continue into the isolated Phase 8.2 ritual app.
  // Gate A still exposes only its original restricted asset set.
  const allowedRoot=pathname.startsWith('/preview/gate-a/')||pathname.startsWith('/preview/gate-b/')||pathname.startsWith('/preview/post-shuffle/')||pathname==='/src/deck.mjs'||pathname.startsWith('/src/ritual-world/')||pathname.startsWith('/assets/rws/')||(gate==='b'&&pathname.startsWith('/assets/artemis/'))||(gate==='b'&&(pathname==='/ritual.html'||pathname.startsWith('/src/')));
  const resolved=resolve(root,'.'+pathname),extension=extname(resolved);
  if(!allowedRoot||!allowed.has(extension)||!resolved.startsWith(root+sep)){res.writeHead(404);res.end('Not found');return}
  const info=await stat(resolved);if(!info.isFile())throw Error('not a file');
  const payload=await readFile(resolved);res.writeHead(200,{'Content-Type':types[extension],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:payload);
 }catch{res.writeHead(404);res.end('Not found')}
});
server.listen(port,'127.0.0.1',()=>console.log('Gate '+gate.toUpperCase()+' review: http://127.0.0.1:'+port+'/preview/gate-'+gate+'/ (production unaffected)'));
