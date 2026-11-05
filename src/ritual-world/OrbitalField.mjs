/** Gate A v4. One coherent, rigidly rotating 78-card celestial shell; no detached foreground tweens. Card side transitions derive from physical orientation. Seed alters only appearance, not Tarot draw odds. */
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
export const ORBIT_SPEED=.034;
export const ENTRANCE_SECONDS=2.25;
export const ORBIT_RADIUS=28.55;
export const ORBIT_CENTER_Z=-32.55;
export const SHELL_CENTER=Object.freeze([0,0,ORBIT_CENTER_Z]);
const RINGS=Object.freeze([6,8,10,13,13,10,10,8]);
const LATITUDES=Object.freeze([-1.21,-.9,-.56,-.21,.19,.55,.9,1.22]);
export function rand01(seed,tag){let x=(seed^Math.imul((tag+1)>>>0,0x9e3779b9))>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return (x>>>0)/4294967296}
export function createVisualSeed(source=globalThis.crypto){if(source?.getRandomValues){const a=new Uint32Array(1);source.getRandomValues(a);return a[0]}return Math.floor(Math.random()*4294967296)>>>0}
function ringSlots(seed){const out=[];let s=0;for(let r=0;r<RINGS.length;r++)for(let j=0;j<RINGS[r];j++){
 const phi=TAU*(j+.5*(r%2))/RINGS[r]+rand01(seed,900+r)*TAU+(rand01(seed,1000+s)-.5)*.14;
 const lat=LATITUDES[r]+(rand01(seed,1100+s)-.5)*.10;
 const radius=ORBIT_RADIUS*(.986+rand01(seed,1200+s)*.028);
 out.push({ring:r,local:[Math.cos(lat)*Math.sin(phi)*radius,Math.sin(lat)*radius,Math.cos(lat)*Math.cos(phi)*radius]});s++;
}return out}
export function makeLandingCardEntities(deck,seed=2026){
 if(!Array.isArray(deck)||deck.length!==N||new Set(deck.map(c=>c.id)).size!==N)throw Error('Exactly 78 unique Tarot cards required');
 const slots=ringSlots(seed),shuffle=Array.from({length:N},(_,i)=>i);
 for(let i=N-1;i>0;i--){const j=Math.floor(rand01(seed,2200+i)*(i+1));[shuffle[i],shuffle[j]]=[shuffle[j],shuffle[i]]}
 const init=TAU*rand01(seed,71);
 return deck.map((c,i)=>{const slot=slots[shuffle[i]];return Object.freeze({
  id:c.id,index:i,name:c.name,orbitSlot:shuffle[i],ring:slot.ring,local:Object.freeze(slot.local),phase:init,
  width:1.11+rand01(seed,335+i)*.16,height:1.88+rand01(seed,435+i)*.19,light:.72+rand01(seed,640+i)*.27,
  reversed:rand01(seed,i+230)<.25,frontVisible:true,
  tangentBias:.58+(rand01(seed,i+470)-.5)*.40,radialBias:.69+(rand01(seed,i+480)-.5)*.45,
  normalSign:rand01(seed,i+490)<.16?-1:1,pitch:(rand01(seed,i+785)-.5)*.28,
  roll:(rand01(seed,i+540)-.5)*.35,spawnIndex:shuffle[i],visualSeed:seed>>>0
 })});
}
export function orbitAngle(card,seconds){return card.phase+ORBIT_SPEED*Math.max(0,seconds)}
export function sphericalPose(card,seconds){const r=rotY(card.local,orbitAngle(card,seconds));return [r[0],r[1],r[2]+ORBIT_CENTER_Z]}
export function entranceProgress(card,seconds){const delay=card.spawnIndex*.004;return smooth((Math.max(0,seconds)-delay)/(ENTRANCE_SECONDS-delay*.14))}
export function entranceScale(card,seconds){return .31+.69*entranceProgress(card,seconds)}
export function sampleLandingPose(card,seconds){const p=entranceProgress(card,seconds),final=sphericalPose(card,seconds);if(p>=1)return final;
 const a=card.phase+card.orbitSlot*.16,near=[Math.cos(a)*.78,Math.sin(a)*.48,-8.5-card.spawnIndex*.03];return near.map((v,i)=>mix(v,final[i],p))}
export function landingOpacity(card,seconds){const delay=card.spawnIndex*.004;return .99*smooth((Math.max(0,seconds)-delay-.02)*3)}
export function landingAttitude(card,position,seconds){
 const radial=norm(card.local),tangent=norm([radial[2],0,-radial[0]]);
 let front=norm(radial.map((v,i)=>(v*card.radialBias+tangent[i]*card.tangentBias)*card.normalSign));
 let right=norm(cross([0,1,0],front));if(len(right)<.01)right=[1,0,0];
 let up=norm(cross(front,right));
 front=rotate(front,right,card.pitch);up=rotate(up,right,card.pitch);
 const roll=card.roll+(card.reversed?Math.PI:0);
 right=rotate(right,front,roll);up=rotate(up,front,roll);
 const angle=orbitAngle(card,seconds);
 right=rotY(right,angle);up=rotY(up,angle);front=rotY(front,angle);
 const viewer=norm(position.map(v=>-v)),facing=dot(front,viewer);
 return {right,up,normal:front,facing,frontFacingCamera:facing>0};
}
export function orbitDiagnostics(cards,seconds){const poses=cards.map(c=>sampleLandingPose(c,seconds)),normals=cards.map((c,i)=>landingAttitude(c,poses[i],seconds));
 const radial=poses.map(p=>len([p[0],p[1],p[2]-ORBIT_CENTER_Z]));
 return {count:cards.length,closest:Math.max(...poses.map(p=>p[2])),frontFacing:cards.length,
  visuallyFrontFacing:normals.filter(a=>a.frontFacingCamera).length,
  visuallyBackFacing:normals.filter(a=>!a.frontFacingCamera).length,edgeOn:normals.filter(a=>Math.abs(a.facing)<.24).length,
  reversed:cards.filter(c=>c.reversed).length,farCount:poses.filter(p=>p[2]<-22).length,
  radialRange:[Math.min(...radial),Math.max(...radial)]
 };
}
