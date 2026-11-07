/**
 * Selective temporal streaks for the ~5 staged hero cards. Ordinary Tarot
 * sheets NEVER receive their own trail. No evenly spaced orbit drawings.
 */
import {sampleVortexCard} from '../../src/ritual-world/VortexRibbon.mjs';
import {HERO_TRAIL_SLOTS,trailStrength} from '../../src/ritual-world/ShotDirector.mjs';
import {sequenceOneEchoEnvelope} from '../../src/ritual-world/TemporalEcho.mjs';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const focal=428/(2*Math.tan(58*Math.PI/360));
const HISTORY=[0,.041,.088,.150,.220];
function project(p){
 const z=-p.position[2];
 return z>2&&Number.isFinite(z)?{x:256+focal*p.position[0]/z,y:214-focal*p.position[1]/z,z}:null;
}
// One lens-scale environmental light-sweep, wholly distinct from card
// velocity tails. ChatARot's fastest beat briefly lights the vacuum wall;
// the rest of the scene remains dark with a readable eye.
export function environmentWakeStrength(t){
 const u=clamp((t-3.45)/2.10);
 return Math.pow(Math.sin(Math.PI*u),4);
}
function drawEnvironmentWake(ctx,t){
 const power=environmentWakeStrength(t);
 if(power<.004)return;
 const drift=21*Math.sin(t*1.19);
 const path=()=>{
  ctx.beginPath();
  ctx.moveTo(90+drift,-40);
  ctx.bezierCurveTo(-60+drift,68,-82+drift,300,126+drift,477);
 };
 ctx.save();ctx.globalCompositeOperation='screen';
 path();ctx.filter='blur(20px)';
 ctx.strokeStyle='rgba(172,183,201,'+(power*.23)+')';
 ctx.lineWidth=58;ctx.stroke();
 path();ctx.filter='blur(9px)';
 ctx.strokeStyle='rgba(210,213,219,'+(power*.16)+')';
 ctx.lineWidth=25;ctx.stroke();
 path();ctx.filter='blur(2px)';
 ctx.strokeStyle='rgba(225,224,216,'+(power*.065)+')';
 ctx.lineWidth=2.5;ctx.stroke();
 ctx.restore();
}
export function initFlowMist({mount,seed=0,getAge=()=>-1,reduceMotion=false}){
 if(!mount)throw Error('FlowMist requires a mount');
 const canvas=document.createElement('canvas');
 canvas.className='advected-mist';canvas.width=512;canvas.height=428;
 canvas.setAttribute('aria-hidden','true');mount.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});
 let frame=0,last=-1,disposed=false;
 const draw=()=>{
  if(disposed)return;
  frame=requestAnimationFrame(draw);
  if(document.hidden)return;
  const t=getAge();
  if(t<1.10||t>5.45||reduceMotion){
   if(last>=0)ctx.clearRect(0,0,512,428);
   last=-1;return;
  }
  if(Math.abs(t-last)<.024)return;
  last=t;ctx.clearRect(0,0,512,428);
  const envelope=sequenceOneEchoEnvelope(t);
  if(envelope<.005)return;
  drawEnvironmentWake(ctx,t);
  ctx.save();ctx.globalCompositeOperation='screen';
  for(const k of HERO_TRAIL_SLOTS){
   const focus=trailStrength(k,t);
   if(focus<.18)continue;
   const path=HISTORY.map(lag=>project(sampleVortexCard(k,seed,Math.max(1.10,t-lag))));
   if(path.some(p=>!p))continue;
   const v=Math.hypot(path[0].x-path[1].x,path[0].y-path[1].y)/HISTORY[1];
   const speed=clamp((v-30)/180);
   if(speed<.1)continue;
   const alpha=focus*speed*envelope;
   const c=k%2===0?'215,198,169':'156,178,235';
   for(let j=HISTORY.length-1;j>0;j--){
    const a=path[j],b=path[j-1];
    const length=Math.hypot(b.x-a.x,b.y-a.y);
    if(length<.35||length>90)continue;
    const tip=(HISTORY.length-j)/HISTORY.length;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
    ctx.lineWidth=clamp(12/b.z,.35,1.4)*(0.5+tip);
    ctx.strokeStyle='rgba('+c+','+(alpha*(.04+.31*tip*tip))+')';
    ctx.stroke();
   }
  }
  ctx.restore();
 };
 frame=requestAnimationFrame(draw);
 return {diagnostics:()=>({type:'directed-hero-streaks',maxTrailCards:5,
  historySamples:HISTORY.length,otherCardsNeverTrail:true,
  approvedSphereUnaffected:true}),dispose(){disposed=true;cancelAnimationFrame(frame);canvas.remove()}};
}
