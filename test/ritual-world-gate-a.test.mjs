import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities,sphericalPose,sampleLandingPose,entranceProgress,entranceDuration,landingAttitude,orbitDiagnostics,ENTRANCE_SECONDS,OUTSIDE_ENTRANCE_SECONDS,ENTRANCE_MODES,ORBIT_LAYERS,ORBIT_SPEED} from '../src/ritual-world/OrbitalField.mjs';

test('78 unique RWS card IDs persist across four seeded orbital scales',()=>{
 const a=makeLandingCardEntities(DECK,47925),b=makeLandingCardEntities(DECK,10002);
 assert.equal(a.length,78);assert.equal(new Set(a.map(x=>x.id)).size,78);
 assert.equal(a.filter(c=>c.frontVisible).length,78);
 assert.deepEqual(ORBIT_LAYERS.map(l=>l.count),[50,12,10,6]);
 assert.deepEqual(ORBIT_LAYERS.map(l=>a.filter(c=>c.orbitScale===l.id).length),[50,12,10,6]);
 assert.equal(a.filter(c=>c.layer==='inner').length,62);
 assert.equal(a.filter(c=>c.layer==='outer').length,16);
 assert.equal(new Set(a.map(c=>c.orbitSlot)).size,78);
 assert.deepEqual(a.map(c=>c.id),b.map(c=>c.id));
 assert.notDeepEqual(a.map(c=>c.local),b.map(c=>c.local));
 assert.ok(a.every(c=>Object.isFrozen(c)&&c.width>0&&c.height>0));
 assert.throws(()=>makeLandingCardEntities(DECK.slice(1)),/78/);
});

test('two distinct entrance rituals share identical final orbital world',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 assert.deepEqual(ENTRANCE_MODES,['inside-out','outside-in']);
 assert.equal(entranceDuration('inside-out'),ENTRANCE_SECONDS);
 assert.equal(entranceDuration('outside-in'),OUTSIDE_ENTRANCE_SECONDS);
 assert.ok(OUTSIDE_ENTRANCE_SECONDS>=3&&OUTSIDE_ENTRANCE_SECONDS<=5);
 for(const mode of ENTRANCE_MODES){
  assert.ok(cards.some(c=>entranceProgress(c,0,mode)===0));
  assert.ok(cards.some(c=>!Object.is(sampleLandingPose(c,0,mode)[0],sphericalPose(c,0)[0])));
  for(const c of cards){
   const t=OUTSIDE_ENTRANCE_SECONDS+2;
   assert.deepEqual(sampleLandingPose(c,t,mode),sphericalPose(c,t));
  }
 }
 const c=cards[0];
 assert.notDeepEqual(sampleLandingPose(c,.5,'inside-out'),sampleLandingPose(c,.5,'outside-in'));
});

test('no yo-yo motion or changing orbital radii after either entrance',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 assert.ok(cards.every(c=>c.passIndex===undefined));
 for(const t of [5,10,20,30,90,150]){
  for(const c of cards){
   const p=sphericalPose(c,t);
   const r=Math.hypot(p[0],p[1],p[2]-c.centerZ);
   assert.ok(Math.abs(r-c.orbitRadius)<1e-8);
   const layer=ORBIT_LAYERS.find(l=>l.id===c.orbitScale);
   assert.ok(Math.abs(r-layer.radius)<layer.radius*.01);
   assert.ok(p.every(Number.isFinite));
  }
 }
 assert.ok(ORBIT_SPEED>.02&&ORBIT_SPEED<.05);
});

test('mixed physical backs and fronts are visible without forced billboard orientation',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 for(const t of [5,12,25]){
  const attitudes=cards.map(c=>landingAttitude(c,sphericalPose(c,t),t));
  assert.ok(attitudes.some(a=>a.frontFacingCamera));
  assert.ok(attitudes.some(a=>!a.frontFacingCamera));
  assert.ok(attitudes.some(a=>Math.abs(a.facing)<.4));
  assert.ok(attitudes.every(a=>a.normal.every(Number.isFinite)));
 }
 const diag=orbitDiagnostics(cards,12);
 assert.equal(diag.scales.length,4);
 assert.equal(diag.inner+diag.outer,78);
});

test('historical assets verified through existing local importer',async()=>{
 const ensure=await readFile(new URL('../scripts/ensure-gate-a-assets.mjs',import.meta.url),'utf8');
 const sync=await readFile(new URL('../scripts/sync-rws-assets.mjs',import.meta.url),'utf8');
 const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
 const manifest=JSON.parse(await readFile(new URL('../assets/rws/manifest.json',import.meta.url),'utf8'));
 assert.equal(manifest.cards.length,78);
 assert.equal(new Set(manifest.cards.map(c=>c.id)).size,78);
 assert.match(ensure,/audit-assets\.mjs/);
 assert.match(ensure,/sync-rws-assets\.mjs/);
 assert.match(sync,/RWS_SKIP_MANIFEST_WRITE/);
 assert.match(pkg.scripts['preview:gate-a'],/ensure-gate-a-assets/);
});

test('preview remains isolated and CTA hiding does not recreate GPU world',async()=>{
 const html=await readFile(new URL('../preview/gate-a/index.html',import.meta.url),'utf8');
 const js=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/gate-a/gate-a.css',import.meta.url),'utf8');
 const server=await readFile(new URL('../scripts/serve-gate-a.mjs',import.meta.url),'utf8');
 assert.match(html,/v0\.8\.3 \/ GATE A v6/);
 assert.match(html,/id="hide-cta"/);
 assert.match(html,/id="change-entrance"/);
 assert.match(html,/id="replay-entrance"/);
 assert.match(js,/page\.classList\.toggle\('review-no-cta',hide\)/);
 assert.match(js,/runEntrance\(mode\)/);
 assert.match(css,/review-no-cta \.question-panel/);
 assert.match(server,/4183/);
 assert.match(server,/127\.0\.0\.1/);
 assert.doesNotMatch(server,/0\.0\.0\.0/);
});
