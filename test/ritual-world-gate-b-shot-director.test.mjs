import test from 'node:test';
import assert from 'node:assert/strict';
import {HERO_SLOTS,HERO_TRAIL_SLOTS,cardRole,cardPacket,stagedOrbitFraction,
 heroEchoStrength,trailStrength,STAGE_ONE_LIMITS} from '../src/ritual-world/ShotDirector.mjs';
import {sampleVortexCard} from '../src/ritual-world/VortexRibbon.mjs';

test('card identities are conserved and hero accents are sparse',()=>{
 assert.equal(new Set(Array.from({length:78},(_,k)=>k)).size,78);
 assert.ok(HERO_SLOTS.length<=10);
 assert.ok(HERO_TRAIL_SLOTS.length<=10);
 for(const t of [1.5,2.1,2.6,3.1,3.65,4.15,4.65,5.3]){
  const active=Array.from({length:78},(_,k)=>heroEchoStrength(k,t))
   .filter(x=>x>.001);
  assert.ok(active.length<=STAGE_ONE_LIMITS.maxConcurrentHeroEchoes,
   'No constant all-card ghost field');
  for(let k=0;k<78;k++)if(cardRole(k)==='background')
   assert.equal(trailStrength(k,t),0);
 }
});

test('each moving shell contains genuine temporary card packets and breathing gaps',()=>{
 const shellGroups=[[0,40,4],[40,64,3],[64,78,2]];
 for(const [lo,hi,packets] of shellGroups){
  const centers=new Set();
  const samples=[];
  for(let k=lo;k<hi;k++){
   const p=cardPacket(k);centers.add(p.packet);
   const q=stagedOrbitFraction(k,2165840022,3.2);
   assert.ok(q>0&&q<1);
   samples.push(q);
  }
  assert.equal(centers.size,packets);
  samples.sort((a,b)=>a-b);
  assert.ok(Math.max(...samples.slice(1).map((q,i)=>q-samples[i]))>.035,
   'The shell must have dark spaces between local card groups');
 }
});
test('all real 3D card centers remain valid across the new shot timing',()=>{
 for(const t of [1.1,2.1,3.2,3.85,4.2,4.7,5.4]){
  const positions=Array.from({length:78},(_,k)=>sampleVortexCard(k,2165840022,t).position);
  assert.equal(positions.length,78);
  for(const p of positions)assert.ok(p.every(Number.isFinite)&&p[2]<-1);
 }
});
