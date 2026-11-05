import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities,sampleLandingPose,sphericalPose,landingOpacity,entranceScale,landingAttitude,orbitDiagnostics,ENTRANCE_SECONDS,ORBIT_SPEED,INNER_CARD_COUNT,OUTER_CARD_COUNT} from '../src/ritual-world/OrbitalField.mjs';

test('all 78 original RWS illustrations map to unique deterministic card identities',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 assert.equal(cards.length,78);
 assert.equal(new Set(cards.map(c=>c.id)).size,78);
 assert.equal(cards.filter(c=>c.layer==='inner').length,INNER_CARD_COUNT);
 assert.equal(cards.filter(c=>c.layer==='outer').length,OUTER_CARD_COUNT);
 assert.equal(INNER_CARD_COUNT+OUTER_CARD_COUNT,78);
 assert.equal(cards.filter(c=>c.frontVisible).length,78);
 assert.equal(new Set(cards.map(c=>c.orbitSlot)).size,78);
 assert.ok(cards.every(c=>Object.isFrozen(c)&&c.width>0&&c.height>0));
 assert.throws(()=>makeLandingCardEntities(DECK.slice(1)),/78/);
});

test('entrance establishes the full two-layer shell rather than hiding while RWS artwork decodes',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 const before=cards.map(c=>sampleLandingPose(c,0));
 const after=cards.map(c=>sampleLandingPose(c,ENTRANCE_SECONDS+1));
 assert.ok(before.every(p=>p[2]>-11));
 assert.ok(after.some(p=>p[2]<-45));
 assert.ok(after.some(p=>p[2]>-9));
 assert.equal(landingOpacity(cards[0],0),0);
 assert.ok(cards.every(c=>landingOpacity(c,ENTRANCE_SECONDS+1)>.97));
 for(const c of cards)assert.deepEqual(sampleLandingPose(c,ENTRANCE_SECONDS+2),sphericalPose(c,ENTRANCE_SECONDS+2));
});

test('all cards move at shared constant orbital rate, with no yo-yo/pass spline',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 for(const t of [0,2,5,14,20,45,150]){
  const poses=cards.map(c=>sampleLandingPose(c,t));
  assert.ok(poses.every(p=>p.length===3&&p.every(Number.isFinite)));
  assert.deepEqual(poses[30],sampleLandingPose(cards[30],t));
 }
 assert.ok(cards.every(c=>c.passIndex===undefined));
 assert.ok(ORBIT_SPEED>.02&&ORBIT_SPEED<.06);
 const a=cards.map(c=>sphericalPose(c,6)),b=cards.map(c=>sphericalPose(c,18));
 assert.ok(cards.filter((c,i)=>Math.abs(b[i][0]-a[i][0])>.5).length>25);
});

test('visual seed randomizes card IDs and their orbital slots without changing Tarot draw identities',()=>{
 const a=makeLandingCardEntities(DECK,10001),b=makeLandingCardEntities(DECK,10002);
 assert.notDeepEqual(a.map(c=>c.orbitSlot),b.map(c=>c.orbitSlot));
 assert.notDeepEqual(a.map(c=>c.local),b.map(c=>c.local));
 assert.notDeepEqual(a.map(c=>c.reversed),b.map(c=>c.reversed));
 assert.deepEqual(a.map(c=>c.id),b.map(c=>c.id));
});

test('GPU renderer and Canvas fallback show backs immediately, then authentic fronts when loaded',async()=>{
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const canvas=await readFile(new URL('../src/ritual-world/CanvasOrbit.mjs',import.meta.url),'utf8');
 const preview=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 assert.match(gl,/this\.cards=makeLandingCardEntities\(cards,visualSeed\)/);
 assert.match(gl,/this\.faceAssetForId\(card\.id\)/);
 assert.match(gl,/uploadTile\(card\.index,img\)/);
 assert.match(gl,/backing\(ctx,x,y\)/);
 assert.doesNotMatch(gl,/if\(this\.loadedCount!==78\)\{this\.last=now/);
 assert.doesNotMatch(canvas,/if\(this\.loadedCount!==78\)\{this\.last=now/);
 assert.match(canvas,/src=pose\.frontFacingCamera\?this\.fronts\.get\(card\.id\)\|\|this\.back:this\.back/);
 assert.match(gl,/appendPremiumCard\(verts,card,position/);
 assert.match(preview,/ORBIT ACTIVE/);
});

test('asset pipeline still validates licensed original historical imagery',async()=>{
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

test('CTA can hide without recreating the 3D world, local preview stays isolated',async()=>{
 const html=await readFile(new URL('../preview/gate-a/index.html',import.meta.url),'utf8');
 const script=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/gate-a/gate-a.css',import.meta.url),'utf8');
 const server=await readFile(new URL('../scripts/serve-gate-a.mjs',import.meta.url),'utf8');
 assert.match(html,/v0\.8\.3 \/ GATE A/);
 assert.match(html,/id="hide-cta"/);
 assert.match(script,/page\.classList\.toggle\('review-no-cta',hide\)/);
 assert.match(css,/review-no-cta \.question-panel/);
 assert.match(server,/4183/);
 assert.match(server,/127\.0\.0\.1/);
 assert.doesNotMatch(server,/0\.0\.0\.0/);
});

test('inner sphere has readable density and natural front-back edge variation',()=>{
 const cards=makeLandingCardEntities(DECK,47925);
 const diag=orbitDiagnostics(cards,12);
 assert.equal(diag.inner,62);assert.equal(diag.outer,16);
 const attitudes=cards.map(c=>landingAttitude(c,sphericalPose(c,12),12));
 assert.ok(attitudes.some(a=>a.frontFacingCamera));
 assert.ok(attitudes.some(a=>!a.frontFacingCamera));
 assert.ok(attitudes.filter(a=>Math.abs(a.facing)<.4).length>1);
 assert.ok(cards.every(c=>c.frontVisible));
});
