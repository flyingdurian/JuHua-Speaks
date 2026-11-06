/**
 * Gate B v7 — ONE volumetric material field drives both card sheets and mist.
 * The apparent cosmic tunnel emerges from moving objects with true 3D depth,
 * not from a composited rotating decal. Coordinates are in world units;
 * origin is the existing Gate A perspective camera looking down -Z.
 * The transport is periodic and C-infinity continuous (no axial wrap jumps).
 */
const TAU=2*Math.PI;
const smoother=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10)};
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
 // Four 3D spiral FILAMENTS with discrete sheets transported through them.
 // The previous quasi-random golden spiral still read as a scattered wreath.
 // Sheets now inhabit recognizable ordered ribbons; motes densely sample
 // those exact same ribbons. Slot is NOT a fixed Z plane: transport shifts Z.
 const lane=k%4,steps=mote?44:20;
 const step=Math.floor(k/4)%steps;
 const phase=(step+.5)/steps+.009*(rand(133)-.5);
 const rawAxial=TAU*(phase-.39*transport);
 // The active cyclone has a FAST near-camera throat and slow, populous far
 // layers: avoid sinusoid's dense near-depth dwell that created v7's wall.
 const axial=rawAxial+.82*Math.sin(rawAxial);
 const depth=7.6+34.0*(.5+.5*Math.cos(axial));
 // An explicit virtual dolly-in. Early cards are small BUT fill the same
 // projected tunnel; late sheets naturally grow as the observer approaches.
 const retreat=16*(1-smoother((t-1.10)/3.25));
 const apparentDepth=depth+retreat;
 const dolly=apparentDepth/depth;
 const azimuth=TAU*(phase*2.65+1.10*transport)+lane*(TAU/4)
  +.10*Math.sin(axial*1.8+rand(47)*TAU);
 const radius=3.25+.12*depth+.48*Math.sin(axial*1.6+rand(57)*TAU);
 // Camera-relative bank: the twisted cylinder has an eccentric, drifting
 // centreline, unlike flat screen-space concentric rings.
 const bank=.055*Math.sin(local*1.18);
 const cx=-.65+bank*(depth-21)+.48*Math.sin(local*.91);
 const cy=.26*Math.cos(local*1.07)+.024*(depth-21);
 let x=(cx+radius*(1+.12*Math.sin(axial+.5))*Math.cos(azimuth))*dolly;
 let y=(cy+radius*(.90+.08*Math.sin(axial*1.35))*Math.sin(azimuth))*dolly;
 let z=-apparentDepth;
 if(!mote){
  // Rare natural near-camera encounters: continuous swells from the SAME
  // helical trajectory, not a keyframed teleport or a background sprite.
  const flyer=k%23===11;
  const center=3.40+1.42*rand(211);
  const u=clamp((t-center+.35)/.70);
  const pulse=flyer?Math.pow(Math.sin(Math.PI*u),2):0;
  x=x*(1-.68*pulse)+pulse*1.45*Math.cos(azimuth);
  y=y*(1-.68*pulse)+pulse*1.30*Math.sin(azimuth);
  z=z*(1-pulse)-2.9*pulse;
 }
 return {position:[x,y,z],azimuth,axial,depth: -z,radius,transport};
}
