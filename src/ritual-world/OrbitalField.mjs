/**
 * Gate A v5 — a readable inner Tarot sphere and a sparse outer flyby shell.
 * Both layers are rigidly orbiting. No card is ever interpolated radially to
 * fake a near-camera pass. Slots are seeded per visit, never used for Tarot odds.
 */
const N=78, TAU=Math.PI*2;
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
export const INNER_CARD_COUNT=62,OUTER_CARD_COUNT=N-INNER_CARD_COUNT;
export const ORBIT_SPEED=.034;
export const ENTRANCE_SECONDS=1.7;
export const ORBIT_RADIUS=8.0;
export const ORBIT_CENTER_Z=-23.5;
export const OUTER_ORBIT_RADIUS=23.5;
export const OUTER_ORBIT_CENTER_Z=-28.0;
export const SHELL_CENTER=Object.freeze([0,0,ORBIT_CENTER_Z]);
const CORE_COUNTS=Object.freeze([4,6,9,11,12,9,7,4]);
const CORE_LATS=Object.freeze([-1.14,-.85,-.52,-.17,.16,.52,.85,1.14]);
const OUTER_COUNTS=Object.freeze([3,5,5,3]);
const OUTER_LATS=Object.freeze([-.52,-.19,.19,.52]);
export function rand01(seed,tag){
 let x=(seed^Math.imul((tag+1)>>>0,0x9e3779b9))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
}
export function createVisualSeed(source=globalThis.crypto){
 if(source?.getRandomValues){const a=new Uint32Array(1);source.getRandomValues(a);return a[0]}
 return Math.floor(Math.random()*4294967296)>>>0;
}
function makeSlots(seed){
 const result=[];
 let index=0;
 const phase=TAU*rand01(seed,71);
 for(const [layer,counts,lats,R,centerZ] of [
  ['inner',CORE_COUNTS,CORE_LATS,ORBIT_RADIUS,ORBIT_CENTER_Z],
  ['outer',OUTER_COUNTS,OUTER_LATS,OUTER_ORBIT_RADIUS,OUTER_ORBIT_CENTER_Z]
 ]){
  for(let band=0;band<counts.length;band++){
   const count=counts[band],offset=TAU*rand01(seed,900+(layer==='outer'?20:0)+band);
   for(let j=0;j<count;j++){
    let phi=TAU*(j+.5*(band%2))/count+offset+(rand01(seed,1100+index)-.5)*.14;
    let lat=lats[band]+(rand01(seed,1200+index)-.5)*.11;
    // Two *initial* outer orbital positions allow naturally passing foreground
    // cards in a 20s review. They never accelerate, detach or yo-yo afterwards.
    // A seeded permutation assigns different RWS identities every refresh.
    const featured=(layer==='outer'&&((band===1||band===2)&&j===0));
    if(featured){
      const time=band===1?5.5:14.5;
      const side=band===1?-1:1;
      phi=side*.105-phase-ORBIT_SPEED*time+(rand01(seed,1350+band)-.5)*.035;
      lat=side*.042+(rand01(seed,1360+band)-.5)*.028;
    }
    const radius=R*(.993+rand01(seed,1400+index)*.014);
    const local=[Math.cos(lat)*Math.sin(phi)*radius,Math.sin(lat)*radius,Math.cos(lat)*Math.cos(phi)*radius];
    result.push(Object.freeze({layer,band,centerZ,radius,local:Object.freeze(local),featured}));
    index++;
   }
  }
 }
 if(result.length!==N)throw Error('Invalid two-shell card count '+result.length);
 return {result,phase};
}
export function makeLandingCardEntities(deck,seed=2026){
 if(!Array.isArray(deck)||deck.length!==N||new Set(deck.map(c=>c.id)).size!==N)
  throw Error('Exactly 78 distinct historic Tarot cards required');
 const {result:slots,phase}=makeSlots(seed>>>0);
 const shuffled=Array.from({length:N},(_,i)=>i);
 for(let i=N-1;i>0;i--){const j=Math.floor(rand01(seed,2200+i)*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
 return deck.map((c,i)=>{
  const slot=slots[shuffled[i]],outer=slot.layer==='outer';
  return Object.freeze({
   id:c.id,index:i,name:c.name,orbitSlot:shuffled[i],ring:slot.band,
   layer:slot.layer,centerZ:slot.centerZ,orbitRadius:slot.radius,
   local:slot.local,phase,featured:slot.featured,
   width:outer?1.14+rand01(seed,i+335)*.28:.74+rand01(seed,i+335)*.14,
   height:outer?1.93+rand01(seed,i+435)*.43:1.34+rand01(seed,i+435)*.20,
   light:.79+rand01(seed,i+640)*.19,
   reversed:rand01(seed,i+230)<.22,frontVisible:true,
   tangentBias:.43+(rand01(seed,i+470)-.5)*.35,
   radialBias:.84+(rand01(seed,i+480)-.5)*.32,
   normalSign:slot.featured?1:(rand01(seed,i+490)<(outer?.51:.26)?1:-1),
   pitch:(rand01(seed,i+785)-.5)*.31,roll:(rand01(seed,i+540)-.5)*.4,
   spawnIndex:shuffled[i],visualSeed:seed>>>0
  });
 });
}
export function orbitAngle(card,seconds){return card.phase+ORBIT_SPEED*Math.max(0,seconds)}
export function sphericalPose(card,seconds){
 const p=rotY(card.local,orbitAngle(card,seconds));
 return [p[0],p[1],p[2]+card.centerZ];
}
export function entranceProgress(card,seconds){
 const delay=card.spawnIndex*.0024;
 return smooth((Math.max(0,seconds)-delay)/(ENTRANCE_SECONDS-delay*.13));
}
export function entranceScale(card,seconds){return .34+.66*entranceProgress(card,seconds)}
export function sampleLandingPose(card,seconds){
 const p=entranceProgress(card,seconds),dest=sphericalPose(card,seconds);
 if(p>=1)return dest;
 const a=card.phase+card.orbitSlot*.16,spawn=[Math.cos(a)*.73,Math.sin(a)*.43,-7.8-card.spawnIndex*.018];
 return spawn.map((v,i)=>mix(v,dest[i],p));
}
export function landingOpacity(card,seconds){
 const delay=card.spawnIndex*.0024;
 return .98*smooth((Math.max(0,seconds)-delay-.01)*3.4);
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
 const normals=cards.map((c,i)=>landingAttitude(c,positions[i],seconds));
 const sizes=positions.map((p,i)=>len([p[0],p[1],p[2]-cards[i].centerZ]));
 const core=cards.filter(c=>c.layer==='inner'),outer=cards.filter(c=>c.layer==='outer');
 return {count:cards.length,inner:core.length,outer:outer.length,
  closest:Math.max(...positions.map(p=>p[2])),frontFacing:cards.length,
  visuallyFrontFacing:normals.filter(a=>a.frontFacingCamera).length,
  visuallyBackFacing:normals.filter(a=>!a.frontFacingCamera).length,
  edgeOn:normals.filter(a=>Math.abs(a.facing)<.24).length,
  reversed:cards.filter(c=>c.reversed).length,farCount:positions.filter(p=>p[2]<-22).length,
  radialRange:[Math.min(...sizes),Math.max(...sizes)],
  innerRadius:ORBIT_RADIUS,outerRadius:OUTER_ORBIT_RADIUS};
}
