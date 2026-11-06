/**
 * Gate B v3 — reference-directed automatic divination choreography.
 *
 * The 30.906-second reference comparison showed TWO large spatial events,
 * separated by a deliberately small suspended deck:
 *  1. WIDE rush / orbiting helix -> small pocket deck.
 *  2. Pocket deck erupts into a LARGE 3D Tarot globe (genuine RWS fronts).
 *  3. Globe separates into THREE readable 26-card piles, then consolidates.
 *
 * No "compact cluster" is reused for the helix or globe. Every pose uses
 * all 78 card identities. This is pure deterministic animation; no runtime
 * mesh or GPU allocations, card draws, AI calls, or scene remounts.
 */
import {sampleLandingPose,landingAttitude} from './OrbitalField.mjs';

const N=78,TAU=Math.PI*2,GOLDEN=Math.PI*(3-Math.sqrt(5));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const smoother=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
const lerp=(a,b,t)=>a+(b-a)*t;
const vMix=(a,b,t)=>a.map((x,i)=>lerp(x,b[i],t));
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const length=a=>Math.hypot(...a);
const norm=a=>{const d=length(a)||1;return a.map(x=>x/d)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const hash=(i,s=0)=>{let x=(Math.imul(i+1,0x9e3779b9)^s)>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return (x>>>0)/4294967296};
export const RITUAL_DURATION=10.8;
export const RITUAL_BEATS=Object.freeze([
 Object.freeze({id:'approach',start:0,end:1.40}),
 Object.freeze({id:'vortex',start:1.40,end:2.65}),
 Object.freeze({id:'implosion',start:2.65,end:3.30}),
 Object.freeze({id:'suspension',start:3.30,end:4.40}),
 Object.freeze({id:'detonation',start:4.40,end:5.25}),
 Object.freeze({id:'globe',start:5.25,end:7.25}),
 Object.freeze({id:'dispersal',start:7.25,end:8.05}),
 Object.freeze({id:'three_piles',start:8.05,end:8.55}),
 Object.freeze({id:'pile_shuffle',start:8.55,end:9.45}),
 Object.freeze({id:'consolidation',start:9.45,end:RITUAL_DURATION})
]);

function attitudeFrom(normal,rightHint=[1,0,0]){
 const n=norm(normal),r0=rightHint.map((v,i)=>v-dot(rightHint,n)*n[i]);
 let right=length(r0)>.001?norm(r0):norm(cross([0,1,0],n));
 if(length(right)<.001)right=[1,0,0];
 const up=norm(cross(n,right));
 return {normal:n,right,up,frontFacingCamera:n[2]>0};
}
function facingAttitude(yaw=0,pitch=0,roll=0){
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
 if(d>.9995)return norm(vMix(a,b,t));
 if(d<-.9995){
  let side=cross(a,[0,1,0]);if(length(side)<.01)side=cross(a,[1,0,0]);
  side=norm(side);return norm(a.map((v,i)=>v*Math.cos(Math.PI*t)+side[i]*Math.sin(Math.PI*t)));
 }
 const th=Math.acos(d),sn=Math.sin(th),w0=Math.sin((1-t)*th)/sn,w1=Math.sin(t*th)/sn;
 return norm(a.map((v,i)=>v*w0+b[i]*w1));
}
function pose(position,attitude,scale=1){return {position,attitude,scale,visible:true}}
function blend(a,b,p){
 const t=smoother(p),n=slerp(a.attitude.normal,b.attitude.normal,t);
 const right=vMix(a.attitude.right,b.attitude.right,t);
 return pose(vMix(a.position,b.position,t),attitudeFrom(n,right),lerp(a.scale,b.scale,t));
}
function landingPose(card,time,entranceMode){
 const pos=sampleLandingPose(card,time,entranceMode);
 return pose(pos,landingAttitude(card,pos,time),1);
}
// Distinct from the later large Tarot globe: a wide, kinetic helical storm.
// 78 separate backs move at varying radii/longitudes/depths at high velocity.
function helixPose(card,t){
 const rank=card.orbitSlot,q=(rank+.5)/N,vertical=2*q-1;
 const theta=rank*GOLDEN+6.15*t+(card.visualSeed>>>0)*.0000014;
 const envelope=1-.24*Math.abs(vertical);
 const r=(4.75+1.05*Math.sin(rank*1.77+t*.8))*envelope;
 const y=vertical*5.15+.35*Math.sin(theta+rank*.31);
 const z=-13.9+r*.62*Math.sin(theta)+.55*Math.cos(t*1.9+rank*.39);
 const roll=.34*Math.sin(theta*.75)+.16*Math.sin(rank*.55);
 // Most cards show backs, with occasional historical RWS fronts (not a
 // static wall of uniformly face-up cards).
 const face=rank%13===0;
 const yaw=(face?Math.PI:0)+.55*Math.sin(theta+rank*.13);
 const pitch=.20*Math.cos(theta+rank*.05);
 const scale=.93+.25*hash(rank,card.visualSeed);
 return pose([r*Math.cos(theta),y,z],facingAttitude(yaw,pitch,roll),scale);
}
// A real, temporarily compact deck with visible 78-layer edge thickness.
function pocketPose(card,t){
 const rank=card.orbitSlot,att=facingAttitude(1.27+.08*Math.sin(t*.8),-.08,.012*Math.sin(t));
 const dz=(rank-38.5)*.0142;
 return pose([
  .12+att.normal[0]*dz,
  -.12+att.normal[1]*dz,
  -16.35+att.normal[2]*dz
 ],att,.96);
}
// Oversize second spectacle. A globe is *not* a compact ball: it occupies
// about 70% of the reference height, has actual near/far distribution,
// independently oriented front/back cards, and slow globe rotation.
function globePose(card,t){
 const rank=card.orbitSlot,v=1-2*(rank+.5)/N;
 const phi=rank*GOLDEN+(t-4.4)*1.40+(card.visualSeed>>>0)*.000001;
 const c=Math.sqrt(Math.max(.001,1-v*v)),radius=5.20+.24*Math.sin(rank*.63);
 const x=radius*c*Math.cos(phi),y=radius*v;
 const localZ=radius*c*Math.sin(phi);
 const z=-14.7+localZ;
 const facing=rank%5===0?1:-1;
 // Radial-facing cards naturally rotate between fronts, backs and edges.
 const normal=norm([x*.13, .14*v, facing*(.86+.14*Math.cos(phi))]);
 // Fronts/backs are still physical surfaces, with visible tilts.
 const n=[normal[0]+.42*Math.sin(phi),normal[1]+.11*Math.sin(rank*.29),normal[2]];
 const attitude=attitudeFrom(n,[Math.cos(.25*Math.sin(phi)),.08*Math.sin(phi),-.13*Math.sin(phi)]);
 return pose([x,y,z],attitude,1.13+.18*hash(rank,card.visualSeed));
}
// Three separate and easily readable piles across the actual viewport,
// each with 26 visible physical edges. Never a single merged clump.
function pilePose(card,t){
 const rank=card.orbitSlot,group=rank%3,slot=Math.floor(rank/3);
 const x=[-5.05,0,5.05][group],z=[-16.5,-15.85,-16.35][group];
 const attitude=facingAttitude(.75+(group-1)*.12,-.12,(group-1)*.035);
 const step=(slot-12.5)*.017;
 return pose([x+attitude.normal[0]*step,.02+attitude.normal[1]*step,
  z+attitude.normal[2]*step],attitude,1.07);
}
// Real independent movements of the three pile centres, intentionally
// separated instead of moving all 78 cards as a monolithic bundle.
function movingPilesPose(card,t){
 const p=smoother((t-8.55)/.90),g=card.orbitSlot%3;
 const base=pilePose(card,t),wave=Math.sin(Math.PI*p);
 if(g===0){base.position[0]+=1.45*wave;base.position[1]+=.78*wave;base.position[2]+=.55*wave}
 if(g===2){base.position[0]-=1.45*wave;base.position[1]-=.43*wave;base.position[2]-=.65*wave}
 if(g===1){base.position[1]+=.22*Math.sin(TAU*p);base.position[2]-=.38*wave}
 return base;
}
function consolidatePose(card,t,deckPose,worldTime){
 const rank=card.orbitSlot,g=rank%3,slot=Math.floor(rank/3);
 // The centre pile moves first; the outside piles trail as alternating
 // streams, so this reads as three stacks combining.
 const delay=(g===1?0:g===0?.16:.32)+slot*.007;
 const p=(t-9.45-delay)/(RITUAL_DURATION-9.45-.32-25*.007);
 const start=pilePose(card,t),end=deckPose(card,worldTime);
 const mixed=blend(start,end,p);
 const arc=Math.sin(Math.PI*smooth(p));
 mixed.position[1]+=(g===1?.18:.52)*arc;
 return mixed;
}
export function sampleReferenceRitual(card,{age=0,landingAt=0,worldTime=0,entranceMode='inside-out',deckPose}={}){
 if(typeof deckPose!=='function')throw Error('Reference ritual requires physical deck pose');
 const t=Math.max(0,Number(age)||0);
 if(t<1.40)return blend(landingPose(card,landingAt,entranceMode),helixPose(card,t),t/1.40);
 if(t<2.65)return helixPose(card,t);
 if(t<3.30)return blend(helixPose(card,t),pocketPose(card,t),(t-2.65)/.65);
 if(t<4.40)return pocketPose(card,t);
 if(t<5.25)return blend(pocketPose(card,t),globePose(card,t),(t-4.40)/.85);
 if(t<7.25)return globePose(card,t);
 if(t<8.05)return blend(globePose(card,t),pilePose(card,t),(t-7.25)/.80);
 if(t<8.55)return pilePose(card,t);
 if(t<9.45)return movingPilesPose(card,t);
 if(t<RITUAL_DURATION)return consolidatePose(card,t,deckPose,worldTime);
 return deckPose(card,worldTime);
}
export function referenceBeat(age){
 for(const beat of RITUAL_BEATS)if(age<beat.end)return beat.id;
 return 'deck_ready';
}
export function referenceDiagnostics(cards,{age,landingAt=0,worldTime=0,entranceMode='inside-out',deckPose}){
 const poses=cards.map(card=>sampleReferenceRitual(card,{age,landingAt,worldTime,entranceMode,deckPose}));
 const at=poses.map(p=>p.position);
 const xs=at.map(p=>p[0]),ys=at.map(p=>p[1]);
 const front=poses.filter(p=>p.attitude.normal[2]>0).length;
 return {beat:referenceBeat(age),cards:poses.length,fronts:front,backs:poses.length-front,
  worldWidth:Math.max(...xs)-Math.min(...xs),worldHeight:Math.max(...ys)-Math.min(...ys)};
}
