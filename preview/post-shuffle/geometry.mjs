/** Post-shuffle sphere: deterministic card identities + continuous camera flight.
 * Times measured from clicking FINISH SHUFFLING, in seconds.
 */
import {organicSheetOffset} from '../../src/ritual-world/OrganicDeck.mjs';
export const CARD_COUNT=78;
/** One projection contract shared by the GPU and DOM hit-test camera. */
export const CAMERA_VERTICAL_FOV_DEG=85;
export const CAMERA_NEAR=.07;
export const CAMERA_CLIP_NEAR=.075;
export function perspectiveFocal(fovDegrees=CAMERA_VERTICAL_FOV_DEG){
 if(!Number.isFinite(fovDegrees)||fovDegrees<=0||fovDegrees>=180)throw new RangeError('Invalid vertical camera field of view');
 // The perspective matrix uses 1/tan(full-FOV/2): the old renderer divided by two twice.
 return 1/Math.tan(fovDegrees*Math.PI/360);
}
/** Clip each physical card quad before projection, preventing entire sheets
 * popping out when the entering camera crosses a card's near plane.
 * UVs follow the clipped edge; WebGL then interpolates them perspectively. */
export function clipCardNearPlane(corners,cameraZ,near=CAMERA_CLIP_NEAR){
 if(!Array.isArray(corners)||corners.length!==4||!Number.isFinite(cameraZ)||!Number.isFinite(near)||near<=0)
  throw new RangeError('Expected four card corners and a positive camera near distance');
 const uv=[[0,0],[1,0],[1,1],[0,1]];
 const result=[];
 let previous={position:corners[3],uv:uv[3]};
 for(let i=0;i<4;i++){
  const current={position:corners[i],uv:uv[i]};
  const prevDepth=cameraZ-previous.position[2],depth=cameraZ-current.position[2];
  const prevInside=prevDepth>=near,inside=depth>=near;
  if(prevInside!==inside){
   const fraction=(near-prevDepth)/(depth-prevDepth);
   result.push({position:previous.position.map((v,j)=>v+(current.position[j]-v)*fraction),
    uv:previous.uv.map((v,j)=>v+(current.uv[j]-v)*fraction)});
  }
  if(inside)result.push(current);
  previous=current;
 }
 return result;
}

export const BEATS=Object.freeze({launch:[0,1.2],scatter:[1.2,2.8],orbit:[2.8,4.3],camera:[4.3,6.9],interactive:6.9});
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const smooth=n=>{const x=clamp(n);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
const fract=n=>n-Math.floor(n);
export const hash=n=>fract(Math.sin(n*127.1+23.17)*43758.5453);
export const normalize3=v=>{const length=Math.hypot(...v)||1;return v.map(x=>x/length)};
export function sphereLayout(count=78){
 if(count!==CARD_COUNT)throw new Error('78 unique tarot cards are mandatory');
 return Array.from({length:count},(_,i)=>{
  const row=Math.floor(i/13),col=i%13;
  const lat=(-66+row*26.4+(hash(i+21)-.5)*6)*Math.PI/180;
  const lon=(col+(row%2)*.5+(hash(i+111)-.5)*.34)*Math.PI*2/13;
  const radius=5.75+(hash(i+303)-.5)*.43;
  // During the camera pass the original 3D shell resolves into a denser
  // inward-looking celestial panorama. The same 78 physical identities move
  // continuously, with enough cards at visible latitudes to match reference.
  const arc=4.05,centerLongitude=Math.PI-orbitAngle(BEATS.interactive);
  const inLat=(-38+row*15.2+(hash(i+89)-.5)*4.2)*Math.PI/180;
  const inLon=centerLongitude+((col+.5+(row%2)*.4)/13-.5)*arc+(hash(i+111)-.5)*.07;
  const insideDirection=[Math.cos(inLat)*Math.sin(inLon),Math.sin(inLat),Math.cos(inLat)*Math.cos(inLon)];
  return {i,row,col,radius,roll:(hash(i+404)-.5)*.28,
   direction:[Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon)],
   insideDirection};
 });
}
export function cameraDistance(time){
 // Deck first drops AWAY into deep space. Only after it is very small do
 // all 78 sheets scatter toward the viewer as the camera crosses the shell.
 if(time<1.2)return mix(9.5,12.6,smooth(time/1.2));
 // No 2.9s idle plateau: physical sphere approaches every frame from
 // first dispersion, with strictly positive speed through entry.
 const u=clamp((time-1.2)/5.7);
 return 12.6*(1-(.29*u+.71*smooth(u)));
}
export function orbitAngle(time){
 const t=Math.max(0,time);if(t<1.2)return t*.4;
 if(t<=4.1)return .48+4.7*(t-1.2);
 const fade=Math.min(t-4.1,2.8);
 const angle=.48+4.7*2.9+4.7*fade+(0.065-4.7)*(fade*fade)/(2*2.8);
 return angle+Math.max(0,t-6.9)*.065;
}
/**
 * Tangential inertial rotation during the exterior sequence. Two secondary
 * axes evolve continuously and decay gently into a comfortable inner orbit.
 * Returned angles are used for BOTH card position and normals.
 */
export function gyroAttitude(time){
 const t=Math.max(0,time),fade=1-smooth((t-5.8)/1.6);
 return {
  pitch:(.13*Math.sin(t*1.39)+.11*Math.sin(t*.57+.4))*fade,
  roll:(.17*Math.sin(t*.94+.7)-.045*Math.cos(t*1.62))*fade
 };
}
export function assemblyProgress(time){return smooth((time-1.05)/2.05);}
export function cardWorld(point,time,selected=false){
 const t=Math.max(0,time),s=assemblyProgress(t);
 const inside=smooth((t-4.5)/2.15);
 const d=normalize3(point.direction.map((v,j)=>mix(v,point.insideDirection?.[j]??v,inside)));
 const centerZ=t<.75?mix(.25,-.75,smooth(t/.75)):-.75;
 const o=organicSheetOffset(point.i);
 const n=[-.70,-.12,-.69],r=[-.70,0,.70],u=[-.085,.99,-.084];
 const stack=[
   n[0]*o.depth+r[0]*o.x+u[0]*o.y,
   -.20+n[1]*o.depth+r[1]*o.x+u[1]*o.y,
   centerZ+n[2]*o.depth+r[2]*o.x+u[2]*o.y
 ];
 // A staggered unwinding wave throws individual physical sheets outwards
 // instead of an instantaneous sphere pop or a pre-scattered barcode deck.
 const wave=Math.sin(s*Math.PI)*(.22+.12*Math.sin(point.i*.33));
 const extent=point.radius*(selected?.955:1);
 return [
  mix(stack[0],d[0]*extent,s)+wave*Math.sin(point.i*.73+t*3.5),
  mix(stack[1],d[1]*extent,s)+wave*Math.cos(point.i*.91+t*3),
  mix(stack[2],d[2]*extent,s)
 ];
}
export function selectCard(choices,deck,id,orientation='upright'){
 if(!Array.isArray(deck)||deck.length!==78||new Set(deck).size!==78)throw Error('Requires one unique 78-card deck');
 if(!deck.includes(id))throw Error('Unknown card');
 if(!['upright','reversed'].includes(orientation))throw Error('Unknown orientation');
 if(choices.some(c=>c.id===id))return choices.filter(c=>c.id!==id);
 if(choices.length===3)return choices;
 return [...choices,{id,orientation}];
}
export function getStage(time,selectedCount){return time<1.05?'launch':time<3.1?'distribute':time<6.9?'enter':selectedCount>0?'select':'inside'};
