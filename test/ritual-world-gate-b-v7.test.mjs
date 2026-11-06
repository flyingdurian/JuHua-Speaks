import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sampleTunnelCameraRail,sampleTunnelTrajectory} from '../src/ritual-world/TunnelDynamics.mjs';

test('authored camera rail hits recorded semantic poses and interpolates without jumps',()=>{
 const samples=[[1.10,1,0,0],[2.10,1.36,231,139],[3.0,.86,230,22],
                [3.8,.54,32,-40],[5.45,1,0,0]];
 for(const [t,z,x,y] of samples){
  const q=sampleTunnelCameraRail(t);
  assert.ok(Math.abs(q.zoom-z)<1e-9);
  assert.ok(Math.abs(q.px-x)<1e-9);
  assert.ok(Math.abs(q.py-y)<1e-9);
 }
 for(let t=1.1;t<=5.45;t+=.025){
  const a=sampleTunnelCameraRail(t),b=sampleTunnelCameraRail(t+.002);
  assert.ok(a.zoom>=.30&&Number.isFinite(a.zoom));
  assert.ok(Math.abs(a.zoom-b.zoom)<.015,'Unphysical camera zoom jump');
  assert.ok(Math.hypot(a.px-b.px,a.py-b.py)<3.2,'Camera rail teleported');
 }
});

test('the same material path drives actual sheets and filament motes',async()=>{
 const mist=await readFile(new URL('../preview/gate-b/FlowMist.mjs',import.meta.url),'utf8');
 assert.match(mist,/sampleTunnelTrajectory/);
 const a=sampleTunnelTrajectory(19,702509,3.28);
 const b=sampleTunnelTrajectory(19,702509,3.30);
 assert.equal(a.position.length,3);
 assert.ok(a.position.every(Number.isFinite));
 assert.ok(Math.hypot(...a.position.map((v,i)=>v-b.position[i]))<6,
  'Material tracks must not teleport during the live storm');
});

test('benchmark uses pinned seed and labels proxy failure separately from actual visual approval',async()=>{
 const capture=await readFile(new URL('../scripts/capture-gate-b-v7.mjs',import.meta.url),'utf8');
 const preview=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 const scorer=await readFile(new URL('../scripts/score-gate-b-v7.py',import.meta.url),'utf8');
 assert.match(capture,/seed=2165840022/);
 assert.match(capture,/setPaused\(true\)/);
 assert.match(preview,/requestedSeed/);
 assert.match(scorer,/REJECT_PROXIES/);
 assert.match(scorer,/does NOT prove 90% perceptual fidelity/);
});
