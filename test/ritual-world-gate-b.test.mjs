import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities,sampleLandingPose} from '../src/ritual-world/OrbitalField.mjs';
import {appendPremiumCard} from '../src/ritual-world/CardSurface.mjs';
import {
 AUTO_SHUFFLE_SECONDS,SHUFFLE_CHOICES,SHUFFLE_DURATIONS,PHYSICAL_CARD,AUTO_RITUAL_BEATS,
 samplePhysicalShuffle,deckPose,deckThickness,shuffleDuration,shuffleBeat,assertShuffleGeometry
} from '../src/ritual-world/ShuffleChoreography.mjs';

import {RITUAL_TIME_SCALE,CANONICAL_RITUAL_DURATION} from '../src/ritual-world/ReferenceRitual.mjs';
const cards=makeLandingCardEntities(DECK,702509);
// Historical visual audit landmarks below use canonical reference seconds.
const point=(c,age,style='auto')=>samplePhysicalShuffle(c,{style,age:style==='auto'&&age!==AUTO_SHUFFLE_SECONDS?age/RITUAL_TIME_SCALE:age,landingAt:7,worldTime:24.5});
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const unique=arr=>new Set(arr.map(x=>x.join(',').slice(0,60))).size;

test('all 78 original cards remain distinct physical objects and visual shuffle never changes IDs',()=>{
 assert.equal(cards.length,78);
 assert.equal(new Set(cards.map(x=>x.id)).size,78);
 assert.equal(new Set(cards.map(x=>x.orbitSlot)).size,78);
 assert.deepEqual(SHUFFLE_CHOICES,['cosmic','riffle','wash']);
 assert.ok(PHYSICAL_CARD.width>0&&PHYSICAL_CARD.height>0);
 assert.ok(AUTO_SHUFFLE_SECONDS>=10&&AUTO_SHUFFLE_SECONDS<=11);
 for(const style of ['auto',...SHUFFLE_CHOICES]){
  for(const t of [0,.25,1.2,2.3,3.8,6.6]){
   const poses=cards.map(c=>point(c,t,style));
   assert.equal(poses.length,78);
   assert.ok(poses.every(p=>p.position.length===3&&p.position.every(Number.isFinite)&&p.scale>0));
   assert.ok(poses.every(p=>p.attitude.normal.every(Number.isFinite)));
   assert.ok(poses.every(p=>p.visible));
  }
 }
});

test('automatic coherent tornado has bounded radius and real depth without face-up piles',()=>{
 const poses=cards.map(c=>point(c,2.5));
 const y=poses.map(x=>x.position[1]),x=poses.map(x=>x.position[0]),z=poses.map(x=>x.position[2]);
 assert.ok(Math.max(...y)-Math.min(...y)>7,'Real vertical funnel / helical height');
 assert.ok(Math.max(...x)-Math.min(...x)>3.5,'Controlled tornado has a wide readable radius');
 assert.ok(Math.max(...z)-Math.min(...z)>2,'Tornado moves through 3D depth');
 assert.ok(poses.filter(p=>p.attitude.normal[2]<0).length>=45,'The helical storm must predominantly show dark backs');
 assert.ok(poses.every(p=>p.position[2]<-3&&p.position[2]>-66),'Dolly-out preserves long-range tunnel perspective');
 assert.equal(shuffleBeat('auto',2.5/RITUAL_TIME_SCALE),'vortex');
 assert.equal(shuffleBeat('auto',3.7/RITUAL_TIME_SCALE),'vortex');
 assert.equal(shuffleBeat('auto',5.2/RITUAL_TIME_SCALE),'vortex');
 assert.equal(shuffleBeat('auto',6.4/RITUAL_TIME_SCALE),'suspension');
 assert.equal(shuffleBeat('auto',8.25/RITUAL_TIME_SCALE),'globe');
 assert.equal(shuffleBeat('auto',9.8/RITUAL_TIME_SCALE),'globe');
});
test('physical deck is 78 closely stacked backs, not a singular facing card',()=>{
 const deck=cards.map(c=>deckPose(c,24.5));
 assert.equal(deck.length,78);
 assert.equal(unique(deck.map(p=>p.position)),78);
 assert.ok(deckThickness(cards)>.75&&deckThickness(cards)<1.05,'compressed 78-sheet stack thickness');
 assert.ok(deck.every(p=>p.attitude.normal[2]<-.25),'tilted backs face the viewer without flat billboard presentation');
 assert.ok(deck.every(p=>p.scale>=1&&p.scale<=1.3),'compact reference-scaled deck, not oversized slab');
 const end=cards.map(c=>point(c,AUTO_SHUFFLE_SECONDS));
 for(let i=0;i<78;i++)assert.deepEqual(end[i],deck[i]);
 assert.equal(shuffleBeat('auto',AUTO_SHUFFLE_SECONDS),'deck_ready');
});

test('Riffle has two genuine 39-card stacks before alternating interleave',()=>{
 const split=cards.map(c=>point(c,.74,'riffle'));
 assert.equal(split.filter((p,i)=>cards[i].orbitSlot%2===0).length,39);
 assert.equal(split.filter((p,i)=>cards[i].orbitSlot%2===1).length,39);
 const left=split.filter((p,i)=>cards[i].orbitSlot%2===0).map(x=>x.position[0]);
 const right=split.filter((p,i)=>cards[i].orbitSlot%2===1).map(x=>x.position[0]);
 assert.ok(left.every(x=>x<0));
 assert.ok(right.every(x=>x>0));
 assert.equal(shuffleBeat('riffle',1.4),'interleaving');
 assert.equal(shuffleBeat('riffle',3.6),'interleaving');
 assert.equal(shuffleBeat('riffle',4.6),'bridging');
});

test('Cosmic, Riffle and Wash use visibly different movement rather than the same random spin',()=>{
 const example=cards[17],age=2.2;
 const a=point(example,age,'cosmic'),b=point(example,age,'riffle'),c=point(example,age,'wash');
 assert.ok(dist(a.position,b.position)>.5);
 assert.ok(dist(b.position,c.position)>.5);
 assert.ok(dist(a.position,c.position)>.5);
 assert.ok(Object.values(SHUFFLE_DURATIONS).every(v=>v>=4&&v<=6));
 for(const style of SHUFFLE_CHOICES){
  const finish=shuffleDuration(style);
  assert.equal(shuffleBeat(style,finish),'deck_ready');
  for(const card of cards)assert.deepEqual(point(card,finish,style),deckPose(card,24.5));
 }
 assert.throws(()=>shuffleDuration('random-chaos'),/Unknown/);
});

test('Table Wash is a bounded planar circulation of backs, not a loose 3D explosion',()=>{
 const spread=cards.map(c=>point(c,2.5,'wash'));
 const xs=spread.map(x=>x.position[0]),ys=spread.map(x=>x.position[1]),zs=spread.map(x=>x.position[2]);
 assert.ok(Math.max(...xs)-Math.min(...xs)>5);
 assert.ok(Math.max(...ys)-Math.min(...ys)>3);
 assert.ok(Math.max(...zs)-Math.min(...zs)<2.5,'Cards stay in a tabletop depth plane');
 assert.ok(spread.every(x=>x.attitude.normal[2]<0));
});

test('landing position is captured at ritual start and reuses the same persistent cards',()=>{
 const time=7;
 const a=cards.map(c=>point(c,0).position);
 const b=cards.map(c=>sampleLandingPose(c,time,'inside-out'));
 assert.ok(a.every((p,i)=>dist(p,b[i])<1e-9));
});

test('WebGL and Canvas both run the same pure choreography, with a complete deck and no renderer remount',async()=>{
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const cv=await readFile(new URL('../src/ritual-world/CanvasOrbit.mjs',import.meta.url),'utf8');
 for(const code of [gl,cv]){
  assert.match(code,/beginAutoShuffle\(/);
  assert.match(code,/playShuffle\(style\)/);
  assert.match(code,/samplePhysicalShuffle/);
  assert.match(code,/deckPose\(card,this\.elapsed\)/);
  assert.match(code,/getShuffleState\(/);
  assert.match(code,/stackedCards:this\.phase==='deck_formed'\?78:0/);
  assert.match(code,/shuffleDuration\(this\.shuffleStyle\)/);
  assert.match(code,/PHYSICAL_CARD/);
 }
 assert.match(gl,/appendPremiumCard\(vertices,\{\.\.\.card,\.\.\.PHYSICAL_CARD\}/);
 assert.match(cv,/dimensions=landing\?card:PHYSICAL_CARD/);
});

test('Gate B preview starts independently of production and uses port 4184',async()=>{
 const html=await readFile(new URL('../preview/gate-b/index.html',import.meta.url),'utf8');
 const js=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/gate-b/gate-b.css',import.meta.url),'utf8');
 const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
 const server=await readFile(new URL('../scripts/serve-gate-a.mjs',import.meta.url),'utf8');
 assert.match(html,/GATE BC v3\.3/);
 assert.doesNotMatch(html,/data-shuffle="cosmic"/);
 assert.doesNotMatch(html,/data-shuffle="riffle"/);
 assert.doesNotMatch(html,/data-shuffle="wash"/);
 assert.match(js,/world\.beginAutoShuffle\(\)/);
 assert.match(js,/world\.playShuffle\(style\)/);
 assert.match(html,/data-shuffle-style="cosmic"/);
 assert.match(html,/data-shuffle-style="riffle"/);
 assert.match(html,/data-shuffle-style="wash"/);
 assert.match(js,/mountPostShuffle/);
 assert.doesNotMatch(js,/window\.location\.assign\(/);
 assert.match(css,/gate-b \.ritual-panel/);
 assert.match(server,/GATE_B_PORT\|\|4184/);
 assert.match(pkg.scripts['preview:gate-b'],/serve-gate-b\.mjs/);
 assert.ok(!js.includes('sendLocalExodia'));
});


test('REGRESSION: every post-CTA card has a complete XYZ basis and finite GPU vertices',()=>{
 const phases={
  auto:[0.05,.35,1.4,2.8,4.5,5.4,6.6],
  cosmic:[.15,1.3,3.6,4.7],
  riffle:[.15,.74,1.5,3.2,4.8],
  wash:[.15,1.5,3.8,5.2]
 };
 const uv=(slot,u,v)=>[(slot%9+u)/9,(Math.floor(slot/9)+v)/9];
 let checked=0;
 for(const [style,times] of Object.entries(phases)){
  for(const age of times){
   const vertices=[];
   for(const card of cards){
    const p=samplePhysicalShuffle(card,{style,age,landingAt:7,worldTime:24.5});
    const basis=p.attitude;
    for(const name of ['normal','right','up']){
     assert.equal(basis[name].length,3,style+' '+age+' '+card.id+' has incomplete '+name+' vector');
     assert.ok(basis[name].every(Number.isFinite),style+' '+age+' '+card.id+' has non-finite '+name);
     assert.ok(Math.abs(Math.hypot(...basis[name])-1)<.001,style+' '+age+' '+name+' must be unit length');
    }
    assert.ok(p.position.length===3&&p.position.every(Number.isFinite),'Finite 3D position required');
    appendPremiumCard(vertices,{...card,...PHYSICAL_CARD},p.position,basis,p.scale,card.light,uv);
    checked++;
   }
   assert.ok(vertices.length>200000,'WebGL must receive non-empty actual geometry for '+style+' '+age);
   assert.equal(vertices.length%6,0,'Each GPU vertex has XYZ, UV and brightness');
   assert.ok(vertices.every(Number.isFinite),'No NaN or Infinity may enter GPU for '+style+' at '+age+' seconds');
  }
 }
 assert.equal(checked,cards.length*Object.values(phases).flat().length);
});

test('REGRESSION: tunnel and sphere preserve oriented GPU projection without forcing all sheets on-screen',()=>{
 const focal=720/(2*Math.tan(58*Math.PI/360));
 const screen=p=>({x:430+p[0]*focal/(-p[2]),y:360-p[1]*focal/(-p[2])});
 for(const [label,t,minVisible] of [['vortex',2.5,35],['deep-tunnel',4.4,35],['deck',6.7,70],
  ['globe',9.5,50],['piles',13.55,70],['finish',16.55,70]]){
  const poses=cards.map(card=>point(card,t)),visible=poses.filter(({position})=>{
   const p=screen(position);
   return position[2]<-1.5&&p.x>=0&&p.x<=860&&p.y>=0&&p.y<=720;
  });
  assert.ok(visible.length>=minVisible,label+' card centers must appear on the reference canvas');
  assert.ok(poses.every(p=>p.attitude.right.length===3&&p.attitude.up.length===3));
 }
});

test('REGRESSION: invalid orientation must fail preflight visibly, not silently blank a frame',()=>{
 for(const style of ['auto',...SHUFFLE_CHOICES]){
  assert.equal(assertShuffleGeometry(cards,{style,landingAt:7,worldTime:24.5}),true);
  const corrupt={...cards[0],orbitSlot:NaN};
  assert.throws(()=>assertShuffleGeometry([corrupt],{style,landingAt:7,worldTime:24.5}),/Invalid shuffle XYZ geometry/);
 }
});
test('Both renderers validate geometry before changing ritual phases',async()=>{
 for(const path of ['RitualWorld.mjs','CanvasOrbit.mjs']){
  const code=await readFile(new URL('../src/ritual-world/'+path,import.meta.url),'utf8');
  assert.match(code,/assertShuffleGeometry\(this\.cards,\{style:'auto'/);
  assert.match(code,/assertShuffleGeometry\(this\.cards,\{style,landingAt/);
 }
 const preview=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 assert.match(preview,/renderError=error\.message/);
 assert.match(preview,/SHUFFLE RENDER ERROR/);
});


test('Reference-directed automatic ritual uses ten authored beats in correct order',()=>{
 assert.deepEqual(AUTO_RITUAL_BEATS.map(x=>x.id),[
  'approach','vortex','implosion','suspension','detonation','globe',
  'dispersal','three_piles','pile_shuffle','consolidation'
 ]);
 assert.equal(AUTO_RITUAL_BEATS[0].start,0);
 assert.equal(AUTO_RITUAL_BEATS.at(-1).end,AUTO_SHUFFLE_SECONDS);
 for(let i=1;i<AUTO_RITUAL_BEATS.length;i++)
  assert.equal(AUTO_RITUAL_BEATS[i].start,AUTO_RITUAL_BEATS[i-1].end);
 for(const beat of AUTO_RITUAL_BEATS)
  assert.equal(shuffleBeat('auto',(beat.start+beat.end)/2),beat.id);
});

test('V7 globe shows historical fronts on near hemisphere and engraved backs behind',()=>{
 const globe=cards.map(c=>point(c,9.5));
 const backs=globe.filter(p=>p.attitude.normal[2]<0);
 const faces=globe.filter(p=>p.attitude.normal[2]>0);
 assert.ok(faces.length>=20&&faces.length<=58);
 assert.ok(backs.length>=20);
 const zs=globe.map(x=>x.position[2]);
 assert.ok(Math.max(...zs)-Math.min(...zs)>7);
});

test('V7 still forms 3 actual 26-card stacks after the hollow globe',()=>{
 const piles=cards.map(c=>({card:c,position:point(c,13.6).position}));
 const groups=[0,1,2].map(j=>piles.filter(p=>p.card.orbitSlot%3===j));
 assert.deepEqual(groups.map(g=>g.length),[26,26,26]);
 const centers=groups.map(g=>g.reduce((v,c)=>v+c.position[0],0)/g.length);
 assert.ok(centers[1]-centers[0]>1.4&&centers[2]-centers[1]>1.4);
 const completed=cards.map(c=>point(c,AUTO_SHUFFLE_SECONDS));
 assert.ok(completed.every((p,i)=>dist(p.position,deckPose(cards[i],24.5).position)<1e-8));
});

test('Every storyboard boundary and every optional shuffle is position-continuous',()=>{
 const stages={
  auto:AUTO_RITUAL_BEATS.map(b=>b.end).slice(0,-1),
  cosmic:[1.05,1.8,3.9],
  riffle:[1,1.4,4],
  wash:[1.3,3.95]
 };
 for(const [style,times] of Object.entries(stages)){
  for(const boundary of times){
   let maxTravel=0;
   for(const card of cards){
    const left=point(card,boundary-.002,style).position;
    const right=point(card,boundary+.002,style).position;
    maxTravel=Math.max(maxTravel,dist(left,right));
   }
   assert.ok(maxTravel<.80,style+' unexpected teleport around '+boundary+'s: '+maxTravel.toFixed(4));
  }
 }
});
test('Washing covers the center of the table and keeps cards thin and physically back-facing',()=>{
 assert.ok(PHYSICAL_CARD.thickness>=.009&&PHYSICAL_CARD.thickness<=.012);
 const spread=cards.map(c=>point(c,2.2,'wash'));
 const center=spread.filter(p=>Math.hypot(p.position[0],p.position[1])<1.65);
 assert.ok(center.length>=12,'No hollow ring of cards in the Table Wash');
 assert.ok(spread.every(p=>p.attitude.normal[2]<-.50),'Cards remain face down');
});


test('Start Divination uses the actual current Gate A entrance, never a hardcoded entrance pose',()=>{
 const t=1.1;
 for(const mode of ['inside-out','outside-in']){
  for(const card of cards){
   const sample=samplePhysicalShuffle(card,{style:'auto',age:0,landingAt:t,worldTime:t,entranceMode:mode});
   assert.deepEqual(sample.position,sampleLandingPose(card,t,mode));
  }
 }
});
test('Canvas and WebGL both show real RWS illustrated faces during the reference-style mini-globe',async()=>{
 const cv=await readFile(new URL('../src/ritual-world/CanvasOrbit.mjs',import.meta.url),'utf8');
 const gl=await readFile(new URL('../src/ritual-world/RitualWorld.mjs',import.meta.url),'utf8');
 const mesh=await readFile(new URL('../src/ritual-world/CardSurface.mjs',import.meta.url),'utf8');
 assert.match(cv,/const src=pose\.frontFacingCamera\?this\.fronts\.get\(card\.id\)/);
 assert.match(gl,/appendPremiumCard\(vertices,\{\.\.\.card,\.\.\.PHYSICAL_CARD\}/);
 assert.match(mesh,/card\.thickness \?\? \(EDGE_THICKNESS\*card\.width\)/);
});


test('keyframe envelopes contrast the wide physical tunnel, empty deck pause and shell globe',()=>{
 const f=720/(2*Math.tan(58*Math.PI/360));
 function span(t){
  const projected=cards.map(card=>point(card,t).position).map(p=>f*p[0]/(-p[2]));
  return Math.max(...projected)-Math.min(...projected);
 }
 const tunnel=span(3.6),pocket=span(6.7),globe=span(9.5),piles=span(13.6),deck=span(AUTO_SHUFFLE_SECONDS);
 assert.ok(tunnel>380,'Tunnel must span substantial screen space');
 assert.ok(globe>390,'Hollow sphere must span substantial screen space');
 assert.ok(piles>300&&pocket<90&&deck<90);
 assert.ok(tunnel/pocket>5&&globe/pocket>5);
});

test('automatic story remains isolated from optional shuffle methods until deck formation',async()=>{
 const preview=await readFile(new URL('../preview/gate-b/gate-b.mjs',import.meta.url),'utf8');
 const html=await readFile(new URL('../preview/gate-b/index.html',import.meta.url),'utf8');
 const choreography=await readFile(new URL('../src/ritual-world/ShuffleChoreography.mjs',import.meta.url),'utf8');
 const ritual=await readFile(new URL('../src/ritual-world/ReferenceRitual.mjs',import.meta.url),'utf8');
 assert.match(choreography,/sampleReferenceRitual/);
 assert.match(ritual,/RITUAL_DURATION=10\.60/);
 assert.doesNotMatch(preview,/document\.querySelectorAll\('\[data-shuffle\]'\)/);
 assert.match(html,/shuffle-buttons/);
 assert.match(html,/FINISH SHUFFLING/);
});
test('Gate BC v3 compresses the physical 10-beat ritual into 10.6 seconds',()=>{
 assert.equal(AUTO_RITUAL_BEATS.length,10);
 assert.equal(AUTO_SHUFFLE_SECONDS,10.6);
 for(let i=1;i<AUTO_RITUAL_BEATS.length;i++)
  assert.equal(AUTO_RITUAL_BEATS[i].start,AUTO_RITUAL_BEATS[i-1].end);
 assert.equal(AUTO_RITUAL_BEATS.at(-1).end,AUTO_SHUFFLE_SECONDS);
 assert.deepEqual([0,1,2].map(g=>cards.filter(card=>card.orbitSlot%3===g).length),[26,26,26]);
 for(const [age,expected] of [[2,'vortex'],[5,'vortex'],[6.7,'suspension'],
  [7.6,'detonation'],[9.5,'globe'],[13.6,'three_piles'],[14.7,'pile_shuffle'],[15.8,'consolidation']])
  assert.equal(shuffleBeat('auto',age/RITUAL_TIME_SCALE),expected);
});
