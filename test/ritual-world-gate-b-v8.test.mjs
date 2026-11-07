import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';
import {DECK} from '../src/deck.mjs';
import {sampleVortexCard,sampleVortexRibbon,vortexCamera,rotateVortexBasis} from '../src/ritual-world/VortexRibbon.mjs';
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
  if(t<4.9)assert.ok(Math.max(...zs)-Math.min(...zs)>7,
   'The accelerated spherical orbit must preserve physical near/far separation');
  else assert.ok(Math.max(...zs)-Math.min(...zs)<8,
   'During the final neck, physical depth must converge into a single deck plane');
  for(const card of cards){
   const a=sampleVortexCard(card.orbitSlot,card.visualSeed,t).position;
   const b=sampleVortexCard(card.orbitSlot,card.visualSeed,t+.005).position;
   assert.ok(Math.hypot(...a.map((v,i)=>v-b[i]))<2.7,
    'A material Tarot sheet must not teleport as orbital phases overtake');
  }
 }
 let moved=0;
 for(const c of cards){
  const a=sampleVortexCard(c.orbitSlot,c.visualSeed,2.5);
  const b=sampleVortexCard(c.orbitSlot,c.visualSeed,2.7);
  if(Math.hypot(...a.position.map((x,i)=>x-b.position[i]))>.3)moved++;
 }
 assert.ok(moved>=60,'Cards must actually travel through the vortex over time');
});

test('Independent sheet velocities vary within a coherent spiral rather than rigid-ring rotation',()=>{
 const speeds=cards.map(c=>{
  const x=sampleVortexCard(c.orbitSlot,c.visualSeed,2.65);
  const y=sampleVortexCard(c.orbitSlot,c.visualSeed,2.82);
  return y.theta-x.theta;
 });
 const spread=Math.max(...speeds)-Math.min(...speeds);
 assert.ok(spread>.06,'Slightly different sheet speeds must create natural overtakes');
 assert.ok(spread<4,'No ballistic discontinuities or randomized spinning');
});

test('Orbital axis banks progressively toward roughly 45 degrees without a deep camera dive',()=>{
 assert.ok(vortexCamera(2.1).roll<.15);
 assert.ok(vortexCamera(3.8).roll>.46);
 assert.ok(vortexCamera(4.7).roll>.70);
 assert.ok(vortexCamera(4.7).pitch<.23);
 assert.ok(vortexCamera(5.45).roll===0);
 for(let t=1.1;t<5.45;t+=.025){
  const a=vortexCamera(t),b=vortexCamera(t+.002);
  assert.ok(Math.abs(a.pitch-b.pitch)<.05&&Math.abs(a.roll-b.roll)<.05,
   'Orbital axis changed discontinuously at '+t);
 }
});

test('Atmospheric trails and cards share the same 3D physical helix',async()=>{
 const text=await readFile(new URL('../preview/gate-b/FlowMist.mjs',import.meta.url),'utf8');
 assert.match(text,/sampleVortexCard/);
 assert.doesNotMatch(text,/sampleTunnelTrajectory/);
 const ribbon=sampleVortexRibbon(0,.35,3.2);
 assert.ok(ribbon.position.every(Number.isFinite));
 const card=sampleVortexCard(cards[20].orbitSlot,cards[20].visualSeed,3.2);
 assert.ok(card.position.every(Number.isFinite));
});

test('Card faces, backs and edges rotate rigidly with the same camera bank as their world-space centres',async()=>{
 const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
 const norm=a=>Math.hypot(...a);
 for(const t of [1.25,2.1,3.0,3.8,4.7,5.2]){
  const basis=[[1,0,0],[0,1,0],[0,0,1]].map(v=>rotateVortexBasis(v,t));
  assert.ok(basis.every(v=>Math.abs(norm(v)-1)<1e-9));
  assert.ok(Math.abs(dot(basis[0],basis[1]))<1e-9);
  assert.ok(Math.abs(dot(basis[0],basis[2]))<1e-9);
  assert.ok(Math.abs(dot(basis[1],basis[2]))<1e-9);
 }
 const a=rotateVortexBasis([0,1,0],1.25),b=rotateVortexBasis([0,1,0],3.8);
 assert.ok(Math.hypot(...a.map((x,i)=>x-b[i]))>.25,
  'The camera bank must physically rotate the card basis, not only its centre');
 const source=await readFile(new URL('../src/ritual-world/ReferenceRitual.mjs',import.meta.url),'utf8');
 assert.match(source,/rotateVortexBasis\(localAtt\.normal,t\)/);
 assert.match(source,/rotateVortexBasis\(localAtt\.right,t\)/);
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

test('Final neck compresses all 78 moving cards into a narrow aligned physical throat',()=>{
 const positions=t=>cards.map(c=>sampleVortexCard(c.orbitSlot,c.visualSeed,t).position);
 const radial=t=>positions(t).reduce((n,p)=>n+Math.hypot(p[0],p[1]),0)/78;
 const wide=radial(4.68),neck=radial(5.42);
 assert.ok(neck<wide*.45,'The neck must contract laterally, not scatter into a pile');
 const near=positions(5.42).map(p=>p[2]);
 assert.ok(Math.max(...near)-Math.min(...near)<3.8,
   'The neck must converge to a common deck depth');
 assert.equal(cards.length,78);
});
