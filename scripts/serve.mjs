import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const type={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT||4173);
createServer(async(req,res)=>{
 try{
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  const route=decodeURIComponent(url.pathname);
  const file=resolve(root,'.'+(route==='/'?'/index.html':route));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end('Method Not Allowed');return}
  const info=await stat(file);
  if(!info.isFile())throw new Error('not a file');
  const body=await readFile(file);
  res.writeHead(200,{'content-type':type[extname(file)]||'application/octet-stream','cache-control':'no-cache','x-content-type-options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404,{'content-type':'text/plain'});res.end('Not found')}
}).listen(port,'127.0.0.1',()=>console.log(`菊花说 dev server: http://127.0.0.1:${port}`));
