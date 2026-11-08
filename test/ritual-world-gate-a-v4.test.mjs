/**
 * Historical filename retained for CI compatibility.
 * Updated to verify Gate A v7 geometry, solid materials and orbit fidelity.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities,sphericalPose,landingAttitude,orbitAngle,ORBIT_LAYERS,ORBIT_SPEED,ENTRANCE_SECONDS,OUTSIDE_ENTRANCE_SECONDS} from '../src/ritual-world/OrbitalField.mjs';
import {appendPremiumCard,CARD_PERIMETER,EDGE_THICKNESS} from '../src/ritual-world/CardSurface.mjs';
const cards=makeLandingCardEntities(DECK,47925);
const f=720/(2*Math.tan(58*Math.PI/360));
function screenCard(c,t){
 const p=sphericalPose(c,t),z=-p[2];return {x:430+p[0]*f/z,y:360-p[1]*f/z,w:c.width*f/z,h:c.height*f/z,z};
}
function visible(q){return q.z>0&&q.x+q.w/2>=0&&q.x-q.w/2<=860&&q.y+q.h/2>=0&&q.y-q.h/2<=720}

test('four ordinal orbital scales retain approximately original v5 central sphere framing',()=>{
 assert.deepEqual(ORBIT_LAYERS.map(l=>l.count),[46,11,15,6]);
 for(const t of [2,6,10,14,18,20,26]){
  const core=cards.filter(c=>c.layer==='inner').map(c=>screenCard(c,t));
  assert.ok(core.filter(visible).length>=46,'Most core+halo cards remain framed');
  assert.ok(core.filter(q=>visible(q)&&q.h>=21).length>=18,'Core contains legible cards');
 }
 const core=ORBIT_LAYERS[0];
 const radius=f*core.radius/Math.sqrt(core.centerZ**2-core.radius**2);
 assert.ok(radius>195&&radius<275,'Inner shell remains compact and visible');
});

test('some outer cards pass near the viewer naturally without radial interpolation',()=>{
 const passing=cards.filter(c=>c.orbitScale==='flyby');
 assert.equal(passing.length,6);
 assert.equal(passing.filter(c=>c.featured).length,2);
 for(const t of [5.5,14.5]){
  const projected=passing.map(c=>screenCard(c,t));
  assert.ok(projected.some(q=>visible(q)&&q.h>125),'A featured card should pass close at '+t);
 }
 for(const c of cards){
  assert.ok(Math.abs(orbitAngle(c,20)-orbitAngle(c,5)-ORBIT_SPEED*15)<1e-10);
  assert.equal(c.passIndex,undefined);
 }
});

test('front/back and edge transitions remain physical, not camera-facing billboards',()=>{
 const a=cards.map(c=>landingAttitude(c,sphericalPose(c,5),5));
 const b=cards.map(c=>landingAttitude(c,sphericalPose(c,25),25));
 assert.ok(a.some(x=>x.frontFacingCamera));
 assert.ok(a.filter(x=>!x.frontFacingCamera).length>=38);
 assert.ok(a.filter(x=>Math.abs(x.facing)<.38).length>=3);
 assert.ok(a.filter((x,i)=>x.frontFacingCamera!==b[i].frontFacingCamera).length>0);
});

test('polished rounded cards retain true front/back geometry',()=>{
 assert.ok(EDGE_THICKNESS>.005&&EDGE_THICKNESS<.02);
 assert.ok(CARD_PERIMETER.length>=20);
 const c=cards[0],p=sphericalPose(c,6),a=landingAttitude(c,p,6),vertices=[];
 appendPremiumCard(vertices,c,p,a,1,1,(slot,u,v)=>[(slot%9+u)/9,(Math.floor(slot/9)+v)/9]);
 assert.ok(vertices.length>500&&vertices.length%18===0&&vertices.every(Number.isFinite));
 assert.match(String(appendPremiumCard),/card\.index/);
 assert.match(String(appendPremiumCard),/backSlot/);
});

test('WebGL and Canvas are opaque after entrance, with proper depth testing',async()=>{
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const canvas=await readFile(new URL('../src/ritual-world/CanvasOrbit.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/gate-a/gate-a.css',import.meta.url),'utf8');
 // Gate A remains fully opaque. Gate B alone may draw history ghosts; normal
 // atlas faces must still use an exact full-alpha, zero-tint main pass.
 assert.match(gl,/gl\.uniform1f\(this\.locPassAlpha,1\)/);
 assert.match(gl,/gl\.uniform1f\(this\.locEchoTone,0\)/);
 assert.match(gl,/this\.phase==='shuffle_ritual'&&this\.shuffleStyle==='auto'/);
 assert.match(gl,/gl\.disable\(gl\.BLEND\)/);
 assert.match(gl,/gl\.depthMask\(true\)/);
 assert.match(canvas,/ctx\.globalAlpha=1/);
 assert.match(css,/\.world-root canvas\{opacity:1!important\}/);
 assert.doesNotMatch(gl,/base\.a\*clamp\(vLight/);
});

test('two reproducible refresh-entry variants and bounded starfield work',async()=>{
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const canvas=await readFile(new URL('../src/ritual-world/CanvasOrbit.mjs',import.meta.url),'utf8');
 const preview=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/gate-a/gate-a.css',import.meta.url),'utf8');
 const html=await readFile(new URL('../preview/gate-a/index.html',import.meta.url),'utf8');
 assert.equal(ENTRANCE_SECONDS,1.7);
 assert.ok(OUTSIDE_ENTRANCE_SECONDS>=3&&OUTSIDE_ENTRANCE_SECONDS<=5);
 assert.match(gl,/restartEntrance\(mode\)/);
 assert.match(canvas,/restartEntrance\(mode\)/);
 assert.match(preview,/get\('entrance'\)/);
 assert.match(preview,/visualSeed%2/);
 assert.match(preview,/world\.restartEntrance\(mode\)/);
 assert.match(html,/id="change-entrance"/);
 assert.match(html,/id="replay-entrance"/);
 assert.match(preview,/initCelestialSky/);
 const sky=await readFile(new URL('../src/ritual-world/CelestialSky.mjs',import.meta.url),'utf8');
 assert.match(sky,/STAR_COUNTS/);
 assert.match(sky,/NEBULA_SIZE/);
 assert.match(sky,/putImageData/);
 assert.doesNotMatch(sky,/requestAnimationFrame\(/);
 assert.doesNotMatch(preview,/requestAnimationFrame\(/,'Star background is painted only on load/resize');
 assert.match(css,/space-background:before/);
 assert.match(css,/max-width:500px/);
});

test('historical fronts are not replaced by generated artwork and keep atlas quality',async()=>{
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 assert.match(gl,/TILE_W=256,TILE_H=448/);
 assert.match(gl,/this\.faceAssetForId\(card\.id\)/);
 assert.match(gl,/gl\.generateMipmap\(gl\.TEXTURE_2D\)/);
 assert.match(gl,/pixelStorei\(gl\.UNPACK_FLIP_Y_WEBGL,false\)/);
 assert.match(gl,/MAX_TEXTURE_SIZE/);
 assert.match(gl,/backing\(ctx,x,y\)/);
});
