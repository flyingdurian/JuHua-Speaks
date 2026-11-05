import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities,sampleLandingPose} from '../src/ritual-world/RitualWorld.mjs';
import {sphericalPose,landingOpacity,orbitDiagnostics,ENTRANCE_SECONDS} from '../src/ritual-world/OrbitalField.mjs';

test('78 unique RWS identities, front-facing art, randomized visual orientation and positions',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 assert.equal(cards.length,78);assert.equal(new Set(cards.map(c=>c.id)).size,78);
 assert.deepEqual(cards.map(c=>c.index),Array.from({length:78},(_,i)=>i));
 assert.equal(cards.filter(c=>c.frontVisible).length,78);
 assert.ok(cards.filter(c=>c.reversed).length>=10&&cards.filter(c=>c.reversed).length<=35);
 assert.equal(new Set(cards.map(c=>c.orbitSlot)).size,78);
 assert.ok(cards.every(c=>Object.isFrozen(c)&&c.width>0&&c.height>0));
 assert.throws(()=>makeLandingCardEntities(DECK.slice(1)),/78/);
});
test('entrance ejects cards from camera before assembling the wide celestial shell',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 const before=cards.map(c=>sampleLandingPose(c,0));
 const after=cards.map(c=>sampleLandingPose(c,ENTRANCE_SECONDS+1));
 assert.ok(before.every(p=>p[2]>-5));
 assert.ok(after.filter(p=>p[2]<-22).length>=60);
 assert.ok(after.some(p=>p[0]<-18)&&after.some(p=>p[0]>18));
 assert.ok(after.some(p=>p[1]<-15)&&after.some(p=>p[1]>15));
 assert.ok(after.some(p=>p[2]<-58));
 assert.equal(landingOpacity(cards[0],0),0);
 assert.ok(cards.every(c=>landingOpacity(c,ENTRANCE_SECONDS+1)>.98));
});
test('one orbital shell moves coherently with broad camera depth, not a picture-wall',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 for(const seconds of [0,1,2,5,14,29]){
  const poses=cards.map(c=>sampleLandingPose(c,seconds));
  assert.ok(poses.every(p=>p.length===3&&p.every(Number.isFinite)));
  assert.deepEqual(poses[30],sampleLandingPose(cards[30],seconds));
 }
 const a=cards.map(c=>sampleLandingPose(c,7)),b=cards.map(c=>sampleLandingPose(c,19));
 assert.ok(cards.filter((c,i)=>Math.abs(b[i][0]-a[i][0])>1).length>=30);
 assert.ok(new Set(cards.map(c=>Math.round(sphericalPose(c,8)[2]))).size>24);
});
test('fresh sessions randomize arrangement, orientation, and which cards pass the camera',()=>{
 const a=makeLandingCardEntities(DECK,10001),b=makeLandingCardEntities(DECK,10002);
 assert.notDeepEqual(a.map(c=>c.orbitSlot),b.map(c=>c.orbitSlot));
 assert.notDeepEqual(a.filter(c=>c.passIndex>=0).map(c=>c.id),b.filter(c=>c.passIndex>=0).map(c=>c.id));
 assert.notDeepEqual(a.map(c=>c.reversed),b.map(c=>c.reversed));
 assert.equal(a.filter(c=>c.passIndex>=0).length,5);
 assert.ok(orbitDiagnostics(a,11).farCount>=64);
 assert.ok([3,6,12,17,24].some(t=>orbitDiagnostics(a,t).closest>-10));
});
test('persistent GPU renderer and fallback share all 78 original front slots and orientation',async()=>{
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const canvas=await readFile(new URL('../src/ritual-world/CanvasOrbit.mjs',import.meta.url),'utf8');
 const preview=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 assert.match(gl,/this\.cards=makeLandingCardEntities\(cards,visualSeed\)/);
 assert.match(gl,/uploadTile\(card\.index,img\)/);
 assert.match(gl,/if\(this\.loadedCount!==78\)/);
 assert.match(canvas,/if\(this\.loadedCount!==78\)/);
 assert.match(gl,/pushQuad\(verts,f0,f1,f2,f3,card\.index/);
 assert.match(gl,/this\.faceAssetForId\(card\.id\)/);
 assert.doesNotMatch(gl,/if\(visibleFront\)\{right=right\.map/);
 assert.match(canvas,/this\.fronts\.get\(card\.id\)/);
 assert.match(canvas,/card\.reversed\?Math\.PI:0/);
 assert.match(preview,/visualSeed/);
 assert.match(preview,/78 FACES LOADED/);
});
test('preview requires original RWS assets, never silently paints fake front artwork',async()=>{
 const ensure=await readFile(new URL('../scripts/ensure-gate-a-assets.mjs',import.meta.url),'utf8');
 const sync=await readFile(new URL('../scripts/sync-rws-assets.mjs',import.meta.url),'utf8');
 const packageFile=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
 const manifest=JSON.parse(await readFile(new URL('../assets/rws/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.cards.length,78);
 assert.equal(new Set(manifest.cards.map(c=>c.id)).size,78);
 assert.match(ensure,/audit-assets\.mjs/);assert.match(ensure,/sync-rws-assets\.mjs/);
 assert.match(ensure,/RWS_SKIP_MANIFEST_WRITE:'1'/);
 assert.match(sync,/RWS_SKIP_MANIFEST_WRITE/);
 assert.match(packageFile.scripts['preview:gate-a'],/ensure-gate-a-assets/);
});
test('Gate A is isolated from production flow, Exodia and Gate B',async()=>{
 const html=await readFile(new URL('../preview/gate-a/index.html',import.meta.url),'utf8');
 const launch=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 const server=await readFile(new URL('../scripts/serve-gate-a.mjs',import.meta.url),'utf8');
 assert.match(html,/v0\.8\.3 \/ GATE A/);
 assert.match(launch,/RitualWorld/);assert.match(launch,/CanvasOrbit/);
 assert.match(server,/4183/);assert.match(server,/127\.0\.0\.1/);
 assert.doesNotMatch(server,/0\.0\.0\.0/);
});
