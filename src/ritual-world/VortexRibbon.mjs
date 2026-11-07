/**
 * Gate B v8 | reference-directed 3D corkscrew choreography, Sequence 1 only.
 *
 * A moving camera dives through one dominant continuous sheet ribbon, with
 * smaller inner and edge streams. World-space cards are carried along the
 * ribbons through Z as they revolve; the entire tunnel banks from a circular
 * face-on helix into an almost edge-on vertical cyclone. A fixed spatial ring
 * cannot reproduce the reference's sweeping, layered silhouette.
 *
 * No card identity/draw logic or approved Stage 2 logic lives here.
 */
const TAU=2*Math.PI;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const softer=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
const lerp=(a,b,t)=>a+(b-a)*t;
const hash=(i,s=0)=>{
 let x=(Math.imul((i+1)>>>0,0x9e3779b9)^(s>>>0))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
};
// These are visual shot beats, not a fixed-duration benchmark contract.
// All camera movement is continuous and evaluated on the same world object.
// Recovery after rejected v11.3: one diagonal (~45-degree) material cyclone,
// held during the fast orbit rather than abruptly introducing camera bank late.
// Identical camera transform applies to card centres, card bases and advected mist.
const CAMERA=[
 {t:1.10,yaw:.20,roll:.765,pitch:.19,zoom:1.00,px:0,py:0,sx:1,sy:1,cardGain:1},
 {t:2.10,yaw:.25,roll:.805,pitch:.24,zoom:1.13,px:8,py:0,sx:1.06,sy:1.05,cardGain:1.04},
 {t:3.00,yaw:.29,roll:.785,pitch:.26,zoom:1.12,px:8,py:0,sx:.91,sy:1.16,cardGain:1.04},
 {t:3.75,yaw:.25,roll:.825,pitch:.28,zoom:1.09,px:5,py:0,sx:.90,sy:1.38,cardGain:1.00},
 {t:4.40,yaw:.21,roll:.785,pitch:.24,zoom:1.02,px:0,py:0,sx:.85,sy:1.28,cardGain:.97},
 {t:4.75,yaw:.18,roll:.725,pitch:.18,zoom:.99,px:0,py:0,sx:.82,sy:1.20,cardGain:.94},
 {t:5.45,yaw:.10,roll:0,pitch:0,zoom:1,px:0,py:0,sx:1,sy:1,cardGain:1},
];
function cameraValue(t,key){
 if(t<=CAMERA[0].t)return CAMERA[0][key];
 for(let i=0;i<CAMERA.length-1;i++){
  const a=CAMERA[i],b=CAMERA[i+1];
  if(t<=b.t)return lerp(a[key],b[key],softer((t-a.t)/(b.t-a.t)));
 }
 return CAMERA[CAMERA.length-1][key];
}
export function vortexCamera(t){
 return {yaw:cameraValue(t,'yaw'),roll:cameraValue(t,'roll'),
  pitch:cameraValue(t,'pitch'),zoom:cameraValue(t,'zoom'),
  px:cameraValue(t,'px'),py:cameraValue(t,'py'),
  sx:cameraValue(t,'sx'),sy:cameraValue(t,'sy'),cardGain:cameraValue(t,'cardGain')};
}
// The reference physically squeezes the wide spiral into a tall, narrow
// stream as the viewer dives into the helix; this is not a pixel-mask trick.
const FUNNEL=[
 {t:1.10,r:1.06},{t:2.10,r:1.12},{t:3.00,r:.93},
 {t:3.75,r:.75},{t:4.40,r:.62},{t:4.75,r:.51},{t:5.45,r:.20}
];
function funnelRadius(t){
 if(t<=FUNNEL[0].t)return FUNNEL[0].r;
 for(let i=0;i<FUNNEL.length-1;i++){
  const a=FUNNEL[i],b=FUNNEL[i+1];
  if(t<=b.t)return lerp(a.r,b.r,softer((t-a.t)/(b.t-a.t)));
 }
 return FUNNEL[FUNNEL.length-1].r;
}
export function vortexProgress(t){
 const u=clamp((t-1.10)/4.35);
 return {u,angular:.11*u+3.35*u*u+.78*u*u*u,
  axial:3.1*(.15*u+.85*u*u),
  collapse:softer((t-4.62)/.80)};
}
// Three genuinely nested, inclined orbital scales: not three decorative
// concentric 2D circles. Each layer has independent 3D depth and precession.
const LANES=Object.freeze([
 {offset:0,radius:9.25,depth:17.8,turns:3.05,count:40,tilt:.27},
 {offset:.24,radius:6.35,depth:22.2,turns:2.30,count:24,tilt:-.31},
 {offset:.61,radius:4.05,depth:29.0,turns:1.85,count:14,tilt:.44}
]);
const FOCAL=720/(2*Math.tan(58*Math.PI/360));
function sample(lane,q,t,seed=0,motionBias=1){
 const state=vortexProgress(t),g=LANES[lane],c=vortexCamera(t);
 // Cards advance down the length of the SAME spiral: not simply spinning in fixed slots.
 // The sin envelope preserves both open ends, so sheets do not teleport or bunch at the boundary.
 const advance=.11*softer((t-3.15)/1.25)*motionBias;
 const u=clamp(q-advance*Math.sin(Math.PI*clamp(q)));
 const motion=state.angular*motionBias*(lane===0?1:lane===1?-.81:1.18);
 const theta=TAU*(g.turns*u+g.offset+motion)+.095*Math.sin(TAU*u*1.9+lane*1.7);
 // Each card moves on a 3D spherical-orbital band. Moving longitude,
 // latitude and radial shell prevent evenly spaced clock-face cards. Three
 // different radii coexist simultaneously, with real near/far parallax.
 // Oscillating latitude makes each shell a rotating, three-dimensional
 // corkscrew band, breaking the old mathematically uniform wreath.
 const latitude=.36*Math.sin(TAU*(u*1.29+.19*motion)+lane*1.42)
   +g.tilt*.40*Math.sin(theta*.53+t*.64);
 const shell=g.radius*(1+.14*Math.sin(TAU*(u*.74+.18*motion)+lane))
    *funnelRadius(t)*(1-.58*state.collapse);
 const latCos=Math.cos(latitude),wave=Math.sin(theta+.38+lane*.49);
 const cx=.40*Math.sin(u*TAU*.73+state.angular);
 const cy=.27*Math.cos(u*TAU*.87+state.angular*.53)+.43*Math.sin(theta*.46+lane*.72);
 let x=cx+shell*latCos*Math.cos(theta);
 let y=cy+shell*(.91*latCos*Math.sin(theta)+.20*Math.sin(latitude));
 const axialCenter=g.depth-1.6*state.axial*motionBias;
 // Orbit phase also changes Z: sheets continuously pass from back to front
 // rather than rotating in a flat billboard wreath.
 let z=-Math.max(4.5,axialCenter-shell*(.98*latCos*wave+.14*Math.sin(latitude+theta*.63))
       -2.3*(u-.5));
 // Camera tilt is around the focal plane (z=-24). This turns a face-on
 // multi-loop tunnel into the reference's tall off-axis corkscrew in motion.
 const pivot=z+24,cyaw=Math.cos(c.yaw),syaw=Math.sin(c.yaw);
 const yawX=x*cyaw+pivot*syaw,yawZ=-x*syaw+pivot*cyaw;
 const cp=Math.cos(c.pitch),sp=Math.sin(c.pitch);
 const pitchY=y*cp-yawZ*sp,pitchZ=y*sp+yawZ*cp;
 const cr=Math.cos(c.roll),sr=Math.sin(c.roll);
 x=yawX*cr-pitchY*sr;
 y=yawX*sr+pitchY*cr;
 z=pitchZ-24;
 // Camera lens track: a real off-axis perspective transform. Position
 // offsets scale with depth and preserve all cards as world-space meshes.
 x=c.zoom*c.sx*x+c.px*(-z)/FOCAL;
 y=c.zoom*c.sy*y-c.py*(-z)/FOCAL;
 // Each orbit begins entering the neck at a slightly different material
 // phase. This creates a genuine transport funnel, not a simultaneous pile.
 // By the end of the beat every card has a narrow lateral footprint AND
 // nearly the same deck-depth plane, ready for the approved pocket assembly.
 const f=state.collapse;
 const neck=softer((t-4.61-.10*q)/.74);
 x*=1-.84*neck;y*=1-.84*neck;
 z=lerp(z,-16.2,.96*neck);
 return {position:[x,y,z],theta,depth:-z,lane,collapse:f,neck};
}
/**
 * Orient a local physical card basis with the SAME camera-bank rotation
 * applied to its centre in sample(). Translation, anamorphic framing and
 * projection do not rotate or distort the card's actual mesh.
 */
export function rotateVortexBasis(vector,t){
 const c=vortexCamera(t);
 let [x,y,z]=vector;
 const cy=Math.cos(c.yaw),sy=Math.sin(c.yaw);
 const yawX=x*cy+z*sy,yawZ=-x*sy+z*cy;
 const cp=Math.cos(c.pitch),sp=Math.sin(c.pitch);
 const pitchY=y*cp-yawZ*sp,pitchZ=y*sp+yawZ*cp;
 const cr=Math.cos(c.roll),sr=Math.sin(c.roll);
 return [yawX*cr-pitchY*sr,yawX*sr+pitchY*cr,pitchZ];
}
/** Shared smooth 3D ribbon used for both real cards and atmosphere. */
export function sampleVortexRibbon(lane,q,t,seed=0){return sample(lane,q,t,seed)}
export function sampleVortexCard(index,seed,t){
 const k=index%78;
 const lane=k<40?0:k<64?1:2;
 const offset=lane===0?0:lane===1?40:64;
 const n=LANES[lane].count;
 const jitter=.0055*(hash(index+100,seed)-.5);
 const q=clamp((k-offset+.5)/n+jitter);
 // Individual sheets acquire slightly different axial and tangential
 // velocities. This prevents the whole field from revolving as one rigid
 // ring while retaining coherent circulation through the same vortex.
 const motionBias=.88+.24*hash(k+431,seed);
 const result=sample(lane,q,t,seed,motionBias);
 // A handful of physical sheets whip past the lens during the terminal
 // vacuum surge. These are C1-smooth ballistic detours on the SAME cards,
 // reconnecting naturally to the 78-card compression before deck assembly.
 const flyby=k%13===3;
 // Three early cards cut through the developed vortex; the other three
 // follow during the collapse. Every flyby remains C1 smooth.
 const early=(k%2===1);
 const start=(early?3.72:4.25)+.15*hash(k+197,seed);
 const u=clamp((t-start)/(early?.75:.75));
 const gust=flyby?Math.pow(Math.sin(Math.PI*u),2):0;
 if(gust>0){
  const target=[-3.6+6.0*hash(k+43,seed),
                -3.0+5.0*hash(k+71,seed),
                (early?-6.6:-5.9)-.8*hash(k+17,seed)];
  result.position=result.position.map((x,i)=>lerp(x,target[i],gust*.98));
 }
 const p0=sample(lane,clamp(q-.001),t,seed,motionBias).position;
 const p1=sample(lane,clamp(q+.001),t,seed,motionBias).position;
 const tangent=p1.map((v,j)=>v-p0[j]);
 const l=Math.hypot(...tangent)||1;
 return {...result,q,tangent:tangent.map(v=>v/l),gust};
}
