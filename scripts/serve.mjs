import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createLocalExodiaAdapter} from './exodia-local.mjs';

const root=resolve(import.meta.dirname,'..');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||4173);
const exodia=createLocalExodiaAdapter();
const hosts=new Set(['127.0.0.1:'+port,'localhost:'+port]);
const origins=new Set(['http://127.0.0.1:'+port,'http://localhost:'+port]);
const reply=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
function verifyLocalRequest(req){
 if(!hosts.has(req.headers.host))return false;
 const origin=req.headers.origin;
 return !origin||origins.has(origin);
}
async function readJson(req){
 const max=16000;
 const chunks=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>max)throw Object.assign(new Error('Request is too large'),{status:413});chunks.push(chunk);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
 catch{throw Object.assign(new Error('Invalid JSON'),{status:400});}
}
async function handleApi(req,res,path){
 if(!verifyLocalRequest(req))return reply(res,403,{error:'Local-only request denied'});
 if(path==='/api/local-exodia/status'&&req.method==='GET')return reply(res,200,exodia.status());
 if(path!=='/api/local-exodia/reading'||req.method!=='POST')return reply(res,405,{error:'Method not allowed'});
 if(!req.headers.origin||!origins.has(req.headers.origin)||req.headers['x-juhua-local-client']!=='1'||!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return reply(res,403,{error:'Same-origin JSON request required'});
 try{
  const body=await readJson(req);
  const result=await exodia.generate(body);
  return reply(res,200,result);
 }catch(e){return reply(res,e.status||502,{error:e.message||'Local generation failed'});}
}
createServer(async(req,res)=>{
 try{
  if(!verifyLocalRequest(req))return reply(res,403,{error:'Local host required'});
  const url=new URL(req.url||'/', 'http://127.0.0.1:'+port);
  const path=decodeURIComponent(url.pathname);
  if(path.startsWith('/api/'))return handleApi(req,res,path);
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Method Not Allowed');return;}
  // Only web UI files are served. This does not expose the Exodia adapter, secrets, or Git files.
  const safe=path==='/'||path==='/index.html'||(path.startsWith('/src/')&&/\.(mjs|css|js)$/.test(path))||(path.startsWith('/assets/rws/')&&/\.(jpg|png|json)$/.test(path));
  if(!safe){res.writeHead(404);res.end('Not found');return;}
  const file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
  const info=await stat(file);if(!info.isFile())throw new Error('Not a file');
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('菊花说 local app: http://127.0.0.1:'+port+' (Exodia adapter local only)'));
