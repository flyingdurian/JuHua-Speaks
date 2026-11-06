/**
 * Gate A v7 celestial atmosphere: black space, actual star depth, procedural
 * smoky clouds and soft lower-edge light. All textures are seeded per visit
 * and repainted only on resize. No continually scheduled JS particle loop.
 */
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
export const STAR_COUNTS=Object.freeze({distant:950,near:130});
export const NEBULA_SIZE=Object.freeze([320,190]);
export const ATMOSPHERE_PALETTES=Object.freeze([
 Object.freeze([177,170,184]),
 Object.freeze([159,173,188]),
 Object.freeze([183,167,160]),
 Object.freeze([160,181,181]),
 Object.freeze([187,179,188]),
 Object.freeze([162,158,187])
]);
function rngFromSeed(seed){
 let n=seed>>>0;return ()=>{
  n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;
 };
}
function hash(x,y,seed){
 let n=(Math.imul(x,374761393)+Math.imul(y,668265263)+seed)>>>0;
 n=Math.imul(n^n>>>13,1274126177);n^=n>>>16;return (n>>>0)/4294967295;
}
function valueNoise(x,y,seed){
 const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,tx=smooth(fx),ty=smooth(fy);
 const a=lerp(hash(xi,yi,seed),hash(xi+1,yi,seed),tx);
 const b=lerp(hash(xi,yi+1,seed),hash(xi+1,yi+1,seed),tx);
 return lerp(a,b,ty);
}
function turbulence(x,y,seed){
 let value=0,amplitude=.53,frequency=1,sum=0;
 for(let i=0;i<4;i++){
  value+=valueNoise(x*frequency,y*frequency,seed+i*14623)*amplitude;
  sum+=amplitude;frequency*=2.03;amplitude*=.52;
 }
 return value/sum;
}
function gaussian(x,y,cx,cy,rx,ry){
 const dx=(x-cx)/rx,dy=(y-cy)/ry;
 return Math.exp(-(dx*dx+dy*dy)*1.2);
}
function drawNebula(canvas,seed,palette,layerIndex,lowPower){
 const W=lowPower?240:NEBULA_SIZE[0],H=lowPower?144:NEBULA_SIZE[1];
 canvas.width=W;canvas.height=H;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const img=ctx.createImageData(W,H),data=img.data;
 const r=rngFromSeed(seed+layerIndex*701),offsetX=r()*9,offsetY=r()*9;
 const shift=(r()-.5)*.14;
 const centerX=layerIndex===0?.43+shift:.22+shift;
 const centerY=layerIndex===0?.94:1.02;
 for(let y=0;y<H;y++){
  const ny=y/(H-1);
  for(let x=0;x<W;x++){
   const nx=x/(W-1);
   // Turbulent holes and wispy edges rather than a flat colored gradient.
   const warp=valueNoise(nx*3.4+offsetX,ny*3.1+offsetY,seed+13)-.5;
   const X=nx+warp*.115;
   const primary=gaussian(X,ny,centerX,centerY,layerIndex===0?.40:.27,layerIndex===0?.66:.54);
   const secondary=gaussian(X,ny,layerIndex===0?.78:.55,layerIndex===0?.83:.73,.23,.40);
   const mask=clamp(primary*.83+secondary*.35);
   const turbulent=turbulence(X*5.3+offsetX,ny*4.7+offsetY,seed+layerIndex*23456);
   const finer=turbulence(X*12+offsetY,ny*11+offsetX,seed+1001);
   const density=clamp((turbulent*.84+finer*.16-.37)*3.0);
   const alpha=smooth(density)*mask*clamp(.80+.32*finer)*(layerIndex===0?.62:.47);
   const i=(y*W+x)*4;
   data[i]=clamp(palette[0]+(finer-.5)*38,0,255);
   data[i+1]=clamp(palette[1]+(finer-.5)*36,0,255);
   data[i+2]=clamp(palette[2]+(finer-.5)*30,0,255);
   data[i+3]=Math.round(clamp(alpha)*255);
  }
 }
 ctx.putImageData(img,0,0);
}
function starLayer(canvas,seed,count,foreground,lowPower){
 const rect=canvas.parentElement?.getBoundingClientRect()||{width:window.innerWidth,height:window.innerHeight};
 const dpr=Math.min(lowPower?1:1.25,window.devicePixelRatio||1);
 const W=Math.max(2,Math.round(rect.width*dpr)),H=Math.max(2,Math.round(rect.height*dpr));
 canvas.width=W;canvas.height=H;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 ctx.clearRect(0,0,W,H);
 if(!foreground){ctx.fillStyle='#010103';ctx.fillRect(0,0,W,H)}
 const random=rngFromSeed(seed);
 for(let i=0;i<count;i++){
  const x=random()*W,y=random()*H,v=random();
  const radius=foreground ? .40+v*.58 : .22+v*.70;
  let alpha=foreground ? .25+v*.63 : .18+v*.60;
  if(v>.98)alpha=.85;
  const tint=random();
  ctx.fillStyle=tint>.87?'rgba(252,227,192,'+alpha+')':tint>.37?'rgba(219,230,248,'+alpha+')':'rgba(190,205,230,'+alpha+')';
  ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
  if((foreground&&v>.91)||(!foreground&&v>.994)){
   const halo=ctx.createRadialGradient(x,y,0,x,y,7+v*6);
   halo.addColorStop(0,'rgba(221,225,248,.23)');
   halo.addColorStop(.23,'rgba(209,213,236,.065)');
   halo.addColorStop(1,'rgba(209,213,236,0)');
   ctx.fillStyle=halo;ctx.fillRect(x-14,y-14,28,28);
  }
 }
}
export function initCelestialSky({mount,starCanvas,seed,reduceMotion=false}){
 if(!mount||!starCanvas)throw Error('CelestialSky requires container and star canvas');
 const palette=ATMOSPHERE_PALETTES[(seed>>>6)%ATMOSPHERE_PALETTES.length];
 const back=document.createElement('canvas'),front=document.createElement('canvas'),twinkle=document.createElement('canvas');
 back.className='nebula-texture nebula-back';
 front.className='nebula-texture nebula-front';
 twinkle.className='twinkle-canvas';
 back.setAttribute('aria-hidden','true');front.setAttribute('aria-hidden','true');twinkle.setAttribute('aria-hidden','true');
 mount.append(back,front,twinkle);
 const lowPower=!!(reduceMotion||window.matchMedia?.('(max-width: 650px)').matches||(navigator.deviceMemory&&navigator.deviceMemory<=2));
 if(reduceMotion)mount.classList.add('sky-still');
 let lastW=0,lastH=0,disposed=false;
 const paint=()=>{
  if(disposed)return;
  const r=mount.getBoundingClientRect();
  if(Math.abs(r.width-lastW)<2&&Math.abs(r.height-lastH)<2)return;
  lastW=r.width;lastH=r.height;
  starLayer(starCanvas,seed^0x88e119d0,STAR_COUNTS.distant,false,lowPower);
  starLayer(twinkle,seed^0x341ecc0f,STAR_COUNTS.near,true,lowPower);
  drawNebula(back,seed^0x7228dd08,palette,0,lowPower);
  drawNebula(front,seed^0x5bcbac13,palette,1,lowPower);
 };
 paint();
 window.addEventListener('resize',paint,{passive:true});
 return {paint,dispose(){disposed=true;window.removeEventListener('resize',paint);back.remove();front.remove();twinkle.remove()},diagnostics(){return {stars:STAR_COUNTS.distant+STAR_COUNTS.near,cloudTextures:2,cloudPixels:(lowPower?240*144:320*190)*2,lowPower,palette}}};
}
