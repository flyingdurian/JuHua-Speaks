import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {CARD_COUNT,BEATS,sphereLayout,cardWorld,orbitAngle,cameraDistance,selectCard,getStage,assemblyProgress,perspectiveFocal,CAMERA_VERTICAL_FOV_DEG,CAMERA_CLIP_NEAR,clipCardNearPlane} from '../preview/post-shuffle/geometry.mjs';

test('One real, non-redealt 78-card spherical identity map',()=>{
 const points=sphereLayout();assert.equal(points.length,78);
 assert.equal(new Set(points.map(p=>p.direction.map(n=>n.toFixed(6)).join(','))).size,78);
 for(const p of points){assert.ok(Math.abs(Math.hypot(...p.direction)-1)<1e-8);assert.ok(p.radius>5&&p.radius<6.1)}
 assert.throws(()=>sphereLayout(77),/78/);
 const first=cardWorld(points[0],0),final=cardWorld(points[0],4);
 assert.ok(Math.hypot(...first)<2.0);assert.ok(Math.hypot(...final)>4.5);
 assert.equal(assemblyProgress(0),0);assert.equal(assemblyProgress(4),1);
});
test('One continuous launch→unfold→fast spin→inward camera shot with no Gate or Cube',()=>{
 assert.equal(BEATS.interactive,6.9);
 assert.equal(getStage(0,0),'launch');assert.equal(getStage(2,0),'distribute');assert.equal(getStage(5,0),'enter');
 assert.equal(getStage(7.1,0),'inside');assert.equal(getStage(7.1,1),'select');
 assert.ok(cameraDistance(0)>9&&cameraDistance(0)<10);assert.ok(cameraDistance(1.2)>12);assert.ok(cameraDistance(4.2)>10);assert.equal(cameraDistance(7),0);
 assert.ok(orbitAngle(4.1)-orbitAngle(2.1)>8,'sphere must rotate rapidly before entry');
 assert.ok(orbitAngle(11)-orbitAngle(9)<.2,'settled interior should rotate gently');
});
test('Tap/undo keeps original identities and orientation, maximum three',()=>{
 const ids=DECK.map(c=>c.id);let selected=[];
 selected=selectCard(selected,ids,ids[12]);selected=selectCard(selected,ids,ids[8],'reversed');selected=selectCard(selected,ids,ids[2]);
 assert.deepEqual(selected.map(x=>x.id),[ids[12],ids[8],ids[2]]);
 assert.equal(selectCard(selected,ids,ids[0]),selected);
 selected=selectCard(selected,ids,ids[8]);assert.deepEqual(selected.map(x=>x.id),[ids[12],ids[2]]);
 assert.throws(()=>selectCard(selected,ids,'fake'),/Unknown/);
 assert.throws(()=>selectCard(selected,ids,ids[0],'sideways'),/orientation/);
});
test('Gate B Finish Shuffling mounts continuity inline instead of redirecting or shuffling again',async()=>{
 const source=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 const post=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 const server=await readFile(new URL('../scripts/serve-gate-a.mjs',import.meta.url),'utf8');
 assert.match(source,/mountPostShuffle/);
 assert.match(source,/deckIds:selectionOrder/);
 assert.doesNotMatch(source,/window\.location\.assign\(new URL\('\.\.\/\.\.\/ritual\.html'/);
 assert.match(post,/getContext\('webgl2'/);
 assert.match(post,/initCelestialSky/);
 assert.match(post,/pointerup/);
 assert.doesNotMatch(post,/Gate \(Fullscreen\)|Celestial Gate|cube-stage/);
 assert.match(server,/preview\/post-shuffle/);
});

test('True 85-degree projection matches shader and JS picking camera',()=>{
 assert.equal(CAMERA_VERTICAL_FOV_DEG,85);
 assert.ok(Math.abs(perspectiveFocal()-1/Math.tan(85*Math.PI/360))<1e-12);
 assert.ok(perspectiveFocal()<1.2,'85-degree view must remain genuinely wide');
 assert.throws(()=>perspectiveFocal(180),/Invalid/);
});
test('Physical cards are clipped instead of disappearing as camera enters sphere',()=>{
 const behind=[[-1,-1,-.20],[1,-1,-.20],[1,1,.15],[-1,1,.15]];
 const clipped=clipCardNearPlane(behind,0);
 assert.equal(clipped.length,4);
 for(const c of clipped){
  assert.ok(-c.position[2]>=CAMERA_CLIP_NEAR-1e-12,'no clipped vertex may cross the near plane');
  assert.ok(c.uv.every(v=>v>=0&&v<=1),'clipped card keeps valid artwork UV coordinates');
 }
 const front=[[-1,-1,-.2],[1,-1,-.2],[1,1,-.2],[-1,1,-.2]];
 assert.equal(clipCardNearPlane(front,0).length,4);
 const invisible=front.map(p=>[p[0],p[1],.2]);
 assert.equal(clipCardNearPlane(invisible,0).length,0);
});
test('Renderer does not fabricate Tarot art or use stale narrow camera formula',async()=>{
 const scene=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 assert.match(scene,/clipCardNearPlane\(corners,cam\)/);
 assert.match(scene,/gl\.uniform1f\(uniform\.focal,perspectiveFocal\(\)\)/);
 assert.doesNotMatch(scene,/Math\.tan\(85\*Math\.PI\/360\/2\)/);
 assert.match(scene,/RWS ART/);
 assert.match(scene,/UNAVAILABLE/);
});

test('FINISH stage constructs an actual compact stacked deck, then unwinds all 78 sheets',()=>{
 const points=sphereLayout();
 const first=points.map(p=>cardWorld(p,0)),mid=points.map(p=>cardWorld(p,2.1)),full=points.map(p=>cardWorld(p,4.0));
 const extent=arr=>Math.max(...arr.map(v=>Math.hypot(...v)));
 assert.ok(extent(first)<2,'no giant fanned stack at launch');
 assert.ok(extent(mid)>2.0,'individual sheets must unravel before sphere entry');
 assert.ok(extent(full)>5,'physical sphere must grow to its full radius');
});
