/**
 * JuHua post-shuffle Gate C — one continuous 3D shot.
 * FINISH SHUFFLING -> deck launch -> rotating spherical distribution -> camera passes
 * through sphere -> three interactive selections. No gate, cube or second shuffle.
 *
 * Actual WebGL2 card surfaces, stable identity and deterministic world coordinates.
 * A selected card moves in its own world coordinate; transient halos are accents.
 */
import {DECK,commonsThumbnailUrl,drawOrientation} from '../../src/deck.mjs';
import {initCelestialSky} from '../../src/ritual-world/CelestialSky.mjs';
import {BEATS,sphereLayout,clamp,smooth,cardWorld,orbitAngle,cameraDistance,selectCard,getStage,pointInQuad} from './geometry.mjs';

const W=174,H=288,COLS=10,ROWS=8,ATLAS_W=W*COLS,ATLAS_H=H*ROWS;
const vs=`#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec2 a_uv;
layout(location=2) in float a_slot;
layout(location=3) in float a_side;
layout(location=4) in float a_selected;
uniform float u_focal;
uniform float u_aspect;
uniform float u_near;
uniform float u_far;
out vec2 v_uv;
flat out float v_slot;
flat out float v_side;
flat out float v_selected;
void main(){
 float z=a_position.z;
 gl_Position=vec4(u_focal*a_position.x/u_aspect,u_focal*a_position.y,
 (u_far+u_near)/(u_near-u_far)*z+(2.0*u_far*u_near)/(u_near-u_far),-z);
 v_uv=a_uv;v_slot=a_slot;v_side=a_side;v_selected=a_selected;
}`;
const fs=`#version 300 es
precision mediump float;
in vec2 v_uv;
flat in float v_slot;
flat in float v_side;
flat in float v_selected;
uniform sampler2D u_atlas;
out vec4 frag;
void main(){
 float slot=mix(v_slot,78.0,v_side);
 float col=mod(slot,10.0);float row=floor(slot/10.0);
 vec2 uv=vec2((col+mix(.012,.988,v_uv.x))/10.0,1.0-(row+mix(.012,.988,1.0-v_uv.y))/8.0);
 vec4 tex=texture(u_atlas,uv);
 float border=min(min(v_uv.x,1.0-v_uv.x),min(v_uv.y,1.0-v_uv.y));
 if(v_selected>.5){
  float gild=1.0-smoothstep(.012,.057,border);
  tex.rgb=mix(tex.rgb,vec3(1.0,.86,.62),.53*gild);
  tex.rgb+=vec3(.09,.082,.05);
 }
 frag=vec4(tex.rgb,1.0);
}`;
function compile(gl,type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader error '+gl.getShaderInfoLog(shader));return shader;}
function makeProgram(gl){const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Program error '+gl.getProgramInfoLog(p));return p;}
function backArt(ctx,x,y){
 ctx.save();ctx.translate(x,y);
 const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#0c2447');grad.addColorStop(.45,'#071328');grad.addColorStop(1,'#142543');ctx.fillStyle='#c4c3c1';ctx.fillRect(0,0,W,H);ctx.fillStyle=grad;ctx.fillRect(3,3,W-6,H-6);
 ctx.strokeStyle='#8293ab';ctx.lineWidth=1;ctx.strokeRect(7,7,W-14,H-14);ctx.strokeStyle='#b9b9bf';ctx.strokeRect(12,12,W-24,H-24);
 for(let i=0;i<38;i++){const a=i*2.4,r=18+(i*17%80);ctx.fillStyle=i%5?'#627b9a':'#d3c5ba';ctx.fillRect(W/2+Math.cos(a)*r, H/2+Math.sin(a)*r*1.39,1.1,1.1)}
 ctx.translate(W/2,H/2);ctx.strokeStyle='#c0babc';ctx.lineWidth=1;
 for(const r of [25,37,45]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke()}
 for(let j=0;j<12;j++){const a=j*Math.PI/6;ctx.beginPath();ctx.moveTo(Math.cos(a)*37,Math.sin(a)*37);ctx.lineTo(Math.cos(a)*52,Math.sin(a)*52);ctx.stroke()}
 ctx.beginPath();ctx.moveTo(0,-39);ctx.lineTo(8,-8);ctx.lineTo(39,0);ctx.lineTo(8,8);ctx.lineTo(0,39);ctx.lineTo(-8,8);ctx.lineTo(-39,0);ctx.lineTo(-8,-8);ctx.closePath();ctx.strokeStyle='#dfd6cf';ctx.stroke();
 ctx.fillStyle='#d8d0c8';ctx.font='25px Georgia,serif';ctx.textAlign='center';ctx.fillText('☾',0,10);
 ctx.restore();
}
function fallbackFace(ctx,x,y,card){
 ctx.save();ctx.translate(x,y);ctx.fillStyle='#e7dfca';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#4a4546';ctx.lineWidth=3;ctx.strokeRect(6,7,W-12,H-14);
 const grad=ctx.createLinearGradient(0,20,W,H-20);grad.addColorStop(0,'#787a8c');grad.addColorStop(.5,'#b7a58c');grad.addColorStop(1,'#53647d');ctx.fillStyle=grad;ctx.fillRect(12,22,W-24,H-54);
 ctx.fillStyle='#202638';ctx.beginPath();ctx.arc(W/2,H*.41,38,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f5e8c5';ctx.stroke();ctx.fillStyle='#dfc9aa';ctx.textAlign='center';ctx.font='17px Georgia,serif';ctx.fillText('✦',W/2,H*.41+7);
 const words=card.name.toUpperCase().split(' ');ctx.fillStyle='#151515';ctx.font='bold 13px Georgia,serif';const lines=[];let l='';for(const w of words){if((l+' '+w).length>20){lines.push(l);l=w}else l=l?l+' '+w:w}lines.push(l);lines.slice(0,2).forEach((v,j)=>ctx.fillText(v,W/2,H-18-j*16));ctx.restore();
}
function atlasTexture(gl,cards,shouldRun){
 const canvas=document.createElement('canvas');canvas.width=ATLAS_W;canvas.height=ATLAS_H;
 const ctx=canvas.getContext('2d',{alpha:false});let dirty=true,loaded=0,failed=0;
 cards.forEach((card,i)=>fallbackFace(ctx,(i%COLS)*W,Math.floor(i/COLS)*H,card));
 backArt(ctx,(78%COLS)*W,Math.floor(78/COLS)*H);
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 function upload(){if(!dirty||!shouldRun())return;gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);dirty=false}
 const imgs=[];
 function load(i,uri,fallback=false){if(!shouldRun())return;const img=new Image();img.decoding='async';img.crossOrigin='anonymous';imgs.push(img);img.onload=()=>{if(!shouldRun())return;ctx.drawImage(img,(i%COLS)*W,Math.floor(i/COLS)*H,W,H);dirty=true;loaded++};img.onerror=()=>{if(!fallback)load(i,commonsThumbnailUrl(cards[i]),true);else failed++};img.src=uri}
 cards.forEach((card,i)=>load(i,new URL('../../assets/rws/'+card.id+'.jpg',import.meta.url).href));
 upload();return {tex,upload,stats:()=>({loaded,failed}),dispose(){imgs.forEach(i=>{i.onload=null;i.onerror=null;i.src=''});gl.deleteTexture(tex)}};
}
const norm=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix=(a,b,t)=>a+(b-a)*t;
const mix3=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
const rotY=(p,a)=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];
const rotX=(p,a)=>[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)];
function cardPose(point,t,turn,yaw,pitch,selectedPct){
 const s=smooth((t-.85)/2.3);
 const center=cardWorld(point,t,false);
 const r=point.radius*(1-.22*selectedPct);
 const center3=mix3(center,point.direction.map(n=>n*r),selectedPct);
 const p=rotX(rotY(center3,turn+yaw),pitch);
 const normal=norm(mix3([0,0,1],point.direction.map(v=>-v),s));
 let n=rotX(rotY(normal,turn+yaw),pitch);
 let right=norm(cross([0,1,0],n));if(Math.hypot(...right)<.3)right=[1,0,0];
 let up=norm(cross(n,right));
 const a=point.roll*s+(1-s)*.055*Math.sin(point.i*.71)+Math.sin(s*Math.PI)*(.25*Math.sin(point.i*.23+t*5)+.19*Math.cos(point.i*.58-t*7));
 const rr=right.map((v,i)=>Math.cos(a)*v+Math.sin(a)*up[i]);
 const uu=up.map((v,i)=>Math.cos(a)*v-Math.sin(a)*right[i]);
 return {position:p,normal:n,right:rr,up:uu};
}
function project(p,camZ,viewport){const z=camZ-p[2],f=viewport.h/(2*Math.tan(115*Math.PI/360));if(z<=.22)return null;return {x:viewport.w*.5+p[0]*f/z,y:viewport.h*.5-p[1]*f/z,z};}
function hitsQuad(x,y,c){return pointInQuad([x,y],c)}

export function mountPostShuffle({mount,deckIds,onComplete=()=>{},demo=false}={}){
 if(!mount||!Array.isArray(deckIds)||deckIds.length!==78||new Set(deckIds).size!==78)throw new Error('A unique 78-card ordered handoff is required');
 const cardMap=new Map(DECK.map(c=>[c.id,c]));if(deckIds.some(id=>!cardMap.has(id)))throw new Error('Unrecognized card identities');
 const cards=deckIds.map(id=>cardMap.get(id)),points=sphereLayout();
 let choices=[],selectedAt=new Map(),lastPointer=null,dragging=false,yaw=0,pitch=0,raf=0,dead=false,ready=false,lastDraw=0,step='launch';
 mount.innerHTML='<div class="ps-world" role="region" aria-label="Continuous post-shuffle Tarot sphere" id="ps-world">'+
  '<div class="ps-sky" id="ps-sky"><canvas class="ps-stars" id="ps-stars"></canvas></div>'+
  '<canvas id="ps-cards" class="ps-cards" aria-label="78 Tarot cards in a three-dimensional sphere. Drag to look around, tap a card to select it." tabindex="0"></canvas>'+
  '<header class="ps-header"><span class="ps-brand">✧ &nbsp; JuHua Speaks</span><span class="ps-guidance" id="ps-guidance" aria-live="polite">Please select 3 cards (0 cards selected)</span><span class="ps-stage" id="ps-stage">DECK IN FLIGHT</span></header>'+
  '<div class="ps-aura-layer" id="ps-auras" aria-hidden="true"></div>'+
  '<div class="ps-readout"><span id="ps-hint">The cards are taking their places…</span><button type="button" id="ps-pause" aria-pressed="false" aria-label="Pause sphere rotation">Ⅱ</button></div>'+
  '<div class="ps-selections" id="ps-selections" aria-label="Past Present Future selections"></div>'+
  '<p class="ps-end" id="ps-end" hidden>THREE CARDS SELECTED · STAGE 5 HELD FOR VISUAL APPROVAL</p></div>';
 const world=mount.querySelector('#ps-world'),canvas=mount.querySelector('#ps-cards'),auras=mount.querySelector('#ps-auras'),guidance=mount.querySelector('#ps-guidance');
 const auraNodes=new Map();
 const sky=initCelestialSky({mount:mount.querySelector('#ps-sky'),starCanvas:mount.querySelector('#ps-stars'),seed:0x7ac4fa2,reduceMotion:matchMedia('(prefers-reduced-motion:reduce)').matches});
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});
 if(!gl){sky.dispose();throw Error('WebGL2 is required for the physical Tarot sphere; graphics unavailable');}
 let program,vertexBuffer,vao,atlas;
 try{
  program=makeProgram(gl);vao=gl.createVertexArray();gl.bindVertexArray(vao);vertexBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
  const stride=8*4;for(const [location,count,offset] of [[0,3,0],[1,2,12],[2,1,20],[3,1,24],[4,1,28]]){gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,count,gl.FLOAT,false,stride,offset)}
  atlas=atlasTexture(gl,cards,()=>!dead);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
 }catch(e){sky.dispose();gl.deleteVertexArray(vao);gl.deleteBuffer(vertexBuffer);gl.deleteProgram(program);throw e}
 const uniform={focal:gl.getUniformLocation(program,'u_focal'),aspect:gl.getUniformLocation(program,'u_aspect'),near:gl.getUniformLocation(program,'u_near'),far:gl.getUniformLocation(program,'u_far'),atlas:gl.getUniformLocation(program,'u_atlas')};
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const start=performance.now(),roles=['Past','Present','Future'];
 let clock=0,clockFreeze=0,paused=false,camZ=12.6,rendered=[],viewport={w:1,h:1},debugTime=null;
 const selectedPct=id=>{const at=selectedAt.get(id);return at===undefined?0:smooth((performance.now()-at)/780)};
 function syncSlots(){const parent=mount.querySelector('#ps-selections');parent.innerHTML=roles.map((r,i)=>{
  const p=choices[i];return '<div class="ps-slot"><label>'+r+'</label><div class="ps-mark">'+(p?'✦':'·')+'</div>'+(p?'<button type="button" data-undo="'+p.id+'" aria-label="Undo '+r+' selection">UNDO</button>':'')+'</div>';}).join('');
  parent.classList.toggle('ps-visible',choices.length>0);guidance.textContent='Please select 3 cards ('+choices.length+' cards selected)';
  const done=choices.length===3;mount.querySelector('#ps-end').hidden=!done;
  if(done)onComplete(choices.map(x=>({...x})));
 }
 syncSlots();
 function changePause(){paused=!paused;const button=mount.querySelector('#ps-pause');button.textContent=paused?'▶':'Ⅱ';button.setAttribute('aria-pressed',String(paused))}
 mount.querySelector('#ps-pause').addEventListener('click',changePause);
 mount.addEventListener('click',e=>{const id=e.target.closest('[data-undo]')?.dataset.undo;if(!id)return;choices=choices.filter(c=>c.id!==id);selectedAt.delete(id);syncSlots()});
 const projectCorner=(pos,right,up,sx,sy)=>[pos[0]+sx*.56*right[0]+sy*.86*up[0],pos[1]+sx*.56*right[1]+sy*.86*up[1],pos[2]+sx*.56*right[2]+sy*.86*up[2]];
 function computeGeometry(t){
  const angle=orbitAngle(t)+yaw,cam=cameraDistance(t),vertex=[],visible=[];
  camZ=cam;
  for(let i=0;i<78;i++){
   const id=deckIds[i],selected=selectedAt.has(id),pct=selected?selectedPct(id):0;
   const p=cardPose(points[i],t,angle,0,pitch,pct);
   const corners=[projectCorner(p.position,p.right,p.up,-1,-1),projectCorner(p.position,p.right,p.up,1,-1),projectCorner(p.position,p.right,p.up,1,1),projectCorner(p.position,p.right,p.up,-1,1)];
   const projected=corners.map(pt=>project(pt,cam,viewport));const center=project(p.position,cam,viewport);
   if(projected.some(p=>!p)||!center)continue;
   // Exterior faces are genuine licensed/public-domain scans. Once the camera
   // enters the shell, the interior is the blue back of the same physical card.
   const side=dot(p.normal,[0,0,cam].map((c,j)=>c-p.position[j]))>=0?1:0;
   const order=[0,1,2,0,2,3],uv=[[0,0],[1,0],[1,1],[0,1]];
   for(const k of order){const c=corners[k];vertex.push(c[0],c[1],c[2]-cam,uv[k][0],uv[k][1],i,side,selected?1:0)}
   if(center.x>-170&&center.x<viewport.w+170&&center.y>-220&&center.y<viewport.h+220)visible.push({id,index:i,corners:projected,center,side,selected,depth:center.z});
  }
  return {vertices:new Float32Array(vertex),visible};
 }
 function updateAuras(){
  const active=new Set();
  for(const p of rendered){if(!p.selected)continue;active.add(p.id);
   let el=auraNodes.get(p.id);if(!el){el=document.createElement('div');el.className='ps-selected-halo';auras.append(el);auraNodes.set(p.id,el)}
   const w=Math.hypot(p.corners[1].x-p.corners[0].x,p.corners[1].y-p.corners[0].y);
   const h=Math.hypot(p.corners[3].x-p.corners[0].x,p.corners[3].y-p.corners[0].y);
   el.style.cssText='left:'+p.center.x+'px;top:'+p.center.y+'px;width:'+Math.max(20,w*1.25)+'px;height:'+Math.max(34,h*1.2)+'px;';
  }
  for(const [id,node] of auraNodes)if(!active.has(id)){node.remove();auraNodes.delete(id)}
 }
 function draw(now){if(dead)return;raf=requestAnimationFrame(draw);const dt=Math.min(64,Math.max(0,now-lastDraw||0));lastDraw=now;
  if(paused){clockFreeze+=dt;return}
  const elapsed=debugTime===null?(now-start-clockFreeze)/1000:debugTime;
  t=debugTime!==null?elapsed:(reduced?Math.max(elapsed,7.05):elapsed);
  if(!reduced&&now-(draw.lastFrame||0)<23)return;draw.lastFrame=now;
  const rect=world.getBoundingClientRect();if(rect.width<10||rect.height<10)return;
  const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  viewport={w:rect.width,h:rect.height};if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
  const state=getStage(t,choices.length);step=state;world.dataset.beat=state;
  ready=t>=BEATS.interactive;
  mount.querySelector('#ps-stage').textContent=state==='launch'?'DECK IN FLIGHT':state==='distribute'?'CARDS UNFOLDING':state==='enter'?'ENTERING THE SPHERE':state==='inside'?'INSIDE THE UNIVERSE':'YOUR SELECTION';
  mount.querySelector('#ps-hint').textContent=ready?'Drag to look around · Tap a card to choose':'The cards are taking their places…';
  const data=computeGeometry(t);rendered=data.visible;
  atlas.upload();gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.bindVertexArray(vao);gl.uniform1f(uniform.focal,1/Math.tan(115*Math.PI/360));gl.uniform1f(uniform.aspect,rect.width/rect.height);gl.uniform1f(uniform.near,.07);gl.uniform1f(uniform.far,100);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlas.tex);gl.uniform1i(uniform.atlas,0);gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,data.vertices,gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,data.vertices.length/8);
  updateAuras();
 }
 let t=0;
 function hitCandidates(x,y){const rect=canvas.getBoundingClientRect(),localX=x-rect.left,localY=y-rect.top;
  return rendered.filter(p=>p.side===1&&hitsQuad(localX,localY,p.corners)).sort((a,b)=>a.depth-b.depth);
 }
 function tap(x,y){if(!ready||dead)return null;
  const candidates=hitCandidates(x,y);
  const candidate=candidates[0];if(!candidate)return null;
  const previous=choices;
  choices=selectCard(choices,deckIds,candidate.id,drawOrientation());
  if(previous===choices)return null;
  if(choices.some(c=>c.id===candidate.id))selectedAt.set(candidate.id,performance.now());else selectedAt.delete(candidate.id);
  syncSlots();return candidate.id;
 }
 canvas.addEventListener('pointerdown',e=>{if(!ready)return;lastPointer={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch,moved:false};});
 canvas.addEventListener('pointermove',e=>{if(!lastPointer||lastPointer.id!==e.pointerId)return;const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;if(Math.hypot(dx,dy)>7)lastPointer.moved=true;if(lastPointer.moved){yaw=lastPointer.yaw+dx*.0043;pitch=clamp(lastPointer.pitch+dy*.004,-1.05,1.05);}});
 window.addEventListener('pointerup',e=>{if(!lastPointer||lastPointer.id!==e.pointerId)return;const {moved}=lastPointer;lastPointer=null;if(!moved)tap(e.clientX,e.clientY)});
 window.addEventListener('pointercancel',()=>{lastPointer=null});
 canvas.addEventListener('keydown',e=>{if(!ready)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){yaw+=(e.key==='ArrowLeft'?-1:1)*.21;e.preventDefault()}if(e.key==='ArrowUp'||e.key==='ArrowDown'){pitch=clamp(pitch+(e.key==='ArrowUp'?-1:1)*.12,-1.05,1.05);e.preventDefault()}});
 raf=requestAnimationFrame(draw);
 return {
  stage:()=>step,selected:()=>choices.map(c=>({...c})),deck:()=>[...deckIds],assetStatus:()=>atlas.stats(),ready:()=>ready,
  visible:()=>rendered.map(p=>({id:p.id,side:p.side,selected:p.selected,x:p.center.x,y:p.center.y,depth:p.depth})),
  time:()=>t,tap,hitTest:hitCandidates,togglePause:changePause,seek(seconds){if(!demo)throw Error('Timeline seek is review-only');debugTime=clamp(seconds,0,60)},clearSeek(){debugTime=null},
  dispose(){dead=true;cancelAnimationFrame(raf);sky.dispose();atlas.dispose();gl.deleteBuffer(vertexBuffer);gl.deleteVertexArray(vao);gl.deleteProgram(program);world.remove()}
 };
}
