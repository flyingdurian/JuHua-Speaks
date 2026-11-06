/**
 * Gate B choreography — 78 physically represented tarot cards.
 * All motion is deterministic at a specified time. Card identities, draw
 * probabilities and historical RWS artwork are unaffected by these visuals.
 *
 * "auto" = coherent tornado -> controlled 78-card stacked deck.
 * "cosmic" = two rotating suspended rings -> deck.
 * "riffle" = split into two 39-card stacks -> alternating interleave -> deck.
 * "wash" = back-down cards circulating across a constrained tabletop -> deck.
 * Never show a chaotic pile of illustrated, face-up Tarot cards.
 */
import {sampleLandingPose,landingAttitude} from './OrbitalField.mjs';
const N=78,TAU=Math.PI*2,GOLDEN=Math.PI*(3-Math.sqrt(5));
const clip=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>{x=clip(x);return x*x*(3-2*x)};
const lerp=(a,b,t)=>a+(b-a)*t;
const length=a=>Math.hypot(...a);
const norm=a=>{const l=length(a)||1;return a.map(v=>v/l)};
const cross=(a,b)=>[
 a[1]*b[2]-a[2]*b[1],
 a[2]*b[0]-a[0]*b[2],
 a[0]*b[1]-a[1]*b[0]
];
const mixVec=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
const hash=(i,seed=1)=>{
 let x=(Math.imul(i+1,0x9e3779b9)^seed)>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
};
export const PHYSICAL_CARD=Object.freeze({width:1.28,height:2.12});
export const AUTO_SHUFFLE_SECONDS=6.6;
export const SHUFFLE_CHOICES=Object.freeze(['cosmic','riffle','wash']);
export const SHUFFLE_DURATIONS=Object.freeze({cosmic:4.7,riffle:4.8,wash:5.2});
export function shuffleDuration(style){
 if(style==='auto')return AUTO_SHUFFLE_SECONDS;
 if(!(style in SHUFFLE_DURATIONS))throw Error('Unknown physical shuffle '+style);
 return SHUFFLE_DURATIONS[style];
}
function backAttitude(yaw=0,pitch=0,roll=0){
 const normal=norm([Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)]);
 let right=norm(cross([0,1,0],normal));
 if(length(right)<.01)right=[1,0,0];
 let up=norm(cross(normal,right));
 if(roll){
  const c=Math.cos(roll),s=Math.sin(roll),r=right,u=up;
  right=norm(r.map((v,i)=>v*c+u[i]*s));
  up=norm(u.map((v,i)=>v*c-r[i]*s));
 }
 return {right,up,normal,frontFacingCamera:false};
}
function blend(a,b,t){
 t=ease(t);
 const normal=norm(mixVec(a.attitude.normal,b.attitude.normal,t));
 const tentativeUp=norm(mixVec(a.attitude.up,b.attitude.up,t));
 let right=norm(cross(tentativeUp,normal));
 if(length(right)<.01)right=b.attitude.right;
 const up=norm(cross(normal,right));
 return {position:mixVec(a.position,b.position,t),attitude:{normal,right,up,frontFacingCamera:normal[2]>0},
  scale:lerp(a.scale,b.scale,t),visible:true};
}
function pose(position,attitude,scale){return {position,attitude,scale,visible:true}}
function startPose(card,landingAt){
 const position=sampleLandingPose(card,landingAt,'inside-out');
 return pose(position,landingAttitude(card,position,landingAt),1);
}
export function deckPose(card,worldTime=0){
 const rank=card.orbitSlot,ang=.20+.085*Math.sin(worldTime*.24);
 const attitude=backAttitude(ang,-.15,Math.sin(worldTime*.21)*.045);
 // Stack along the shared surface normal, each of 78 physical cards distinct.
 // Small edge stagger is <.03 world units; there is NO single-card collapse.
 const step=.017,normal=attitude.normal;
 const position=[
  .04+normal[0]*rank*step+.012*Math.sin(rank*.73),
  -.20+normal[1]*rank*step+.006*Math.cos(rank*.93),
  -13.8+normal[2]*rank*step
 ];
 return pose(position,attitude,2.23);
}
export function deckThickness(entities){
 const positions=entities.map(c=>deckPose(c,0).position);
 return Math.max(...positions.map(p=>p[2]))-Math.min(...positions.map(p=>p[2]));
}
function tornadoPose(card,age){
 const rank=card.orbitSlot,q=(rank+.5)/N,v=2*q-1;
 const theta=rank*GOLDEN+age*2.65+card.visualSeed*.000002;
 const r=2.1+1.45*Math.max(0,1-v*v)+.10*Math.sin(theta*2.2);
 const position=[r*Math.cos(theta),v*4.25+.18*Math.sin(age*1.4+rank),
  -16.2+r*.72*Math.sin(theta)];
 const attitude=backAttitude(Math.sin(theta)*.40,.19*Math.sin(age+rank*.15),-.32*Math.sin(theta*.75));
 return pose(position,attitude,1.04);
}
function cosmicRingPose(card,t){
 const rank=card.orbitSlot,r=rank%2?4.2:3.2,phase=rank*GOLDEN+t*2.15;
 const y=rank%2?1.35:-1.35;
 return pose([Math.cos(phase)*r,y+.38*Math.sin(phase*2),-17+Math.sin(phase)*r*.38],
  backAttitude(.38*Math.sin(phase),.12*Math.cos(phase),.14*Math.sin(phase)),1.04);
}
function riffleStackPose(card,side,t){
 const rank=card.orbitSlot,half=Math.floor(rank/2),sign=side===0?-1:1;
 const angle=sign*(-.12)+.03*Math.sin(t*.7);
 const normal=backAttitude(angle,-.14).normal;
 const position=[sign*2.3+normal[0]*half*.020,-.50+normal[1]*half*.020,-15.2+normal[2]*half*.020];
 return pose(position,backAttitude(angle,-.14),2.13);
}
function riffleBridgePose(card,t){
 // After interleaving, the 78 cards form a visibly arched, fanned bridge.
 // They only close and flatten into the deck during the final beat.
 const rank=card.orbitSlot,side=rank%2,sign=side===0?-1:1;
 const base=deckPose(card,t);
 const arch=.67*Math.sin(Math.PI*(rank+.5)/N);
 return pose([base.position[0]+sign*.24,base.position[1]+arch,
              base.position[2]-.24*Math.sin(Math.PI*(rank+.5)/N)],
             backAttitude(sign*.14,-.22,sign*.07),2.20);
}
function riffleInterleavePose(card,t){
 const rank=card.orbitSlot,side=rank%2,half=Math.floor(rank/2);
 const arrival=.70+half/39*1.70;
 const local=ease((t-arrival)/.46);
 const start=riffleStackPose(card,side,t);
 const end=riffleBridgePose(card,t);
 const arc=.53*Math.sin(Math.PI*local);
 const mid=blend(start,end,local);
 mid.position[1]+=arc;
 return mid;
}
function washPose(card,t){
 const rank=card.orbitSlot,seed=card.visualSeed;
 const a=rank*GOLDEN+hash(rank,seed)*.65+t*(rank%2?-.48:.52);
 const r=1.1+Math.sqrt((rank+.5)/N)*3.8+hash(rank+999,seed)*.15;
 const x=r*Math.cos(a),y=.78*r*Math.sin(a)-.42;
 const z=-17.2+.16*y+.22*Math.cos(a*2);
 const tilt=(hash(rank+121,seed)-.5)*.32;
 return pose([x,y,z],backAttitude(tilt, -.40,Math.sin(a*.85)*.33),.96);
}
export function samplePhysicalShuffle(card,{style='auto',age=0,landingAt=2.5,worldTime=0}={}){
 const t=Math.max(0,Number(age)||0),deck=deckPose(card,worldTime);
 if(style==='auto'){
  if(t<1.15)return blend(startPose(card,landingAt),tornadoPose(card,t),t/1.15);
  if(t<4.55)return tornadoPose(card,t);
  if(t<AUTO_SHUFFLE_SECONDS)return blend(tornadoPose(card,t),deck,(t-4.55)/(AUTO_SHUFFLE_SECONDS-4.55));
  return deck;
 }
 if(style==='cosmic'){
  if(t<.85)return blend(deck,cosmicRingPose(card,t),t/.85);
  if(t<3.28)return cosmicRingPose(card,t);
  if(t<SHUFFLE_DURATIONS.cosmic)return blend(cosmicRingPose(card,t),deck,(t-3.28)/(SHUFFLE_DURATIONS.cosmic-3.28));
  return deck;
 }
 if(style==='riffle'){
  const side=card.orbitSlot%2,stack=riffleStackPose(card,side,t);
  if(t<.72)return blend(deck,stack,t/.72);
  if(t<2.95)return riffleInterleavePose(card,t);
  if(t<SHUFFLE_DURATIONS.riffle)return blend(riffleBridgePose(card,t),deck,(t-2.95)/(SHUFFLE_DURATIONS.riffle-2.95));
  return deck;
 }
 if(style==='wash'){
  if(t<.90)return blend(deck,washPose(card,t),t/.90);
  if(t<3.70)return washPose(card,t);
  if(t<SHUFFLE_DURATIONS.wash)return blend(washPose(card,t),deck,(t-3.70)/(SHUFFLE_DURATIONS.wash-3.70));
  return deck;
 }
 throw Error('Unsupported physical shuffle '+style);
}
export function shuffleBeat(style,age){
 if(style==='auto')return age<1.15?'gathering':age<4.55?'tornado':age<AUTO_SHUFFLE_SECONDS?'collapsing':'deck_ready';
 if(!SHUFFLE_CHOICES.includes(style))throw Error('Unknown shuffle variant');
 if(age>=shuffleDuration(style))return 'deck_ready';
 if(style==='riffle')return age<.72?'splitting':age<2.95?'interleaving':'closing';
 if(style==='wash')return age<.90?'spreading':age<3.70?'table_wash':'gathering';
 return age<.85?'expanding':age<3.28?'orbital_shuffle':'gathering';
}


/**
 * Validate complete physical 3D basis before starting a ritual. Fail closed
 * with a visible preview error instead of accepting a cardless GPU animation.
 * It runs on a control transition only, never every animation frame.
 */
export function assertShuffleGeometry(cards,{style='auto',landingAt=0,worldTime=0}={}){
 const stop=shuffleDuration(style);
 for(const age of [0.05,.6,1.6,3.2,stop]){
  for(const card of cards){
   const p=samplePhysicalShuffle(card,{style,age,landingAt,worldTime});
   const values=[p.position,p.attitude?.right,p.attitude?.up,p.attitude?.normal];
   if(values.some(a=>!Array.isArray(a)||a.length!==3||a.some(v=>!Number.isFinite(v)))){
    throw new Error('Invalid shuffle XYZ geometry: '+style+' at '+age+'s, '+card.id);
   }
   if(!(p.scale>0&&Number.isFinite(p.scale)))throw new Error('Invalid shuffle scale: '+style+', '+card.id);
  }
 }
 return true;
}
