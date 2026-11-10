import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {setTimeout as wait} from 'node:timers/promises';
import {DECK} from '../src/deck.mjs';
const source=p=>readFile(new URL('../'+p,import.meta.url));
test('Gate C is a real 78-card world rather than three hard-coded results',async()=>{
 const world=(await source('preview/gate-c/gate-c.mjs')).toString();
 assert.equal(DECK.length,78);assert.equal(new Set(DECK.map(c=>c.id)).size,78);
 assert.match(world,/shuffleDeck\(\)/);
 assert.match(world,/parseGateBHandoff/);
 assert.match(world,/drawOrientation\(\)/);
 assert.match(world,/picks\.length>=3/);
 assert.match(world,/unselected\.length!==75/);
 assert.match(world,/data-returned-id/);
 assert.match(world,/pointerdown/);assert.match(world,/pointermove/);
 assert.doesNotMatch(world,/setPointerCapture/,'Avoid the previous click-retargeting defect');
});
test('Gate C uses dedicated authored imagery and a non-rectangular ritual space',async()=>{
 const [css,html,scene]=await Promise.all(['preview/gate-c/gate-c.css','preview/gate-c/index.html','preview/gate-c/scene.mjs'].map(async p=>(await source(p)).toString()));
 assert.match(html,/gate-c\.mjs/);
 assert.match(css,/assets\/gate-c\/sphere\.webp/);
 assert.match(css,/assets\/gate-c\/collapse\.webp/);
 assert.match(css,/scene-art/);
 assert.match(scene,/function globe/);
 assert.match(scene,/function voidField/);
 for(const path of ['assets/gate-c/sphere.webp','assets/gate-c/collapse.webp']){const a=await source(path);assert.equal(a.subarray(0,4).toString('ascii'),'RIFF');assert.equal(a.subarray(8,12).toString('ascii'),'WEBP');assert.ok(a.length>40000)}
});
test('Gate C standalone preview serves painted assets without exposing production',async()=>{
 const port=45000+(process.pid%10000),host='http://127.0.0.1:'+port;
 const child=spawn(process.execPath,['scripts/serve-gate-c.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,GATE_C_PORT:String(port)},stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<35;i++){try{const r=await fetch(host+'/preview/gate-c/');if(r.status===200){ready=true;break}}catch{}await wait(100)}
  assert.ok(ready,'review server must become available');
  for(const [path,mime] of [['/preview/gate-c/','text/html'],['/preview/gate-c/gate-c.mjs','text/javascript'],['/preview/gate-c/scene.mjs','text/javascript'],['/preview/gate-c/gate-c.css','text/css'],['/assets/gate-c/sphere.webp','image/webp'],['/assets/gate-c/collapse.webp','image/webp'],['/src/gate-b-handoff.mjs','text/javascript']]){
   const r=await fetch(host+path);assert.equal(r.status,200,path);assert.ok(r.headers.get('content-type').includes(mime),path);
  }
  assert.equal((await fetch(host+'/ritual.html')).status,404,'Gate C preview must not route to production');
 }finally{child.kill('SIGTERM')}
});
