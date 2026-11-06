/**
 * Gate B v2 — authored physical Tarot ritual.
 * Reference footage (30.906s split-screen, 2026-11-06) demonstrates:
 * orbit rush -> compact helical storm -> irregular globe -> three piles ->
 * interleaving consolidation -> slender suspended deck.
 * Cosmetic choreography never changes identities or divination probabilities.
 * All 78 objects exist throughout; no new renderer or camera is created.
 */
import {sampleLandingPose,landingAttitude} from './OrbitalField.mjs';

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
export const PHYSICAL_CARD=Object.freeze({width:1.28,height:2.12,thickness:.0048});
export const AUTO_SHUFFLE_SECONDS=9.45;
export const SHUFFLE_CHOICES=Object.freeze(['cosmic','riffle','wash']);
export const SHUFFLE_DURATIONS=Object.freeze({cosmic:5.65,riffle:5.75,wash:5.85});
export const AUTO_RITUAL_BEATS=Object.freeze([
 Object.freeze({id:'gathering',start:0,end:1.3}),
 Object.freeze({id:'tornado',start:1.3,end:3.05}),
 Object.freeze({id:'storm_to_globe',start:3.05,end:3.9}),
 Object.freeze({id:'globe',start:3.9,end:5.95}),
 Object.freeze({id:'three_piles',start:5.95,end:6.95}),
 Object.freeze({id:'pile_shuffling',start:6.95,end:7.8}),
 Object.freeze({id:'consolidating',start:7.8,end:AUTO_SHUFFLE_SECONDS})
]);
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
function startPose(card,landingAt,entranceMode='inside-out'){
 const position=sampleLandingPose(card,landingAt,entranceMode);
 return pose(position,landingAttitude(card,position,landingAt),1);
}
function stackPose(card,{center=[0,-.16,-17.0],yaw=1.14,pitch=PITCH,roll=0,scale=1.14,rank=card.orbitSlot,count=N,step=.0145}={}){
 const basis=backAttitude(yaw,pitch,roll);
 const layer=(rank-(count-1)/2)*step;
 // Thin paper-like edge sheets, no overlap: each card thickness is .0096.
 return pose([
  center[0]+basis.normal[0]*layer+.0028*Math.sin(rank*.79),
  center[1]+basis.normal[1]*layer+.0023*Math.cos(rank*.72),
  center[2]+basis.normal[2]*layer
 ],basis,scale);
}
export function deckPose(card,worldTime=0){
 const yaw=1.14+.055*Math.sin(worldTime*.20);
 const pitch=PITCH+.035*Math.sin(worldTime*.11);
 const roll=.018*Math.sin(worldTime*.22);
 return stackPose(card,{yaw,pitch,roll});
}
export function deckThickness(cards){
 const first=deckPose(cards[0],0),axis=first.attitude.normal;
 const values=cards.map(c=>dot(deckPose(c,0).position,axis));
 return Math.max(...values)-Math.min(...values);
}
function tornadoPose(card,t){
 const rank=card.orbitSlot,u=(rank+.5)/N,vertical=2*u-1;
 const az=rank*GOLDEN+t*4.25+(card.visualSeed||0)*.0000025;
 const r=1.70+1.05*(1-vertical*vertical)+.18*Math.sin(t*2+rank*.28);
 const x=r*Math.cos(az),y=vertical*4.45+.15*Math.sin(az*.8),z=-17.2+r*.7*Math.sin(az);
 const tilt=(rank%9===0)? .11:.18;
 const direction=backAttitude(.46*Math.sin(az),.25*Math.sin(t*2+rank*.2),tilt*Math.cos(az+.3));
 return pose([x,y,z],direction,1.13);
}
function globePose(card,t){
 const rank=card.orbitSlot,u=(rank+.5)/N,y=1-2*u;
 const az=rank*GOLDEN+(t-3)*1.65+(card.visualSeed||0)*.000001;
 const ring=Math.sqrt(Math.max(.001,1-y*y)),r=2.70+.14*Math.sin(rank*1.23);
 const x=r*ring*Math.cos(az),z=-16.45+r*ring*Math.sin(az)*.86;
 const isFace=rank%7===0;
 const attitude=backAttitude((isFace?Math.PI:0)+.42*Math.sin(az),.21*Math.cos(az+rank*.2),.13*Math.sin(t*.6+rank));
 return pose([x,r*y,z],attitude,1.05);
}
function pilePose(card,t){
 const rank=card.orbitSlot,pile=rank%3,slot=Math.floor(rank/3),side=pile-1;
 return stackPose(card,{
  center:[side*2.25,-.24+.05*(pile===1),-17.1+Math.abs(side)*.35],
  yaw:.87+side*.11+.025*Math.sin(t*.5+pile),
  pitch:-.10,roll:side*.025,scale:1.05,rank:slot,count:26,step:.016
 });
}
function livingPilesPose(card,t){
 const result=pilePose(card,t),amount=Math.sin(Math.PI*clamp((t-6.95)/.85));
 const group=card.orbitSlot%3,sign=group-1;
 result.position[0]+=sign*amount*.26;
 result.position[1]+=.10*amount*Math.sin(group*2.1);
 result.position[2]+=.12*amount*(group===1?-1:1);
 return result;
}
function autoPose(card,t,landingAt,worldTime,entranceMode){
 if(t<1.3)return blend(startPose(card,landingAt,entranceMode),tornadoPose(card,t),t/1.3);
 if(t<3.05)return tornadoPose(card,t);
 if(t<3.9)return blend(tornadoPose(card,t),globePose(card,t),(t-3.05)/.85);
 if(t<5.95)return globePose(card,t);
 if(t<6.95)return blend(globePose(card,t),pilePose(card,t),(t-5.95)/1);
 if(t<7.8)return livingPilesPose(card,t);
 if(t<AUTO_SHUFFLE_SECONDS){
  const delay=(card.orbitSlot/77)*.42;
  const w=(t-7.8-delay)/(AUTO_SHUFFLE_SECONDS-7.8-delay);
  return blend(pilePose(card,t),deckPose(card,worldTime),w);
 }
 return deckPose(card,worldTime);
}
function cosmicHalvesPose(card,t){
 const rank=card.orbitSlot,half=rank%2,index=Math.floor(rank/2),side=half?-1:1;
 // Two coherent 39-card helixes, not a pair of rigid rows.
 const cycle=Math.max(0,t-1.05),r=1.73;
 const angle=cycle*1.62;
 const center=[side*r*Math.cos(angle),side*.48*Math.sin(angle),-16.7+side*r*.48*Math.sin(angle)];
 const fan=smoother(cycle/.9);
 const strand=(index-19)/19;
 const az=angle+side*strand*.72;
 const position=[
  center[0]+fan*.55*Math.sin(az)*strand,
  center[1]+fan*strand*.95,
  center[2]+(index-19)*.015+fan*.22*Math.cos(az)*strand
 ];
 return pose(position,backAttitude(.45+side*.26*Math.sin(angle),-.10,fan*strand*.28),1.18);
}
function cosmicInitialSplit(card,t){
 const half=card.orbitSlot%2,side=half?-1:1,index=Math.floor(card.orbitSlot/2);
 return stackPose(card,{center:[side*1.73,-.15,-16.7],yaw:.48,pitch:-.10,scale:1.18,rank:index,count:39,step:.0145});
}
function cosmicPose(card,t,worldTime){
 if(t<1.05)return blend(deckPose(card,worldTime),cosmicInitialSplit(card,t),t/1.05);
 if(t<1.8)return blend(cosmicInitialSplit(card,t),cosmicHalvesPose(card,t),(t-1.05)/.75);
 if(t<3.9)return cosmicHalvesPose(card,t);
 if(t<SHUFFLE_DURATIONS.cosmic)return blend(cosmicHalvesPose(card,t),deckPose(card,worldTime),(t-3.9)/(SHUFFLE_DURATIONS.cosmic-3.9));
 return deckPose(card,worldTime);
}
function riffleHalfPose(card,t){
 const rank=card.orbitSlot,half=rank%2,slot=Math.floor(rank/2),side=half?1:-1;
 const bow=Math.sin(Math.PI*(slot+.5)/39);
 return stackPose(card,{center:[side*1.53,-.12+bow*.07,-16.8],yaw:side*.22,pitch:-.17,roll:side*.035,scale:1.18,rank:slot,count:39,step:.0145});
}
function riffleBridgePose(card,t){
 const rank=card.orbitSlot,side=rank%2?1:-1;
 const p=deckPose(card,t);
 const arc=.71*Math.sin(Math.PI*(rank+.5)/N);
 p.position[0]+=side*.22;
 p.position[1]+=arc;
 p.position[2]+=.14*arc;
 p.attitude=backAttitude(.24+side*.12,-.21,side*.075);
 return p;
}
function rifflePose(card,t,worldTime){
 if(t<1.0)return blend(deckPose(card,worldTime),riffleHalfPose(card,t),t);
 if(t<1.4)return riffleHalfPose(card,t);
 if(t<4.0){
  const slot=Math.floor(card.orbitSlot/2);
  const delay=1.42+slot/38*1.93+(card.orbitSlot%2)*.09;
  const progress=(t-delay)/.55;
  const p=blend(riffleHalfPose(card,t),riffleBridgePose(card,t),progress);
  p.position[1]+=.22*Math.sin(Math.PI*clamp(progress));
  return p;
 }
 if(t<SHUFFLE_DURATIONS.riffle)return blend(riffleBridgePose(card,t),deckPose(card,worldTime),(t-4.0)/(SHUFFLE_DURATIONS.riffle-4));
 return deckPose(card,worldTime);
}
function washFieldPose(card,t){
 const rank=card.orbitSlot,seed=card.visualSeed||0;
 const u=(rank+.5)/N,r=3.45*Math.sqrt(u),angle=rank*GOLDEN+hash(rank,seed)*.18;
 const drift=Math.max(0,t-1.0);
 const twist=.16*Math.sin(drift*.92+rank*.19)+.24*Math.sin(drift*.50+rank*.037);
 const a=angle+twist;
 let x=r*Math.cos(a),y=r*.65*Math.sin(a);
 // Continuous overlapping streams on a slightly tilted tabletop.
 x+=.22*Math.sin(drift*1.2+rank*.47);
 y+=.13*Math.sin(drift*.83+rank*.21);
 const z=-17.1+.40*y+.018*Math.sin(rank);
 const yaw=(hash(rank+111,seed)-.5)*.33;
 const roll=(hash(rank+211,seed)-.5)*.40;
 return pose([x,y-.26,z],backAttitude(yaw,-.73,roll),.83);
}
function washPose(card,t,worldTime){
 if(t<1.30){
  const delay=(card.orbitSlot/77)*.28;
  const w=(t-delay)/(1.30-delay);
  return blend(deckPose(card,worldTime),washFieldPose(card,t),w);
 }
 if(t<3.95)return washFieldPose(card,t);
 if(t<SHUFFLE_DURATIONS.wash){
  const delay=(card.orbitSlot/77)*.40;
  const w=(t-3.95-delay)/(SHUFFLE_DURATIONS.wash-3.95-delay);
  return blend(washFieldPose(card,t),deckPose(card,worldTime),w);
 }
 return deckPose(card,worldTime);
}
export function samplePhysicalShuffle(card,{style='auto',age=0,landingAt=2.5,worldTime=0,entranceMode='inside-out'}={}){
 const t=Math.max(0,Number(age)||0);
 if(style==='auto')return autoPose(card,t,landingAt,worldTime,entranceMode);
 if(style==='cosmic')return cosmicPose(card,t,worldTime);
 if(style==='riffle')return rifflePose(card,t,worldTime);
 if(style==='wash')return washPose(card,t,worldTime);
 throw Error('Unsupported physical shuffle '+style);
}
export function shuffleBeat(style,age){
 const t=Math.max(0,Number(age)||0);
 if(style==='auto'){
  for(const beat of AUTO_RITUAL_BEATS)if(t<beat.end)return beat.id;
  return 'deck_ready';
 }
 if(!SHUFFLE_CHOICES.includes(style))throw Error('Unknown shuffle variant');
 if(t>=shuffleDuration(style))return 'deck_ready';
 if(style==='cosmic')return t<1.05?'splitting':t<1.8?'unfurling':t<3.9?'orbital_shuffle':'gathering';
 if(style==='riffle')return t<1?'splitting':t<4?'interleaving':'bridging';
 return t<1.3?'spreading':t<3.95?'table_wash':'gathering';
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
