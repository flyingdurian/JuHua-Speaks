import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FOIL_FINISHES,HOLOGRAM_STYLES,nextHologramStyle,chooseFoilFinish} from '../preview/post-shuffle/TarotTableau.mjs';
import {sampleVapor} from '../preview/post-shuffle/CardVapor.mjs';

test('four switchable hologram styles; deterministic wrap in both directions',()=>{
 assert.deepEqual(HOLOGRAM_STYLES,['prismatic','aurora','starfield','glass-spectrum']);
 assert.equal(FOIL_FINISHES,HOLOGRAM_STYLES);
 assert.equal(chooseFoilFinish(()=>0),'prismatic');
 assert.equal(chooseFoilFinish(()=>3),'glass-spectrum');
 assert.equal(nextHologramStyle('prismatic',1),'aurora');
 assert.equal(nextHologramStyle('glass-spectrum',1),'prismatic');
 assert.equal(nextHologramStyle('prismatic',-1),'glass-spectrum');
 assert.throws(()=>nextHologramStyle('foil'),/Invalid/);
});
test('reveal no longer renders a detached white flap; artwork is always original RWS',async()=>{
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 const scene=await readFile(new URL('../preview/post-shuffle/TarotTableau.mjs',import.meta.url),'utf8');
 assert.match(css,/\.ps-flip-inner::before\{content:none!important;display:none!important\}/);
 assert.match(css,/\.ps-card-back\{transform:translateZ\(\.65px\)!important\}/);
 assert.match(css,/\.ps-card-front\{transform:rotateY\(180deg\) translateZ\(\.65px\)!important\}/);
 assert.match(scene,/assets\/rws\//);
 assert.match(scene,/commonsThumbnailUrl/);
 assert.match(scene,/ps-hologram-controls/);
 assert.match(scene,/setHologramStyle/);
 assert.match(scene,/aria-live/);
 assert.match(scene,/ps-card-hologram ps-card-foil/);
 for(const style of HOLOGRAM_STYLES)assert.ok(css.includes('.ps-holo-'+style+' .ps-card-hologram'));
});
test('card-back ethereal veil uses bounded translucent curl-advection only',async()=>{
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 const vapor=await readFile(new URL('../preview/post-shuffle/CardVapor.mjs',import.meta.url),'utf8');
 assert.match(css,/\.ps-card-back::after\{content:none!important;display:none!important\}/);
 assert.match(css,/\.ps-vapor-cloud\.ps-vapor-near\{opacity:\.42/);
 assert.match(vapor,/const eddy=/);
 for(const t of [0,1.3,7.8,36.5]){
  for(const layer of [0,1]){
   const q=sampleVapor(.35,.57,t,layer);
   assert.ok(Number.isFinite(q)&&q>=0&&q<=.68);
  }
 }
});
