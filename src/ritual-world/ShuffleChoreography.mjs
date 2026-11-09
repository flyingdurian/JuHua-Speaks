/**
 * Gate B v3: the automatic ritual is authored independently in
 * ReferenceRitual.mjs; the optional shuffle methods below are INACTIVE
 * in the Gate B v3 UI pending separate product review.
 * Every style shares the same immutable 78 card IDs and physical deck pose.
 */
/**
 * Gate B v2 — authored physical Tarot ritual.
 * Reference footage (30.906s split-screen, 2026-11-06) demonstrates:
 * orbit rush -> compact helical storm -> irregular globe -> three piles ->
 * interleaving consolidation -> slender suspended deck.
 * Cosmetic choreography never changes identities or divination probabilities.
 * All 78 objects exist throughout; no new renderer or camera is created.
 */
import {sampleReferenceRitual,referenceBeat,RITUAL_DURATION,RITUAL_BEATS} from './ReferenceRitual.mjs';

const N=78, TAU=Math.PI*2, GOLDEN=Math.PI*(3-Math.sqrt(5));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smoother=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
const mix=(a,b,t)=>a+(b-a)*t;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const length=a=>Math.hypot(a[0],a[1],a[2]);
const norm=a=>{const d=length(a)||1;return [a[0]/d,a[1]/d,a[2]/d]};
const cross=(a,b)=>[
 a[1]*b[2]-a[2]*b[1],
 a[2]*b[0]-a[0]*b[2],
 a[0]*b[1]-a[1]*b[0]
];
const vMix=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];
const hash=(i,seed=1)=>{
 let x=(Math.imul((i+1)>>>0,0x9e3779b9)^(seed>>>0))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
};
const PITCH=-.12;
export const PHYSICAL_CARD=Object.freeze({width:1.28,height:2.12,thickness:.0078});
export const AUTO_SHUFFLE_SECONDS=RITUAL_DURATION;
export const SHUFFLE_CHOICES=Object.freeze(['cosmic','riffle','wash']);
export const SHUFFLE_DURATIONS=Object.freeze({cosmic:5.65,riffle:5.75,wash:5.85});
export const AUTO_RITUAL_BEATS=RITUAL_BEATS;
export function shuffleDuration(style){
 if(style==='auto')return AUTO_SHUFFLE_SECONDS;
 if(!Object.hasOwn(SHUFFLE_DURATIONS,style))throw Error('Unknown physical shuffle '+style);
 return SHUFFLE_DURATIONS[style];
}
function backAttitude(yaw=0,pitch=0,roll=0){
 const normal=norm([Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)]);
 let right=norm(cross([0,1,0],normal));
 if(length(right)<.001)right=[1,0,0];
 let up=norm(cross(normal,right));
 if(roll){
  const c=Math.cos(roll),s=Math.sin(roll),r=right,u=up;
  right=norm([r[0]*c+u[0]*s,r[1]*c+u[1]*s,r[2]*c+u[2]*s]);
  up=norm([u[0]*c-r[0]*s,u[1]*c-r[1]*s,u[2]*c-r[2]*s]);
 }
 return {right,up,normal,frontFacingCamera:normal[2]>0};
}
function slerpUnit(a,b,t){
 const d=clamp(dot(a,b),-1,1);
 if(d>.9995)return norm(vMix(a,b,t));
 if(d<-.9995){
  let perpendicular=cross(a,[0,1,0]);
  if(length(perpendicular)<.02)perpendicular=cross(a,[1,0,0]);
  const p=norm(perpendicular),angle=t*Math.PI;
  return norm([a[0]*Math.cos(angle)+p[0]*Math.sin(angle),
               a[1]*Math.cos(angle)+p[1]*Math.sin(angle),
               a[2]*Math.cos(angle)+p[2]*Math.sin(angle)]);
 }
 const theta=Math.acos(d),denom=Math.sin(theta),
  w1=Math.sin((1-t)*theta)/denom,w2=Math.sin(t*theta)/denom;
 return norm([a[0]*w1+b[0]*w2,a[1]*w1+b[1]*w2,a[2]*w1+b[2]*w2]);
}
function attitudeFrom(normal,right){
 const n=norm(normal);
 let r=[right[0]-n[0]*dot(n,right),right[1]-n[1]*dot(n,right),right[2]-n[2]*dot(n,right)];
 if(length(r)<.0002)r=cross([0,1,0],n);
 if(length(r)<.0002)r=[1,0,0];
 r=norm(r);
 const up=norm(cross(n,r));
 return {normal:n,right:r,up,frontFacingCamera:n[2]>0};
}
function pose(position,attitude,scale=1){
 return {position,attitude,scale,visible:true};
}
function blend(a,b,t){
 const w=smoother(t);
 const fixedNormal=slerpUnit(a.attitude.normal,b.attitude.normal,w);
 const right=vMix(a.attitude.right,b.attitude.right,w);
 return pose(vMix(a.position,b.position,w),attitudeFrom(fixedNormal,right),mix(a.scale,b.scale,w));
}
function stackPose(card,{center=[0,-.16,-17.0],yaw=.70,pitch=PITCH,roll=0,scale=.99,rank=card.orbitSlot,count=N,step=.0104}={}){
 // Anti-Solid: each real sheet is 0.0078 units thick; the spacing leaves
 // a positive 0.0026 micro-air gap. Very shallow organic bow and staggering
 // give individually illuminated paper edges without a fused cuboid.
 const n=count>1?(rank-(count-1)/2)/((count-1)/2):0;
 const bow=.019*(1-n*n),offset=.0058*Math.sin(rank*.79),ruffle=.0032*Math.cos(rank*.72);
 const basis=backAttitude(yaw,pitch,roll+.008*Math.sin(rank*.31));
 const layer=(rank-(count-1)/2)*step;
 return pose([
  center[0]+basis.normal[0]*layer+bow+offset,
  center[1]+basis.normal[1]*layer+.007*n*n+ruffle,
  center[2]+basis.normal[2]*layer
 ],basis,scale);
}
export function deckPose(card,worldTime=0){
 // Actual continuous slow rotation, not a frozen stack or oscillating brick.
 const yaw=.76+worldTime*.12;
 const pitch=PITCH+.032*Math.sin(worldTime*.16);
 const roll=.027*Math.sin(worldTime*.22);
 return stackPose(card,{yaw,pitch,roll});
}
export function deckThickness(cards){
 const first=deckPose(cards[0],0),axis=first.attitude.normal;
 const values=cards.map(c=>dot(deckPose(c,0).position,axis));
 return Math.max(...values)-Math.min(...values);
}
// COSMIC / 78 individual sheets: two opposing 39-card helical currents.
// They emerge as real stacks, overtake at the centre and physically return
// to the original deck; no cards blink out or become a decorative particle.
function cosmicInitialSplit(card){
 const half=card.orbitSlot%2,side=half?-1:1,index=Math.floor(card.orbitSlot/2);
 return stackPose(card,{center:[side*1.58,-.14,-16.7],yaw:.55+side*.10,pitch:-.13,
  scale:1.08,rank:index,count:39,step:.0104});
}
function cosmicHalvesPose(card,t){
 const rank=card.orbitSlot,half=rank%2,slot=Math.floor(rank/2),side=half?-1:1;
 const u=(slot+.5)/39,phase=side*(t-1.0)*2.35+u*TAU*1.26;
 const strand=(slot-19)/19;
 const radius=1.47+.45*Math.cos(u*TAU*1.8+t*.4);
 const approach=.5+.5*Math.sin(phase);
 const x=side*.35+side*radius*Math.cos(phase)+.16*Math.sin(t*3+slot*.22);
 const y=radius*.75*Math.sin(phase)+strand*.75;
 const z=-16.8+side*.44*Math.sin(phase)+strand*.74+approach*.32;
 const yaw=.78+side*.20*Math.sin(phase),pitch=-.12+.16*Math.sin(phase+u*TAU);
 const roll=side*.28*Math.sin(phase)+strand*.20;
 return pose([x,y,z],backAttitude(yaw,pitch,roll),.91+.11*Math.cos(u*TAU));
}
function cosmicPose(card,t,worldTime){
 const split=cosmicInitialSplit(card);
 if(t<.95)return blend(deckPose(card,worldTime),split,t/.95);
 const flowing=cosmicHalvesPose(card,t);
 if(t<1.65)return blend(split,flowing,(t-.95)/.70);
 if(t<4.12)return flowing;
 if(t<SHUFFLE_DURATIONS.cosmic)return blend(flowing,deckPose(card,worldTime),(t-4.12)/(SHUFFLE_DURATIONS.cosmic-4.12));
 return deckPose(card,worldTime);
}
// RIFFLE / two genuine 39-layer piles; alternating releases bend up into
// an arched 78-card bridge and land at alternating positions in one deck.
function riffleHalfPose(card){
 const rank=card.orbitSlot,half=rank%2,slot=Math.floor(rank/2),side=half?1:-1;
 return stackPose(card,{center:[side*1.48,-.18,-16.7],yaw:.70+side*.16,
  pitch:-.17,roll:side*.032,scale:1.10,rank:slot,count:39});
}
function riffleBridgePose(card,t){
 const rank=card.orbitSlot,half=rank%2,slot=Math.floor(rank/2),side=half?1:-1;
 const p=deckPose(card,t),bow=Math.sin(Math.PI*(slot+.5)/39);
 p.position[0]+=side*.31*(1-bow);
 p.position[1]+=.92*bow;
 p.position[2]+=.23*bow;
 p.attitude=backAttitude(1.07+side*.14,-.22,side*.09);
 return p;
}
function rifflePose(card,t,worldTime){
 const split=riffleHalfPose(card),bridge=riffleBridgePose(card,worldTime);
 if(t<.90)return blend(deckPose(card,worldTime),split,t/.90);
 if(t<1.28)return split;
 if(t<4.12){
  const slot=Math.floor(card.orbitSlot/2),half=card.orbitSlot%2;
  const release=1.28+(slot/38)*2.30+half*.045;
  const p=clamp((t-release)/.40);
  const moved=blend(split,bridge,p);
  moved.position[1]+=.31*Math.sin(Math.PI*smoother(p));
  moved.position[2]-=.16*Math.sin(Math.PI*smoother(p));
  return moved;
 }
 if(t<SHUFFLE_DURATIONS.riffle)return blend(bridge,deckPose(card,worldTime),(t-4.12)/(SHUFFLE_DURATIONS.riffle-4.12));
 return deckPose(card,worldTime);
}
// TABLE WASH / bounded, populated centre with 78 individual overlapping
// backs sliding on a shallow tabletop plane, not a hollow wheel or tornado.
function washFieldPose(card,t){
 const k=card.orbitSlot,seed=card.visualSeed>>>0;
 const u=(k+.5)/N,base=k*GOLDEN+.10*(hash(k+18,seed)-.5);
 const radius=3.18*Math.sqrt(u),drift=Math.max(0,t-1.0);
 const phase=base+.38*Math.sin(drift*1.20+k*.057);
 const swirl=.44*Math.sin(drift*.83+k*.31);
 const x=radius*Math.cos(phase)+swirl+.23*Math.sin(drift*1.67+k*.17);
 const y=.68*radius*Math.sin(phase)+.21*Math.cos(drift*1.28+k*.23);
 const z=-17.1+.27*y+.045*Math.sin(k*2.1+drift*.7);
 const yaw=(hash(k+113,seed)-.5)*.37+.09*Math.sin(drift+k*.21);
 const roll=(hash(k+211,seed)-.5)*.52+.11*Math.sin(drift*.7+k*.47);
 return pose([x,y-.21,z],backAttitude(yaw,-.66,roll),.84);
}
function washPose(card,t,worldTime){
 const field=washFieldPose(card,t);
 if(t<1.30){
  const delay=card.orbitSlot/77*.24;
  return blend(deckPose(card,worldTime),field,(t-delay)/(1.30-delay));
 }
 if(t<4.08)return field;
 if(t<SHUFFLE_DURATIONS.wash){
  const delay=card.orbitSlot/77*.35;
  return blend(field,deckPose(card,worldTime),(t-4.08-delay)/(SHUFFLE_DURATIONS.wash-4.08-delay));
 }
 return deckPose(card,worldTime);
}
export function samplePhysicalShuffle(card,{style='auto',age=0,landingAt=2.5,worldTime=0,entranceMode='inside-out'}={}){
 const t=Math.max(0,Number(age)||0);
 if(style==='auto')return sampleReferenceRitual(card,{age:t,landingAt,worldTime,entranceMode,deckPose});
 if(style==='cosmic')return cosmicPose(card,t,worldTime);
 if(style==='riffle')return rifflePose(card,t,worldTime);
 if(style==='wash')return washPose(card,t,worldTime);
 throw Error('Unsupported physical shuffle '+style);
}
export function shuffleBeat(style,age){
 const t=Math.max(0,Number(age)||0);
 if(style==='auto')return referenceBeat(t);
 if(!SHUFFLE_CHOICES.includes(style))throw Error('Unknown shuffle variant');
 if(t>=shuffleDuration(style))return 'deck_ready';
 if(style==='cosmic')return t<.95?'splitting':t<1.65?'unfurling':t<4.12?'orbital_shuffle':'gathering';
 if(style==='riffle')return t<1.28?'splitting':t<4.12?'interleaving':'bridging';
 return t<1.3?'spreading':t<4.08?'table_wash':'gathering';
}
export function assertShuffleGeometry(cards,{style='auto',landingAt=0,worldTime=0,entranceMode='inside-out'}={}){
 const duration=shuffleDuration(style);
 const times=[.05,.35,.9,1.3,1.75,2.5,3.15,3.85,4.2,5.6,6.0,7.1,8.3,duration];
 for(const age of times){
  if(age>duration)continue;
  for(const card of cards){
   const p=samplePhysicalShuffle(card,{style,age,landingAt,worldTime,entranceMode});
   for(const key of ['position']){
    if(!Array.isArray(p[key])||p[key].length!==3||!p[key].every(Number.isFinite))throw Error('Invalid shuffle XYZ geometry: '+style+' '+card.id);
   }
   for(const key of ['normal','right','up']){
    const basis=p.attitude?.[key];
    if(!Array.isArray(basis)||basis.length!==3||!basis.every(Number.isFinite))throw Error('Invalid shuffle XYZ geometry: '+style+' '+card.id+' '+key);
    if(Math.abs(length(basis)-1)>.01)throw Error('Invalid shuffle basis length: '+style+' '+card.id+' '+key);
   }
   if(!(p.scale>0&&Number.isFinite(p.scale)))throw Error('Invalid shuffle scale: '+style+' '+card.id);
  }
 }
 return true;
}
