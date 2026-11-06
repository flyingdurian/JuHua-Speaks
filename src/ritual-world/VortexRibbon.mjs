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
 {t:1.10,yaw:.10,roll:.00,pitch:.06,zoom:1.00,px:0,py:0,sx:1,sy:1,cardGain:1},
 {t:2.10,yaw:.16,roll:-.18,pitch:.18,zoom:1.24,px:22,py:5,sx:1.10,sy:1.08,cardGain:1.06},
 {t:3.00,yaw:.17,roll:-.32,pitch:.24,zoom:1.24,px:25,py:7,sx:1.10,sy:1.12,cardGain:1.08},
 {t:3.75,yaw:.22,roll:.10,pitch:.48,zoom:1.17,px:40,py:14,sx:1.10,sy:1.12,cardGain:1.02},
 {t:4.40,yaw:.28,roll:.15,pitch:.59,zoom:1.10,px:12,py:12,sx:1.08,sy:1.05,cardGain:1.00},
 {t:4.75,yaw:.26,roll:.20,pitch:.67,zoom:1.04,px:6,py:12,sx:1.05,sy:1.02,cardGain:.97},
 {t:5.45,yaw:.10,roll:0,pitch:0,zoom:1.00,px:0,py:0,sx:1,sy:1,cardGain:1},
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
 {t:1.10,r:1.06},{t:2.10,r:1.20},{t:3.00,r:1.12},
 {t:3.75,r:.93},{t:4.40,r:.78},{t:4.75,r:.69},{t:5.45,r:.21}
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
function sample(lane,q,t,seed=0,motionBias=1){
 const state=vortexProgress(t),g=LANES[lane],c=vortexCamera(t);
 // Cards advance down the length of the SAME spiral: not simply spinning in fixed slots.
 // The sin envelope preserves both open ends, so sheets do not teleport or bunch at the boundary.
 const advance=.11*softer((t-3.15)/1.25)*motionBias;
 const u=clamp(q-advance*Math.sin(Math.PI*clamp(q)));
 const motion=state.angular*motionBias*(lane===0?1:lane===1?-.81:1.18);
 const theta=TAU*(g.turns*u+g.offset+motion)+.095*Math.sin(TAU*u*1.9+lane*1.7);
 // Depth increases monotonically along each ribbon, establishing actual
 // concentric near-to-far layers rather than a fixed camera-facing wreath.
 const depth=13.5+33*u-2.5*state.axial*motionBias+(lane===1?1.5:0);
 const radius=(5.45+.065*depth+g.radius)*funnelRadius(t)*(1-.58*state.collapse);
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
 x=c.zoom*c.sx*x+c.px*(-z)/FOCAL;
 y=c.zoom*c.sy*y-c.py*(-z)/FOCAL;
 // Cards are drawn into a common throat BEFORE the 78-layer deck beat.
 const f=state.collapse;
 x*=1-.65*f;y*=1-.65*f;
 z=lerp(z,-16.2,f*.42);
 return {position:[x,y,z],theta,depth:-z,lane,collapse:f};
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
 const lane=k<52?0:k<70?1:2;
 const offset=lane===0?0:lane===1?52:70;
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
