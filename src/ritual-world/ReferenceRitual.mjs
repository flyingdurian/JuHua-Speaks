/**
 * Gate B v7 — reference-directed tunnel and hollow globe, authored from the actual 15.813s split screen.
 *
 * Card and smoke use one coherent volumetric tunnel field, a curved camera
 * centreline and depth transport. All 78 sheets remain real geometry.
 *
 * A complete 78-layer deck forms, then blooms into a largely hollow rotating
 * spherical shell with real faces, backs and edge silhouettes. Three physical 26-card decks finish with staggered
 * individual sheet transfers. Total 78 authentic identities unchanged.
 *
 * Pure sampled choreography; no timer, rendering, AI, card draw or allocation
 * beyond per-frame pose arrays. Gate A world/camera remain persistent.
 */
import {sampleLandingPose,landingAttitude} from './OrbitalField.mjs';
import {sampleVortexCard,vortexCamera,rotateVortexBasis} from './VortexRibbon.mjs';
import {cardRole,heroAccent} from './ShotDirector.mjs';

const N=78,TAU=2*Math.PI,GOLDEN=Math.PI*(3-Math.sqrt(5));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const smoother=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
const mix=(a,b,t)=>a+(b-a)*t;
const vmix=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const mag=a=>Math.hypot(...a);
const norm=a=>{const d=mag(a)||1;return a.map(v=>v/d)};
const cross=(a,b)=>[
 a[1]*b[2]-a[2]*b[1],
 a[2]*b[0]-a[0]*b[2],
 a[0]*b[1]-a[1]*b[0]
];
const hash=(i,s=0)=>{
 let x=(Math.imul((i+1)>>>0,0x9e3779b9)^(s>>>0))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;
 x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
};
export const RITUAL_DURATION=16.55;
export const RITUAL_BEATS=Object.freeze([
 Object.freeze({id:'approach',start:0,end:1.10}),
 Object.freeze({id:'vortex',start:1.10,end:5.45}),
 Object.freeze({id:'implosion',start:5.45,end:6.30}),
 Object.freeze({id:'suspension',start:6.30,end:7.10}),
 Object.freeze({id:'detonation',start:7.10,end:8.15}),
 Object.freeze({id:'globe',start:8.15,end:12.35}),
 Object.freeze({id:'dispersal',start:12.35,end:13.20}),
 Object.freeze({id:'three_piles',start:13.20,end:14.00}),
 Object.freeze({id:'pile_shuffle',start:14.00,end:15.30}),
 Object.freeze({id:'consolidation',start:15.30,end:RITUAL_DURATION})
]);

function orientedFrom(normal,rightHint=[1,0,0]){
 const n=norm(normal);
 let r=rightHint.map((v,i)=>v-dot(n,rightHint)*n[i]);
 if(mag(r)<.0001)r=cross([0,1,0],n);
 if(mag(r)<.0001)r=cross([1,0,0],n);
 r=norm(r);
 return {normal:n,right:r,up:norm(cross(n,r)),frontFacingCamera:n[2]>0};
}
function facing(yaw=0,pitch=0,roll=0){
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
  let o=cross(a,[0,1,0]);
  if(mag(o)<.01)o=cross(a,[1,0,0]);
  o=norm(o);
  return norm(a.map((v,i)=>v*Math.cos(t*Math.PI)+o[i]*Math.sin(t*Math.PI)));
 }
 const theta=Math.acos(d),ss=Math.sin(theta);
 return norm(a.map((v,i)=>v*Math.sin((1-t)*theta)/ss+b[i]*Math.sin(t*theta)/ss));
}
function pose(position,attitude,scale=1){return {position,attitude,scale,visible:true}}
function blend(a,b,t){
 const w=smoother(t);
 return pose(vmix(a.position,b.position,w),
  orientedFrom(slerp(a.attitude.normal,b.attitude.normal,w),vmix(a.attitude.right,b.attitude.right,w)),
  mix(a.scale,b.scale,w));
}
function currentLanding(card,time,entranceMode){
 const position=sampleLandingPose(card,time,entranceMode);
 return pose(position,landingAttitude(card,position,time),1);
}
// V8: 78 real Tarot sheets are threaded along a continuous 3D spiral,
// not randomly distributed around a centred ring or shallow swarm.
// Banked perspective moves from the face of the ribbon toward its sweeping
// edge, so near and far cards exhibit natural physical parallax.
function suctionPose(card,t){
 const k=card.orbitSlot,seed=card.visualSeed>>>0;
 const rnd=n=>hash(k+n,seed);
 const v=sampleVortexCard(k,seed,t);
 const theta=v.theta,stream=v.lane;
 const role=cardRole(k),illustrated=role==='hero'||(role==='support'&&k%3===1);
 // Coherent card roll aligns long edges to the curving ribbon. Selected
 // sheets reveal real historic fronts; most show their engraved dark backs.
 const yaw=(illustrated?Math.PI:0)+.23*Math.sin(theta*.75+k*.17)
   +.20*Math.sin(t*2.4+k*.31);
 const pitch=.29*Math.sin(theta*.52+k*.47)+.10*Math.sin(t*3+k*.23);
 // IMPORTANT: both the position AND the card's genuine 3D orientation
 // must share the same camera bank; otherwise the cards detach visually
 // from the twister and appear to float through a separately moving image.
 const localRoll=theta+.20*Math.sin(k*.73)+[0,.16,-.12][stream];
 const localAtt=facing(yaw,pitch,localRoll);
 const sceneNormal=rotateVortexBasis(localAtt.normal,t);
 const sceneRight=rotateVortexBasis(localAtt.right,t);
 let attitude=orientedFrom(sceneNormal,sceneRight);
 // During actual near-lens flights, face the viewer just enough to reveal
 // the authentic RWS illustration while preserving the underlying tumble.
 if(v.gust>0&&illustrated){
  attitude=orientedFrom(slerp(attitude.normal,[0,0,1],v.gust*.66),attitude.right);
 }
 // While cards thread through the real 3D throat, their orientation settles
 // progressively toward the one-deck stacking basis. Nothing teleports or
 // mutates a logical card; approved pocket/deck poses remain unchanged.
 const align=smoother((v.neck-.38)/.62)*.90;
 if(align>.001){
  const target=facing(1.11,-.09,0);
  attitude=orientedFrom(
   slerp(attitude.normal,target.normal,align),
   vmix(attitude.right,target.right,align)
  );
 }
 // The actual reference grows dense as sheets rush toward the viewer:
 // distant backs remain small, then their projected area accelerates sharply
 // during the steeply banked terminal corkscrew. The illustrated close
 // passes retain their own independently authored near-lens scale.
 // Preserve contrast between a handful of big hero fronts and fine
 // background blue backs; a uniform growth ramp previously crowded the eye.
 const backGain=1+.42*smoother((t-3.05)/.69)
   +.08*smoother((t-4.23)/.50);
 const visualFocus=heroAccent(k,t);
 const scale=((illustrated?.69:(.30+.10*rnd(39))*backGain)
   +.025*Math.sin(t*1.35+k*.24))*vortexCamera(t).cardGain
   *(1+.18*visualFocus);
 return pose(v.position,attitude,scale);
}
function pocketPose(card,t){
 const k=card.orbitSlot,normal=facing(1.11+.05*Math.sin(t*.32),-.09,.018*Math.sin(t*.5));
 const layer=(k-38.5)*.0145;
 return pose([
  normal.normal[0]*layer,
  -.10+normal.normal[1]*layer,
  -16.2+normal.normal[2]*layer
 ],normal,1.05);
}
function implosionPose(card,t){
 const delay=(card.orbitSlot%6)*.017;
 const p=clamp((t-5.45-delay)/(.85-delay));
 const a=suctionPose(card,t),b=pocketPose(card,t);
 const result=blend(a,b,p);
 const swirl=.42*Math.sin(Math.PI*ease(p))*(1-p);
 const phi=card.orbitSlot*GOLDEN+8.6*t;
 result.position[0]+=swirl*Math.cos(phi);
 result.position[1]+=swirl*Math.sin(phi);
 return result;
}
// V7: a recognizable, mostly hollow and steadily rotating spherical
// silhouette, not a bag of cards. Fibonacci placement distributes the 78
// persistent sheets evenly over a shell; geometry, face orientation and
// perspective all come from the same rotating 3D positions.
function chaoticGlobePose(card,t){
 const k=card.orbitSlot,seed=card.visualSeed>>>0;
 const rnd=n=>hash(k+n,seed);
 const latitude=1-2*(k+.5)/N;
 const ring=Math.sqrt(Math.max(0,1-latitude*latitude));
 const phi=k*GOLDEN+.23*(rnd(14)-.5);
 const time=t-7.10;
 let p=[ring*Math.cos(phi),latitude,ring*Math.sin(phi)];
 // Whole globe revolves coherently on a slowly banked axis; individual
 // sheets also tumble relative to their local tangent planes.
 const spin=time*1.32,cs=Math.cos(spin),ss=Math.sin(spin);
 const x=p[0]*cs+p[2]*ss,zz=-p[0]*ss+p[2]*cs;
 const bank=.20+.13*Math.sin(time*.67);
 const cb=Math.cos(bank),sb=Math.sin(bank);
 const y=p[1]*cb-zz*sb,z=p[1]*sb+zz*cb;
 const R=(k<66?5.70:4.62)+.36*Math.sin(k*.74+time*1.5);
 const pos=[R*x+.10*Math.sin(time*1.1+k*.7),
    R*y+.12*Math.sin(time*.9+k*.61),
    -13.75+R*z];
 // A sheet approximately faces radially out from the globe. Near hemisphere
 // therefore reveals historical fronts, rear hemisphere shows engraved backs.
 // Limited tangential rock preserves edge silhouettes without random flipping.
 const wobble=.16*Math.sin(time*2.8+k*.43);
 let normal=norm([x+.13*Math.sin(time*2.2+k),
                    y+.10*Math.sin(time*1.8+k*.63),
                    z+wobble]);
 // The back-facing sheets form the dark inner scaffold seen in ChatARot.
 if(k%8===0)normal=norm([normal[0],normal[1],-Math.abs(normal[2])]);
 const roll=.82*Math.sin(time*2.3+k*.53)+.28*Math.cos(k*.37);
 const attitude=orientedFrom(normal,[Math.cos(roll),Math.sin(roll),.06]);
 const scale=.76+.13*rnd(37)+(k<66?0:-.05);
 return pose(pos,attitude,scale);
}
// The canonical, pre-camera globe is exposed for physical-shell integrity
// regression checks. The director rail only changes how it is photographed.
export function sampleReferenceGlobeCanonical(card,t){return chaoticGlobePose(card,t)}
// Director's coherent globe camera rail: a restrained first bloom, then a
// denser near hemisphere, then a more open rotating shell. Matched against
// actual 860x720 reference frames rather than a 10.8-second stopwatch.
const GLOBE_RAIL=Object.freeze([
 {t:7.10,xs:1,ys:1,px:0,py:0,cardScale:1},
 {t:7.50,xs:1.33,ys:1.26,px:75,py:-2,cardScale:.63},
 {t:8.25,xs:1.24,ys:1.22,px:56,py:14,cardScale:.90},
 {t:9.20,xs:1.12,ys:1.17,px:32,py:33,cardScale:1.23},
 {t:10.70,xs:1.06,ys:.94,px:27,py:35,cardScale:.97},
 {t:12.35,xs:1,ys:1,px:0,py:0,cardScale:1}
]);
function globeDirection(t,key){
 if(t<=GLOBE_RAIL[0].t)return GLOBE_RAIL[0][key];
 const n=GLOBE_RAIL.length;
 if(t>=GLOBE_RAIL[n-1].t)return GLOBE_RAIL[n-1][key];
 let i=0;while(i<n-2&&t>GLOBE_RAIL[i+1].t)i++;
 const a=GLOBE_RAIL[i],b=GLOBE_RAIL[i+1];
 return mix(a[key],b[key],smoother((t-a.t)/(b.t-a.t)));
}
function directGlobe(p,t){
 const f=720/(2*Math.tan(58*Math.PI/360));
 const depth=Math.max(2,-p.position[2]);
 const xs=globeDirection(t,'xs'),ys=globeDirection(t,'ys');
 const px=globeDirection(t,'px'),py=globeDirection(t,'py');
 return pose([
  p.position[0]*xs+px*depth/f,
  p.position[1]*ys-py*depth/f,
  p.position[2]
 ],p.attitude,p.scale*globeDirection(t,'cardScale'));
}
function detonationPose(card,t){
 const k=card.orbitSlot,seed=card.visualSeed>>>0;
 // Reference begins with a few substantial flying sheets. The rest follow
 // in overlapping waves; 78 cards must NOT appear fully expanded at once.
 const firstWave=k%7===0;
 const delay=firstWave?0:(k%13)*.032+.025*hash(k+29,seed);
 // A dozen visually prominent sheets establish the outer globe immediately;
 // the remaining 66 cards follow later, keeping the bloom airy rather than
 // filling the whole screen with stacked dark backs at once.
 const u=clamp((t-7.10-delay)/(firstWave?.34:1.05-delay));
 const p=Math.pow(u,firstWave?.46:.72);
 const start=pocketPose(card,t),end=chaoticGlobePose(card,t);
 const result=blend(start,end,p);
 const arc=.48*Math.sin(Math.PI*p);
 const theta=card.orbitSlot*GOLDEN+t*4.6;
 result.position[0]+=arc*Math.cos(theta);
 result.position[1]+=arc*Math.sin(theta);
 return result;
}
function subdeckPose(card,t){
 const k=card.orbitSlot,g=k%3,slot=Math.floor(k/3);
 const centerX=[-3.65,0,3.65][g],centerZ=[-14.2,-14.0,-14.5][g];
 const orientation=facing(.49+(g-1)*.10,-.10,.026*(g-1));
 const layer=(slot-12.5)*.0145;
 return pose([
  centerX+orientation.normal[0]*layer,
  -.08+orientation.normal[1]*layer,
  centerZ+orientation.normal[2]*layer
 ],orientation,1.04);
}
function splitPose(card,t){
 const delay=(card.orbitSlot%7)*.012;
 const p=clamp((t-12.35-delay)/(.85-delay));
 const from=chaoticGlobePose(card,t),to=subdeckPose(card,t);
 const result=blend(from,to,p);
 result.position[1]+=.36*Math.sin(Math.PI*ease(p));
 return result;
}
function fannedDeckPose(card,t){
 const k=card.orbitSlot,ang=k*GOLDEN;
 const orientation=facing(.98+.02*Math.sin(t*.3),-.11,.012*Math.cos(t*.8));
 const layer=(k-38.5)*.0158;
 return pose([
  orientation.normal[0]*layer+.054*Math.sin(ang),
  -.08+orientation.normal[1]*layer+.034*Math.cos(ang),
  -16.25+orientation.normal[2]*layer+.063*Math.cos(ang)
 ],orientation,1.06);
}
function transferPose(card,t){
 const k=card.orbitSlot,g=k%3,slot=Math.floor(k/3),from=subdeckPose(card,t);
 const to=fannedDeckPose(card,t);
 const delay=(g===1?0:.020)+slot/25*.64+(g===2?.035:0);
 const dur=g===1?.42:.40;
 const p=clamp((t-14.00-delay)/dur);
 const result=blend(from,to,p);
 const arch=Math.sin(Math.PI*ease(p));
 result.position[1]+=arch*(g===1?.10:.55);
 result.position[2]-=arch*(g===1?.09:.30);
 return result;
}
function settlePose(card,t,deckPose,worldTime){
 return blend(fannedDeckPose(card,t),deckPose(card,worldTime),(t-15.30)/(RITUAL_DURATION-15.30));
}
export function sampleReferenceRitual(card,{age=0,landingAt=0,worldTime=0,entranceMode='inside-out',deckPose}={}){
 if(typeof deckPose!=='function')throw Error('Reference ritual requires a physical canonical deckPose');
 const t=Math.max(0,Number(age)||0);
 if(t<1.10)return blend(currentLanding(card,landingAt,entranceMode),suctionPose(card,t),t/1.10);
 if(t<5.45)return suctionPose(card,t);
 if(t<6.30)return implosionPose(card,t);
 if(t<7.10)return pocketPose(card,t);
 if(t<8.15)return directGlobe(detonationPose(card,t),t);
 if(t<12.35)return directGlobe(chaoticGlobePose(card,t),t);
 if(t<13.20)return splitPose(card,t);
 if(t<14.00)return subdeckPose(card,t);
 if(t<15.30)return transferPose(card,t);
 if(t<RITUAL_DURATION)return settlePose(card,t,deckPose,worldTime);
 return deckPose(card,worldTime);
}
export function referenceBeat(age){
 for(const b of RITUAL_BEATS)if(age<b.end)return b.id;
 return 'deck_ready';
}
export function referenceDiagnostics(cards,{age,landingAt=0,worldTime=0,entranceMode='inside-out',deckPose}={}){
 const poses=cards.map(card=>sampleReferenceRitual(card,{age,landingAt,worldTime,entranceMode,deckPose}));
 const p=poses.map(x=>x.position),z=p.map(x=>x[2]),x=p.map(x=>x[0]),y=p.map(x=>x[1]);
 return {beat:referenceBeat(age),count:poses.length,fronts:poses.filter(x=>x.attitude.normal[2]>0).length,
  worldDepth:Math.max(...z)-Math.min(...z),width:Math.max(...x)-Math.min(...x),height:Math.max(...y)-Math.min(...y)};
}
