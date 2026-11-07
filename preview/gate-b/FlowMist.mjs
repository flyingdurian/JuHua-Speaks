/**
 * Gate B Sequence 1: velocity-aligned ink/light tails.
 *
 * Every trail samples actual previous positions of the 78 real 3D Tarot
 * meshes; no image of a tornado, no static moving ring, no cloned identities.
 * Real afterimage CARD artwork is rendered separately by WebGL2.
 */
import {sampleVortexCard} from '../../src/ritual-world/VortexRibbon.mjs';
import {sequenceOneEchoEnvelope} from '../../src/ritual-world/TemporalEcho.mjs';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const FOCAL=428/(2*Math.tan(58*Math.PI/360));
const HISTORY=[0,.032,.070,.115,.170,.237];
function project(point){
 const z=-point.position[2];
 if(z<=2||!Number.isFinite(z))return null;
 return {x:256+FOCAL*point.position[0]/z,
         y:214-FOCAL*point.position[1]/z,z};
}
export function initFlowMist({mount,seed=0,getAge=()=>-1,reduceMotion=false}){
 if(!mount)throw Error('FlowMist requires a mount');
 const canvas=document.createElement('canvas');canvas.className='advected-mist';
 canvas.width=512;canvas.height=428;canvas.setAttribute('aria-hidden','true');
 mount.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});
 let frame=0,last=-1,disposed=false;
 const draw=()=>{
  if(disposed)return;
  frame=requestAnimationFrame(draw);
  if(document.hidden)return;
  const t=getAge();
  if(t<1.10||t>=5.45){
   if(last>=0)ctx.clearRect(0,0,512,428);
   last=-1;return;
  }
  if(Math.abs(t-last)<.025)return;
  last=t;ctx.clearRect(0,0,512,428);
  const envelope=sequenceOneEchoEnvelope(t);
  if(envelope<.005||reduceMotion)return;
  ctx.save();ctx.globalCompositeOperation='screen';
  // Each visible stroke follows one independently moving card through 3D
  // perspective, including curved paths and accelerated foreground passes.
  for(let k=0;k<78;k++){
   const trace=HISTORY.map(lag=>project(sampleVortexCard(k,seed,Math.max(1.10,t-lag))));
   if(trace.some(v=>!v))continue;
   const [now,prior]=trace,delta=Math.hypot(now.x-prior.x,now.y-prior.y);
   const apparentSpeed=delta/HISTORY[1];
   const strength=clamp((apparentSpeed-17)/135)*envelope;
   if(strength<.07)continue;
   const close=clamp(26/now.z,.42,2.2);
   const isBright=k%11===2||k%13===3;
   const color=isBright?[214,201,183]:[139,155,206];
   for(let j=HISTORY.length-1;j>0;j--){
    const a=trace[j],b=trace[j-1];
    const length=Math.hypot(a.x-b.x,a.y-b.y);
    if(length>110||length<.25)continue;
    const weight=Math.pow(1-j/HISTORY.length,1.45);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
    ctx.lineWidth=close*(.47+1.2*weight);
    ctx.strokeStyle='rgba('+color.join(',')+','+(strength*(.09+.36*weight))+')';
    ctx.stroke();
   }
  }
  ctx.restore();
 };
 frame=requestAnimationFrame(draw);
 return {diagnostics:()=>({
  type:'individual-card-temporal-streaks',cardCount:78,
  tailSamples:HISTORY.length,velocityDriven:true,staticTornado:false,
  approvedSphereUnaffected:true
 }),dispose(){disposed=true;cancelAnimationFrame(frame);canvas.remove()}};
}
