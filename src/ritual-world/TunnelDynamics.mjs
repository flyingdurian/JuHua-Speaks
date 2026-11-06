/**
 * Gate B v7 — ONE volumetric material field drives both card sheets and mist.
 * The apparent cosmic tunnel emerges from moving objects with true 3D depth,
 * not from a composited rotating decal. Coordinates are in world units;
 * origin is the existing Gate A perspective camera looking down -Z.
 * The transport is periodic and C-infinity continuous (no axial wrap jumps).
 */
const TAU=2*Math.PI;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function tunnelHash(i,s=0){
 let x=(Math.imul((i+1)>>>0,0x9e3779b9)^(s>>>0))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return (x>>>0)/4294967296;
}
export function sampleTunnelTrajectory(index,seed,t,{mote=false}={}){
 const k=index,rand=n=>tunnelHash(k+n,seed);
 const local=Math.max(0,t-1.10);
 // Accelerating transport through successive helical depth layers. This
 // object-space path is closed in Z: motes and cards can circulate without
 // a hidden teleport when passing the near-camera throat.
 const transport=.13*local+.065*local*local;
 const phase=(k+.5)*.6180339887498949+.027*(rand(133)-.5);
 const axial=TAU*(phase-.39*transport);
 const depth=5.0+37.0*(.5+.5*Math.cos(axial));
 const azimuth=TAU*(phase*3.10+.47*transport)+.22*Math.sin(axial*1.8+rand(47)*TAU);
 const radius=2.2+.13*depth+.55*Math.sin(axial*1.6+rand(57)*TAU);
 // Camera-relative bank: the twisted cylinder has an eccentric, drifting
 // centreline, unlike flat screen-space concentric rings.
 const bank=.055*Math.sin(local*1.18);
 const cx=-.65+bank*(depth-21)+.48*Math.sin(local*.91);
 const cy=.26*Math.cos(local*1.07)+.024*(depth-21);
 let x=cx+radius*(1+.17*Math.sin(axial+.5))*Math.cos(azimuth);
 let y=cy+radius*(.90+.12*Math.sin(axial*1.35))*Math.sin(azimuth);
 let z=-depth;
 if(!mote){
  // Rare natural near-camera encounters: continuous swells from the SAME
  // helical trajectory, not a keyframed teleport or a background sprite.
  const flyer=k%19===3||k%23===11;
  const center=3.55+.50*rand(211);
  const u=clamp((t-center+.43)/.86);
  const pulse=flyer?Math.pow(Math.sin(Math.PI*u),2):0;
  x=x*(1-.68*pulse)+pulse*1.45*Math.cos(azimuth);
  y=y*(1-.68*pulse)+pulse*1.30*Math.sin(azimuth);
  z=z*(1-pulse)-2.9*pulse;
 }
 return {position:[x,y,z],azimuth,axial,depth: -z,radius,transport};
}
