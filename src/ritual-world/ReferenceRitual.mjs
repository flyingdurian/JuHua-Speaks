/**
 * Gate B v6 — automatic ritual, authored from the actual 15.813s split screen.
 *
 * A fully time-parametrized, coherent flow carries 78 independently moving
 * cards through axial suction, accelerated angular travel and radial collapse.
 * No card is assigned a fixed stream, frozen ring or static depth.
 *
 * A complete 78-layer deck forms, then detonates into a turbulent,
 * multi-radius 3D card globe. 39 outer + 25 inner + 14 roving cards,
 * each with independent spin and real fronts/backs. No perfectly regular
 * spherical shell. Three physical 26-card decks finish with staggered
 * individual sheet transfers. Total 78 authentic identities unchanged.
 *
 * Pure sampled choreography; no timer, rendering, AI, card draw or allocation
 * beyond per-frame pose arrays. Gate A world/camera remain persistent.
 */
import {sampleLandingPose,landingAttitude} from './OrbitalField.mjs';

const N=78,TAU=2*Math.PI,GOLDEN=Math.PI*(3-Math.sqrt(5));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const smoother=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
const mix=(a,b,t)=>a+(b-a)*t;
const vmix=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const mag=a=>Math.hypot(...a);
const norm=a=>{const d=mag(a)||1;return a.map(v=>v/d)};
const cross=(a,b)=>[
 a[1]*b[2]-a[2]*b[1],
 a[2]*b[0]-a[0]*b[2],
 a[0]*b[1]-a[1]*b[0]
];
const hash=(i,s=0)=>{
 let x=(Math.imul((i+1)>>>0,0x9e3779b9)^(s>>>0))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;
 x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
};
export const RITUAL_DURATION=10.80;
export const RITUAL_BEATS=Object.freeze([
 Object.freeze({id:'approach',start:0,end:1.20}),
 Object.freeze({id:'vortex',start:1.20,end:2.86}),
 Object.freeze({id:'implosion',start:2.86,end:3.62}),
 Object.freeze({id:'suspension',start:3.62,end:4.42}),
 Object.freeze({id:'detonation',start:4.42,end:5.25}),
 Object.freeze({id:'globe',start:5.25,end:7.12}),
 Object.freeze({id:'dispersal',start:7.12,end:7.88}),
 Object.freeze({id:'three_piles',start:7.88,end:8.51}),
 Object.freeze({id:'pile_shuffle',start:8.51,end:9.67}),
 Object.freeze({id:'consolidation',start:9.67,end:RITUAL_DURATION})
]);

function orientedFrom(normal,rightHint=[1,0,0]){
 const n=norm(normal);
 let r=rightHint.map((v,i)=>v-dot(n,rightHint)*n[i]);
 if(mag(r)<.0001)r=cross([0,1,0],n);
 if(mag(r)<.0001)r=cross([1,0,0],n);
 r=norm(r);
 return {normal:n,right:r,up:norm(cross(n,r)),frontFacingCamera:n[2]>0};
}
function facing(yaw=0,pitch=0,roll=0){
 const n=norm([Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)]);
 let r=norm(cross([0,1,0],n)),u=norm(cross(n,r));
 if(roll){
  const c=Math.cos(roll),s=Math.sin(roll),a=r,b=u;
  r=norm(a.map((v,i)=>v*c+b[i]*s));
  u=norm(b.map((v,i)=>v*c-a[i]*s));
 }
 return {normal:n,right:r,up:u,frontFacingCamera:n[2]>0};
}
function slerp(a,b,t){
 const d=clamp(dot(a,b),-1,1);
 if(d>.9995)return norm(vmix(a,b,t));
 if(d<-.9995){
  let o=cross(a,[0,1,0]);
  if(mag(o)<.01)o=cross(a,[1,0,0]);
  o=norm(o);
  return norm(a.map((v,i)=>v*Math.cos(t*Math.PI)+o[i]*Math.sin(t*Math.PI)));
 }
 const theta=Math.acos(d),ss=Math.sin(theta);
 return norm(a.map((v,i)=>v*Math.sin((1-t)*theta)/ss+b[i]*Math.sin(t*theta)/ss));
}
function pose(position,attitude,scale=1){return {position,attitude,scale,visible:true}}
function blend(a,b,t){
 const w=smoother(t);
 return pose(vmix(a.position,b.position,w),
  orientedFrom(slerp(a.attitude.normal,b.attitude.normal,w),vmix(a.attitude.right,b.attitude.right,w)),
  mix(a.scale,b.scale,w));
}
function currentLanding(card,time,entranceMode){
 const position=sampleLandingPose(card,time,entranceMode);
 return pose(position,landingAttitude(card,position,time),1);
}
// Gate B v6: 78 independent Lagrangian card trajectories, NOT a rotating
// spiral illustration or four frozen tubes. Each sheet is sampled through the
// same accelerating flow field. Card index affects release/drag, never its
// fixed slot in a ring. The camera sees crossing paths, overtakes and parallax.
// Three components form a continuous trajectory: axial suction, angular
// advection and an asymmetric, damped radial collapse.
function suctionPose(card,t){
 const k=card.orbitSlot,seed=card.visualSeed>>>0;
 const rnd=n=>hash(k+n,seed);
 const release=.70+.30*rnd(113);
 const age=Math.max(0,t-release);
 const duration=2.60-.35*rnd(29);
 const u=clamp(age/duration);
 // Material particles advance towards the lens and through a narrow throat.
 // Travel is time-driven (not k/78), with staggered entry and acceleration.
 const travel=u*u*(1.52-.52*u);
 const far=23+15*rnd(33);
 const depth=far-(far-4.25)*travel;
 const theta=TAU*rnd(43)+TAU*(.42*u+1.90*u*u+.32*u*u*u)
   +.22*Math.sin(u*TAU*2+k*1.41);
 // The atmospheric cloud is only background; cards ARE the moving tornado.
 // Large, uneven radial travel first expands the field, then tightens it.
 const startRadius=2.0+11.5*rnd(53);
 const radial=startRadius*(.90-.66*smoother(u)) + .8*rnd(57);
 const stretch=1+.26*Math.sin(theta*.54+2*rnd(67));
 const x=radial*Math.cos(theta)*stretch+.95*Math.sin(u*TAU+k*.77);
 const y=radial*.86*Math.sin(theta)+1.2*Math.cos(u*TAU*.8+k*.41);
 const z=-depth+.65*Math.sin(theta*.8+k*.24);
 // Chosen sheets perform camera-directed ballistic arcs rather than popping
 // into arbitrarily assigned near-lens locations. The path is C1 smooth and
 // reunites with the ordinary inward flow on either end.
 const flyer=k%13===2||k%17===5;
 const center=2.96+.19*rnd(214);
 const pulse=clamp((t-center+.35)/.70);
 const gust=flyer?Math.pow(Math.sin(Math.PI*pulse),2):0;
 const position=[
  x*(1-.57*gust)+gust*2.1*Math.sin(theta+.4),
  y*(1-.57*gust)+gust*1.7*Math.cos(theta-.6),
  z+gust*(depth-2.75)
 ];
 // Independently spinning papers: orientation follows the moving tangent
 // with wobble, pitch and roll, not synchronized billiard-ball rotation.
 const angularVelocity=TAU*(.42+3.80*u+.96*u*u)/duration;
 const yaw=.18*Math.sin(theta)+.53*Math.sin(2.1*theta+k*.71)
   +.14*Math.sin(angularVelocity*.1+k);
 const pitch=.20*Math.sin(1.4*theta+k*.33)+.15*Math.sin(6.8*u+k);
 const roll=.69*Math.sin(theta*.83+k*.63)+.23*Math.sin(14*u+k*.37);
 const scale=.72+.22*rnd(93)+.19*gust;
 return pose(position,facing(yaw,pitch,roll),scale);
}
function pocketPose(card,t){
 const k=card.orbitSlot,normal=facing(1.11+.05*Math.sin(t*.32),-.09,.018*Math.sin(t*.5));
 const layer=(k-38.5)*.0145;
 return pose([
  normal.normal[0]*layer,
  -.10+normal.normal[1]*layer,
  -16.2+normal.normal[2]*layer
 ],normal,1.05);
}
function implosionPose(card,t){
 const delay=(card.orbitSlot%6)*.017;
 const p=clamp((t-2.86-delay)/(.76-delay));
 const a=suctionPose(card,t),b=pocketPose(card,t);
 const result=blend(a,b,p);
 const swirl=.42*Math.sin(Math.PI*ease(p))*(1-p);
 const phi=card.orbitSlot*GOLDEN+8.6*t;
 result.position[0]+=swirl*Math.cos(phi);
 result.position[1]+=swirl*Math.sin(phi);
 return result;
}
// 3 distinct REAL depth families, not one mathematically regular shell.
// Outer 39 cards: coherent but violently turning surface;
// inner 25 cards: luminous/dark central mass;
// 14 foreground flyers: genuine close-up faces/backs/edge silhouettes.
function chaoticGlobePose(card,t){
 const k=card.orbitSlot,seed=card.visualSeed>>>0;
 const rnd=n=>hash(k+n,seed);
 // The 39/25/14 groups define broad density, not three static mathematical
 // shells. Each sphere sheet precesses around a different inclined axis,
 // crosses depth layers and changes latitude while the whole cloud tumbles.
 const outer=k<39,inner=k>=39&&k<64,roamer=k>=64;
 const idx=outer?k:inner?k-39:k-64;
 const size=outer?39:inner?25:14;
 const time=t-4.42;
 const baseLat=1-2*(idx+.5)/size;
 const lat=clamp(baseLat+.29*Math.sin(time*2.4+k*.74),-.96,.96);
 const radial=Math.sqrt(1-lat*lat);
 const omega=(outer?2.3:inner?-2.1:3.15)*(1+.18*(rnd(81)-.5));
 const theta=idx*GOLDEN+TAU*rnd(107)*.34+omega*time
   +.28*Math.sin(time*3+k*.63);
 const radius=(outer?5.55:inner?3.15:6.00)
   *(.90+.19*rnd(91)+.075*Math.sin(time*4.1+k*.8));
 const orbitalX=radius*radial*Math.cos(theta);
 const orbitalZ=radius*radial*Math.sin(theta);
 const incline=.34+.20*Math.sin(time*.74);
 let position=[
  orbitalX+.44*Math.sin(time*1.8+k*.27),
  radius*lat+incline*orbitalZ+.32*Math.cos(time*2.5+k*.41),
  -13.45+orbitalZ*.91-incline*orbitalX*.36
 ];
 if(roamer){
  // Outer cards pass across and THROUGH the globe's silhouette, entering
  // foreground then receding rather than sitting in a fixed outer sphere.
  const pulse=Math.pow(Math.sin(Math.PI*clamp((t-(5.02+(idx%4)*.32))/.98)),2);
  position[0]=mix(position[0],1.35*Math.cos(theta),pulse*.57);
  position[1]=mix(position[1],1.80*Math.sin(theta),pulse*.57);
  position[2]+=pulse*3.4;
 }
 // Local attitude spin is independent of the cloud's global tumble.
 const spin=time*(2.4+.84*rnd(72))+k*.67;
 const frontBias=k%4===0||k%7===3?Math.PI:0;
 const yaw=frontBias+1.12*Math.sin(spin)+.46*Math.sin(theta);
 const pitch=.79*Math.sin(time*3.1+k*.39);
 const roll=.91*Math.sin(time*3.6+k*.31)+.15*Math.cos(k);
 const scale=(outer?1.11:inner?.95:1.25)+.22*rnd(37);
 return pose(position,facing(yaw,pitch,roll),scale);
}
function detonationPose(card,t){
 const delay=(card.orbitSlot%7)*.020;
 const u=clamp((t-4.42-delay)/(.83-delay));
 // This is deliberately front-loaded rather than double-smoothstep, so
 // the 78-card globe is already enormous at the first quarter of the beat.
 const p=1-Math.pow(1-u,2.45);
 const start=pocketPose(card,t),end=chaoticGlobePose(card,t);
 const result=blend(start,end,Math.sqrt(p));
 const arc=.48*Math.sin(Math.PI*p);
 const theta=card.orbitSlot*GOLDEN+t*4.6;
 result.position[0]+=arc*Math.cos(theta);
 result.position[1]+=arc*Math.sin(theta);
 return result;
}
function subdeckPose(card,t){
 const k=card.orbitSlot,g=k%3,slot=Math.floor(k/3);
 const centerX=[-3.65,0,3.65][g],centerZ=[-14.2,-14.0,-14.5][g];
 const orientation=facing(.49+(g-1)*.10,-.10,.026*(g-1));
 const layer=(slot-12.5)*.0145;
 return pose([
  centerX+orientation.normal[0]*layer,
  -.08+orientation.normal[1]*layer,
  centerZ+orientation.normal[2]*layer
 ],orientation,1.04);
}
function splitPose(card,t){
 const delay=(card.orbitSlot%7)*.012;
 const p=clamp((t-7.12-delay)/(.76-delay));
 const from=chaoticGlobePose(card,t),to=subdeckPose(card,t);
 const result=blend(from,to,p);
 result.position[1]+=.36*Math.sin(Math.PI*ease(p));
 return result;
}
function fannedDeckPose(card,t){
 const k=card.orbitSlot,ang=k*GOLDEN;
 const orientation=facing(.98+.02*Math.sin(t*.3),-.11,.012*Math.cos(t*.8));
 const layer=(k-38.5)*.0158;
 return pose([
  orientation.normal[0]*layer+.054*Math.sin(ang),
  -.08+orientation.normal[1]*layer+.034*Math.cos(ang),
  -16.25+orientation.normal[2]*layer+.063*Math.cos(ang)
 ],orientation,1.06);
}
function transferPose(card,t){
 const k=card.orbitSlot,g=k%3,slot=Math.floor(k/3),from=subdeckPose(card,t);
 const to=fannedDeckPose(card,t);
 const delay=(g===1?0:.020)+slot/25*.44+(g===2?.035:0);
 const dur=g===1?.32:.30;
 const p=clamp((t-8.51-delay)/dur);
 const result=blend(from,to,p);
 const arch=Math.sin(Math.PI*ease(p));
 result.position[1]+=arch*(g===1?.10:.55);
 result.position[2]-=arch*(g===1?.09:.30);
 return result;
}
function settlePose(card,t,deckPose,worldTime){
 return blend(fannedDeckPose(card,t),deckPose(card,worldTime),(t-9.67)/(RITUAL_DURATION-9.67));
}
export function sampleReferenceRitual(card,{age=0,landingAt=0,worldTime=0,entranceMode='inside-out',deckPose}={}){
 if(typeof deckPose!=='function')throw Error('Reference ritual requires a physical canonical deckPose');
 const t=Math.max(0,Number(age)||0);
 if(t<1.20)return blend(currentLanding(card,landingAt,entranceMode),suctionPose(card,t),t/1.20);
 if(t<2.86)return suctionPose(card,t);
 if(t<3.62)return implosionPose(card,t);
 if(t<4.42)return pocketPose(card,t);
 if(t<5.25)return detonationPose(card,t);
 if(t<7.12)return chaoticGlobePose(card,t);
 if(t<7.88)return splitPose(card,t);
 if(t<8.51)return subdeckPose(card,t);
 if(t<9.67)return transferPose(card,t);
 if(t<RITUAL_DURATION)return settlePose(card,t,deckPose,worldTime);
 return deckPose(card,worldTime);
}
export function referenceBeat(age){
 for(const b of RITUAL_BEATS)if(age<b.end)return b.id;
 return 'deck_ready';
}
export function referenceDiagnostics(cards,{age,landingAt=0,worldTime=0,entranceMode='inside-out',deckPose}={}){
 const poses=cards.map(card=>sampleReferenceRitual(card,{age,landingAt,worldTime,entranceMode,deckPose}));
 const p=poses.map(x=>x.position),z=p.map(x=>x[2]),x=p.map(x=>x[0]),y=p.map(x=>x[1]);
 return {beat:referenceBeat(age),count:poses.length,fronts:poses.filter(x=>x.attitude.normal[2]>0).length,
  worldDepth:Math.max(...z)-Math.min(...z),width:Math.max(...x)-Math.min(...x),height:Math.max(...y)-Math.min(...y)};
}
