/**
 * Gate A v7: 46-core, 11-halo, 15-middle and 6 unchanged natural flybys, still exactly 78 persistent
 * historical Tarot IDs and no radial lunge at any point after entry.
 * Entrance styles are cosmetic; secure Tarot card odds remain independent.
 */
const N=78,TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
const len=v=>Math.hypot(v[0],v[1],v[2]);
const norm=v=>{const n=len(v)||1;return [v[0]/n,v[1]/n,v[2]/n]};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const rotY=(v,a)=>[Math.cos(a)*v[0]+Math.sin(a)*v[2],v[1],-Math.sin(a)*v[0]+Math.cos(a)*v[2]];
const rotate=(vec,axis,angle)=>{const k=norm(axis),c=Math.cos(angle),s=Math.sin(angle),v=cross(k,vec),d=dot(k,vec);return vec.map((n,i)=>n*c+v[i]*s+k[i]*d*(1-c))};
export const ORBIT_CARD_COUNT=N;
export const INNER_CARD_COUNT=57,OUTER_CARD_COUNT=21;
export const ORBIT_SPEED=.034;
export const ORBIT_RADIUS=7.9,ORBIT_CENTER_Z=-25.1;
export const OUTER_ORBIT_RADIUS=23.5,OUTER_ORBIT_CENTER_Z=-28.5;
export const SHELL_CENTER=Object.freeze([0,0,ORBIT_CENTER_Z]);
export const ENTRANCE_MODES=Object.freeze(['inside-out','outside-in']);
export const ENTRANCE_SECONDS=1.7; // preserved v5 entrance
export const OUTSIDE_ENTRANCE_SECONDS=4.75;
export const ORBIT_LAYERS=Object.freeze([
 Object.freeze({id:'core',family:'inner',count:46,radius:ORBIT_RADIUS,centerZ:ORBIT_CENTER_Z,counts:Object.freeze([3,5,7,8,9,7,4,3]),lats:Object.freeze([-1.14,-.85,-.52,-.17,.16,.52,.85,1.14])}),
 Object.freeze({id:'halo',family:'inner',count:11,radius:10.10,centerZ:-25.7,counts:Object.freeze([2,2,2,2,2,1]),lats:Object.freeze([-.91,-.59,-.24,.24,.59,.91])}),
 Object.freeze({id:'orbit',family:'outer',count:15,radius:18.0,centerZ:-28.1,counts:Object.freeze([3,4,5,3]),lats:Object.freeze([-.58,-.19,.19,.58])}),
 Object.freeze({id:'flyby',family:'outer',count:6,radius:OUTER_ORBIT_RADIUS,centerZ:OUTER_ORBIT_CENTER_Z,counts:Object.freeze([1,2,2,1]),lats:Object.freeze([-.48,-.15,.15,.48])})
]);
export function rand01(seed,tag){
 let x=(seed^Math.imul((tag+1)>>>0,0x9e3779b9))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
}
export function createVisualSeed(source=globalThis.crypto){
 if(source?.getRandomValues){const a=new Uint32Array(1);source.getRandomValues(a);return a[0]}
 return Math.floor(Math.random()*4294967296)>>>0;
}
function slotsForSeed(seed){
 const result=[];let index=0;const phase=TAU*rand01(seed,71);
 for(const [layerIndex,layer] of ORBIT_LAYERS.entries()){
  for(let band=0;band<layer.counts.length;band++){
   const count=layer.counts[band],offset=TAU*rand01(seed,900+layerIndex*30+band);
   for(let j=0;j<count;j++){
    let phi=TAU*(j+.5*(band%2))/count+offset+(rand01(seed,1100+index)-.5)*.14;
    let lat=layer.lats[band]+(rand01(seed,1200+index)-.5)*.085;
    // Set only the initial longitude of two flyby members. All subsequent
    // movement is ordinary constant-speed rotation; no radial tween/yo-yo.
    const featured=layer.id==='flyby'&&((band===1||band===2)&&j===0);
    if(featured){
     const time=band===1?5.5:14.5,side=band===1?-1:1;
     phi=side*.11-phase-ORBIT_SPEED*time+(rand01(seed,1350+band)-.5)*.036;
     lat=side*.045+(rand01(seed,1360+band)-.5)*.025;
    }
    const radius=layer.radius*(.993+rand01(seed,1400+index)*.014);
    const local=[Math.cos(lat)*Math.sin(phi)*radius,Math.sin(lat)*radius,Math.cos(lat)*Math.cos(phi)*radius];
    result.push(Object.freeze({layer:layer.id,family:layer.family,band,centerZ:layer.centerZ,radius,local:Object.freeze(local),featured}));index++;
   }
  }
 }
 if(result.length!==N)throw Error('Expected 78 slots, got '+result.length);
 return {slots:result,phase};
}
export function makeLandingCardEntities(deck,seed=2026){
 if(!Array.isArray(deck)||deck.length!==N||new Set(deck.map(c=>c.id)).size!==N)throw Error('Exactly 78 unique Tarot IDs required');
 const {slots,phase}=slotsForSeed(seed>>>0),shuffled=Array.from({length:N},(_,i)=>i);
 for(let i=N-1;i>0;i--){const j=Math.floor(rand01(seed,2200+i)*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
 return deck.map((c,i)=>{
  const slot=slots[shuffled[i]],large=slot.layer==='flyby',outer=slot.family==='outer';
  // Start with the reference's dark backs predominant, but preserve genuine
  // physical front/back transitions as the whole orbit turns.
  const radial=norm(slot.local),tangent=norm([radial[2],0,-radial[0]]);
  const tangentBias=.43+(rand01(seed,i+470)-.5)*.35;
  const radialBias=.84+(rand01(seed,i+480)-.5)*.32;
  const unsignedNormal=norm(radial.map((v,j)=>v*radialBias+tangent[j]*tangentBias));
  const initialNormal=rotY(unsignedNormal,phase+ORBIT_SPEED*5);
  const initialPosition=rotY(slot.local,phase+ORBIT_SPEED*5);
  initialPosition[2]+=slot.centerZ;
  const unsignedFront=dot(initialNormal,norm(initialPosition.map(v=>-v)))>0;
  const preferBack=rand01(seed,i+490)<(outer?.67:.74);
  const normalSign=slot.featured?1:(preferBack?(unsignedFront?-1:1):(unsignedFront?1:-1));
  return Object.freeze({
   id:c.id,index:i,name:c.name,orbitSlot:shuffled[i],ring:slot.band,
   layer:slot.family,orbitScale:slot.layer,centerZ:slot.centerZ,orbitRadius:slot.radius,
   local:slot.local,phase,featured:slot.featured,
   width:large?1.22+rand01(seed,i+335)*.23:outer?1.02+rand01(seed,i+335)*.24:.74+rand01(seed,i+335)*.18,
   height:large?2.06+rand01(seed,i+435)*.37:outer?1.76+rand01(seed,i+435)*.29:1.32+rand01(seed,i+435)*.24,
   light:.83+rand01(seed,i+640)*.15,reversed:rand01(seed,i+230)<.22,frontVisible:true,
   tangentBias,radialBias,normalSign,
   pitch:(rand01(seed,i+785)-.5)*.31,roll:(rand01(seed,i+540)-.5)*.4,
   spawnIndex:shuffled[i],visualSeed:seed>>>0
  });
 });
}
export function orbitAngle(card,seconds){return card.phase+ORBIT_SPEED*Math.max(0,seconds)}
export function sphericalPose(card,seconds){
 const p=rotY(card.local,orbitAngle(card,seconds));return [p[0],p[1],p[2]+card.centerZ];
}
export function entranceDuration(mode='inside-out'){return mode==='outside-in'?OUTSIDE_ENTRANCE_SECONDS:ENTRANCE_SECONDS}
export function entranceDelay(card,mode='inside-out'){
 return mode==='outside-in'?card.spawnIndex*.037:card.spawnIndex*.0024;
}
export function entranceProgress(card,seconds,mode='inside-out'){
 const t=Math.max(0,seconds),delay=entranceDelay(card,mode);
 if(mode==='outside-in'){
  // Each card takes a different 0.9–1.7s curved flight. The late arrivals
  // attach between ~3.5s and 4.7s, matching an assembled world, not a mural.
  const duration=.87+rand01(card.visualSeed,5700+card.index)*.92;
  return smooth((t-delay)/duration);
 }
 return smooth((t-delay)/(ENTRANCE_SECONDS-delay*.13));
}
export function entranceScale(card,seconds,mode='inside-out'){
 return mode==='outside-in'?.53+.47*entranceProgress(card,seconds,mode):.34+.66*entranceProgress(card,seconds,mode);
}
export function landingVisible(card,seconds,mode='inside-out'){
 return mode!=='outside-in'||seconds>=entranceDelay(card,mode);
}
function bezier(start,c1,c2,end,p){
 const q=1-p,a=q*q*q,b=3*q*q*p,c=3*q*p*p,d=p*p*p;
 return [0,1,2].map(i=>a*start[i]+b*c1[i]+c*c2[i]+d*end[i]);
}
export function outsideArrivalPose(card,seconds){
 // Physical space: a near/far mixture of arrival depths and tangential arcs.
 // The starting point lies beyond the camera frustum in 16:9 or narrower view.
 const destination=sphericalPose(card,seconds);
 const p=entranceProgress(card,seconds,'outside-in');
 if(p>=1)return destination;
 const zabs=30+rand01(card.visualSeed,6200+card.index)*17;
 const angle=card.phase+card.orbitSlot*2.399963229728653;
 const ca=Math.cos(angle),sa=Math.sin(angle),sgn=rand01(card.visualSeed,6500+card.index)<.5?-1:1;
 const start=[zabs*1.08*ca,zabs*.91*sa,-zabs];
 const curvature=4.5+rand01(card.visualSeed,6650+card.index)*7;
 const ctrl1=[start[0]*.75-sa*curvature*sgn,
              start[1]*.75+ca*curvature*sgn,
              start[2]-(3.5+rand01(card.visualSeed,6800+card.index)*5)];
 const tangent=[destination[2]-card.centerZ,0,-destination[0]];
 const tnorm=norm(tangent);
 const ctrl2=[destination[0]-tnorm[0]*curvature*.65,
              destination[1]+sgn*curvature*.28,
              destination[2]-tnorm[2]*curvature*.65-3.0];
 return bezier(start,ctrl1,ctrl2,destination,p);
}
export function sampleLandingPose(card,seconds,mode='inside-out'){
 const p=entranceProgress(card,seconds,mode),end=sphericalPose(card,seconds);
 if(p>=1)return end;
 if(mode==='outside-in')return outsideArrivalPose(card,seconds);
 const a=card.phase+card.orbitSlot*.16,start=[Math.cos(a)*.73,Math.sin(a)*.43,-7.8-card.spawnIndex*.018];
 return start.map((v,i)=>mix(v,end[i],p));
}
export function landingOpacity(card,seconds,mode='inside-out'){
 // Retained for API compatibility only: physical cards are ALWAYS opaque.
 return landingVisible(card,seconds,mode)?1:0;
}
export function landingAttitude(card,position,seconds){
 const radial=norm(card.local),tangent=norm([radial[2],0,-radial[0]]);
 let front=norm(radial.map((v,i)=>(v*card.radialBias+tangent[i]*card.tangentBias)*card.normalSign));
 let right=norm(cross([0,1,0],front));if(len(right)<.01)right=[1,0,0];
 let up=norm(cross(front,right));
 front=rotate(front,right,card.pitch);up=rotate(up,right,card.pitch);
 const roll=card.roll+(card.reversed?Math.PI:0);
 right=rotate(right,front,roll);up=rotate(up,front,roll);
 const ang=orbitAngle(card,seconds);
 right=rotY(right,ang);up=rotY(up,ang);front=rotY(front,ang);
 const viewer=norm(position.map(v=>-v)),facing=dot(front,viewer);
 return {right,up,normal:front,facing,frontFacingCamera:facing>0};
}
export function orbitDiagnostics(cards,seconds){
 const positions=cards.map(c=>sampleLandingPose(c,seconds));
 const faces=cards.map((c,i)=>landingAttitude(c,positions[i],seconds));
 const radii=positions.map((p,i)=>len([p[0],p[1],p[2]-cards[i].centerZ]));
 return {count:cards.length,inner:cards.filter(c=>c.layer==='inner').length,outer:cards.filter(c=>c.layer==='outer').length,
  scales:ORBIT_LAYERS.map(l=>({id:l.id,count:cards.filter(c=>c.orbitScale===l.id).length,radius:l.radius,centerZ:l.centerZ})),
  closest:Math.max(...positions.map(p=>p[2])),frontFacing:cards.length,
  visuallyFrontFacing:faces.filter(f=>f.frontFacingCamera).length,
  visuallyBackFacing:faces.filter(f=>!f.frontFacingCamera).length,
  edgeOn:faces.filter(f=>Math.abs(f.facing)<.24).length,
  reversed:cards.filter(c=>c.reversed).length,farCount:positions.filter(p=>p[2]<-22).length,
  radialRange:[Math.min(...radii),Math.max(...radii)],
  innerRadius:ORBIT_RADIUS,outerRadius:OUTER_ORBIT_RADIUS};
}
