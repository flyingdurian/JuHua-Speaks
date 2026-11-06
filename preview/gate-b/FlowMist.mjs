/**
 * Gate B v8: actual material-wake filaments along the same physical 3D
 * corkscrew paths as the 78 cards. No painted tornado image, no background
 * rotation, and no effect outside the unapproved first sequence.
 */
import {sampleVortexRibbon,vortexProgress} from '../../src/ritual-world/VortexRibbon.mjs';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const FOCAL=428/(2*Math.tan(58*Math.PI/360));
function project(p){
 const v=p.position,z=-v[2];
 if(z<=2)return null;
 return {x:256+FOCAL*v[0]/z,y:214-FOCAL*v[1]/z,z};
}
function sprite(){
 const c=document.createElement('canvas');c.width=64;c.height=64;
 const x=c.getContext('2d');
 const g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'rgba(228,229,218,.65)');
 g.addColorStop(.23,'rgba(188,193,199,.20)');
 g.addColorStop(1,'rgba(143,155,175,0)');
 x.fillStyle=g;x.fillRect(0,0,64,64);
 return c;
}
export function initFlowMist({mount,seed=0,getAge=()=>-1,reduceMotion=false}){
 if(!mount)throw Error('FlowMist requires a mount');
 const canvas=document.createElement('canvas');canvas.className='advected-mist';
 canvas.width=512;canvas.height=428;canvas.setAttribute('aria-hidden','true');
 mount.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true}),mote=sprite();
 let last=-1,frame=0,disposed=false;
 const draw=()=>{
  if(disposed)return;
  frame=requestAnimationFrame(draw);
  if(document.hidden)return;
  const t=getAge();
  if(t<1.12||t>6.30){
   if(last>=0)ctx.clearRect(0,0,512,428);
   last=-1;return;
  }
  if(Math.abs(t-last)<.027)return;
  last=t;ctx.clearRect(0,0,512,428);
  const {collapse}=vortexProgress(t);
  const fade=clamp((t-1.12)/.44)*clamp((6.26-t)/.7);
  const plume=clamp((t-3.44)/.76)*clamp((5.50-t)/.80);
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let lane=0;lane<3;lane++){
   // Curved streaks are computed from the WHOLE moving 3D ribbon, not
   // rotating images. The foreground moves differently from far segments.
   const steps=reduceMotion?40:96;
   ctx.beginPath();let previous=null;
   for(let i=0;i<=steps;i++){
    const q=i/steps,p=project(sampleVortexRibbon(lane,q,t,seed));
    if(!p){previous=null;continue}
    if(!previous||Math.hypot(p.x-previous.x,p.y-previous.y)>100)
      ctx.moveTo(p.x,p.y);
    else ctx.lineTo(p.x,p.y);
    previous=p;
   }
   const haze=(.07+.025*(lane===0?1:0))*fade*plume;
   ctx.globalAlpha=1;
   ctx.strokeStyle='rgba(154,165,176,'+haze+')';
   ctx.lineWidth=reduceMotion?9:23;ctx.stroke();
   ctx.strokeStyle='rgba(214,216,211,'+(.11*fade)+')';
   ctx.lineWidth=1.3;ctx.stroke();
  }
  const n=reduceMotion?55:185;
  for(let i=0;i<n;i++){
   const lane=i%3;
   const q=((i*0.6180339887498949+seed*.00000017)%1+1)%1;
   const p=project(sampleVortexRibbon(lane,q,t,seed));
   if(!p||p.x<-40||p.x>552||p.y<-40||p.y>468)continue;
   const size=clamp(190/p.z,2.5,19);
   ctx.globalAlpha=fade*(.07+.085*((i*37%101)/101))*(1-.35*collapse);
   ctx.drawImage(mote,p.x-size/2,p.y-size/2,size,size);
  }
  ctx.restore();
 };
 frame=requestAnimationFrame(draw);
 return {diagnostics:()=>({type:'shared-3D-card-ribbon-wake',count:reduceMotion?55:185,
  staticTornado:false,approvedSphereUnaffected:true}),
  dispose(){disposed=true;cancelAnimationFrame(frame);canvas.remove()}};
}
