/**
 * Gate B v6 volumetric motion accents. Unlike the rejected rotating tornado
 * image, each smoky mote has a time-dependent material trajectory through the
 * same accelerated suction family as the physical cards. This is intentionally
 * secondary/low opacity: NEVER replace card silhouettes with atmosphere.
 */
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const hash=n=>{let x=Math.imul((n+1)>>>0,0x9e3779b9)>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return(x>>>0)/4294967296};
function sample(i,age,seed){
 const a=i+seed%12317;
 const lane=i%4;
 const offset=hash(a+10);
 const release=.05+1.48*hash(a+23);
 const duration=1.8+.8*hash(a+31);
 const u=clamp((age-release)/duration);
 const p=u*u*(1.52-.52*u);
 const theta=TAU*(lane/4+1.75*p+.30*u+.045*(hash(a+43)-.5));
 const radial=(.20+1.03*hash(a+87))*(.98-.72*p);
 const perspective=1+.62*p;
 return {
  x:radial*perspective*Math.cos(theta)+.02*Math.sin(age*3+i),
  y:radial*perspective*.79*Math.sin(theta),
  u,progress:p,
  active:age>release&&age<release+duration+.42,
  size:2.5+9*hash(a+19)+5*p
 };
}
function sprite(){
 const c=document.createElement('canvas');c.width=64;c.height=64;
 const ctx=c.getContext('2d');
 const g=ctx.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'rgba(226,227,215,.65)');
 g.addColorStop(.35,'rgba(163,186,185,.25)');
 g.addColorStop(1,'rgba(120,148,165,0)');
 ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
 return c;
}
export function initFlowMist({mount,seed=0,getAge=()=>-1,reduceMotion=false}){
 if(!mount)throw Error('FlowMist requires a mount');
 const canvas=document.createElement('canvas');canvas.className='advected-mist';
 canvas.width=512;canvas.height=428;canvas.setAttribute('aria-hidden','true');
 const ctx=canvas.getContext('2d',{alpha:true});
 mount.append(canvas);
 const cloud=sprite(),count=reduceMotion?84:240;
 let frame=0,disposed=false,last=-1;
 const render=()=>{
  frame=requestAnimationFrame(render);
  if(disposed)return;
  const age=getAge();
  if(age<.80||age>3.66){if(last>=0)ctx.clearRect(0,0,512,428);last=-1;return}
  const now=age;
  if(Math.abs(now-last)<.018)return;
  last=now;
  ctx.clearRect(0,0,512,428);
  ctx.save();
  ctx.globalCompositeOperation='screen';
  const fade=clamp((age-.8)/.42)*clamp((3.66-age)/.42);
  // Each mote sweeps its own short temporal arc. Motion/history, not rotation
  // of a prepainted spiral or visual FX rigidly attached to a card cluster.
  for(let i=0;i<count;i++){
   const samples=reduceMotion?1:5;
   for(let h=samples-1;h>=0;h--){
    const p=sample(i,now-h*.047,seed);
    if(!p.active)continue;
    const weight=fade*(1-h/samples)*(.11+.06*(i%3));
    const r=p.size*(1+.65*p.progress)*2.4;
    ctx.globalAlpha=weight;
    ctx.drawImage(cloud,256+p.x*222-r/2,214+p.y*186-r/2,r,r);
   }
  }
  ctx.restore();
 };
 if(!reduceMotion)frame=requestAnimationFrame(render);
 else {frame=requestAnimationFrame(render)}
 return {diagnostics:()=>({type:'advected-particles',count,animated:true,staticTornado:false}),
  dispose(){disposed=true;cancelAnimationFrame(frame);canvas.remove()}};
}
