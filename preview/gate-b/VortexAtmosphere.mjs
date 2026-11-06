/**
 * Gate B v5 procedural cosmic vacuum backdrop, subordinate to actual cards.
 * One seeded 512x512 texture at startup, no external image, no additional
 * GPU context, no per-frame Canvas painting. Matches the grey/green silvery
 * four-lane smokelike vortex in the user-provided reference more closely
 * than a flat purple circular-gradient disk.
 */
const saturate=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=saturate(x);return x*x*(3-2*x)};
function noiseHash(x,y,seed){
 let v=(Math.imul(x,374761393)+Math.imul(y,668265263)+(seed>>>0))|0;
 v=Math.imul(v^(v>>>13),1274126177);
 return ((v^(v>>>16))>>>0)/4294967295;
}
function noise(x,y,seed){
 const xi=Math.floor(x),yi=Math.floor(y),fx=ease(x-xi),fy=ease(y-yi);
 const a=noiseHash(xi,yi,seed),b=noiseHash(xi+1,yi,seed),
  c=noiseHash(xi,yi+1,seed),d=noiseHash(xi+1,yi+1,seed);
 return (a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy;
}
export function buildVortexTexture(canvas,seed=0,lowPower=false){
 const size=lowPower?352:512;
 canvas.width=size;canvas.height=size;
 const ctx=canvas.getContext('2d',{alpha:true});
 if(!ctx)throw Error('No Canvas2D context for lightweight vacuum atmosphere');
 const data=ctx.createImageData(size,size),values=data.data;
 const phase=(seed%1021)/1021*Math.PI*2;
 const tone=(seed%3);
 const rgb=tone===0?[177,181,168]:tone===1?[177,172,181]:[166,176,180];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=(x+.5-size/2)/(size*.48),dy=(y+.5-size/2)/(size*.48);
  const r=Math.hypot(dx,dy),theta=Math.atan2(dy,dx);
  const curl=noise(dx*9+21,dy*9+41,seed)*1.35+
   noise(dx*23+11,dy*23+37,seed^0x9e3779b9)*.33;
  const armPhase=4*theta-11.8*Math.log(r+.115)+curl+phase;
  // Smooth broad smoke arms plus brighter, thin inner filaments.
  const arm=.5+.5*Math.cos(armPhase);
  const core=Math.pow(Math.max(0,arm),2.7);
  const ribbons=Math.pow(Math.max(0,.5+.5*Math.cos(armPhase*1.45+1.2*curl)),8);
  const turbulence=.56+.55*noise(dx*15+43,dy*15+91,seed^0x7f4a7c15);
  const radial=ease((r-.095)/.14)*(1-ease((r-.73)/.35));
  const wisps=(.045+.72*core+.23*ribbons)*turbulence*radial;
  const alpha=saturate(wisps*.78);
  const pos=(y*size+x)*4;
  values[pos]=rgb[0];values[pos+1]=rgb[1];values[pos+2]=rgb[2];
  values[pos+3]=Math.round(alpha*255);
 }
 ctx.putImageData(data,0,0);
 // Delicate fine-grained elliptical filaments similar to those glimpsed in
 // the benchmark. They are part of the ONE static texture.
 ctx.save();ctx.translate(size/2,size/2);
 ctx.lineWidth=Math.max(.55,size/640);
 for(let arm=0;arm<4;arm++){
  for(let lane=0;lane<3;lane++){
   ctx.beginPath();
   for(let i=0;i<=130;i++){
    const r=.19+i/130*.77;
    const theta=phase+arm*Math.PI/2+2.98*Math.log(r+.115)+lane*.085;
    const rx=Math.cos(theta)*r*size*.47;
    const ry=Math.sin(theta)*r*size*.42;
    if(i===0)ctx.moveTo(rx,ry);else ctx.lineTo(rx,ry);
   }
   ctx.strokeStyle='rgba(211,212,206,'+(lane===1?.16:.08)+')';
   ctx.stroke();
  }
 }
 ctx.restore();
 return {width:size,height:size,arms:4,animatedPixelsPerFrame:0};
}
export function initVortexAtmosphere({mount,seed=0,reduceMotion=false}){
 if(!mount)throw Error('Vortex atmosphere requires a container');
 const canvas=document.createElement('canvas');
 canvas.className='vortex-smoke-texture';
 canvas.setAttribute('aria-hidden','true');
 const memory=typeof navigator!=='undefined'?navigator.deviceMemory:undefined;
 const lowPower=reduceMotion||window.matchMedia?.('(max-width: 650px)').matches||Boolean(memory&&memory<=4);
 const stats=buildVortexTexture(canvas,seed,lowPower);
 mount.appendChild(canvas);
 return {diagnostics:()=>({...stats,lowPower}),
  dispose(){canvas.remove()}};
}
