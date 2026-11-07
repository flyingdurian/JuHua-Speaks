import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const gate=process.env.JUHUA_PREVIEW_GATE==='b'?'b':'a';
const port=Number(gate==='b'?(process.env.GATE_B_PORT||4184):(process.env.GATE_A_PORT||4183));
const allowed=new Set(['.html','.css','.mjs','.js','.jpg','.png','.json']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host)){res.writeHead(403);res.end();return}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return}
  const url=new URL(req.url||'/',`http://127.0.0.1:${port}`),path=decodeURIComponent(url.pathname);
  const pathname=path==='/'?'/preview/gate-'+gate+'/index.html':path.endsWith('/')?path+'index.html':path;
  // Gate B preview may continue into the isolated Phase 8.2 ritual app.
  // Gate A still exposes only its original restricted asset set.
  const allowedRoot=pathname.startsWith('/preview/gate-a/')||pathname.startsWith('/preview/gate-b/')||pathname==='/src/deck.mjs'||pathname.startsWith('/src/ritual-world/')||pathname.startsWith('/assets/rws/')||(gate==='b'&&(pathname==='/ritual.html'||pathname.startsWith('/src/')));
  const resolved=resolve(root,'.'+pathname),extension=extname(resolved);
  if(!allowedRoot||!allowed.has(extension)||!resolved.startsWith(root+sep)){res.writeHead(404);res.end('Not found');return}
  const info=await stat(resolved);if(!info.isFile())throw Error('not a file');
  const payload=await readFile(resolved);res.writeHead(200,{'Content-Type':types[extension],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:payload);
 }catch{res.writeHead(404);res.end('Not found')}
});
server.listen(port,'127.0.0.1',()=>console.log('Gate '+gate.toUpperCase()+' review: http://127.0.0.1:'+port+'/preview/gate-'+gate+'/ (production unaffected)'));
