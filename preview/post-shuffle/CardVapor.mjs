/**
 * Two independent, animated, translucent curl-noise smoke fields for the
 * unrevealed celestial card backs. No sprite-sheet GIF, animated radial
 * gradient, or third-party dependency. Reuses one low-res noise buffer per
 * depth layer for all three physical cards to limit mobile GPU uploads.
 *
 * This is procedural noise advection, not a claimed full Navier-Stokes solver.
 */
const WIDTH=92,HEIGHT=160,STEP_MS=64;
const fract=n=>n-Math.floor(n);
const smooth=t=>t*t*(3-2*t);
const mix=(a,b,t)=>a+(b-a)*t;
function rand(x,y){
 const k=Math.imul(x,374761393)^Math.imul(y,668265263);
 let n=Math.imul(k^(k>>>13),1274126177);n^=n>>>16;
 return (n>>>0)/4294967295;
}
export function valueNoise2(x,y){
 const ix=Math.floor(x),iy=Math.floor(y),u=smooth(fract(x)),v=smooth(fract(y));
 return mix(mix(rand(ix,iy),rand(ix+1,iy),u),mix(rand(ix,iy+1),rand(ix+1,iy+1),u),v);
}
export function sampleVapor(u,v,time,layer=0){
 // Advect the coordinate frame in two different velocities. An evolving
 // nonuniform curl-like warp generates recognizable eddies, not scrolling
 // rectangular gradient bands.
 const t=Math.max(0,time),phase=layer*19.79;
 const xx=(u-.5)*3.3,yy=v*5.1;
 const warpA=valueNoise2(xx*.73+phase*.3+t*.12,yy*.67-t*.16)-.5;
 const warpB=valueNoise2(xx*.65-phase*.4-t*.13,yy*.79+t*.10)-.5;
 const swirl=Math.sin(yy*1.44+t*.52+warpB*4.6)*.43;
 const flowX=xx+warpA*1.36+swirl+Math.cos(yy*.82-t*.26)*.19;
 const flowY=yy+warpB*1.12-t*(layer===0?.37:.25);
 const broad=valueNoise2(flowX*.76+phase,flowY*.66);
 const ribbons=valueNoise2(flowX*1.94+phase*.7,flowY*1.65-t*.13);
 const wisps=valueNoise2(flowX*3.7+phase*.33,flowY*3.27+t*.07);
 const density=.52*broad+.36*ribbons+.12*wisps;
 // Smoke is gossamer, with a few identifiable brighter swirling ridges.
 const feather=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.47);
 const heightFade=.46+.54*Math.sin(Math.PI*(.08+v*.84));
 return Math.max(0,Math.min(1,(density-.275)*2.05*feather*heightFade));
}
function noisePlane(layer,time,canvas,ctx){
 const data=ctx.createImageData(WIDTH,HEIGHT),p=data.data;
 for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
  const u=(x+.5)/WIDTH,v=(y+.5)/HEIGHT;
  const d=sampleVapor(u,v,time,layer),i=(y*WIDTH+x)*4;
  p[i]=layer?216:198;p[i+1]=layer?219:207;p[i+2]=layer?225:219;
  p[i+3]=Math.round(Math.pow(d,.82)*232);
 }
 ctx.putImageData(data,0,0);
 return canvas;
}
export function createCardVapor({reduceMotion=false}={}){
 const layers=[0,1].map(i=>{
  const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;
  return {canvas,ctx:canvas.getContext('2d',{willReadFrequently:true}),targets:new Set(),layer:i};
 });
 let active=false,raf=0,last=0,frameCount=0;
 function draw(now){
  if(!active)return;
  raf=requestAnimationFrame(draw);
  if(now-last<STEP_MS)return;last=now;
  if(typeof document!=='undefined'&&document.hidden)return;
  const time=reduceMotion?2.75:now/1000;
  for(const data of layers){
   if(!data.ctx)continue;
   noisePlane(data.layer,time,data.canvas,data.ctx);
   for(const target of data.targets){
    if(!target.isConnected||target.closest('.ps-revealed'))continue;
    const ctx=target.getContext('2d');
    if(!ctx)continue;
    ctx.clearRect(0,0,target.width,target.height);
    ctx.drawImage(data.canvas,0,0,target.width,target.height);
   }
  }
  frameCount++;
  if(reduceMotion)stop();
 }
 function attach(back){
  if(!back)throw new Error('Vapor must attach to a physical Tarot reverse');
  const result=[];
  for(const data of layers){
   const target=document.createElement('canvas');
   target.className='ps-vapor-cloud ps-vapor-'+(data.layer?'near':'far');
   target.setAttribute('aria-hidden','true');
   target.width=256;target.height=448;
   back.append(target);data.targets.add(target);result.push(target);
  }
  return result;
 }
 function start(){
  if(active)return;active=true;raf=requestAnimationFrame(draw);
 }
 function stop(){active=false;if(raf)cancelAnimationFrame(raf);raf=0;}
 function dispose(){
  stop();
  for(const data of layers){data.targets.clear();data.canvas.width=1;data.canvas.height=1;}
 }
 return {attach,start,stop,dispose,get frames(){return frameCount}};
}
