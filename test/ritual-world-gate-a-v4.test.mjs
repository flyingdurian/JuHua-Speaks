import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities,sphericalPose,sampleLandingPose,landingAttitude,orbitDiagnostics,orbitAngle,ORBIT_CENTER_Z,ORBIT_RADIUS,ORBIT_SPEED,ENTRANCE_SECONDS} from '../src/ritual-world/OrbitalField.mjs';
import {appendPremiumCard,CARD_PERIMETER,EDGE_THICKNESS} from '../src/ritual-world/CardSurface.mjs';
const cards=makeLandingCardEntities(DECK,47925);
const dist=p=>Math.hypot(p[0],p[1],p[2]-ORBIT_CENTER_Z);
test('all 78 historical card identities occupy one continuous spherical shell',()=>{
 assert.equal(cards.length,78);
 assert.equal(new Set(cards.map(c=>c.id)).size,78);
 assert.ok(cards.every(c=>c.passIndex===undefined),'No special near-pass spline or yo-yo');
 assert.ok(cards.every(c=>Array.isArray(c.local)&&c.local.length===3));
 for(const time of [ENTRANCE_SECONDS+1,4,10,20,30,75,150]){
  for(const c of cards){const p=sphericalPose(c,time);assert.ok(Math.abs(dist(p)-dist(c.local.map((v,i)=>i===2?v+ORBIT_CENTER_Z:v)))<1e-8);
   assert.ok(dist(p)>ORBIT_RADIUS*.985&&dist(p)<ORBIT_RADIUS*1.015)}
 }
});
test('close passes are an automatic consequence of rigid orbital rotation',()=>{
 const first=cards.map(c=>sphericalPose(c,7)),later=cards.map(c=>sphericalPose(c,20));
 assert.ok(cards.filter((c,i)=>Math.abs(first[i][2]-later[i][2])>1).length>35);
 assert.equal(cards.filter(c=>c.passIndex!==undefined).length,0);
 for(const c of cards){const delta=orbitAngle(c,20)-orbitAngle(c,7);assert.ok(Math.abs(delta-ORBIT_SPEED*13)<1e-12)}
 for(const t of [5,10,15,20,25,30])assert.ok(orbitDiagnostics(cards,t).closest<0);
});
test('real front/back transitions and card foreshortening occur over time',()=>{
 const sides=t=>cards.map(c=>{const p=sphericalPose(c,t);return landingAttitude(c,p,t)});
 const a=sides(5),b=sides(25);
 const changed=a.filter((x,i)=>x.frontFacingCamera!==b[i].frontFacingCamera).length;
 assert.ok(changed>=5,'Some cards must naturally flip from front to back during orbit');
 assert.ok(a.filter(x=>x.frontFacingCamera).length>=8);
 assert.ok(a.filter(x=>!x.frontFacingCamera).length>=38,'Dark backs predominate');
 assert.ok(a.filter(x=>Math.abs(x.facing)<.3).length>=5,'Thin edge-on silhouettes');
 for(const x of [...a,...b]){assert.ok(x.right.every(Number.isFinite)&&x.up.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...x.normal)-1)<1e-8)}
});
test('entrance ends once and never disrupts the persistent shell',()=>{
 for(const c of cards){
  assert.deepEqual(sampleLandingPose(c,ENTRANCE_SECONDS+1),sphericalPose(c,ENTRANCE_SECONDS+1));
  assert.deepEqual(sampleLandingPose(c,ENTRANCE_SECONDS+500),sphericalPose(c,ENTRANCE_SECONDS+500));
 }
 const a=makeLandingCardEntities(DECK,10001),b=makeLandingCardEntities(DECK,10002);
 assert.notDeepEqual(a.map(c=>c.local),b.map(c=>c.local));
 assert.equal(new Set(a.map(c=>c.orbitSlot)).size,78);
});
test('card geometry has true rounded bevel, thin edge and separately textured front/back',()=>{
 assert.ok(EDGE_THICKNESS<.02&&EDGE_THICKNESS>.005);
 assert.ok(CARD_PERIMETER.length>=20);
 const c=cards[0],p=sphericalPose(c,6),att=landingAttitude(c,p,6),out=[];
 appendPremiumCard(out,c,p,att,1,1,(slot,u,v)=>[(slot%9+u)/9,(Math.floor(slot/9)+v)/9]);
 assert.ok(out.length>500);
 assert.equal(out.length%18,0);
 assert.ok(out.every(Number.isFinite));
 const modelSource=''+appendPremiumCard;
 assert.match(modelSource,/backSlot/);
 assert.match(modelSource,/card\.index/);
 assert.match(modelSource,/edgeSlot/);
});
test('high-quality atlas and fallback use genuine art and no billboard paths',async()=>{
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const canvas=await readFile(new URL('../src/ritual-world/CanvasOrbit.mjs',import.meta.url),'utf8');
 const preview=await readFile(new URL('../preview/gate-a/gate-a.mjs',import.meta.url),'utf8');
 assert.match(gl,/TILE_W=256,TILE_H=448/);
 assert.match(gl,/appendPremiumCard/);
 assert.match(gl,/gl\.generateMipmap\(gl\.TEXTURE_2D\)/);
 assert.match(gl,/MAX_TEXTURE_SIZE/);
 assert.match(gl,/pixelStorei\(gl\.UNPACK_FLIP_Y_WEBGL,false\)/); // v=0 represents top of real card art
 assert.doesNotMatch(gl,/UNPACK_FLIP_Y_WEBGL,true/);
 assert.match(gl,/this\.faceAssetForId\(card\.id\)/);
 assert.match(canvas,/small\.width=384;small\.height=664/);
 assert.match(canvas,/src=pose\.frontFacingCamera\?/);
 assert.match(preview,/RitualWorld/);
 assert.doesNotMatch(gl,/TILE_W=128,TILE_H=220/);
});
