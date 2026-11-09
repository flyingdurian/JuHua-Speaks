import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {valueNoise2,sampleVapor} from '../preview/post-shuffle/CardVapor.mjs';
import {deckPacketLayout,deckInstanceLayout} from '../src/ritual-world/InstancedDeck.mjs';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';

const cards=makeLandingCardEntities(DECK,2165840022);
test('v3.2 matte paper packets are exactly seven physical side skins',()=>{
 const sheets=deckInstanceLayout(cards,31,1),skins=deckPacketLayout(sheets);
 assert.equal(sheets.length,78);
 assert.equal(skins.length,7);
 assert.equal(skins.reduce((n,p)=>n+p.sheets,0),78);
 assert.ok(skins.every(p=>p.scale>0&&p.thickness>.12&&p.thickness<.25));
 assert.ok(skins.every(p=>p.position.every(Number.isFinite)));
 assert.deepEqual(skins.map(p=>p.packet),[0,1,2,3,4,5,6]);
});
test('v3.2 layered vapor is procedural moving noise, not drifted CSS blobs',()=>{
 for(const xy of [[.25,.36],[.5,.5],[.7,.82]]){
  assert.equal(valueNoise2(xy[0],xy[1]),valueNoise2(xy[0],xy[1]),'noise deterministic');
 }
 const first=Array.from({length:80},(_,k)=>sampleVapor((k%10+.5)/10,(Math.floor(k/10)+.5)/8,1.8,0));
 const later=Array.from({length:80},(_,k)=>sampleVapor((k%10+.5)/10,(Math.floor(k/10)+.5)/8,4.3,0));
 const other=Array.from({length:80},(_,k)=>sampleVapor((k%10+.5)/10,(Math.floor(k/10)+.5)/8,1.8,1));
 assert.ok(first.every(n=>Number.isFinite(n)&&n>=0&&n<=1));
 assert.ok(first.some((n,i)=>Math.abs(n-later[i])>.07),'smoke must physically advect over time');
 assert.ok(first.some((n,i)=>Math.abs(n-other[i])>.07),'two independently advected transparency fields');
});
test('v3.2 fail-closed artwork and 3D transforms must be present',async()=>{
 const tableau=await readFile(new URL('../preview/post-shuffle/TarotTableau.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 const smoke=await readFile(new URL('../scripts/smoke-post-shuffle.mjs',import.meta.url),'utf8');
 const deck=await readFile(new URL('../src/ritual-world/InstancedDeck.mjs',import.meta.url),'utf8');
 assert.match(tableau,/image\.naturalWidth>0&&image\.naturalHeight>0/);
 assert.match(tableau,/button\.disabled=true/);
 assert.match(tableau,/vapor\.attach\(back\)/);
 assert.match(tableau,/backWarning\.hidden=false/);
 assert.match(css,/filter:none!important;transform-style:preserve-3d/);
 assert.match(css,/rotateX\(2\.4deg\) rotateY\(-6deg\)/);
 assert.match(css,/grid-template-rows:clamp\(24px,4vh,35px\) max-content var\(--ps-reading-height\)/);
 assert.match(css,/\.ps-vapor-cloud/);
 assert.match(smoke,/naturalWidth>0&&img\.naturalHeight>0/);
 assert.match(smoke,/vaporPixels>400/);
 assert.match(smoke,/cardTextGap>=0&&cardTextGap<29/);
 assert.match(deck,/packetVao/);
 assert.match(deck,/color=vec4\(\.866,\.870,\.864,1\.\);return;/);
});
