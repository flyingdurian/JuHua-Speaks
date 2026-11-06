import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';
import {DECK} from '../src/deck.mjs';
import {sampleVortexCard,sampleVortexRibbon,vortexCamera} from '../src/ritual-world/VortexRibbon.mjs';
import {samplePhysicalShuffle} from '../src/ritual-world/ShuffleChoreography.mjs';

const cards=makeLandingCardEntities(DECK,2165840022);
const sample=(card,t)=>samplePhysicalShuffle(card,{style:'auto',age:t,landingAt:7,worldTime:24.5});

test('Sequence 1 cards are carried through substantial 3D depth while revolving on coherent ribbons',()=>{
 for(const t of [1.4,2.1,3.0,3.8,4.7,5.25]){
  const v=cards.map(c=>sampleVortexCard(c.orbitSlot,c.visualSeed,t));
  assert.equal(v.length,78);
  assert.ok(v.every(x=>x.position.every(Number.isFinite)&&x.position[2]<-2),
   'All physical sheets must remain in front of the camera with finite geometry');
  const zs=v.map(x=>x.position[2]);
  assert.ok(Math.max(...zs)-Math.min(...zs)>7,'The spiral must have real Z separation');
  const angles=v.filter(p=>p.lane===0).sort((a,b)=>a.q-b.q).map(p=>p.theta);
  for(let i=1;i<angles.length;i++)assert.ok(angles[i]>angles[i-1]-.2,
   'Dominant ribbon must remain longitudinally ordered instead of randomized');
 }
 let moved=0;
 for(const c of cards){
  const a=sampleVortexCard(c.orbitSlot,c.visualSeed,2.5);
  const b=sampleVortexCard(c.orbitSlot,c.visualSeed,2.7);
  if(Math.hypot(...a.position.map((x,i)=>x-b.position[i]))>.3)moved++;
 }
 assert.ok(moved>=60,'Cards must actually travel through the vortex over time');
});

test('Camera moves from face-on to edge-on, making sweeping perspective changes rather than a stationary wreath',()=>{
 assert.ok(vortexCamera(2.1).yaw<.45);
 assert.ok(vortexCamera(3.8).yaw>.90);
 assert.ok(vortexCamera(4.7).yaw>1.1);
 assert.ok(vortexCamera(5.45).yaw<.2);
 for(let t=1.1;t<5.45;t+=.025){
  const a=vortexCamera(t),b=vortexCamera(t+.002);
  assert.ok(Math.abs(a.yaw-b.y)<.05&&Math.abs(a.roll-b.roll)<.04,
   'Camera must not snap at t='+t+' (yaw delta '+Math.abs(a.yaw-b.y)+', roll delta '+Math.abs(a.roll-b.roll)+')');
 }
});

test('Atmospheric trails and cards share the same 3D physical helix',async()=>{
 const text=await readFile(new URL('../preview/gate-b/FlowMist.mjs',import.meta.url),'utf8');
 assert.match(text,/sampleVortexRibbon/);
 assert.doesNotMatch(text,/sampleTunnelTrajectory/);
 const ribbon=sampleVortexRibbon(0,.35,3.2);
 assert.ok(ribbon.position.every(Number.isFinite));
 const card=sampleVortexCard(cards[20].orbitSlot,cards[20].visualSeed,3.2);
 assert.ok(card.position.every(Number.isFinite));
});

test('Approved Sequence 2 choreography and all subsequent steps are byte-for-byte frozen',async()=>{
 const source=await readFile(new URL('../src/ritual-world/ReferenceRitual.mjs',import.meta.url),'utf8');
 const boundary=source.indexOf('function pocketPose(');
 assert.ok(boundary>0);
 const frozen=source.slice(boundary);
 let h=2166136261;
 for(const c of frozen){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0}
 assert.equal(h.toString(16),'3b577ed3',
  'Approved Sequence 2 changed: revert it before claiming a new Sequence 1 candidate');
 assert.match(source,/sampleVortexCard/);
 assert.equal(cards.length,78);
 for(const t of [7.5,9.2,10.7,13.6,16.55]){
  const poses=cards.map(c=>sample(c,t));
  assert.ok(poses.every(p=>p.position.every(Number.isFinite)));
 }
});
