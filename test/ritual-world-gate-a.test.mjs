import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities,sampleLandingPose} from '../src/ritual-world/RitualWorld.mjs';

test('78 individually identified card objects retain immutable identities',()=>{
 const a=makeLandingCardEntities(DECK);
 assert.equal(a.length,78);assert.equal(new Set(a.map(c=>c.id)).size,78);
 assert.ok(a.every(Object.isFrozen));assert.ok(a.every(c=>c.width>0&&c.height>0));
 assert.throws(()=>makeLandingCardEntities(DECK.slice(1)),/78/);
});
test('landing orbit is large, deterministic and animated with true depth',()=>{
 const a=makeLandingCardEntities(DECK);
 for(const s of [0,2,7,15,27]){
  const xyz=a.map(c=>sampleLandingPose(c,s));
  assert.ok(xyz.every(p=>p.length===3&&p.every(Number.isFinite)));
  assert.ok(xyz.some(p=>p[2]<-58));
  assert.ok(xyz.some(p=>p[2]>-30));
  assert.ok(xyz.some(p=>p[0]<-10)&&xyz.some(p=>p[0]>10));
  assert.deepEqual(xyz[11],sampleLandingPose(a[11],s));
 }
 assert.notDeepEqual(sampleLandingPose(a[7],0),sampleLandingPose(a[7],15));
});
test('mostly distant orbit prevents permanent close-up crowding',()=>{
 const cards=makeLandingCardEntities(DECK);
 assert.equal(cards.filter(c=>c.layer==='near').length,5);
 assert.equal(cards.filter(c=>c.layer==='mid').length,15);
 for(const t of [0,1,2,4,8,12,15]){
  const p=cards.map(c=>sampleLandingPose(c,t));
  assert.ok(p.filter(pos=>pos[2]<-20).length>=65);
 }
});
test('one renderer owns camera and card lifetime; RWS textures use exact semantic IDs',async()=>{
 const code=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 assert.match(code,/class RitualWorld/);assert.match(code,/this\.cards=makeLandingCardEntities\(cards\)/);
 assert.match(code,/appendBox\(vertices,card/);assert.match(code,/this\.faceAssetForId\(card\.id\)/);
 assert.match(code,/pushQuad\(verts,f0,f1,f2,f3/);assert.match(code,/pushQuad\(verts,f0,b0,b1,f1/);
 assert.doesNotMatch(code,/ritual-cinema|ritual-swirl/);
});
test('Gate A preview is isolated from production flow',async()=>{
 const html=await readFile(new URL('../preview/gate-a/index.html',import.meta.url),'utf8');
 const launch=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 const server=await readFile(new URL('../scripts/serve-gate-a.mjs',import.meta.url),'utf8');
 assert.match(html,/v0\.8\.3 \/ GATE A/);
 assert.match(launch,/RitualWorld/);assert.match(launch,/CanvasOrbit/);
 assert.match(server,/4183/);assert.match(server,/127\.0\.0\.1/);
 assert.doesNotMatch(server,/0\.0\.0\.0/);
});
