import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';
import {deckInstanceLayout,DECK_SHEET_STEP,DECK_SHEET_THICKNESS,DECK_AIR_GAP,DECK_INSTANCE_COUNT} from '../src/ritual-world/InstancedDeck.mjs';
const cards=makeLandingCardEntities(DECK,2165840022);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
test('78 separate thin instances with positive air-gaps, correct back orientation',()=>{
 assert.equal(DECK_INSTANCE_COUNT,78);
 assert.ok(DECK_AIR_GAP>.007&&DECK_AIR_GAP<.009);
 for(const zoom of [0,.3,1]){
  const instances=deckInstanceLayout(cards,32.5,zoom).sort((a,b)=>a.rank-b.rank);
  assert.equal(new Set(instances.map(v=>v.id)).size,78);
  assert.ok(instances.every(v=>v.normal[2]<-.25));
  const layers=instances.map(v=>dot(v.position,instances[0].normal));
  assert.ok(layers.every((x,i)=>i===0||x>layers[i-1]+DECK_SHEET_THICKNESS),'Overlapping layers');
  const nearest=instances.reduce((a,b)=>a.position[2]>b.position[2]?a:b);
  assert.ok(nearest.position[0]>0,'Navy back on right, card edges left');
 }
});
test('GPU instancing and a true shadow-depth framebuffer, never a combined slab',async()=>{
 const code=await readFile(new URL('../src/ritual-world/InstancedDeck.mjs',import.meta.url),'utf8');
 const root=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 assert.match(code,/vertexAttribDivisor\(loc,1\)/);
 assert.equal((code.match(/gl\.drawArraysInstanced\(/g)||[]).length,2);
 assert.match(code,/DEPTH_COMPONENT24/);
 assert.match(code,/framebufferTexture2D/);
 assert.match(root,/this\.instancedDeck\.render/);
});

test('ref1 suspended-deck proportions: pull back rather than push towards camera',()=>{
 const atStart=deckInstanceLayout(cards,32.5,0);
 const atRest=deckInstanceLayout(cards,32.5,1);
 const avgZ=arr=>arr.reduce((sum,c)=>sum+c.position[2],0)/arr.length;
 const averageScale=arr=>arr.reduce((sum,c)=>sum+c.scale,0)/arr.length;
 assert.ok(avgZ(atRest)<avgZ(atStart)-.9,'resting deck must move AWAY from camera');
 assert.ok(averageScale(atRest)<averageScale(atStart),'resting deck must shrink modestly, not grow');
 assert.ok(avgZ(atRest)<-15,'deck should remain a small silhouette in deep space');
 const sorted=atRest.toSorted((a,b)=>a.rank-b.rank);
 assert.equal(new Set(sorted.map(c=>c.id)).size,78);
 const layers=sorted.map(c=>dot(c.position,sorted[0].normal));
 assert.ok(layers.every((n,i)=>i===0||n>layers[i-1]+DECK_SHEET_THICKNESS*.85),'micro-stagger must not collapse the air gaps');
 const deviations=sorted.map((c,i)=>{
  const original=atStart.find(v=>v.id===c.id);
  return [c.position[0]/.895-original.position[0],c.position[1]/.895-original.position[1]];
 });
 assert.ok(new Set(deviations.map(d=>d.map(x=>x.toFixed(3)).join(','))).size>35,
  'deck edges need organic variation rather than repeated barcode alignment');
});
test('one shared detailed celestial back engraving across Gate B and Gate C',async()=>{
 const art=await readFile(new URL('../src/ritual-world/EngravedBack.mjs',import.meta.url),'utf8');
 const ritual=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const sphere=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 assert.match(art,/paintCelestialBack/);
 for(const motif of ['compass(ctx)','crescent(ctx','star(ctx','border(ctx'])assert.ok(art.includes(motif),motif);
 assert.match(ritual,/paintCelestialBack\(ctx,x,y,TILE_W,TILE_H\)/);
 assert.match(sphere,/paintCelestialBack\(ctx,x,y,W,H\)/);
});
