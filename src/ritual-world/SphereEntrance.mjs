/**
 * Gate B -> C, a 78-object deck-to-sphere cinematic, not a page transition.
 * Same identity and card orientation throughout the 5.7-second camera entry.
 */
import {deckPose} from './ShuffleChoreography.mjs';
export const SPHERE_ENTRANCE_SECONDS=5.7;
const N=78,GOLDEN=Math.PI*(3-Math.sqrt(5)),clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,u)=>a+(b-a)*u;
const lerp=(a,b,u)=>a.map((x,i)=>mix(x,b[i],u));
const norm=a=>{const d=Math.hypot(...a)||1;return a.map(x=>x/d)};
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function basis(normal,right){
 const n=norm(normal),r=norm(lerp(right,n,-dot(right,n)));
 return {normal:n,right:r,up:norm(cross(n,r)),frontFacingCamera:n[2]>0};
}
function blend(a,b,u){
 return {position:lerp(a.position,b.position,u),
 attitude:basis(lerp(a.attitude.normal,b.attitude.normal,u),lerp(a.attitude.right,b.attitude.right,u)),
 scale:mix(a.scale,b.scale,u),visible:true};
}
export function sampleSphereEntrance(card,{age=0,worldTime=0}={}){
 const t=Math.max(0,Number(age)||0),k=card.orbitSlot;
 const from=deckPose(card,worldTime);
 const latitude=Math.asin(1-2*(k+.5)/N),longitude=k*GOLDEN+.13*Math.sin(k*1.83);
 const axis=[Math.cos(latitude)*Math.sin(longitude),Math.sin(latitude),Math.cos(latitude)*Math.cos(longitude)];
 const orientation=basis(axis.map(x=>-x),norm(cross([0,1,0],axis)));
 const opening=ease((t-.25)/1.7),flythrough=ease((t-2.0)/3.55);
 const radius=4.5+.7*Math.sin(k*.49)+1.6*flythrough;
 const centre=[0,.15,-16+11.1*flythrough];
 const target={position:centre.map((v,i)=>v+axis[i]*radius),
  attitude:orientation,scale:.98+.14*Math.sin(k*1.7),visible:true};
 const p=blend(from,target,opening);
 p.position[2]+=(.5+.5*Math.cos(longitude))*1.6*ease((t-4.35)/1.35);
 return p;
}
