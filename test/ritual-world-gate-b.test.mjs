import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities,sampleLandingPose} from '../src/ritual-world/OrbitalField.mjs';
import {
 AUTO_SHUFFLE_SECONDS,SHUFFLE_CHOICES,SHUFFLE_DURATIONS,PHYSICAL_CARD,
 samplePhysicalShuffle,deckPose,deckThickness,shuffleDuration,shuffleBeat
} from '../src/ritual-world/ShuffleChoreography.mjs';

const cards=makeLandingCardEntities(DECK,702509);
const point=(c,age,style='auto')=>samplePhysicalShuffle(c,{style,age,landingAt:7,worldTime:24.5});
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const unique=arr=>new Set(arr.map(x=>x.join(',').slice(0,60))).size;

test('all 78 original cards remain distinct physical objects and visual shuffle never changes IDs',()=>{
 assert.equal(cards.length,78);
 assert.equal(new Set(cards.map(x=>x.id)).size,78);
 assert.equal(new Set(cards.map(x=>x.orbitSlot)).size,78);
 assert.deepEqual(SHUFFLE_CHOICES,['cosmic','riffle','wash']);
 assert.ok(PHYSICAL_CARD.width>0&&PHYSICAL_CARD.height>0);
 assert.ok(AUTO_SHUFFLE_SECONDS>=5&&AUTO_SHUFFLE_SECONDS<=8);
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
 assert.ok(poses.every(p=>p.attitude.normal[2]<0),'No front-illustrated card pile after start');
 assert.ok(poses.every(p=>p.position[2]<-10&&p.position[2]>-22));
 assert.equal(shuffleBeat('auto',2.5),'tornado');
 assert.equal(shuffleBeat('auto',5.2),'collapsing');
});
test('physical deck is 78 closely stacked backs, not a singular facing card',()=>{
 const deck=cards.map(c=>deckPose(c,24.5));
 assert.equal(deck.length,78);
 assert.equal(unique(deck.map(p=>p.position)),78);
 assert.ok(deckThickness(cards)>1&&deckThickness(cards)<1.6,'Actual stack thickness');
 assert.ok(deck.every(p=>p.attitude.normal[2]<-.65),'backs face the viewer');
 assert.ok(deck.every(p=>p.scale>2),'legible complete deck in front of camera');
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
 assert.equal(shuffleBeat('riffle',3.6),'closing');
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
 assert.match(html,/GATE B/);
 assert.match(html,/data-shuffle="cosmic"/);
 assert.match(html,/data-shuffle="riffle"/);
 assert.match(html,/data-shuffle="wash"/);
 assert.match(js,/world\.beginAutoShuffle\(\)/);
 assert.match(js,/world\.playShuffle\(style\)/);
 assert.match(js,/Gate B complete/);
 assert.match(css,/gate-b \.ritual-panel/);
 assert.match(server,/GATE_B_PORT\|\|4184/);
 assert.match(pkg.scripts['preview:gate-b'],/serve-gate-b\.mjs/);
 assert.ok(!js.includes('sendLocalExodia'));
});
