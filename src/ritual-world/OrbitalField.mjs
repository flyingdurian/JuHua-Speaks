/**
 * Gate A v6: four visually related orbital scales, still exactly 78 persistent
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
export const INNER_CARD_COUNT=62,OUTER_CARD_COUNT=16;
export const ORBIT_SPEED=.034;
export const ORBIT_RADIUS=7.8,ORBIT_CENTER_Z=-23.5;
export const OUTER_ORBIT_RADIUS=23.5,OUTER_ORBIT_CENTER_Z=-28.5;
export const SHELL_CENTER=Object.freeze([0,0,ORBIT_CENTER_Z]);
export const ENTRANCE_MODES=Object.freeze(['inside-out','outside-in']);
export const ENTRANCE_SECONDS=1.7; // preserved v5 entrance
export const OUTSIDE_ENTRANCE_SECONDS=4.2;
export const ORBIT_LAYERS=Object.freeze([
 Object.freeze({id:'core',family:'inner',count:50,radius:ORBIT_RADIUS,centerZ:ORBIT_CENTER_Z,counts:Object.freeze([3,5,8,9,10,7,5,3]),lats:Object.freeze([-1.14,-.85,-.52,-.17,.16,.52,.85,1.14])}),
 Object.freeze({id:'halo',family:'inner',count:12,radius:10.25,centerZ:-24.0,counts:Object.freeze([2,2,2,2,2,2]),lats:Object.freeze([-.91,-.59,-.24,.24,.59,.91])}),
 Object.freeze({id:'orbit',family:'outer',count:10,radius:18.7,centerZ:-27.1,counts:Object.freeze([2,3,3,2]),lats:Object.freeze([-.52,-.19,.19,.52])}),
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
  return Object.freeze({
   id:c.id,index:i,name:c.name,orbitSlot:shuffled[i],ring:slot.band,
   layer:slot.family,orbitScale:slot.layer,centerZ:slot.centerZ,orbitRadius:slot.radius,
   local:slot.local,phase,featured:slot.featured,
   width:large?1.22+rand01(seed,i+335)*.23:outer?1.02+rand01(seed,i+335)*.24:.74+rand01(seed,i+335)*.18,
   height:large?2.06+rand01(seed,i+435)*.37:outer?1.76+rand01(seed,i+435)*.29:1.32+rand01(seed,i+435)*.24,
   light:.83+rand01(seed,i+640)*.15,reversed:rand01(seed,i+230)<.22,frontVisible:true,
   tangentBias:.43+(rand01(seed,i+470)-.5)*.35,radialBias:.84+(rand01(seed,i+480)-.5)*.32,
   normalSign:slot.featured?1:(rand01(seed,i+490)<(outer?.48:.25)?1:-1),
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
export function entranceProgress(card,seconds,mode='inside-out'){
 const duration=entranceDuration(mode),delay=mode==='outside-in'?card.spawnIndex*.014:card.spawnIndex*.0024;
 return smooth((Math.max(0,seconds)-delay)/(duration-delay*.13));
}
export function entranceScale(card,seconds,mode='inside-out'){
 return mode==='outside-in'?.76+.24*entranceProgress(card,seconds,mode):.34+.66*entranceProgress(card,seconds,mode);
}
function outsideSpawn(card,end){
 // Spawn beyond the frame edges (not at the camera) then join each preassigned
 // orbital slot with staggered easing. Uses stable slot position; no draw change.
 const a=card.phase+card.orbitSlot*2.3999632297;
 const ux=Math.cos(a),uy=Math.sin(a);
 const depth=Math.max(11,-end[2]),edge=depth*.80;
 const length=Math.max(1,Math.hypot(ux,uy));
 return [end[0]+(ux/length)*edge*1.8,end[1]+(uy/length)*edge*1.45,end[2]-2.5];
}
export function sampleLandingPose(card,seconds,mode='inside-out'){
 const p=entranceProgress(card,seconds,mode),end=sphericalPose(card,seconds);
 if(p>=1)return end;
 if(mode==='outside-in'){
  const start=outsideSpawn(card,end),sway=Math.sin(Math.PI*p)*(1-p)*.35;
  return [mix(start[0],end[0],p)-Math.sin(card.phase)*sway,
          mix(start[1],end[1],p)+Math.cos(card.phase)*sway,
          mix(start[2],end[2],p)];
 }
 const a=card.phase+card.orbitSlot*.16,start=[Math.cos(a)*.73,Math.sin(a)*.43,-7.8-card.spawnIndex*.018];
 return start.map((v,i)=>mix(v,end[i],p));
}
export function landingOpacity(card,seconds,mode='inside-out'){
 const delay=mode==='outside-in'?card.spawnIndex*.014:card.spawnIndex*.0024;
 // Opaque physical cards after entrance; no per-card translucency animation.
 return Math.max(0,Math.min(1,(Math.max(0,seconds)-delay)*8));
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
