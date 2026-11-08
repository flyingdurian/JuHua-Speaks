import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {CARD_COUNT,BEATS,sphereLayout,cardWorld,orbitAngle,cameraDistance,selectCard,getStage,assemblyProgress,pointInQuad} from '../preview/post-shuffle/geometry.mjs';

test('One real, non-redealt 78-card spherical identity map',()=>{
 const points=sphereLayout();assert.equal(points.length,78);
 assert.equal(new Set(points.map(p=>p.direction.map(n=>n.toFixed(6)).join(','))).size,78);
 for(const p of points){assert.ok(Math.abs(Math.hypot(...p.direction)-1)<1e-8);assert.ok(p.radius>5&&p.radius<6.1)}
 assert.throws(()=>sphereLayout(77),/78/);
 const first=cardWorld(points[0],0),final=cardWorld(points[0],4);
 assert.ok(Math.hypot(...first)<1.2);assert.ok(Math.hypot(...final)>4.5);
 assert.equal(assemblyProgress(0),0);assert.equal(assemblyProgress(4),1);
});
test('One continuous launch→unfold→fast spin→inward camera shot with no Gate or Cube',()=>{
 assert.equal(BEATS.interactive,6.9);
 assert.equal(getStage(0,0),'launch');assert.equal(getStage(2,0),'distribute');assert.equal(getStage(5,0),'enter');
 assert.equal(getStage(7.1,0),'inside');assert.equal(getStage(7.1,1),'select');
 assert.ok(cameraDistance(0)>12);assert.ok(cameraDistance(3)>11);
 assert.ok(cameraDistance(4.2)<9,'exterior globe must approach camera before entry');
 assert.ok(cameraDistance(4.3)>5.7&&cameraDistance(4.3)<5.9);
 assert.ok(cameraDistance(4.65)<5.8&&cameraDistance(4.65)>4.8);
 assert.equal(cameraDistance(7),0);
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

test('Real tap-hit projection accepts center of skewed card and rejects outside points',()=>{
 const corners=[{x:20,y:20},{x:97,y:30},{x:90,y:149},{x:10,y:130}];
 assert.equal(pointInQuad([50,75],corners),true);
 assert.equal(pointInQuad([900,750],corners),false);
 assert.equal(pointInQuad([24,24],corners),true);
});
