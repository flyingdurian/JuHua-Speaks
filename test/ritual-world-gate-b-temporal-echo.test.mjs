import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
 CARD_ECHO_HISTORY,sequenceOneEchoEnvelope,projectedCardSpeed,
 velocityEchoWeight,cardEchoOpacity
} from '../src/ritual-world/TemporalEcho.mjs';

test('three genuine temporal card echoes fade with age and increase with projected velocity',()=>{
 assert.equal(CARD_ECHO_HISTORY.length,3);
 assert.deepEqual(CARD_ECHO_HISTORY.map(x=>x.lag),[.19,.115,.054]);
 assert.equal(sequenceOneEchoEnvelope(.9),0);
 assert.ok(sequenceOneEchoEnvelope(2.3)>.99);
 assert.equal(sequenceOneEchoEnvelope(5.5),0);
 assert.ok(velocityEchoWeight(8)===0);
 assert.ok(velocityEchoWeight(160)>.9);
 const slow=cardEchoOpacity(3,.054,10),fast=cardEchoOpacity(3,.054,170);
 assert.equal(slow,0);
 assert.ok(fast>.15);
 assert.equal(cardEchoOpacity(10,.054,200),0);
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
