/**
 * Gate B v4 — physically spatial, reference-observed Tarot vacuum.
 *
 * The previous builds used world-space envelopes but never measured projected
 * card area/overdraw. They placed 78 large faces on a shallow shell, producing
 * an opaque clump. This sampler instead builds a DEEP 5-turn helical tunnel
 * with variable-sized near/far cards; then a true pocket deck; then a sparse
 * rotating sphere (surface occupancy approx 16–20%); then three small
 * complete decks and visible interleaving transfers into one floating stack.
 *
 * The same 78 unique card IDs and camera persist. Pure deterministic poses,
 * no render-loop allocations, network, animation state, or random draws.
 */
import {sampleLandingPose,landingAttitude} from './OrbitalField.mjs';

const N=78,TAU=Math.PI*2,GOLDEN=Math.PI*(3-Math.sqrt(5));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smoother=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
const lerp=(a,b,t)=>a+(b-a)*t;
const vmix=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
const mag=a=>Math.hypot(...a);
const norm=a=>{const d=mag(a)||1;return a.map(v=>v/d)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const hash=(i,s=0)=>{let x=(Math.imul(i+1,0x9e3779b9)^(s>>>0))>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return (x>>>0)/4294967296};

export const RITUAL_DURATION=10.8;
export const RITUAL_BEATS=Object.freeze([
 {id:'approach',start:0,end:1.40},
 {id:'vortex',start:1.40,end:2.65},
 {id:'implosion',start:2.65,end:3.30},
 {id:'suspension',start:3.30,end:4.40},
 {id:'detonation',start:4.40,end:5.25},
 {id:'globe',start:5.25,end:7.25},
 {id:'dispersal',start:7.25,end:8.05},
 {id:'three_piles',start:8.05,end:8.55},
 {id:'pile_shuffle',start:8.55,end:9.45},
 {id:'consolidation',start:9.45,end:RITUAL_DURATION}
].map(Object.freeze));

function attitude(normal,rightHint=[1,0,0]){
 const n=norm(normal);
 let r=rightHint.map((v,i)=>v-dot(n,rightHint)*n[i]);
 if(mag(r)<.001)r=cross([0,1,0],n);
 if(mag(r)<.001)r=[1,0,0];
 r=norm(r);
 const up=norm(cross(n,r));
 return {normal:n,right:r,up,frontFacingCamera:n[2]>0};
}
function oriented(yaw=0,pitch=0,roll=0){
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
  let side=cross(a,[0,1,0]);
  if(mag(side)<.001)side=cross(a,[1,0,0]);
  side=norm(side);
  return norm(a.map((v,i)=>v*Math.cos(Math.PI*t)+side[i]*Math.sin(Math.PI*t)));
 }
 const angle=Math.acos(d),v0=Math.sin((1-t)*angle)/Math.sin(angle),v1=Math.sin(t*angle)/Math.sin(angle);
 return norm(a.map((v,i)=>v*v0+b[i]*v1));
}
function pose(position,orientation,scale=1){return {position,attitude:orientation,scale,visible:true}}
function blend(a,b,t){
 const s=smoother(t);
 return pose(vmix(a.position,b.position,s),
  attitude(slerp(a.attitude.normal,b.attitude.normal,s),vmix(a.attitude.right,b.attitude.right,s)),
  lerp(a.scale,b.scale,s));
}
function fromLanding(card,age,entranceMode){
 const pos=sampleLandingPose(card,age,entranceMode);
 return pose(pos,landingAttitude(card,pos,age),1);
}
function vacuumPose(card,age){
 // Five entire turns along Z; near and far cards DO NOT share a shallow plane.
 // The projected geometry has an open center and several independently
 // rotating rings/filaments rather than 78 overlapping center cards.
 const k=card.orbitSlot,s=(k+.5)/N,seed=card.visualSeed>>>0;
 const angle=TAU*5.2*s+age*6.60+seed*.0000011;
 const throat=1.65+13.8*Math.pow(s,.92);
 const radius=throat*(.965+.075*Math.sin(k*.81+age*.9));
 const z=-5.6-30.1*s+.36*Math.sin(k*.49+age*1.7);
 const x=radius*Math.cos(angle),y=radius*.86*Math.sin(angle);
 const selectedFront=k%11===0;
 const yaw=(selectedFront?Math.PI:0)+.58*Math.sin(angle+.18*k);
 const pitch=.27*Math.sin(angle*.60+k*.18);
 const roll=.68*Math.cos(angle+age*1.2+k*.17);
 // Near passes are noticeably larger, far-space cards smaller.
 const scale=.62+.16*hash(k,seed)+.36*Math.pow(1-s,3);
 return pose([x,y,z],oriented(yaw,pitch,roll),scale);
}
function pocketPose(card,age){
 const k=card.orbitSlot,orientation=oriented(1.05+.055*Math.sin(age*.36),-.09,.014*Math.sin(age*.61));
 const layer=(k-38.5)*.0145;
 return pose([orientation.normal[0]*layer,
  -.05+orientation.normal[1]*layer,
  -16.6+orientation.normal[2]*layer],orientation,1.04);
}
function vacuumCollapsePose(card,t){
 const k=card.orbitSlot,delay=(k%9)*.026;
 const p=(t-2.65-delay)/(.65-delay);
 const result=blend(vacuumPose(card,t),pocketPose(card,t),p);
 const w=smoother(p);
 // Acceleration and a trailing curl remain visible during the contraction.
 const curl=.34*Math.sin(Math.PI*w)*(1-w);
 const a=k*GOLDEN+t*9;
 result.position[0]+=Math.cos(a)*curl;
 result.position[1]+=Math.sin(a)*curl;
 return result;
}
function globePose(card,t){
 // Fibonacci sphere: wide 3D spacing. Reduced physical card scales change
 // real surface occupancy instead of only increasing center-center distance.
 const k=card.orbitSlot,seed=card.visualSeed>>>0;
 const v=1-2*(k+.5)/N,ring=Math.sqrt(Math.max(.0001,1-v*v));
 const phi=k*GOLDEN+(t-4.40)*1.63+seed*.000001;
 const radius=7.80+.30*Math.sin(k*1.17);
 const x=radius*ring*Math.cos(phi),y=radius*v;
 const localZ=radius*ring*Math.sin(phi);
 const z=-21.0+localZ;
 // Independent 3-axis rotations: coherent slowly rotating globe, chaotic
 // individual card silhouettes with illustrated faces intermittently shown.
 const face=k%5===0;
 const yaw=(face?Math.PI:0)+.72*Math.sin(t*1.9+k*.76)+.33*Math.cos(phi);
 const pitch=.56*Math.sin(t*1.4+k*.47);
 const roll=.78*Math.sin(t*2.1+k*.31);
 const scale=.69+.16*hash(k,seed);
 return pose([x,y,z],oriented(yaw,pitch,roll),scale);
}
function globeDetonationPose(card,t){
 const k=card.orbitSlot,delay=(k%9)*.023;
 const u=clamp((t-4.40-delay)/(.85-delay));
 // A genuinely explosive OUTWARD acceleration: do not spend most of this
 // beat staring at a compact pile as v3 did.
 const p=1-Math.pow(1-u,2.8);
 const result=blend(pocketPose(card,t),globePose(card,t),p);
 const w=smoother(p);
 // Cards sweep outward on curved paths, not a single radial linear tween.
 const arc=.65*Math.sin(Math.PI*w);
 const a=k*GOLDEN+t*4;
 result.position[0]+=arc*Math.cos(a);
 result.position[1]+=arc*Math.sin(a);
 result.position[2]-=arc*.40;
 return result;
}
function pilePose(card,t){
 const k=card.orbitSlot,group=k%3,slot=Math.floor(k/3);
 const centers=[-4.55,0,4.55],depths=[-18.0,-17.5,-18.2];
 const orientation=oriented(.42+(group-1)*.12,-.08,.02*(group-1));
 const layer=(slot-12.5)*.0145;
 return pose([centers[group]+orientation.normal[0]*layer,
             -.07+orientation.normal[1]*layer,
             depths[group]+orientation.normal[2]*layer],
  orientation,1.06);
}
function globeToPiles(card,t){
 const k=card.orbitSlot,delay=(k%7)*.019;
 const p=(t-7.25-delay)/(.80-delay),w=smoother(p);
 const result=blend(globePose(card,t),pilePose(card,t),p);
 const arc=.50*Math.sin(Math.PI*w);
 result.position[1]+=arc;
 result.position[2]-=arc*.65;
 return result;
}
function fannedAssemblyPose(card,t){
 // A single central deck with 78 individually addressable layers. At this
 // stage it remains slightly fanned so it can visibly settle afterward.
 const k=card.orbitSlot,phase=k*GOLDEN;
 const orientation=oriented(.84+.025*Math.sin(t*.28),-.11,.02*Math.sin(t*.57));
 const layer=(k-38.5)*.016;
 return pose([orientation.normal[0]*layer+.16*Math.sin(phase)*.30,
              -.06+orientation.normal[1]*layer+.045*Math.sin(phase),
              -16.7+orientation.normal[2]*layer+.09*Math.cos(phase)],
  orientation,1.05);
}
function movingCardTransfer(card,t){
 const k=card.orbitSlot,g=k%3,slot=Math.floor(k/3);
 const from=pilePose(card,t),to=fannedAssemblyPose(card,t);
 const delay=(g===1?0:.02)+(slot/25)*.42+(g===2?.02:0);
 const duration=g===1?.33:.26;
 const progress=(t-8.55-delay)/duration,w=smoother(progress);
 const result=blend(from,to,progress);
 // Sheets travel individually (not as three moving rigid groups), with
 // alternating left/right interleaves and vertical lift at mid-flight.
 const arc=Math.sin(Math.PI*w);
 result.position[1]+=arc*(g===1?.12:.65);
 result.position[2]-=arc*(g===1?.11:.34);
 return result;
}
function settlePose(card,t,deckPose,worldTime){
 const p=(t-9.45)/(RITUAL_DURATION-9.45);
 return blend(fannedAssemblyPose(card,t),deckPose(card,worldTime),p);
}
export function sampleReferenceRitual(card,{age=0,landingAt=0,worldTime=0,entranceMode='inside-out',deckPose}={}){
 if(typeof deckPose!=='function')throw Error('Reference ritual requires physical deckPose');
 const t=Math.max(0,Number(age)||0);
 if(t<1.40)return blend(fromLanding(card,landingAt,entranceMode),vacuumPose(card,t),t/1.40);
 if(t<2.65)return vacuumPose(card,t);
 if(t<3.30)return vacuumCollapsePose(card,t);
 if(t<4.40)return pocketPose(card,t);
 if(t<5.25)return globeDetonationPose(card,t);
 if(t<7.25)return globePose(card,t);
 if(t<8.05)return globeToPiles(card,t);
 if(t<8.55)return pilePose(card,t);
 if(t<9.45)return movingCardTransfer(card,t);
 if(t<RITUAL_DURATION)return settlePose(card,t,deckPose,worldTime);
 return deckPose(card,worldTime);
}
export function referenceBeat(age){
 for(const beat of RITUAL_BEATS)if(age<beat.end)return beat.id;
 return 'deck_ready';
}
export function referenceDiagnostics(cards,{age,landingAt=0,worldTime=0,entranceMode='inside-out',deckPose}){
 const poses=cards.map(card=>sampleReferenceRitual(card,{age,landingAt,worldTime,entranceMode,deckPose}));
 const xs=poses.map(p=>p.position[0]),ys=poses.map(p=>p.position[1]),zs=poses.map(p=>p.position[2]);
 return {beat:referenceBeat(age),cards:poses.length,
  fronts:poses.filter(p=>p.attitude.normal[2]>0).length,
  depthSpan:Math.max(...zs)-Math.min(...zs),
  worldWidth:Math.max(...xs)-Math.min(...xs),
  worldHeight:Math.max(...ys)-Math.min(...ys)};
}
