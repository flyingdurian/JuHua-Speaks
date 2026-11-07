import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {vortexCamera,sampleVortexCard} from '../src/ritual-world/VortexRibbon.mjs';

test('reference camera banks dynamically from face-on into a vertical corkscrew',()=>{
 const samples=[[1.10,.04],[2.10,.08],[3.00,.14],[3.75,.19],[4.40,.23],[5.45,0]];
 for(const [t,pitch] of samples)assert.ok(Math.abs(vortexCamera(t).pitch-pitch)<1e-9);
 for(let t=1.1;t<=5.44;t+=.025){
  const a=vortexCamera(t),b=vortexCamera(t+.002);
  assert.ok(Math.abs(a.pitch-b.pitch)<.05,'Unphysical camera pitch jump');
  assert.ok(Math.hypot(a.px-b.px,a.py-b.py)<4,'Camera rail jumped');
 }
});

test('the same material path drives actual sheets and filament motes',async()=>{
 const mist=await readFile(new URL('../preview/gate-b/FlowMist.mjs',import.meta.url),'utf8');
 assert.match(mist,/sampleVortexCard/);
 const a=sampleVortexCard(19,702509,3.28);
 const b=sampleVortexCard(19,702509,3.30);
 assert.equal(a.position.length,3);
 assert.ok(a.position.every(Number.isFinite));
 assert.ok(Math.hypot(...a.position.map((v,i)=>v-b.position[i]))<6,
  'Material tracks must not teleport during the live storm');
});

test('benchmark uses pinned seed and labels proxy failure separately from actual visual approval',async()=>{
 const capture=await readFile(new URL('../scripts/capture-gate-b-v8.mjs',import.meta.url),'utf8');
 const preview=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 const scorer=await readFile(new URL('../scripts/score-gate-b-v8.py',import.meta.url),'utf8');
 assert.match(capture,/seed=2165840022/);
 assert.ok(capture.includes('page.screenshot'));
 assert.match(preview,/requestedSeed/);
 assert.match(scorer,/REJECT_PROXIES/);
 assert.match(scorer,/does NOT prove perceptual fidelity/);
});
