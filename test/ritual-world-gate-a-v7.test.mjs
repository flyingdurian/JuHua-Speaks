import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {ORBIT_LAYERS,OUTSIDE_ENTRANCE_SECONDS,ENTRANCE_SECONDS,makeLandingCardEntities,
 sampleLandingPose,sphericalPose,entranceDelay,entranceProgress,entranceScale,landingVisible,
 outsideArrivalPose,orbitAngle} from '../src/ritual-world/OrbitalField.mjs';
import {STAR_COUNTS,NEBULA_SIZE,ATMOSPHERE_PALETTES} from '../src/ritual-world/CelestialSky.mjs';

const cards=makeLandingCardEntities(DECK,47925);
const byLayer=id=>cards.filter(c=>c.orbitScale===id);
const f=720/(2*Math.tan(58*Math.PI/360));
const projected=(p,card)=>{const z=-p[2];return {x:430+p[0]*f/z,y:360-p[1]*f/z,z,h:card.height*f/z}};
const onScreen=p=>p.x>=-20&&p.x<=880&&p.y>=-20&&p.y<=740;

test('v7 rebalances cards into three depth groups without changing 6 near flybys',()=>{
 assert.deepEqual(ORBIT_LAYERS.map(x=>x.count),[46,11,15,6]);
 assert.equal(cards.length,78);
 assert.equal(new Set(cards.map(c=>c.id)).size,78);
 assert.equal(byLayer('flyby').length,6);
 assert.equal(byLayer('orbit').length,15);
 assert.equal(byLayer('core').length+byLayer('halo').length,57);
 assert.ok(ORBIT_LAYERS[0].centerZ< -24,'Main shell is slightly farther than v6');
 assert.equal(ORBIT_LAYERS[3].radius,23.5,'Approved flyby radius remains unchanged');
 assert.equal(ORBIT_LAYERS[3].centerZ,-28.5,'Approved flyby center remains unchanged');
});

test('four shells hold fixed radius and identical orbital speed after entry',()=>{
 for(const t of [5.2,8,14,24,40,180]){
  for(const c of cards){
   const p=sphericalPose(c,t);
   const r=Math.hypot(p[0],p[1],p[2]-c.centerZ);
   assert.ok(Math.abs(r-c.orbitRadius)<1e-8);
   assert.equal(c.passIndex,undefined);
  }
 }
 for(const c of cards){
  assert.ok(Math.abs((orbitAngle(c,40)-orbitAngle(c,5))-35*.034)<1e-10);
 }
});

test('Star Assembly is staggered, not all cards appearing as a mural at once',()=>{
 assert.ok(OUTSIDE_ENTRANCE_SECONDS>=4&&OUTSIDE_ENTRANCE_SECONDS<=5);
 assert.equal(ENTRANCE_SECONDS,1.7);
 const activeAtStart=cards.filter(c=>landingVisible(c,0,'outside-in')).length;
 const activeAtOne=cards.filter(c=>landingVisible(c,1,'outside-in')).length;
 const activeAtThree=cards.filter(c=>landingVisible(c,3,'outside-in')).length;
 assert.ok(activeAtStart<=2);
 assert.ok(activeAtOne>activeAtStart&&activeAtOne<78);
 assert.ok(activeAtThree>activeAtOne);
 assert.ok(cards.every(c=>entranceProgress(c,OUTSIDE_ENTRANCE_SECONDS,'outside-in')===1));
 assert.ok(cards.every(c=>entranceScale(c,OUTSIDE_ENTRANCE_SECONDS,'outside-in')===1));
 assert.ok(cards.every(c=>sampleLandingPose(c,OUTSIDE_ENTRANCE_SECONDS,'outside-in').every(Number.isFinite)));
});

test('outside-in entry begins beyond the screen and follows curved 3D trajectories',()=>{
 let offscreen=0,curved=0,depth=0;
 for(const c of cards){
  const t=.001;
  const p=outsideArrivalPose(c,t);
  if(!onScreen(projected(p,c)))offscreen++;
  const delay=entranceDelay(c,'outside-in'),dt=.87+.92*.5;
  const start=outsideArrivalPose(c,delay+.02);
  const middle=outsideArrivalPose(c,delay+.65);
  const end=sphericalPose(c,delay+2);
  if(Math.hypot(start[0]-end[0],start[1]-end[1])>.5 &&
     Math.abs(middle[2]-((start[2]+end[2])*.5))>.2)curved++;
  if(Math.abs(start[2]-end[2])>1.0)depth++;
 }
 assert.ok(offscreen>=70,'Most cards start beyond the viewport, not in a mural');
 assert.ok(curved>=45,'Arrival paths must curve through true depth');
 assert.ok(depth>=55,'The animation must travel in Z, not only in the screen plane');
});

test('both entrances preserve exact 78 IDs and identical final positions',()=>{
 const again=makeLandingCardEntities(DECK,47925);
 for(const c of cards){
  assert.deepEqual(sampleLandingPose(c,OUTSIDE_ENTRANCE_SECONDS+2,'outside-in'),
                   sampleLandingPose(c,OUTSIDE_ENTRANCE_SECONDS+2,'inside-out'));
  assert.equal(c.id,again[c.index].id);
 }
});

test('cached sky textures give near-black star depth and bounded two-cloud motion',async()=>{
 assert.equal(STAR_COUNTS.distant+STAR_COUNTS.near,1080);
 assert.ok(NEBULA_SIZE[0]*NEBULA_SIZE[1]<=320*190);
 assert.ok(ATMOSPHERE_PALETTES.length>=4);
 const sky=await readFile(new URL('../src/ritual-world/CelestialSky.mjs',import.meta.url),'utf8');
 const preview=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/gate-a/gate-a.css',import.meta.url),'utf8');
 assert.match(sky,/putImageData/);
 assert.match(sky,/turbulence/);
 assert.match(sky,/window\.addEventListener\('resize',paint/);
 assert.doesNotMatch(sky,/requestAnimationFrame\(/);
 assert.doesNotMatch(sky,/setInterval\(/);
 assert.match(preview,/sky\.dispose\(\)/);
 assert.match(css,/cloudWanderA/);
 assert.match(css,/cloudWanderB/);
 assert.match(css,/starBreathe/);
 assert.match(css,/space-background:after\{content:none!important/);
 assert.match(css,/prefers-reduced-motion/);
});

test('webGL and Canvas still render fully opaque and skip off-stage cards only during assembly',async()=>{
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const cv=await readFile(new URL('../src/ritual-world/CanvasOrbit.mjs',import.meta.url),'utf8');
 assert.match(gl,/if\(!landingVisible\(card,time,entranceMode\)\)return/);
 assert.match(cv,/this\.phase!=='landing'\|\|landingVisible\(c,this\.elapsed,this\.entranceMode\)/);
 assert.match(gl,/gl\.disable\(gl\.BLEND\)/);
 assert.match(cv,/ctx\.globalAlpha=1/);
});
