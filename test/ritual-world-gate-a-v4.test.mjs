import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities,sphericalPose,sampleLandingPose,landingAttitude,orbitAngle,ORBIT_RADIUS,ORBIT_CENTER_Z,OUTER_ORBIT_RADIUS,OUTER_ORBIT_CENTER_Z,ORBIT_SPEED,ENTRANCE_SECONDS} from '../src/ritual-world/OrbitalField.mjs';
import {appendPremiumCard,CARD_PERIMETER,EDGE_THICKNESS} from '../src/ritual-world/CardSurface.mjs';
const cards=makeLandingCardEntities(DECK,47925);
const distance=(p,c)=>Math.hypot(p[0],p[1],p[2]-c.centerZ);
const f=720/(2*Math.tan(58*Math.PI/360));
function screenCard(c,t){const p=sphericalPose(c,t),z=-p[2];return {x:430+p[0]*f/z,y:360-p[1]*f/z,w:c.width*f/z,h:c.height*f/z,z};}
function visible(q){return q.z>0&&q.x+q.w/2>=0&&q.x-q.w/2<=860&&q.y+q.h/2>=0&&q.y-q.h/2<=720}

test('two coherent rigid shells preserve a clear inner sphere and sparse outer orbit',()=>{
 assert.equal(cards.length,78);
 assert.equal(cards.filter(c=>c.layer==='inner').length,62);
 assert.equal(cards.filter(c=>c.layer==='outer').length,16);
 assert.equal(new Set(cards.map(c=>c.id)).size,78);
 assert.ok(cards.every(c=>c.passIndex===undefined),'No tweened close passes');
 for(const t of [ENTRANCE_SECONDS+.1,5,10,20,30,60,120]){
  for(const c of cards){
   const p=sphericalPose(c,t);
   const target=c.layer==='inner'?ORBIT_RADIUS:OUTER_ORBIT_RADIUS;
   assert.ok(Math.abs(distance(p,c)-Math.hypot(...c.local))<1e-8);
   assert.ok(distance(p,c)>target*.99&&distance(p,c)<target*1.01);
  }
 }
 assert.equal(ORBIT_CENTER_Z,-23.5);
 assert.equal(OUTER_ORBIT_CENTER_Z,-28);
});
test('inner sphere stays large and readable at every recorded review timestamp',()=>{
 const visibleCounts=[];
 for(const t of [2,6,10,14,18,20]){
  const projected=cards.filter(c=>c.layer==='inner').map(c=>screenCard(c,t));
  const visibleCore=projected.filter(visible);
  visibleCounts.push(visibleCore.length);
  assert.ok(visibleCore.length>=53,'Compact core cannot disappear beyond viewport');
  const near=visibleCore.filter(q=>q.h>=32);
  assert.ok(near.length>=22,'Most illustrated/obsidian cards must be discernible in core');
 }
 const radius=f*ORBIT_RADIUS/Math.sqrt(ORBIT_CENTER_Z**2-ORBIT_RADIUS**2);
 assert.ok(radius>195&&radius<285,'Inner shell projected radius should resemble reference');
});
test('outer layer naturally produces at least one legible near pass over 20 seconds',()=>{
 for(const t of [5.5,14.5]){
  const projected=cards.filter(c=>c.layer==='outer').map(c=>screenCard(c,t));
  assert.ok(projected.some(q=>visible(q)&&q.h>130),'No foreground card visible at the intended orbital longitude');
 }
 for(const c of cards)assert.ok(Math.abs((orbitAngle(c,20)-orbitAngle(c,5))-15*ORBIT_SPEED)<1e-10);
});
test('historical fronts, black/navy backs, and thin edges all transition physically',()=>{
 const first=cards.map(c=>landingAttitude(c,sphericalPose(c,5),5));
 const later=cards.map(c=>landingAttitude(c,sphericalPose(c,23),23));
 const flips=first.filter((a,i)=>a.frontFacingCamera!==later[i].frontFacingCamera).length;
 assert.ok(flips>0);
 assert.ok(first.some(a=>a.frontFacingCamera));
 assert.ok(first.filter(a=>!a.frontFacingCamera).length>=35);
 assert.ok(first.filter(a=>Math.abs(a.facing)<.4).length>=3);
 for(const a of [...first,...later])assert.ok(a.normal.every(Number.isFinite));
});
test('reveal-safe materials preserve premium rounded geometry and genuine RWS texture mapping',()=>{
 assert.ok(EDGE_THICKNESS<.02&&EDGE_THICKNESS>.005);
 assert.ok(CARD_PERIMETER.length>=20);
 const c=cards[0],p=sphericalPose(c,5),att=landingAttitude(c,p,5),vertices=[];
 appendPremiumCard(vertices,c,p,att,1,1,(slot,u,v)=>[(slot%9+u)/9,(Math.floor(slot/9)+v)/9]);
 assert.ok(vertices.length>500&&vertices.length%18===0&&vertices.every(Number.isFinite));
 const source=String(appendPremiumCard);
 assert.match(source,/card\.index/);
 assert.match(source,/backSlot/);
});
test('WebGL and Canvas start orbit before downloads complete but never forge illustrated fronts',async()=>{
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const canvas=await readFile(new URL('../src/ritual-world/CanvasOrbit.mjs',import.meta.url),'utf8');
 const preview=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(gl,/if\(this\.loadedCount!==78\)\{this\.last=now/);
 assert.doesNotMatch(canvas,/if\(this\.loadedCount!==78\)\{this\.last=now/);
 assert.match(gl,/backing\(ctx,x,y\)/);
 assert.doesNotMatch(gl,/ctx\.fillText\('RWS'/);
 assert.match(canvas,/this\.fronts\.get\(card\.id\)\|\|this\.back/);
 assert.match(gl,/TILE_W=256,TILE_H=448/);
 assert.match(gl,/gl\.generateMipmap\(gl\.TEXTURE_2D\)/);
 assert.match(gl,/MAX_TEXTURE_SIZE/);
 assert.match(gl,/pixelStorei\(gl\.UNPACK_FLIP_Y_WEBGL,false\)/);
 assert.match(preview,/LOADING RWS ART/);
});
