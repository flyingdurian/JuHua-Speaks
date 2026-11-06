import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';
import {samplePhysicalShuffle,deckPose,PHYSICAL_CARD,assertShuffleGeometry} from '../src/ritual-world/ShuffleChoreography.mjs';
import {RITUAL_DURATION,RITUAL_BEATS,sampleReferenceGlobeCanonical} from '../src/ritual-world/ReferenceRitual.mjs';
import {buildVortexTexture} from '../preview/gate-b/VortexAtmosphere.mjs';

// Earlier Gate B builds tested the span of CARD CENTERS only. A 78-card
// billboard clump can pass that metric. This inexpensive software rasterizer
// instead projects the four true card corners and counts the density of
// physically overdrawn pixels in the 860x720 reference camera.
const cards=makeLandingCardEntities(DECK,702509);
const pose=(card,age)=>samplePhysicalShuffle(card,{style:'auto',age,landingAt:7,worldTime:24.5});
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const camera={width:860,height:720,focal:720/(2*Math.tan(58*Math.PI/360))};
const gridSize={width:100,height:80};
function audit(time){
 const counts=new Uint8Array(gridSize.width*gridSize.height);
 const depths=[],centers=[],poses=cards.map(card=>pose(card,time)),faces=poses.filter(p=>p.attitude.normal[2]>0).length;
 const project=q=>[
  camera.width*.5+q[0]*camera.focal/-q[2],
  camera.height*.5-q[1]*camera.focal/-q[2]
 ];
 const inside=(poly,x,y)=>{
  let pos=false,neg=false;
  for(let i=0;i<4;i++){
   const a=poly[i],b=poly[(i+1)%4],s=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);
   if(s>.001)pos=true;
   if(s<-.001)neg=true;
  }
  return !(pos&&neg);
 };
 for(const p of poses){
  depths.push(-p.position[2]);centers.push(project(p.position));
  const halfW=PHYSICAL_CARD.width*p.scale/2,halfH=PHYSICAL_CARD.height*p.scale/2;
  const quad=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>
   project(p.position.map((x,i)=>x+p.attitude.right[i]*u*halfW+p.attitude.up[i]*v*halfH)));
  const xs=quad.map(q=>q[0]),ys=quad.map(q=>q[1]);
  const minx=Math.max(0,Math.floor(Math.min(...xs)*gridSize.width/camera.width));
  const maxx=Math.min(gridSize.width-1,Math.ceil(Math.max(...xs)*gridSize.width/camera.width));
  const miny=Math.max(0,Math.floor(Math.min(...ys)*gridSize.height/camera.height));
  const maxy=Math.min(gridSize.height-1,Math.ceil(Math.max(...ys)*gridSize.height/camera.height));
  for(let iy=miny;iy<=maxy;iy++)for(let ix=minx;ix<=maxx;ix++){
   const x=(ix+.5)*camera.width/gridSize.width,y=(iy+.5)*camera.height/gridSize.height;
   if(inside(quad,x,y))counts[iy*gridSize.width+ix]++;
  }
 }
 const covered=counts.filter(x=>x>0).length,draws=counts.reduce((a,b)=>a+b,0);
 return {
  faces,depthRatio:Math.max(...depths)/Math.min(...depths),
  near:depths.filter(x=>x<12).length,far:depths.filter(x=>x>25).length,
  maxOverlap:Math.max(...counts),centerOverlap:counts[40*100+50],
  coverageFraction:covered/counts.length,overpaint:draws/Math.max(1,covered),
  boundsX:Math.max(...centers.map(p=>p[0]))-Math.min(...centers.map(p=>p[0])),
  positions:poses.map(p=>p.position)
 };
}
test('V7 tunnel sweeps independent Tarot sheets through near, middle and far perspective',()=>{
 const times=[1.65,2.5,3.55,4.75];
 const states=times.map(t=>cards.map(c=>pose(c,t)));
 let depthChanged=0,angleTraveled=0;
 for(let i=0;i<78;i++){
  const p=states.map(st=>st[i].position);
  if(Math.max(...p.map(q=>q[2]))-Math.min(...p.map(q=>q[2]))>2.5)depthChanged++;
  if(Math.hypot(p[3][0]-p[0][0],p[3][1]-p[0][1])>3)angleTraveled++;
 }
 const measured=audit(3.55);
 assert.ok(depthChanged>=55,'Sheets must sweep through distinct axial layers, not fixed-Z rings');
 assert.ok(angleTraveled>=50,'Cards traverse substantial curved screen paths');
 assert.ok(Math.max(...measured.positions.map(p=>p[2]))-Math.min(...measured.positions.map(p=>p[2]))>20,'Coexisting near and far sheets must occupy distinct 3D depths');
 assert.ok(measured.positions.some(p=>-p[2]<20)&&measured.far>=13,'The tilted corkscrew must retain both near-camera and deep-background cards');
 assert.ok(states.flat().every(p=>p.position.every(Number.isFinite)));
});

test('V7 globe forms a legible hollow sphere with circumferential card silhouettes',()=>{
 const before=audit(6.75),opening=audit(7.90);
 assert.ok(opening.coverageFraction>before.coverageFraction*5,'The stack must bloom visibly into a globe');
 for(const t of [8.8,10.2,11.4]){
  const m=audit(t);
  assert.ok(m.faces>=18&&m.faces<=60,'Historic illustrated fronts and dark backs both present');
  assert.ok(m.depthRatio>1.8,'Large actual near and far hemisphere separation');
  assert.ok(m.coverageFraction>.17&&m.coverageFraction<.74,'Readable sphere, not an invisible ring or a solid page of cards');
  assert.ok(m.boundsX>390,'Globe extends to a meaningful round silhouette');
  const radius=cards.map(c=>sampleReferenceGlobeCanonical(c,t).position).map(p=>Math.hypot(p[0],p[1],p[2]+13.75));
  assert.ok(radius.filter(r=>r>4.10&&r<6.20).length>=76,'Most sheets must occupy the shell, not a central pile');
 }
});

test('three separate 26-sheet decks follow the globe after the longer reference pacing',()=>{
 const piles=cards.map(card=>({card,position:pose(card,13.60).position}));
 const groups=[0,1,2].map(i=>piles.filter(x=>x.card.orbitSlot%3===i));
 assert.deepEqual(groups.map(a=>a.length),[26,26,26]);
 const centers=groups.map(g=>g.reduce((v,c)=>v+c.position[0],0)/g.length);
 assert.ok(centers[1]-centers[0]>3.5&&centers[2]-centers[1]>3.5);
});

test('each of the three decks continues to transfer distinct sheets independently',()=>{
 const chosen=cards.filter(c=>c.orbitSlot%3!==1),states={waiting:0,arrived:0,inflight:0};
 for(const card of chosen){
  const before=pose(card,13.75).position;
  const mid=pose(card,14.65).position;
  const after=pose(card,15.25).position;
  if(dist(mid,before)<.2)states.waiting++;
  else if(dist(mid,after)<.2)states.arrived++;
  else states.inflight++;
 }
 assert.ok(states.waiting>=5&&states.arrived>=5&&states.inflight>=5,
  'Interleave has waiting, arrived and in-flight individual sheets '+JSON.stringify(states));
});

test('reference sequence stays continuous and all 78 entities finish the same canonical deck',()=>{
 assert.equal(RITUAL_BEATS.length,10);
 assert.equal(RITUAL_BEATS.at(-1).end,RITUAL_DURATION);
 for(const beat of RITUAL_BEATS.slice(0,-1)){
  const delta=Math.max(...cards.map(card=>dist(
   pose(card,beat.end-.002).position,pose(card,beat.end+.002).position)));
  assert.ok(delta<.8,beat.id+' has a teleport beyond intentional high-speed camera whip '+delta);
 }
 for(const card of cards){
  assert.deepEqual(pose(card,RITUAL_DURATION),deckPose(card,24.5));
 }
 assert.equal(assertShuffleGeometry(cards,{style:'auto',landingAt:7,worldTime:24.5}),true);
});
test('V7 uses material-synchronized atmosphere, no decorative tornado decal',async()=>{
 const markup=await readFile(new URL('../preview/gate-b/index.html',import.meta.url),'utf8');
 const script=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 const mist=await readFile(new URL('../preview/gate-b/FlowMist.mjs',import.meta.url),'utf8');
 assert.match(markup,/GATE B v8/);
 assert.doesNotMatch(markup,/data-shuffle=/);
 assert.match(markup,/FINISH SHUFFLING/);
 assert.doesNotMatch(script,/initVortexAtmosphere/);
 assert.match(mist,/sampleVortexRibbon/);
});

test('seeded gas vortex is rendered once in bounded texture memory',()=>{
 let pixels=null,paintCount=0,segments=0;
 const context={
  createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)}},
  putImageData(img){pixels=img.data;paintCount++},
  save(){},translate(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){segments++},stroke(){},
  set lineWidth(v){this._lineWidth=v},
  set strokeStyle(v){this._strokeStyle=v}
 };
 const mock={width:0,height:0,getContext(){return context}};
 const profile=buildVortexTexture(mock,37851,true);
 assert.equal(profile.arms,4);
 assert.equal(profile.width,352);
 assert.equal(profile.height,352);
 assert.equal(profile.animatedPixelsPerFrame,0);
 assert.equal(paintCount,1);
 assert.ok(pixels.filter((v,i)=>i%4===3&&v>0).length>25000,'Smoke texture has organic transparent gas arms');
 assert.ok(pixels.filter((v,i)=>i%4===3&&v===0).length>3000,'Gas texture leaves black voids');
 assert.ok(segments>200,'Faint spiral filaments are embedded in the texture');
});
