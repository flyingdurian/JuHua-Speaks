/**
 * Three-dimensional ritual theater for 8.1 fidelity.
 * Authentic JPEGs are sampled as textures, never regenerated or vector-traced.
 */
import {DECK} from './deck.mjs';
import {BRAND} from './brand-config.mjs';
import {resolveFaceSource} from './deck-config.mjs';
const TAU=Math.PI*2;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>Object.fromEntries(['x','y','z','rx','ry','rz','scale'].map(k=>[k,lerp(a[k],b[k],smooth(t))]));
export const SHUFFLE_BEATS=Object.freeze([
 {id:'tornado',start:0,end:1700},
 {id:'collapse',start:1700,end:2600},
 {id:'mini-sphere',start:2600,end:3900},
 {id:'three-piles',start:3900,end:5350},
 {id:'single-deck',start:5350,end:6500}
]);
export const LAUNCH_DURATION_MS=3300;
export function cinematicBeat(ms){return SHUFFLE_BEATS.find(b=>ms<b.end)?.id||'single-deck'}
function orbit(i,t){const a=i*2.3999632+t*.19,r=5.4+(i%6)*.45;
 return {x:Math.cos(a)*r,y:Math.sin(i*.73+t*.13)*2.6,z:Math.sin(a)*r,rx:.19*Math.sin(i+t*.2),ry:a+Math.PI,rz:.2*Math.cos(i*.31+t),scale:.81+i%4*.1};
}
export function cinematicPose(i,elapsedMs,mode='shuffle',phaseOffset=0,style='cosmic'){
 const t=elapsedMs/1000,a=i*2.3999632,p=i%3,land=orbit(i,phaseOffset+t);
 if(mode==='landing')return land;
 const tw={x:Math.sin(a+t*13.4)*(1.8+i%6*.19),y:Math.sin(a*.7+t*5)*2.2,z:-5+Math.cos(a+t*13.4)*(1.35+i%4*.18),rx:.7*Math.sin(i+t*6),ry:t*8+i*.46,rz:t*6+i*.71,scale:.67};
 const c={x:0,y:0,z:-4.1+(i%21)*.012,rx:0,ry:t*.28,rz:0,scale:.79};
 if(mode==='shuffle'&&style==='riffle'){
  const row=i%39,half=i<39?-1:1;
  const split={x:half*(1.6+Math.sin(t*9+row*.13)*.6),y:(row-19)*.042,z:-5+Math.cos(row*.15+t*8)*.36,rx:Math.sin(row*.13+t*8)*.22,ry:half*.26,rz:half*.21,scale:.69};
  const weave={x:half*.25+Math.sin(row*.18+t*13)*.27,y:(row-19)*.018,z:-4.8+row*.008,rx:0,ry:0,rz:half*.03,scale:.73};
  return elapsedMs<4400?blend(split,weave,Math.max(0,(elapsedMs-1000)/3400)):blend(weave,c,(elapsedMs-4400)/2100);
 }
 if(mode==='shuffle'&&style==='wash'){
  const radius=2.6+(i%8)*.29,angle=i*2.3999632+t*3.8;
  const wash={x:Math.sin(angle)*radius,y:Math.cos(i*.77+t*5)*1.25,z:-5.8+Math.cos(angle)*.85,rx:Math.cos(i+t*3)*.83,ry:i+t*3,rz:t*3+i*.6,scale:.68};
  return elapsedMs<4950?wash:blend(wash,c,(elapsedMs-4950)/1550);
 }
 const phi=Math.acos(1-2*(i+.5)/78),angle=a+t*3.1;
 const mini={x:Math.cos(angle)*Math.sin(phi)*2.1,y:Math.cos(phi)*2.1,z:-5.7+Math.sin(angle)*Math.sin(phi)*2.1,rx:Math.sin(i+t)*.5,ry:angle,rz:t*1.2+i*.16,scale:.76};
 const pile={x:(p-1)*1.48+Math.sin(i+t*7)*.19,y:(i%17)*.013-.28,z:-5.1+(i%18)*.012,rx:.08,ry:(p-1)*.17,rz:(p-1)*.12,scale:.67};
 if(mode==='launch'){
  const away={...c,z:-12,scale:.26};
  if(elapsedMs<1050)return blend(c,away,elapsedMs/1050);
  const rr=6.5,a2=a+t*2.2;
  const shell={x:Math.cos(a2)*Math.sin(phi)*rr,y:Math.cos(phi)*rr,z:Math.sin(a2)*Math.sin(phi)*rr,rx:Math.sin(a2)*.24,ry:a2+Math.PI,rz:i*.07,scale:1};
  return blend(away,shell,(elapsedMs-1050)/2250);
 }
 if(elapsedMs<1700)return blend(land,tw,elapsedMs/1700);
 if(elapsedMs<2600)return blend(tw,{...c,z:-5.3,scale:.03},(elapsedMs-1700)/900);
 if(elapsedMs<3900)return blend({...c,z:-5.3,scale:.03},mini,(elapsedMs-2600)/500);
 if(elapsedMs<5350)return blend(mini,pile,(elapsedMs-3900)/1450);
 return blend(pile,c,(elapsedMs-5350)/1150);
}
const VS=['#version 300 es','precision highp float;','layout(location=0) in vec3 pos;','layout(location=1) in vec2 uv;','uniform mat4 projection;','out vec2 texUV;','void main(){gl_Position=projection*vec4(pos,1.0);texUV=uv;}'].join('\n');
const FS=['#version 300 es','precision mediump float;','in vec2 texUV;','uniform sampler2D atlas;','out vec4 color;','void main(){color=texture(atlas,texUV);}'].join('\n');
function compile(gl,type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Ritual shader: '+gl.getShaderInfoLog(s));return s}
function createProgram(gl){
 const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,VS),f=compile(gl,gl.FRAGMENT_SHADER,FS);
 gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Ritual program: '+gl.getProgramInfoLog(p));return p;
}
function drawBack(ctx,x,y,w,h){
 const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#09152b');g.addColorStop(.5,'#1e315c');g.addColorStop(1,'#050d21');
 ctx.fillStyle='#997b57';ctx.fillRect(x,y,w,h);ctx.fillStyle=g;ctx.fillRect(x+7,y+7,w-14,h-14);
 ctx.strokeStyle='#f0d8a3';ctx.lineWidth=2;ctx.strokeRect(x+13,y+13,w-26,h-26);
 ctx.strokeStyle='#cab98c';ctx.lineWidth=1;ctx.strokeRect(x+26,y+26,w-52,h-52);
 ctx.beginPath();ctx.arc(x+w/2,y+h/2,64,0,TAU);ctx.stroke();
 for(let i=0;i<16;i++){const a=i*TAU/16;ctx.beginPath();ctx.moveTo(x+w/2+Math.sin(a)*55,y+h/2+Math.cos(a)*55);ctx.lineTo(x+w/2+Math.sin(a)*78,y+h/2+Math.cos(a)*78);ctx.stroke()}
 ctx.fillStyle='#edd29e';ctx.textAlign='center';ctx.font='68px Georgia,serif';ctx.fillText('☽',x+w/2,y+h/2+19);
 ctx.font='16px Georgia,serif';ctx.fillText(BRAND.cardBackLabel,x+w/2,y+h-46);
}
function makeAtlas(){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1792;
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas 2D unavailable');
 for(let i=0;i<16;i++)drawBack(ctx,(i%4)*256,Math.floor(i/4)*448,256,448);
 return {canvas,ctx};
}
function projection(aspect){
 const f=1/Math.tan(Math.PI/5),n=.08,z=40;
 return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(z+n)/(n-z),-1,0,0,2*z*n/(n-z),0]);
}
function addQuad(out,p,slot){
 if(p.z>-.2)return;
 const cy=Math.cos(p.ry),sy=Math.sin(p.ry),cx=Math.cos(p.rx),sx=Math.sin(p.rx),cz=Math.cos(p.rz),sz=Math.sin(p.rz);
 function rot(x,y,z){const ax=x*cz-y*sz,ay=x*sz+y*cz,az=z;
  const yy=ay*cx-az*sx,zz=ay*sx+az*cx;return [ax*cy+zz*sy,yy,-ax*sy+zz*cy]}
 const R=rot(1,0,0),U=rot(0,1,0),w=.67*p.scale,h=1.18*p.scale;
 for(const [a,b,u,v] of [[-1,-1,0,1],[1,-1,1,1],[1,1,1,0],[-1,-1,0,1],[1,1,1,0],[-1,1,0,0]]){
  out.push(p.x+R[0]*a*w+U[0]*b*h,p.y+R[1]*a*w+U[1]*b*h,p.z+R[2]*a*w+U[2]*b*h,((slot%4)+u)/4,(Math.floor(slot/4)+v)/4);
 }
}
export function mountRitualCinema(container,{mode='landing',startAt=0,phaseOffset=0,deckId='rws',localImages,style='cosmic'}={}){
 if(!container||typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.className='ritual-cinema-canvas';canvas.setAttribute('aria-hidden','true');container.prepend(canvas);
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});
 if(!gl){canvas.remove();return null}
 let program,vao,buffer,texture,frame=0,disposed=false,lastFrame=0;
 const a=makeAtlas(),imgs=[];
 try{
  program=createProgram(gl);vao=gl.createVertexArray();gl.bindVertexArray(vao);
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [index,size,offset] of [[0,3,0],[1,2,12]]){gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,size,gl.FLOAT,false,20,offset)}
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  function updateAtlas(){if(disposed||gl.isContextLost())return;
   gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,a.canvas);gl.generateMipmap(gl.TEXTURE_2D)}
  updateAtlas();
  if(mode!=='launch'&&deckId==='rws'){
   const faces=[0,4,8,11,17,18,19,20,21,25,36,50];
   faces.forEach((ix,k)=>{const img=new Image();img.decoding='async';imgs.push(img);
    img.onload=()=>{if(disposed)return;a.ctx.drawImage(img,(k%4)*256,Math.floor(k/4)*448,256,448);updateAtlas()};
    img.onerror=()=>{};img.src=resolveFaceSource(deckId,DECK[ix].id,localImages)});
  }
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  const u=gl.getUniformLocation(program,'projection'),v=gl.getUniformLocation(program,'atlas');
  function paint(time){
   if(disposed)return;frame=requestAnimationFrame(paint);
   if(document.hidden||time-lastFrame<27)return;lastFrame=time;
   const rect=container.getBoundingClientRect();if(rect.width<8||rect.height<8)return;
   const dpr=Math.min(window.devicePixelRatio||1,1.5),width=Math.round(rect.width*dpr),height=Math.round(rect.height*dpr);
   if(width!==canvas.width||height!==canvas.height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height)}
   gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.useProgram(program);gl.bindVertexArray(vao);gl.uniformMatrix4fv(u,false,projection(width/height));
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(v,0);
   const elapsed=mode==='landing'?time:Math.max(0,time-startAt);
   const verts=[];
   for(let i=0;i<78;i++)addQuad(verts,cinematicPose(i,elapsed,mode,phaseOffset,style),mode==='launch'?12:i%5===0?(Math.floor(i/5)%12):12);
   gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.DYNAMIC_DRAW);
   gl.drawArrays(gl.TRIANGLES,0,verts.length/5);
  }
  function dispose(){
   if(disposed)return;disposed=true;cancelAnimationFrame(frame);for(const img of imgs){img.onload=null;img.onerror=null}
   if(!gl.isContextLost()){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteVertexArray(vao);gl.deleteProgram(program)}
   canvas.remove();container.classList.remove('ritual-gpu-active');
  }
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();dispose()},{once:true});
  container.classList.add('ritual-gpu-active');frame=requestAnimationFrame(paint);
  return {dispose,canvas};
 }catch(e){console.warn('GPU ritual fallback:',e);canvas.remove();return null}
}
