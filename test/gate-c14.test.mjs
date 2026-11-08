import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {setTimeout as wait} from 'node:timers/promises';
import {DECK} from '../src/deck.mjs';
import {sphereLayout,projectCard,validateDeck,addChoice,removeChoice,assertSelection} from '../preview/gate-c14/geometry.mjs';
test('A physical 78-card celestial dome looks inward: distinct coordinates and full deck',()=>{
 const points=sphereLayout(),ids=DECK.map(x=>x.id);assert.equal(points.length,78);
 assert.equal(new Set(points.map(p=>p.vector.map(x=>x.toFixed(5)).join(','))).size,78);
 assert.deepEqual(validateDeck(ids),ids);assert.throws(()=>validateDeck(ids.slice(0,77)),/78/);
 assert.ok(points.map(p=>projectCard(p,0,0,1440,900)).filter(Boolean).length>=12);
});
test('Three selections are immutable; cannot duplicate, add a fourth, or forge identities',()=>{
 const ids=DECK.map(x=>x.id),old=[];let picks=old;
 for(let i=0;i<3;i++)picks=addChoice(picks,ids[i],i===1?'reversed':'upright',ids);
 assert.equal(old.length,0);assert.deepEqual(picks.map(x=>x.id),ids.slice(0,3));
 assert.equal(addChoice(picks,ids[3],'upright',ids),picks);assert.equal(addChoice(picks,ids[1],'reversed',ids),picks);
 assert.equal(assertSelection(picks,ids),true);assert.throws(()=>addChoice([], 'fake','upright',ids),/Unknown/);
 picks=removeChoice(picks,ids[1]);assert.deepEqual(picks.map(x=>x.id),[ids[0],ids[2]]);
});
test('Gate is restricted to scenes one through four with authored art and working input',async()=>{
 const read=path=>readFile(new URL('../'+path,import.meta.url));
 const [app,css,html,svg,texture]=await Promise.all(['preview/gate-c14/gate-c14.mjs','preview/gate-c14/gate-c14.css','preview/gate-c14/index.html','assets/gate-c14/gate-architecture.svg','assets/gate-c14/sphere-sanctuary.webp'].map(read));
 assert.match(app.toString(),/pointerdown/);assert.match(app.toString(),/pointerup/);
 assert.match(app.toString(),/focus-halo|class="focus"/);assert.doesNotMatch(app.toString(),/setPointerCapture/);
 assert.match(app.toString(),/REVIEW ENDS WITH THREE CARDS/);assert.doesNotMatch(app.toString(),/case 'collapse'/);
 assert.match(css.toString(),/gate-architecture.svg/);assert.match(css.toString(),/cube-face/);assert.match(css.toString(),/dome-rings/);
 assert.match(svg.toString(),/<svg/);assert.match(html.toString(),/gate-c14.mjs/);
 assert.equal(texture.toString('ascii',0,4),'RIFF');assert.equal(texture.toString('ascii',8,12),'WEBP');
});
test('Isolated Gate C preview serves art and no production route',async()=>{
 const port=45000+(process.pid%12000),base='http://127.0.0.1:'+port;
 const child=spawn(process.execPath,['scripts/serve-gate-c14.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,GATE_C14_PORT:String(port)},stdio:'ignore'});
 try{let ready=false;for(let i=0;i<40;i++){try{if((await fetch(base+'/preview/gate-c14/')).status===200){ready=true;break}}catch{}await wait(90)}assert.ok(ready);
  for(const path of ['/preview/gate-c14/index.html','/preview/gate-c14/gate-c14.css','/preview/gate-c14/gate-c14.mjs','/preview/gate-c14/geometry.mjs','/assets/gate-c14/card-back.svg','/assets/gate-c14/gate-architecture.svg','/assets/gate-c14/sphere-sanctuary.webp','/src/deck.mjs','/src/gate-b-handoff.mjs'])assert.equal((await fetch(base+path)).status,200,path);
  assert.equal((await fetch(base+'/ritual.html')).status,404);
 }finally{child.kill('SIGTERM')}
});
