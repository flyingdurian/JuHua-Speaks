/** Restricted read-only Gate C 01–04 review server. Production routes are never served. */
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url))),port=Number(process.env.GATE_C14_PORT||4186);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp'};
createServer(async(req,res)=>{try{
 if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host)){res.writeHead(403);res.end();return}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
 const url=new URL(req.url||'/', 'http://127.0.0.1:'+port);
 const path=url.pathname==='/preview/gate-c14/'?'/preview/gate-c14/index.html':url.pathname;
 const allowed=path.startsWith('/preview/gate-c14/')||path.startsWith('/assets/gate-c14/')||path==='/src/deck.mjs'||path==='/src/gate-b-handoff.mjs';
 const file=resolve(root,'.'+decodeURIComponent(path)),type=types[extname(file)];
 if(!allowed||!type||!file.startsWith(root+sep)){res.writeHead(404);res.end('Not found');return}
 const s=await stat(file);if(!s.isFile())throw Error('Not a file');
 const data=await readFile(file);res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404);res.end('Not found')}
}).listen(port,'127.0.0.1',()=>console.log('Gate C 01–04: http://127.0.0.1:'+port+'/preview/gate-c14/'));
