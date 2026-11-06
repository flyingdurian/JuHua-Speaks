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
// Reference-anchored cinematography. Each entry is a *camera pose* matched
// to a semantic point of the owner-provided comparison (not wall-clock sync).
// Values are focal-plane zoom and pixel-equivalent lens shift on 860x720.
// An interpolated camera rail changes ALL materials coherently in 3D.
const SHOT_RAIL=Object.freeze([
 {t:1.10,zoom:1.00,px:0,py:0,zx:1,zy:1,dx:0,dy:0},
 {t:1.55,zoom:1.08,px:96,py:86,zx:1.03,zy:1.06,dx:100,dy:25},
 {t:2.10,zoom:1.36,px:231,py:139,zx:1.056,zy:1.081,dx:268,dy:69},
 {t:3.00,zoom:.86,px:230,py:22,zx:.751,zy:1.34,dx:56,dy:-89},
 {t:3.80,zoom:.54,px:32,py:-40,zx:.965,zy:1.889,dx:-7,dy:49},
 {t:4.42,zoom:.68,px:15,py:-14,zx:.72,zy:1.41,dx:-35,dy:18},
 {t:4.70,zoom:.76,px:11,py:-11,zx:.613,zy:1.196,dx:-49,dy:5},
 {t:5.45,zoom:1.00,px:0,py:0,zx:1,zy:1,dx:0,dy:0},
]);
function railValue(t,key){
 if(t<=SHOT_RAIL[0].t)return SHOT_RAIL[0][key];
 const len=SHOT_RAIL.length;
 if(t>=SHOT_RAIL[len-1].t)return SHOT_RAIL[len-1][key];
 let i=0;
 while(i<len-2&&t>SHOT_RAIL[i+1].t)i++;
 const a=SHOT_RAIL[i],b=SHOT_RAIL[i+1],p=SHOT_RAIL[Math.max(0,i-1)],n=SHOT_RAIL[Math.min(len-1,i+2)];
 const d=b.t-a.t,u=(t-a.t)/d,u2=u*u,u3=u2*u;
 const m0=(b[key]-p[key])/(b.t-p.t),m1=(n[key]-a[key])/(n.t-a.t);
 return (2*u3-3*u2+1)*a[key]+(u3-2*u2+u)*d*m0+
  (-2*u3+3*u2)*b[key]+(u3-u2)*d*m1;
}
export function sampleTunnelCameraRail(t){
 return {zoom:Math.max(.30,railValue(t,'zoom')),px:railValue(t,'px'),py:railValue(t,'py'),
  zx:Math.max(.35,railValue(t,'zx')),zy:Math.max(.6,railValue(t,'zy')),
  dx:railValue(t,'dx'),dy:railValue(t,'dy')};
}
export function sampleTunnelTrajectory(index,seed,t,{mote=false}={}){
 const k=index,rand=n=>tunnelHash(k+n,seed);
 const local=Math.max(0,t-1.10);
 // Accelerating transport through successive helical depth layers. This
 // object-space path is closed in Z: motes and cards can circulate without
 // a hidden teleport when passing the near-camera throat.
 const transport=.13*local+.065*local*local;
 // Three asymmetrical helical streams, not a symmetric fourfold wreath.
 // The major 48-card ribbon dominates the visual twister; the 22-card
 // countercurrent adds depth and the last eight make dramatic close passes.
 // Each ribbon is physically continuous through depth as time evolves.
 const base=k%78;
 const lane=base<48?0:base<70?1:2;
 const slot=lane===0?base:lane===1?base-48:base-70;
 const size=lane===0?48:lane===1?22:8;
 const phase=(slot+.5)/size+(mote?.021:.008)*(rand(133)-.5);
 const rawAxial=TAU*(phase-.39*transport);
 // The active cyclone has a FAST near-camera throat and slow, populous far
 // layers: avoid sinusoid's dense near-depth dwell that created v7's wall.
 const axial=rawAxial+.82*Math.sin(rawAxial);
 const depth=7.6+34.0*(.5+.5*Math.cos(axial));
 // An explicit virtual dolly-in. Early cards are small BUT fill the same
 // projected tunnel; late sheets naturally grow as the observer approaches.
 const retreat=16*(1-smoother((t-1.10)/3.25));
 // A reference-directed camera rail adds transient perspective depth while
 // preserving each card's true size and sightline; no material card scaling.
 const lensTrack=6.0*Math.exp(-Math.pow((t-3.10)/.80,2))
    +1.8*smoother((t-3.40)/1.20);
 const apparentDepth=depth+retreat+lensTrack;
 const dolly=apparentDepth/depth;
 const azimuth=TAU*(phase*(lane===0?2.80:lane===1?2.25:1.75)+1.78*transport+
   [0,.22,.57][lane])+.12*Math.sin(axial*1.8+rand(47)*TAU);
 const radius=3.05+.115*depth+[0,1.10,-.72][lane]+.47*Math.sin(axial*1.6+rand(57)*TAU);
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
 // Reference camera does not stare squarely down the tube. Banking its
 // viewing axis makes the same physical 3D helix foreshorten into sweeping,
 // eccentric arcs, with foreground cards crossing one side of the lens.
 // This is a reversible world-space camera transform, shared with mist.
 const tiltY=.55*Math.sin(.80*local+.35);
 const tiltX=.28*Math.cos(.72*local+.80);
 const oy=z+20,cosY=Math.cos(tiltY),sinY=Math.sin(tiltY);
 const bx=x*cosY+oy*sinY,bz=-x*sinY+oy*cosY;
 const cx2=Math.cos(tiltX),sx2=Math.sin(tiltX);
 const oldY=y;
 x=bx;y=oldY*cx2-bz*sx2;z=oldY*sx2+bz*cx2-20;
 // The tunnel tightens physically BEFORE the final stacking beat; the old
 // algorithm retained a wreath and then abruptly tweened 78 cards at once.
 const contraction=smoother((t-4.47)/.98);
 x*=1-.70*contraction;y*=1-.70*contraction;
 z=z*(1-.34*contraction)-16.2*(.34*contraction);
 const shot=sampleTunnelCameraRail(t);
 // Equivalent to smoothly shifting an off-axis physical lens: lateral
 // displacement scales with depth, preserving parallax and true Z spacing.
 const focal=720/(2*Math.tan(58*Math.PI/360));
 x=shot.zoom*x+shot.px*(-z)/focal;
 y=shot.zoom*y-shot.py*(-z)/focal;
 // World-space anisotropy follows the vacuum's rising vertical stretch,
 // while an additional coherent lens shift matches the owner's reference
 // silhouettes. These move card centres, not the actual card geometry.
 x=shot.zx*x+shot.dx*(-z)/focal;
 y=shot.zy*y-shot.dy*(-z)/focal;
 return {position:[x,y,z],azimuth,axial,depth:-z,radius,transport};
}
