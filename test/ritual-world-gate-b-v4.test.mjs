import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';
import {samplePhysicalShuffle,deckPose,PHYSICAL_CARD,assertShuffleGeometry} from '../src/ritual-world/ShuffleChoreography.mjs';
import {RITUAL_DURATION,RITUAL_BEATS} from '../src/ritual-world/ReferenceRitual.mjs';
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
test('V5 advecting cosmic vacuum stays open across true near/middle/far layers',()=>{
 const x=audit(1.9),y=audit(2.4);
 for(const result of [x,y]){
  assert.ok(result.depthRatio>5,'Cards require real near/middle/far Z layers');
  assert.ok(result.near>=10,'Multiple near depth planes, but no permanently close pile');
  assert.ok(result.far>=20,'The vast majority of spiral depth remains visible');
  assert.ok(result.centerOverlap<=5,'The funnel throat must not fill with a wall of cards');
  assert.ok(result.maxOverlap<=8,'No stack of dozens of faces at vortex time');
  assert.ok(result.overpaint<2.2,'Real projected card area must stay mostly unoccluded');
  assert.ok(result.coverageFraction>.10&&result.coverageFraction<.30,'Grey smoky vortex needs negative space between cards');
  assert.ok(result.boundsX>550,'The first vacuum must reach the broad screen edges');
 }
});
test('V5 second globe is denser, voluminous, asymmetric and illustrative',()=>{
 const before=audit(3.7),start=audit(4.7),globe=audit(5.8),later=audit(6.5);
 assert.ok(start.coverageFraction>before.coverageFraction*8,'Detonation must expand promptly, not linger as a clump');
 for(const result of [globe,later]){
  assert.ok(result.faces>=18&&result.faces<=45,'Genuine original RWS faces must appear among the dark backs');
  assert.ok(result.depthRatio>1.8,'Not a flat screen-plane collage');
  assert.ok(result.maxOverlap<=12,'Local physical overlaps are fine; no flat 78-card wall');
  assert.ok(result.overpaint<2.2,'Reference globe has rich but legible layering');
  assert.ok(result.coverageFraction>.37&&result.coverageFraction<.70,'The second bloom must be notably fuller than v4');
  assert.ok(result.boundsX>430,'The sphere genuinely expands outward across the screen');
 }
});
test('there are exactly three separate complete decks, not three props',()=>{
 const piles=cards.map(card=>({card,position:pose(card,8.3).position}));
 const groups=[0,1,2].map(i=>piles.filter(x=>x.card.orbitSlot%3===i));
 assert.deepEqual(groups.map(a=>a.length),[26,26,26]);
 const centers=groups.map(g=>g.reduce((v,c)=>v+c.position[0],0)/g.length);
 assert.ok(centers[1]-centers[0]>3.5&&centers[2]-centers[1]>3.5);
});
test('the quick shuffle is a true card-by-card transfer, not three rigid moving piles',()=>{
 const halves=cards.filter(c=>c.orbitSlot%3!==1);
 const states={waiting:0,arrived:0,inflight:0};
 for(const card of halves){
  const before=pose(card,8.3).position;
  const middle=pose(card,8.9).position;
  const after=pose(card,9.45).position;
  const toSource=dist(middle,before),toTarget=dist(middle,after);
  if(toSource<.20)states.waiting++;
  else if(toTarget<.20)states.arrived++;
  else states.inflight++;
 }
 assert.equal(halves.length,52);
 assert.ok(states.waiting>=7,'Some cards are still waiting in side decks');
 assert.ok(states.arrived>=7,'Other cards have already joined the combined deck');
 assert.ok(states.inflight>=7,'Multiple individual cards are actively crossing between piles');
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
test('only automatic ritual is exposed, with a temporary vortex behind the real cards',async()=>{
 const markup=await readFile(new URL('../preview/gate-b/index.html',import.meta.url),'utf8');
 const script=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/gate-b/gate-b.css',import.meta.url),'utf8');
 assert.match(markup,/GATE B v5/);
 assert.match(markup,/id="ritual-vortex-glow"/);
 assert.doesNotMatch(markup,/data-shuffle=/);
 assert.match(markup,/FINISH SHUFFLING/);
 assert.match(script,/vacuum-active/);
 assert.match(css,/gateBV5Spiral/);
 assert.match(script,/VortexAtmosphere/);
 assert.match(css,/prefers-reduced-motion/);
});


test('v5 close-up cards appear as temporary whips, not persistent screen occlusion',()=>{
 const calm=audit(1.9),funnel=audit(2.4),whip=audit(3.05),hold=audit(3.7);
 assert.ok(calm.coverageFraction<.25&&funnel.coverageFraction<.30);
 assert.ok(whip.coverageFraction>funnel.coverageFraction*1.8,'Near-camera pass must have a cinematic impact');
 assert.ok(hold.coverageFraction<.04,'All 78 sheets really collapse into a small suspended deck');
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
