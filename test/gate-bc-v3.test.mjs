import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DECK} from '../src/deck.mjs';
import {makeLandingCardEntities} from '../src/ritual-world/OrbitalField.mjs';
import {organicSheetOffset,positionOrganicSheet,ORGANIC_GAP,ORGANIC_STEP} from '../src/ritual-world/OrganicDeck.mjs';
import {RITUAL_DURATION,RITUAL_BEATS,RITUAL_TIME_SCALE,sampleReferenceGlobeCanonical} from '../src/ritual-world/ReferenceRitual.mjs';
import {samplePhysicalShuffle,deckPose} from '../src/ritual-world/ShuffleChoreography.mjs';
import {SPHERE_VERTEX_STRIDE,SPHERE_SHEET_THICKNESS,extrudedCardVertices} from '../preview/post-shuffle/PhysicalSphereMesh.mjs';
import {FOIL_FINISHES,chooseFoilFinish,cardBrief,SPREAD_ROLES} from '../preview/post-shuffle/TarotTableau.mjs';

const cards=makeLandingCardEntities(DECK,2165840022);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const dist=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
test('Gate BC v3: 5.95 seconds removed while preserving 10 physical beats',()=>{
 assert.equal(RITUAL_DURATION,10.6);
 assert.ok(16.55-RITUAL_DURATION>=5.9);
 assert.equal(RITUAL_BEATS.length,10);
 assert.equal(RITUAL_BEATS.at(-1).end,RITUAL_DURATION);
 assert.deepEqual(RITUAL_BEATS.map(x=>x.id),[
  'approach','vortex','implosion','suspension','detonation','globe',
  'dispersal','three_piles','pile_shuffle','consolidation'
 ]);
 for(const b of RITUAL_BEATS){
  const age=(b.start+b.end)/2;
  const samples=cards.map(c=>samplePhysicalShuffle(c,{age,style:'auto',landingAt:7,worldTime:24.5}));
  assert.ok(samples.every(p=>p.position.every(Number.isFinite)&&p.scale>0),b.id+' has invalid sheet');
 }
 for(const card of cards){
  assert.deepEqual(samplePhysicalShuffle(card,{age:RITUAL_DURATION,landingAt:7,worldTime:24.5}),deckPose(card,24.5));
 }
});
test('Every deck uses a distinct organic sheet but keeps real positive air gaps',()=>{
 assert.ok(ORGANIC_GAP>.007);
 const basis={normal:[0,0,1],right:[1,0,0],up:[0,1,0]};
 const offsets=Array.from({length:78},(_,rank)=>organicSheetOffset(rank));
 const xys=new Set(offsets.map(o=>[o.x.toFixed(4),o.y.toFixed(4)].join(',')));
 assert.ok(xys.size>65);
 const positions=offsets.map((o,i)=>positionOrganicSheet([0,0,0],basis,i));
 // Normal-axis increments are either one thin sheet or one real packet
 // seam; they must never collapse or reverse adjacent physical cards.
 const depths=positions.slice(1).map((p,i)=>p[2]-positions[i][2]);
 assert.ok(depths.every(d=>d>=ORGANIC_STEP-1e-10));
 assert.equal(depths.filter(d=>d>ORGANIC_STEP+.01).length,6,'seven physical packets have six dark shadow seams');
 for(let g=0;g<3;g++){
  const pile=Array.from({length:26},(_,slot)=>positionOrganicSheet([g*4,0,0],basis,slot,{count:26,group:g+1}));
  assert.ok(pile.every(p=>p.every(Number.isFinite)));
  assert.ok(new Set(pile.map(p=>p[0].toFixed(4)+','+p[1].toFixed(4))).size>20);
 }
});
test('Three interwoven currents shuffle individual sheets inside the globe',()=>{
 const sample=t=>cards.map(c=>sampleReferenceGlobeCanonical(c,t).position);
 const atA=sample(9.0),atB=sample(9.4);
 assert.ok(atA.filter((p,i)=>dist(p,atB[i])>.45).length>55);
 assert.ok(atA.every(p=>p.every(Number.isFinite)));
});
test('3D sphere draws 2 physical faces plus independent paper edges',()=>{
 const corners=[[-.43,-.7,-3],[.43,-.7,-3],[.43,.7,-3],[-.43,.7,-3]];
 const v=extrudedCardVertices({corners,normal:[0,0,-1],cameraZ:0,slot:23,selected:1,alpha:.8});
 assert.equal(v.length%SPHERE_VERTEX_STRIDE,0);
 assert.ok(v.length>=36*SPHERE_VERTEX_STRIDE,'front, back and four edges must have true triangles');
 const slots=new Set();
 for(let i=0;i<v.length;i+=SPHERE_VERTEX_STRIDE)slots.add(v[i+5]);
 assert.ok(slots.has(-1)&&slots.has(23));
 assert.ok(v.every(Number.isFinite));
 assert.ok(SPHERE_SHEET_THICKNESS>.03);
});
test('Exactly four session finishes, authentic RWS interpretations and same foil for three cards',()=>{
 assert.equal(FOIL_FINISHES.length,4);
 assert.deepEqual(SPREAD_ROLES,['Past','Present','Future']);
 assert.deepEqual(FOIL_FINISHES.map((_,i)=>chooseFoilFinish(()=>i)),FOIL_FINISHES);
 assert.equal(chooseFoilFinish(()=>0),FOIL_FINISHES[0]);
 assert.match(cardBrief('major-17'),/Hope/);
 assert.match(cardBrief('major-17','reversed'),/Discouragement/);
 assert.throws(()=>chooseFoilFinish(()=>8),/Invalid/);
});
test('GPU highlight belongs to the selected sheet and final tableau actually reveals meanings',async()=>{
 const scene=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 const tableau=await readFile(new URL('../preview/post-shuffle/TarotTableau.mjs',import.meta.url),'utf8');
 assert.match(scene,/extrudedCardVertices/);
 assert.match(scene,/selected:pct,alpha/);
 assert.match(scene,/p\.position=p\.position\.map/);
 assert.match(scene,/choices\.length===3&&/);
 assert.doesNotMatch(scene,/function updateAuras/);
 assert.match(scene,/horizontal panning only/);
 assert.match(tableau,/cardBrief\(pick\.id,pick\.orientation\)/);
 assert.match(tableau,/ps-revealed/);
 assert.match(css,/@keyframes ps-flip-land/);
 for(const finish of FOIL_FINISHES)assert.ok(css.includes('ps-foil-'+finish),finish);
});

test('Suspended organic deck continues a deliberately slow physical yaw in place',()=>{
 const first=deckPose(cards[0],24.5),later=deckPose(cards[0],38.5);
 const distance=dist(first.attitude.normal,later.attitude.normal);
 assert.ok(distance>.10&&distance<.50,'suspended deck must visibly turn without fast spinning');
 assert.ok(later.attitude.normal[2]<-.25,'reference engraved back should remain visible during initial turn');
});

test('Gate BC v3.1 acceptance guards: packet shader, tactile reveal and static layout',async()=>{
 const organic=await readFile(new URL('../src/ritual-world/OrganicDeck.mjs',import.meta.url),'utf8');
 const deck=await readFile(new URL('../src/ritual-world/InstancedDeck.mjs',import.meta.url),'utf8');
 const scene=await readFile(new URL('../preview/post-shuffle/scene.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../preview/post-shuffle/post-shuffle.css',import.meta.url),'utf8');
 assert.match(organic,/DEFAULT_PACKET_COUNT=7/);
 assert.match(organic,/PACKET_SEAM_EXTRA/);
 assert.match(deck,/packetOf\(rank\)/);
 assert.doesNotMatch(deck,/float ink=smoothstep/);
 assert.match(scene,/pickProjectedCard\(rendered,localX,localY/);
 assert.doesNotMatch(scene,/const candidates=rendered\.filter/);
 assert.match(css,/\.ps-tableau-detail\[hidden\]\{display:block!important/);
 assert.match(css,/grid-template-rows:clamp\(23px,4vh,35px\)/);
 assert.match(css,/\.ps-card-back::after/);
 assert.match(css,/@keyframes ps-vapor-roll/);
 assert.match(css,/@keyframes ps-prestige-sweep/);
 assert.match(css,/@keyframes ps-nebula-volumetric/);
 assert.match(css,/\.ps-flip-inner::before/);
});
