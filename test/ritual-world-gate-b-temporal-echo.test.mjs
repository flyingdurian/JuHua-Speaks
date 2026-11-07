import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sampleVortexCard} from '../src/ritual-world/VortexRibbon.mjs';
import {
 CARD_ECHO_HISTORY,sequenceOneEchoEnvelope,projectedCardSpeed,
 velocityEchoWeight,cardEchoOpacity
} from '../src/ritual-world/TemporalEcho.mjs';

test('three genuine temporal card echoes fade with age and increase with projected velocity',()=>{
 assert.equal(CARD_ECHO_HISTORY.length,3);
 assert.deepEqual(CARD_ECHO_HISTORY.map(x=>x.lag),[.24,.13,.052]);
 assert.equal(sequenceOneEchoEnvelope(.9),0);
 assert.ok(sequenceOneEchoEnvelope(2.3)>.99);
 assert.equal(sequenceOneEchoEnvelope(5.5),0);
 assert.ok(velocityEchoWeight(8)===0);
 assert.ok(velocityEchoWeight(160)>.9);
 const slow=cardEchoOpacity(2.6,.052,10,11),fast=cardEchoOpacity(2.6,.052,170,11);
 assert.equal(slow,0);
 assert.ok(fast>.15);
 assert.equal(cardEchoOpacity(10,.054,200,11),0);
});

test('projected speed uses actual camera-space near/far perspective',()=>{
 const front=projectedCardSpeed([2,0,-8],[1,0,-8],.05,720);
 const far=projectedCardSpeed([2,0,-40],[1,0,-40],.05,720);
 assert.ok(front>far*4.8);
 assert.equal(projectedCardSpeed([0,0,-8],[0,0,-8],.1),0);
});

test('GPU renderer uses true atlas-textured previous card poses and restores opaque rendering',async()=>{
 const renderer=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const mist=await readFile(new URL('../preview/gate-b/FlowMist.mjs',import.meta.url),'utf8');
 assert.match(renderer,/cardEchoOpacity/);
 assert.match(renderer,/samplePhysicalShuffle\(card,\{/);
 assert.match(renderer,/ghostVertices/);
 assert.match(renderer,/gl\.depthMask\(false\)/);
 assert.match(renderer,/gl\.depthMask\(true\)/);
 assert.match(renderer,/gl\.uniform1f\(this\.locPassAlpha,1\)/);
 assert.match(renderer,/this\.phase==='shuffle_ritual'&&this\.shuffleStyle==='auto'/);
 assert.match(mist,/sampleVortexCard/);
 assert.doesNotMatch(mist,/sampleVortexRibbon/);
});

test('Three genuine 3D orbital scales coexist with near/far motion in Sequence 1',()=>{
 const cardGroups=[Array.from({length:40},(_,i)=>i),Array.from({length:24},(_,i)=>i+40),Array.from({length:14},(_,i)=>i+64)];
 const sampled=cardGroups.map(group=>group.map(i=>sampleVortexCard(i,2165840022,2.75).position));
 const radii=sampled.map(a=>a.reduce((n,p)=>n+Math.hypot(p[0],p[1]),0)/a.length);
 assert.ok(radii[0]>radii[1]+.5&&radii[1]>radii[2]+.5,
  'Outer, middle and inner card layers must have separately readable scales: '+radii);
 for(const positions of sampled){
  const z=positions.map(p=>p[2]);
  assert.ok(Math.max(...z)-Math.min(...z)>2,'Spherical layers must travel through depth, not rotate as flat clock faces');
 }
 assert.equal(cardGroups.reduce((n,g)=>n+g.length,0),78);
});
