/** Gate B v7: volumetric mist follows the VERY SAME 3D flow as the cards. */
import {sampleTunnelTrajectory,tunnelHash} from '../../src/ritual-world/TunnelDynamics.mjs';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function softMote(){
 const c=document.createElement('canvas');c.width=64;c.height=64;
 const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'rgba(218,225,227,.55)');
 g.addColorStop(.24,'rgba(173,181,181,.30)');
 g.addColorStop(.67,'rgba(137,145,157,.08)');
 g.addColorStop(1,'rgba(120,148,165,0)');
 x.fillStyle=g;x.fillRect(0,0,64,64);return c;
}
export function initFlowMist({mount,seed=0,getAge=()=>-1,reduceMotion=false}){
 const canvas=document.createElement('canvas');canvas.className='advected-mist';
 canvas.width=512;canvas.height=428;canvas.setAttribute('aria-hidden','true');
 mount.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});
 const mote=softMote(),N=reduceMotion?80:175;
 const f=428/(2*Math.tan(58*Math.PI/360));
 const project=p=>({x:256+f*p.position[0]/(-p.position[2]),
                     y:214-f*p.position[1]/(-p.position[2]),depth:-p.position[2]});
 let disposed=false,frame=0,last=-100;
 const draw=()=>{
  frame=requestAnimationFrame(draw);
  if(disposed||document.hidden)return;
  const t=getAge();
  if(t<.95||t>6.29){if(last!==-100)ctx.clearRect(0,0,512,428);last=-100;return}
  if(Math.abs(t-last)<.035)return;
  last=t;ctx.clearRect(0,0,512,428);
  const fade=clamp((t-.95)/.58)*clamp((6.29-t)/.52);
  ctx.save();ctx.globalCompositeOperation='screen';
  // The four projected gas streamlines are the actual four card filaments.\n  // Their vertices recalculate from the material field as time advances.\n  for(let lane=0;lane<4;lane++){\n   ctx.beginPath();let previous=null;\n   for(let step=0;step<44;step++){\n    const p=project(sampleTunnelTrajectory(step*4+lane,seed,t,{mote:true}));\n    if(!previous||Math.hypot(p.x-previous.x,p.y-previous.y)>88)ctx.moveTo(p.x,p.y);\n    else ctx.lineTo(p.x,p.y);\n    previous=p;\n   }\n   ctx.strokeStyle='rgba(178,186,191,'+(.20*fade)+')';\n   ctx.lineWidth=1.15;ctx.globalAlpha=1;ctx.stroke();\n  }
  // A camera-perspective filament is a trail of the same material coordinate,
  // not a CSS/Canvas spiral that spins behind stationary sheets.
  for(let i=0;i<N;i++){
   const key=i+781;
   const head=project(sampleTunnelTrajectory(key,seed,t,{mote:true}));
   if(head.depth<3.5||head.depth>43)continue;
   const tail=project(sampleTunnelTrajectory(key,seed,t-.065,{mote:true}));
   const alpha=fade*(.090+.11*tunnelHash(key+71,seed));
   if((head.x>=-80&&head.x<=592)&&(head.y>=-80&&head.y<=508)){
    ctx.strokeStyle='rgba(175,190,195,'+(alpha*.95)+')';
    ctx.lineWidth=clamp(1.5*(24/head.depth),.3,2.7);
    ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(head.x,head.y);ctx.stroke();
    const size=clamp((10+13*tunnelHash(key+17,seed))*18/head.depth,3,46);
    ctx.globalAlpha=alpha*2.1;
    ctx.drawImage(mote,head.x-size/2,head.y-size/2,size,size);
   }
  }
  ctx.restore();
 };
 frame=requestAnimationFrame(draw);
 return {diagnostics:()=>({type:'material-perspective-filaments',count:N,staticTornado:false,sharedTrajectory:true}),
 dispose(){disposed=true;cancelAnimationFrame(frame);canvas.remove()}};
}
