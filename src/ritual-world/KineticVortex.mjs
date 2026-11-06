/**
 * Gate B v6 — physical material-coordinate transport for the 78 existing sheets.
 * No duplicated props, camera motion, recycled particles or static spiral ring.
 * Angular velocity grows while an individual card travels from far field to lens.
 * Pure deterministic positions/orientations are sampled by both renderers.
 */
const TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const hash=(i,s=0)=>{
 let x=(Math.imul((i+1)>>>0,0x9e3779b9)^(s>>>0))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;
 x=Math.imul(x,0x846ca68b);x^=x>>>16;return(x>>>0)/4294967296;
};
const norm=v=>{const m=Math.hypot(...v)||1;return v.map(n=>n/m)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function facing(yaw,pitch,roll){
 const normal=norm([Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)]);
 const r=norm(cross([0,1,0],normal)),u=norm(cross(normal,r));
 const c=Math.cos(roll),s=Math.sin(roll);
 const right=norm(r.map((n,i)=>n*c+u[i]*s)),up=norm(u.map((n,i)=>n*c-r[i]*s));
 return {normal,right,up,frontFacingCamera:normal[2]>0};
}
function axialDepth(q){
 // Monotone C1 Hermite flight: outer field, sharply accelerating throat,
 // then a short near-lens passage. No axial snapshots or teleportation.
 const keys=[[0,42,-30],[.45,26,-53],[.70,10.4,-54],[.84,5.7,-14],[1,4.25,0]];
 for(let j=0;j<keys.length-1;j++){
  const [a,za,ma]=keys[j],[b,zb,mb]=keys[j+1];
  if(q>b&&j<keys.length-2)continue;
  const h=b-a,u=clamp((q-a)/h),u2=u*u,u3=u2*u;
  return (2*u3-3*u2+1)*za+(u3-2*u2+u)*h*ma+
   (-2*u3+3*u2)*zb+(u3-u2)*h*mb;
 }
 return 4.25;
}
/** One world-space pose, evaluated continuously at any time t in seconds. */
export function sampleKineticVortex(card,t){
 const k=card.orbitSlot,seed=card.visualSeed>>>0;
 const axialOffset=hash(k+67,seed)-.50;
 const q=clamp((t-1.0)/2.75+axialOffset,0,.987);
 const theta=k*2.399963229728653+.30*Math.sin(k*1.17)+
  1.3*(t-1.0)+2.9*q+15.6*q*q;
 const depth=axialDepth(q);
 // Irregular, morphing cross-section, different for each sheet; not 4
 // rigid rings, not a radius defined solely by an immutable orbit slot.
 const rho=.35+.30*hash(k+190,seed)+.095*Math.sin(theta*.71+k*.93);
 const radius=depth*rho,eccentricity=.88+.10*Math.sin(k*.68);
 let position=[
  radius*Math.cos(theta)+.17*Math.sin(t*3+k*.61),
  radius*eccentricity*Math.sin(theta)+.15*Math.sin(t*2.5+k),
  -depth+.38*Math.sin(theta*.72+k*.31)
 ];
 // Several near-lens passes occur ONLY in the final rush, as in the
 // benchmark. These are the original sheet meshes, never overlay sprites.
 const flyer=k%13===2||k%17===5;
 let near=0;
 if(flyer){
  const peak=2.92+.25*hash(k+216,seed),dt=(t-peak)/.205;
  near=Math.exp(-dt*dt);
  const pull=near*.93,bearing=theta+.4*Math.sin(k);
  position=[
   mix(position[0],Math.cos(bearing)*.88,pull),
   mix(position[1],Math.sin(bearing)*.87,pull),
   mix(position[2],-2.48-.45*hash(k+41,seed),pull)
  ];
 }
 const yaw=.61*Math.sin(theta+.2*k)+.17*Math.sin(t*3.1+k*.31)+
  (near>.14&&k%2===0?Math.PI*near:0);
 const pitch=.40*Math.sin(theta*.67+k*.29)+.22*Math.cos(t*2.7+k);
 const roll=k*.26+.68*theta+.32*Math.sin(t*3.3+k*.17);
 // Perspective supplies the actual scale. Do not make 20 giant cards
 // cover the center during the early vortex; reserve it for the final rush.
 const scale=.24+.32*(depth/42)+.10*hash(k+18,seed)+.91*near;
 return {position,attitude:facing(yaw,pitch,roll),scale,visible:true};
}
export function sampleVortexVelocity(card,t,dt=.025){
 const a=sampleKineticVortex(card,t-dt).position,b=sampleKineticVortex(card,t+dt).position;
 return a.map((n,i)=>(b[i]-n)/(2*dt));
}
