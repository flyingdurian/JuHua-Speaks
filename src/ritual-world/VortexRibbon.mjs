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
const CAMERA=[
 {t:1.10,yaw:.10,roll:0,pitch:.05,zoom:1.0,px:0,py:0},
 {t:2.10,yaw:.15,roll:.05,pitch:.20,zoom:1.31,px:70,py:82},
 {t:3.00,yaw:.18,roll:.10,pitch:.42,zoom:1.18,px:66,py:29},
 {t:3.75,yaw:.22,roll:.11,pitch:1.06,zoom:1.09,px:50,py:52},
 {t:4.40,yaw:.27,roll:.08,pitch:1.20,zoom:1.07,px:20,py:45},
 {t:4.75,yaw:.20,roll:.04,pitch:1.26,zoom:.99,px:14,py:65},
 {t:5.45,yaw:.10,roll:0,pitch:0,zoom:1.00,px:0,py:0},
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
  px:cameraValue(t,'px'),py:cameraValue(t,'py')};
}
// The reference physically squeezes the wide spiral into a tall, narrow
// stream as the viewer dives into the helix; this is not a pixel-mask trick.
const FUNNEL=[
 {t:1.10,r:1.04},{t:2.10,r:1.29},{t:3.00,r:.92},
 {t:3.75,r:.54},{t:4.40,r:.40},{t:4.75,r:.36},{t:5.45,r:.21}
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
 return {u,angular:.14*u+2.35*u*u+.40*u*u*u,
  axial:3.1*(.15*u+.85*u*u),
  collapse:softer((t-4.52)/.93)};
}
const LANES=Object.freeze([
 {offset:0,radius:0,turns:3.32,count:52},
 {offset:.20,radius:-1.36,turns:2.82,count:18},
 {offset:.57,radius:.50,turns:2.10,count:8}
]);
const FOCAL=720/(2*Math.tan(58*Math.PI/360));
function sample(lane,q,t,seed=0){
 const u=clamp(q),state=vortexProgress(t),g=LANES[lane],c=vortexCamera(t);
 const motion=state.angular*(lane===0?1:lane===1?-.81:1.18);
 const theta=TAU*(g.turns*u+g.offset+motion)+.095*Math.sin(TAU*u*1.9+lane*1.7);
 // Depth increases monotonically along each ribbon, establishing actual
 // concentric near-to-far layers rather than a fixed camera-facing wreath.
 const depth=11.0+40*u-3.1*state.axial+(lane===1?1.5:0);
 const radius=(5.05+.050*depth+g.radius)*funnelRadius(t)*(1-.62*state.collapse);
 const cx=.48*Math.sin(1.3*u*TAU+state.angular*1.5);
 const cy=.32*Math.cos(1.1*u*TAU+state.angular*.8);
 let x=cx+radius*Math.cos(theta);
 let y=cy+.92*radius*Math.sin(theta);
 let z=-Math.max(4.5,depth);
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
 x=c.zoom*x+c.px*(-z)/FOCAL;
 y=c.zoom*y-c.py*(-z)/FOCAL;
 // Cards are drawn into a common throat BEFORE the 78-layer deck beat.
 const f=state.collapse;
 x*=1-.65*f;y*=1-.65*f;
 z=lerp(z,-16.2,f*.42);
 return {position:[x,y,z],theta,depth:-z,lane,collapse:f};
}
/** Shared smooth 3D ribbon used for both real cards and atmosphere. */
export function sampleVortexRibbon(lane,q,t,seed=0){return sample(lane,q,t,seed)}
export function sampleVortexCard(index,seed,t){
 const k=index%78;
 const lane=k<52?0:k<70?1:2;
 const offset=lane===0?0:lane===1?52:70;
 const n=LANES[lane].count;
 const jitter=.0055*(hash(index+100,seed)-.5);
 const q=clamp((k-offset+.5)/n+jitter);
 const result=sample(lane,q,t,seed);
 // A handful of physical sheets whip past the lens during the terminal
 // vacuum surge. These are C1-smooth ballistic detours on the SAME cards,
 // reconnecting naturally to the 78-card compression before deck assembly.
 const flyby=k%13===3;
 const start=4.03+.18*hash(k+197,seed);
 const u=clamp((t-start)/.99);
 const gust=flyby?Math.pow(Math.sin(Math.PI*u),2):0;
 if(gust>0){
  const target=[-4.8+6.0*hash(k+43,seed),
                -3.8+5.0*hash(k+71,seed),
                -5.9-.8*hash(k+17,seed)];
  result.position=result.position.map((x,i)=>lerp(x,target[i],gust*.98));
 }
 const p0=sample(lane,clamp(q-.001),t,seed).position;
 const p1=sample(lane,clamp(q+.001),t,seed).position;
 const tangent=p1.map((v,j)=>v-p0[j]);
 const l=Math.hypot(...tangent)||1;
 return {...result,q,tangent:tangent.map(v=>v/l)};
}
