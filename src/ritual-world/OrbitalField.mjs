/**
 * Gate A v3: evidence-guided orbital composition.
 *
 * Reference-video findings:
 *  - dark card backs dominate; some genuine illustrated faces turn into view
 *  - cards visibly foreshorten and show their edges (not camera-facing billboards)
 *  - a deep, circular volume is seen both with and without CTA
 *  - the same coherent cloud slowly revolves; a few cards sweep near the edges
 *
 * All 78 fronts remain loaded/identity-mapped. Display sides and decorative seed
 * NEVER alter card identities, orientations in a reading, or shuffle probabilities.
 */
const TAU=Math.PI*2;
const GOLDEN=Math.PI*(3-Math.sqrt(5));
const N=78;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
const norm=v=>{const len=Math.hypot(...v)||1;return v.map(n=>n/len)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const rotate=(vec,axis,radians)=>{
 const [x,y,z]=vec,a=norm(axis),c=Math.cos(radians),s=Math.sin(radians),v=cross(a,vec),d=dot(a,vec);
 return [x*c+v[0]*s+a[0]*d*(1-c),y*c+v[1]*s+a[1]*d*(1-c),z*c+v[2]*s+a[2]*d*(1-c)];
};
export const ORBIT_CARD_COUNT=N;
export const ORBIT_SPEED=.043; // full revolution ~146 s, visible movement over 20-s review
export const ENTRANCE_SECONDS=1.90;
export const ORBIT_RADIUS=23.5;
export const ORBIT_CENTER_Z=-40;
export function rand01(seed,tag){
 let x=(seed^Math.imul((tag+1)>>>0,0x9e3779b9))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
}
export function createVisualSeed(source=globalThis.crypto){
 if(source?.getRandomValues){const a=new Uint32Array(1);source.getRandomValues(a);return a[0]}
 return Math.floor(Math.random()*4294967296)>>>0;
}
export function makeLandingCardEntities(deck,seed=2026){
 if(!Array.isArray(deck)||deck.length!==N||new Set(deck.map(c=>c.id)).size!==N)
  throw Error('Exactly 78 unique original Tarot cards are required');
 const slots=Array.from({length:N},(_,i)=>i);
 for(let i=N-1;i>0;i--){const j=Math.floor(rand01(seed,999+i)*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]]}
 const passIds=Array.from({length:N},(_,i)=>i).sort((a,b)=>rand01(seed,a+899)-rand01(seed,b+899)).slice(0,4);
 const baseAngle=rand01(seed,71)*TAU;
 return deck.map((card,i)=>{
  const sideRoll=rand01(seed,i+240),sideMode=sideRoll<.25?'front':sideRoll<.88?'back':'edge';
  const angle=sideMode==='front'?(rand01(seed,i+340)-.5)*1.60:
   sideMode==='back'?Math.PI+(rand01(seed,i+440)-.5)*1.65:
   (rand01(seed,i+540)<.5?-1:1)*(Math.PI/2+(rand01(seed,i+640)-.5)*.30);
  return Object.freeze({
   id:card.id,index:i,name:card.name,orbitSlot:slots[i],
   phase:baseAngle+(rand01(seed,i+1)-.5)*.18,
   width:1.06+rand01(seed,i+335)*.32,
   height:1.88+rand01(seed,i+435)*.48,
   light:.76+rand01(seed,i+640)*.24,
   reversed:rand01(seed,i+230)<.27,
   frontVisible:true, // face texture AVAILABLE; visible side derives from real 3D pose
   sideMode, yaw:angle,
   pitch:(rand01(seed,i+785)-.5)*.74,
   roll:(rand01(seed,i+540)-.5)*1.10,
   passIndex:passIds.indexOf(i),jitter:(rand01(seed,i+740)-.5)*.12,
   spawnIndex:slots[i],seed:seed>>>0
  });
 });
}
export function sphericalPose(card,seconds){
 const t=Math.max(0,seconds);
 const slot=card.orbitSlot;
 const v=1-2*(slot+.5)/N;
 const ring=Math.sqrt(Math.max(0,1-v*v));
 const theta=slot*GOLDEN+card.phase+t*ORBIT_SPEED;
 const radius=ORBIT_RADIUS*(1+card.jitter);
 let x=Math.cos(theta)*ring*radius;
 let y=v*radius+Math.sin(theta*1.1+card.phase)*.40;
 let z=ORBIT_CENTER_Z+Math.sin(theta)*ring*radius;
 // Mild precession prevents a mechanically fixed planar ring.
 const pitch=.065*Math.sin(t*.018+card.seed*.000003);
 const yy=y*Math.cos(pitch)-z*Math.sin(pitch)*.06;
 y=yy;
 // Rare foreground passes peel out of the orbit *near the viewport edges*.
 if(card.passIndex>=0){
  const cycle=56,at=(t-(3.5+card.passIndex*11.7)+cycle*9)%cycle;
  if(at>=0&&at<8.8){
   const amount=.91*Math.sin(Math.PI*at/8.8)**2;
   const side=card.passIndex%2===0?-1:1;
   x=mix(x,side*(6.4+Math.sin(at*.43)*.8),amount);
   y=mix(y,(card.passIndex%3-1)*2.1+Math.sin(at*.26)*.7,amount);
   z=mix(z,-5.8,amount);
  }
 }
 return [x,y,z];
}
export function entranceProgress(card,seconds){
 const delay=card.spawnIndex*.004;
 return smooth((Math.max(0,seconds)-delay)/(ENTRANCE_SECONDS-delay*.12));
}
export function entranceScale(card,seconds){
 const p=entranceProgress(card,seconds);
 return .19+.81*p;
}
export function sampleLandingPose(card,seconds){
 const t=Math.max(0,Number(seconds)||0),end=sphericalPose(card,t),p=entranceProgress(card,t);
 if(p>=1)return end;
 const a=card.phase+card.spawnIndex*.12;
 const start=[Math.cos(a)*.85,Math.sin(a)*.5,-7.8-card.spawnIndex*.026];
 return start.map((v,i)=>mix(v,end[i],p));
}
export function landingOpacity(card,seconds){
 const delay=card.spawnIndex*.004;
 return .995*smooth((Math.max(0,seconds)-delay-.08)*2.5);
}
export function landingAttitude(card,position,seconds){
 // Coherent spherical placement, but card normals are not forced to face camera.
 // Face/back visibility comes from real yaw/pitch and depth testing.
 const toward=norm(position.map(n=>-n));
 let right=norm(cross([0,1,0],toward));
 if(Math.hypot(...right)<.02)right=[1,0,0];
 let up=norm(cross(toward,right)),front=toward;
 const yaw=card.yaw+.20*Math.sin(seconds*.19+card.phase);
 right=rotate(right,up,yaw);front=rotate(front,up,yaw);
 const pitch=card.pitch+.14*Math.sin(seconds*.14+card.phase*2.3);
 up=rotate(up,right,pitch);front=rotate(front,right,pitch);
 const roll=card.roll+(card.reversed?Math.PI:0)+.09*Math.sin(seconds*.16+card.phase);
 right=rotate(right,front,roll);up=rotate(up,front,roll);
 const facing=dot(front,toward);
 return {right:norm(right),up:norm(up),normal:norm(front),facing,frontFacingCamera:facing>0};
}
export function orbitDiagnostics(cards,seconds){
 const positions=cards.map(c=>sampleLandingPose(c,seconds));
 const frontVisibleCount=cards.filter((c,i)=>landingAttitude(c,positions[i],seconds).frontFacingCamera).length;
 return {
  count:cards.length,closest:Math.max(...positions.map(p=>p[2])),
  frontFacing:cards.length, // all 78 physical fronts loaded
  visuallyFrontFacing:frontVisibleCount,visuallyBackFacing:cards.length-frontVisibleCount,
  reversed:cards.filter(c=>c.reversed).length,
  farCount:positions.filter(p=>p[2]<-22).length
 };
}
