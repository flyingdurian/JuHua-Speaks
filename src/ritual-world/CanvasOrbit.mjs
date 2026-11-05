/**
 * Canvas2D renderer for environments that block WebGL. Shares the SAME 78 card
 * entities, world-space orbit, camera projection and lifecycle as RitualWorld.
 * It is a real perspective projection, not a scattered CSS animation.
 */
import {makeLandingCardEntities,sampleLandingPose,landingOpacity,entranceScale,landingAttitude,createVisualSeed,orbitDiagnostics} from './OrbitalField.mjs';
const TAU=Math.PI*2;
const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function makeBack(){
 const c=document.createElement('canvas');c.width=180;c.height=304;
 const x=c.getContext('2d');const g=x.createLinearGradient(0,0,180,304);g.addColorStop(0,'#07152f');g.addColorStop(.55,'#21345b');g.addColorStop(1,'#071027');
 x.fillStyle='#bba478';x.fillRect(0,0,180,304);x.fillStyle=g;x.fillRect(5,5,170,294);
 x.strokeStyle='#e3c98d';x.lineWidth=1.5;x.strokeRect(12,13,156,278);x.lineWidth=.75;x.strokeRect(21,23,138,258);
 x.strokeStyle='#d9b17b';x.lineWidth=1.7;for(let k=0;k<3;k++){x.beginPath();x.arc(90,153,38+k*11,0,TAU);x.stroke()}
 for(let i=0;i<24;i++){let a=i*TAU/24;x.beginPath();x.moveTo(90+Math.sin(a)*70,153+Math.cos(a)*70);x.lineTo(90+Math.sin(a)*80,153+Math.cos(a)*80);x.stroke()}
 x.fillStyle='#edd6a1';x.textAlign='center';x.font='47px Georgia';x.fillText('☾',90,170);
 x.font='12px Georgia';x.fillText('✧   ✶   ✧',90,42);x.fillText('✧   ✶   ✧',90,272);
 return c;
}
export class CanvasOrbit{
 constructor({mount,cards,faceAssetForId,visualSeed=createVisualSeed(),onStatus=()=>{}}){
  this.mount=mount;this.visualSeed=visualSeed;this.cards=makeLandingCardEntities(cards,visualSeed);this.faceAssetForId=faceAssetForId;this.phase='landing';this.onStatus=onStatus;
  this.loadedCount=0;this.failedAssets=[];this.elapsed=0;this.last=0;this.lastPaint=0;this.frame=0;this.paused=false;this.disposed=false;this.images=[];this.fronts=new Map();
  this.canvas=document.createElement('canvas');this.canvas.className='ritual-world-canvas';this.canvas.setAttribute('aria-hidden','true');mount.append(this.canvas);
  this.ctx=this.canvas.getContext('2d');if(!this.ctx)throw Error('2D unavailable');this.back=makeBack();
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(mount);
  let i=0;const priority=[...this.cards].sort((a,b)=>(Number(b.passIndex>=0)-Number(a.passIndex>=0))||a.orbitSlot-b.orbitSlot);
  for(let n=0;n<4;n++){
   const work=()=>{if(this.disposed||i>=priority.length)return;const card=priority[i++],image=new Image();this.images.push(image);
    image.onload=()=>{if(this.disposed)return;const small=document.createElement('canvas');small.width=384;small.height=664;small.getContext('2d').drawImage(image,0,0,384,664);this.fronts.set(card.id,small);this.loadedCount++;image.onload=null;image.onerror=null;this.images.splice(this.images.indexOf(image),1);work()};
    image.onerror=()=>{if(this.disposed)return;this.failedAssets.push(card.id);this.images.splice(this.images.indexOf(image),1);work()};image.src=faceAssetForId(card.id)};work();
  }
  this.tick=this.tick.bind(this);this.frame=requestAnimationFrame(this.tick);
 }
 setPaused(state){this.paused=!!state}
 setPhase(phase){this.phase=phase}
 resize(){const r=this.mount.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.35);
  const w=Math.max(2,Math.round(r.width*dpr)),h=Math.max(2,Math.round(r.height*dpr));if(w!==this.canvas.width||h!==this.canvas.height){this.canvas.width=w;this.canvas.height=h}}
 tick(now){if(this.disposed)return;this.frame=requestAnimationFrame(this.tick);if(document.hidden||this.paused)return;
  const delta=Math.min(65,now-this.last||0);this.last=now;this.elapsed+=delta/1000;
  if(now-this.lastPaint<29)return;this.lastPaint=now;
  this.resize();const ctx=this.ctx,w=this.canvas.width,h=this.canvas.height,f=h/(2*Math.tan(Math.PI*58/360));
  ctx.clearRect(0,0,w,h);
  const items=this.cards.map(c=>({card:c,pos:sampleLandingPose(c,this.elapsed)})).filter(o=>o.pos[2]<-1.4);
  items.sort((a,b)=>a.pos[2]-b.pos[2]);
  const project=p=>[w*.5+p[0]*f/(-p[2]),h*.5-p[1]*f/(-p[2])];
  for(const {card,pos} of items){
   // The 2D perspective fallback uses the same physical front/back basis as WebGL.
   const pose=landingAttitude(card,pos,this.elapsed),right=pose.right,up=pose.up;
   const scale=entranceScale(card,this.elapsed),W=card.width*.5*scale,H=card.height*.5*scale;
   const v=(sx,sy)=>project([pos[0]+right[0]*sx*W+up[0]*sy*H,pos[1]+right[1]*sx*W+up[1]*sy*H,pos[2]+right[2]*sx*W+up[2]*sy*H]);
   const A=v(-1,1),B=v(1,1),C=v(1,-1),D=v(-1,-1);
   const bound=Math.max(Math.hypot(B[0]-A[0],B[1]-A[1]),Math.hypot(D[0]-A[0],D[1]-A[1]));
   if(bound<2.8||bound>1900||[A,B,C,D].every(p=>p[0]<-80||p[0]>w+80||p[1]<-80||p[1]>h+80))continue;
   const edge=Math.max(.8,Math.min(2.2,bound*.004));
   ctx.fillStyle='#8e816f';ctx.beginPath();ctx.moveTo(B[0],B[1]);ctx.lineTo(C[0],C[1]);ctx.lineTo(C[0]+edge,C[1]+edge);ctx.lineTo(B[0]+edge,B[1]+edge);ctx.closePath();ctx.fill();
   const src=pose.frontFacingCamera?this.fronts.get(card.id)||this.back:this.back;
   ctx.save();ctx.globalAlpha=card.light*landingOpacity(card,this.elapsed);ctx.setTransform((B[0]-A[0])/src.width,(B[1]-A[1])/src.width,(D[0]-A[0])/src.height,(D[1]-A[1])/src.height,A[0],A[1]);
   ctx.beginPath();ctx.roundRect(0,0,src.width,src.height,src.width*.056);ctx.clip();ctx.drawImage(src,0,0);ctx.restore();
   ctx.strokeStyle='rgba(194,171,126,.58)';ctx.lineWidth=Math.max(.35,Math.min(1.2,bound*.003));ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(...B);ctx.lineTo(...C);ctx.lineTo(...D);ctx.closePath();ctx.stroke();
  }
  this.onStatus({state:this.phase,rendered:78,elapsed:this.elapsed,loaded:this.loadedCount,failed:this.failedAssets.length});
 }
 getDiagnostics(){return {phase:this.phase,cards:this.cards.length,loaded:this.loadedCount,failed:this.failedAssets.length,elapsed:this.elapsed,visualSeed:this.visualSeed,...orbitDiagnostics(this.cards,this.elapsed),renderer:'Canvas2D perspective fallback',width:this.canvas.width,height:this.canvas.height}}
 dispose(){if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver?.disconnect();for(const i of this.images){i.onload=null;i.onerror=null}this.canvas.remove()}
}
