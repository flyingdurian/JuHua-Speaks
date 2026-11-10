/**
 * JuHua post-shuffle Gate C — one continuous 3D shot.
 * FINISH SHUFFLING -> deck launch -> rotating spherical distribution -> camera passes
 * through sphere -> three interactive selections. No gate, cube or second shuffle.
 *
 * Actual WebGL2 card surfaces, stable identity and deterministic world coordinates.
 * A selected card moves in its own world coordinate; transient halos are accents.
 */
import {DECK,commonsThumbnailUrl,drawOrientation,BY_ID} from '../../src/deck.mjs';
import {buildDemoReading} from '../../src/demo-reading.mjs';
import {renderReadingStage,handoffDuration,READING_CHAPTERS} from './reading-stage.mjs';
import {initCelestialSky} from '../../src/ritual-world/CelestialSky.mjs';
import {paintCelestialBack} from '../../src/ritual-world/EngravedBack.mjs';
import {SPHERE_VERTEX_STRIDE,extrudedCardVertices} from './PhysicalSphereMesh.mjs';
import {chooseFoilFinish,createTarotTableau} from './TarotTableau.mjs';
import {createSelectionHandoff,HANDOFF_SETTLE_MS} from './SelectionHandoff.mjs';
import {BEATS,sphereLayout,clamp,smooth,cardWorld,orbitAngle,cameraDistance,gyroAttitude,selectCard,getStage,perspectiveFocal,pickProjectedCard,orbitYaw,selectionRise,CAMERA_CLIP_NEAR,CAMERA_NEAR,clipCardNearPlane} from './geometry.mjs';

const W=174,H=288,COLS=10,ROWS=8,ATLAS_W=W*COLS,ATLAS_H=H*ROWS;
const vs=`#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec2 a_uv;
layout(location=2) in float a_slot;
layout(location=3) in float a_side;
layout(location=4) in float a_selected;
layout(location=5) in float a_alpha;
uniform float u_focal;
uniform float u_aspect;
uniform float u_near;
uniform float u_far;
out vec2 v_uv;
flat out float v_slot;
flat out float v_side;
out float v_selected;
out float v_alpha;
void main(){
 float z=a_position.z;
 gl_Position=vec4(u_focal*a_position.x/u_aspect,u_focal*a_position.y,
 (u_far+u_near)/(u_near-u_far)*z+(2.0*u_far*u_near)/(u_near-u_far),-z);
 v_uv=a_uv;v_slot=a_slot;v_side=a_side;v_selected=a_selected;v_alpha=a_alpha;
}`;
const fs=`#version 300 es
precision highp float;
in vec2 v_uv;
flat in float v_slot;
flat in float v_side;
in float v_selected;
in float v_alpha;
uniform sampler2D u_atlas;
uniform float u_time;
out vec4 frag;
void main(){
 if(v_alpha<.006)discard;
 if(v_slot<-.5){
  // Actual side-faces give the inward sphere its visibly thin 3D depth.
  float thread=sin(v_uv.y*47.)*.06;
  vec3 paper=mix(vec3(.78,.78,.80),vec3(.20,.31,.47),.36+thread);
  frag=vec4(paper,v_alpha);return;
 }
 float slot=mix(78.0,v_slot,v_side);
 float col=mod(slot,10.0),row=floor(slot/10.0);
 vec2 uv=vec2((col+mix(.012,.988,v_uv.x))/10.0,1.0-(row+mix(.012,.988,1.0-v_uv.y))/8.0);
 vec4 tex=texture(u_atlas,uv);
 float edge=min(min(v_uv.x,1.-v_uv.x),min(v_uv.y,1.-v_uv.y));
 if(v_selected>.001){
  // Gold light is attached to the CARD UVs, not an imprecise DOM halo.
  float rim=1.-smoothstep(.012,.093,edge);
  float sweep=exp(-pow((v_uv.x*.84+v_uv.y*.45)-fract(u_time*.23),2.)*85.);
  float spec=pow(max(0.,sin(u_time*2.8+v_uv.x*6.+v_uv.y*7.)),4.);
  vec3 reflective=vec3(.56,.41,.16)*rim+vec3(.62,.53,.38)*sweep+vec3(.16,.13,.12)*spec;
  tex.rgb+=reflective*v_selected;
 }
 frag=vec4(tex.rgb,v_alpha);
}`;

function compile(gl,type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader error '+gl.getShaderInfoLog(shader));return shader;}
function makeProgram(gl){const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Program error '+gl.getProgramInfoLog(p));return p;}
function backArt(ctx,x,y){
 paintCelestialBack(ctx,x,y,W,H);
}
function fallbackFace(ctx,x,y,card){
 // Never substitute invented Tarot illustrations for missing historical RWS art.
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#131827';ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='#b2ac9c';ctx.lineWidth=2;ctx.strokeRect(6,7,W-12,H-14);
 ctx.textAlign='center';ctx.fillStyle='#e0caba';ctx.font='bold 14px Arial,sans-serif';
 ctx.fillText('RWS ART',W/2,H/2-13);ctx.fillText('UNAVAILABLE',W/2,H/2+7);
 ctx.fillStyle='#9e9c9e';ctx.font='11px Arial,sans-serif';ctx.fillText(card.id.replace(/_/g,' ').slice(0,21),W/2,H-26);
 ctx.restore();
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
 const inside=smooth((t-4.5)/2.15);
 const direction=norm(mix3(point.direction,point.insideDirection??point.direction,inside));
 const r=point.radius*(1-.125*selectedPct); // unmistakable in-world lift
 const center3=mix3(center,direction.map(n=>n*r),selectedPct);
 const gyro=gyroAttitude(t);
 const p=rotX(rotY(center3,turn+yaw),pitch+gyro.pitch);
 p[1]+=selectionRise(selectedPct,t,point.i); // chosen card visibly ascends while its halo forms
 const normal=norm(mix3([-.70,-.12,-.69],direction,s)); // illustrated faces OUT, navy backs IN
 let n=rotX(rotY(normal,turn+yaw),pitch+gyro.pitch);
 let right=norm(cross([0,1,0],n));if(Math.hypot(...right)<.3)right=[1,0,0];
 let up=norm(cross(n,right));
 const a=point.roll*s-.045*(1-s)+gyro.roll+Math.sin(Math.PI*s)*.35*Math.sin(point.i*.47+t*5.4); // all stacked sheets remain aligned until unfolding
 const rr=right.map((v,i)=>Math.cos(a)*v+Math.sin(a)*up[i]);
 const uu=up.map((v,i)=>Math.cos(a)*v-Math.sin(a)*right[i]);
 return {position:p,normal:n,right:rr,up:uu};
}
function project(p,camZ,viewport){const z=camZ-p[2],f=viewport.h*.5*perspectiveFocal();if(z<CAMERA_CLIP_NEAR)return null;return {x:viewport.w*.5+p[0]*f/z,y:viewport.h*.5-p[1]*f/z,z};}
function insideTriangle(x,y,a,b,c){const v0=[c.x-a.x,c.y-a.y],v1=[b.x-a.x,b.y-a.y],v2=[x-a.x,y-a.y];const d00=dot(v0,v0),d01=dot(v0,v1),d02=dot(v0,v2),d11=dot(v1,v1),d12=dot(v1,v2),den=d00*d11-d01*d01;if(Math.abs(den)<.001)return false;const v=(d11*d02-d01*d12)/den,w=(d00*d12-d01*d02)/den;return v>=0&&w>=0&&v+w<=1;}
function hitsQuad(x,y,c){return insideTriangle(x,y,c[0],c[1],c[2])||insideTriangle(x,y,c[0],c[2],c[3]);}

export function mountPostShuffle({mount,deckIds,question='',onComplete=()=>{},demo=false}={}){
 if(!mount||!Array.isArray(deckIds)||deckIds.length!==78||new Set(deckIds).size!==78)throw new Error('A unique 78-card ordered handoff is required');
 const cardMap=new Map(DECK.map(c=>[c.id,c]));if(deckIds.some(id=>!cardMap.has(id)))throw new Error('Unrecognized card identities');
 const cards=deckIds.map(id=>cardMap.get(id)),points=sphereLayout();
 let choices=[],selectedAt=new Map(),lastPointer=null,yaw=0,pitch=0,raf=0,dead=false,ready=false,lastDraw=0,step='launch';

 let lockAt=null,tableau=null,tableauShown=false,handoff=null;const pickAnchors=new Map();
 let readingStarted=false,readingTimer=null,readingChapter=-1,resourcesDisposed=false;
 const readingQuestion=typeof question==='string'&&question.trim().length>=3&&question.length<=600
  ?question.trim():'What can these cards help me reflect on?';
 function readingDemo(){
  return buildDemoReading({question:readingQuestion,picks:choices.map(c=>({card:BY_ID.get(c.id),orientation:c.orientation})),
   spread:'insight',lens:'western',lang:'en',options:['','']});
 }
 function disposeSphereResources(){
  if(resourcesDisposed)return;
  resourcesDisposed=true;
  sky.dispose();handoff?.dispose();tableau?.dispose();atlas.dispose();
  gl.deleteBuffer(vertexBuffer);gl.deleteVertexArray(vao);gl.deleteProgram(program);
 }
 function renderReading(){
  if(!readingStarted)return;
  world.innerHTML=renderReadingStage({choices,cardsById:BY_ID,demo:readingDemo(),
   chapter:readingChapter,question:readingQuestion});
 }
 function goReading(){
  if(dead||lockAt===null||tableau?.revealed!==3||readingStarted)return false;
  readingStarted=true;ready=false;step='reading';world.dataset.beat='reading';
  cancelAnimationFrame(raf);disposeSphereResources();renderReading();
  world.querySelector('#artemis-reading-title')?.focus({preventScroll:true});
  return true;
 }
 function beginReading(){
  if(dead||lockAt===null||!tableauShown||tableau?.revealed!==3||readingStarted||readingTimer!==null)return false;
  step='reading-transition';world.dataset.beat='reading-transition';ready=false;
  const veil=document.createElement('div');veil.className='reading-handoff-veil';veil.setAttribute('role','status');
  veil.setAttribute('aria-live','polite');
  veil.innerHTML='<div class="reading-handoff-aura" aria-hidden="true"><span>✧</span></div><p>THE CARDS ARE READY TO SPEAK</p>';
  world.append(veil);
  readingTimer=setTimeout(()=>{readingTimer=null;if(!dead)goReading()},handoffDuration(reduced));
  return true;
 }
 function updateReadingChapter(next){
  if(!readingStarted||!READING_CHAPTERS.includes(next))return false;
  readingChapter=next;renderReading();
  world.querySelector('#artemis-chapter-title')?.focus({preventScroll:true});return true;
 }
 const handleReadingControls=event=>{
  if(!readingStarted||dead)return;
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-reading-chapter')){updateReadingChapter(Number(button.dataset.readingChapter));return;}
  if(button.dataset.action==='reading-prev'){updateReadingChapter(Math.max(-1,readingChapter-1));return;}
  if(button.dataset.action==='reading-next'){updateReadingChapter(readingChapter===3?0:readingChapter+1);return;}
 };
 mount.addEventListener('click',handleReadingControls);
 const sessionFoil=chooseFoilFinish();
 mount.innerHTML='<div class="ps-world" role="region" aria-label="Continuous post-shuffle Tarot sphere" id="ps-world">'+
  '<div class="ps-sky" id="ps-sky"><canvas class="ps-stars" id="ps-stars"></canvas></div>'+
  '<canvas id="ps-cards" class="ps-cards" aria-label="78 Tarot cards in a three-dimensional sphere. Drag to look around, tap a card to select it." tabindex="0"></canvas>'+
  '<header class="ps-header"><span class="ps-brand">✧ &nbsp; JuHua Speaks</span><span class="ps-guidance" id="ps-guidance" aria-live="polite">Please select 3 cards (0 cards selected)</span><span class="ps-stage" id="ps-stage">DECK IN FLIGHT</span></header>'+
  '<div class="ps-readout"><span id="ps-hint">The cards are taking their places…</span><button type="button" id="ps-pause" aria-pressed="false" aria-label="Pause sphere rotation">Ⅱ</button></div>'+
  '<div class="ps-selections" id="ps-selections" aria-label="Past Present Future selections"></div>'+
  '<p class="ps-end" id="ps-end" hidden>THREE CARDS SELECTED · CONTINUE HELD FOR VISUAL REVIEW</p></div>';
 const world=mount.querySelector('#ps-world'),canvas=mount.querySelector('#ps-cards'),guidance=mount.querySelector('#ps-guidance');
 const sky=initCelestialSky({mount:mount.querySelector('#ps-sky'),starCanvas:mount.querySelector('#ps-stars'),seed:0x7ac4fa2,reduceMotion:matchMedia('(prefers-reduced-motion:reduce)').matches});
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});
 if(!gl){sky.dispose();throw Error('WebGL2 is required for the physical Tarot sphere; graphics unavailable');}
 let program,vertexBuffer,vao,atlas;
 try{
  program=makeProgram(gl);vao=gl.createVertexArray();gl.bindVertexArray(vao);vertexBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
  const stride=SPHERE_VERTEX_STRIDE*4;for(const [location,count,offset] of [[0,3,0],[1,2,12],[2,1,20],[3,1,24],[4,1,28],[5,1,32]]){gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,count,gl.FLOAT,false,stride,offset)}
  atlas=atlasTexture(gl,cards,()=>!dead);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 }catch(e){sky.dispose();gl.deleteVertexArray(vao);gl.deleteBuffer(vertexBuffer);gl.deleteProgram(program);throw e}
 const uniform={focal:gl.getUniformLocation(program,'u_focal'),aspect:gl.getUniformLocation(program,'u_aspect'),near:gl.getUniformLocation(program,'u_near'),far:gl.getUniformLocation(program,'u_far'),atlas:gl.getUniformLocation(program,'u_atlas'),time:gl.getUniformLocation(program,'u_time')};
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const start=performance.now(),roles=['Past','Present','Future'];
 let clock=0,clockFreeze=0,paused=false,camZ=12.6,rendered=[],viewport={w:1,h:1};
 const selectedPct=id=>{const at=selectedAt.get(id);return at===undefined?0:smooth((performance.now()-at)/780)};
 function syncSlots(){
  const parent=mount.querySelector('#ps-selections');
  parent.innerHTML=roles.map((r,i)=>{
   const p=choices[i];
   return '<div class="ps-slot"><label>'+r+'</label><div class="ps-mark">'+(p?'✦':'·')+'</div>'+
    (p&&!lockAt?'<button type="button" data-undo="'+p.id+'" aria-label="Undo '+r+' selection">UNDO</button>':'')+'</div>';
  }).join('');
  // Selection is communicated by the moving gold-highlighted cards, not HUD slots.
  parent.classList.remove('ps-visible');
  guidance.textContent='Please select 3 cards ('+choices.length+' cards selected)';
  if(choices.length===3&&!lockAt){
   lockAt=performance.now();
   tableau=createTarotTableau({mount:world,picks:choices,foil:sessionFoil,onBeginReading:beginReading});
   // Render target rectangles while they are transparent. Ghosts animate
   // from the real 3D projected positions into these exact card positions.
   tableau.prepareHandoff();
   handoff=createSelectionHandoff({world,picks:choices,anchors:pickAnchors,
    buttons:tableau.destinations,backUrl:tableau.backUrl,reducedMotion:reduced});
   parent.classList.remove('ps-visible');
   guidance.textContent='Your three cards are taking their places';
  }
 }
 syncSlots();
 function changePause(){
  if(lockAt!==null)return;
  paused=!paused;
  const button=mount.querySelector('#ps-pause');
  button.textContent=paused?'▶':'Ⅱ';button.setAttribute('aria-pressed',String(paused));
 }
 mount.querySelector('#ps-pause').addEventListener('click',changePause);
 mount.addEventListener('click',e=>{
  if(lockAt!==null)return;
  const id=e.target.closest('[data-undo]')?.dataset.undo;if(!id)return;
  choices=choices.filter(c=>c.id!==id);selectedAt.delete(id);syncSlots();
 });
 const lockProgress=()=>lockAt===null?0:smooth((performance.now()-lockAt)/1600);
 const projectCorner=(pos,right,up,sx,sy,scale=1)=>[pos[0]+scale*(sx*.43*right[0]+sy*.70*up[0]),pos[1]+scale*(sx*.43*right[1]+sy*.70*up[1]),pos[2]+scale*(sx*.43*right[2]+sy*.70*up[2])];
 function computeGeometry(t){
  const angle=orbitAngle(t)+yaw,cam=cameraDistance(t),vertex=[],visible=[];
  const collapse=lockProgress();
  camZ=cam;
  for(let i=0;i<78;i++){
   const id=deckIds[i],selected=selectedAt.has(id),pct=selected?selectedPct(id):0;
   const p=cardPose(points[i],t,angle,0,pitch,pct);
   let alpha=1;
   if(lockAt!==null){
    if(selected){
     const place=choices.findIndex(x=>x.id===id);
     const target=[(place-1)*1.54,-.04,-3.35];
     p.position=mix3(p.position,target,collapse);
     p.normal=norm(mix3(p.normal,[0,0,-1],collapse));
     p.right=norm(mix3(p.right,[1,0,0],collapse));
     p.up=norm(mix3(p.up,[0,1,0],collapse));
     alpha=1-smooth((collapse-.80)/.20);
    }else{
     // Unchosen cards spiral out of the universe instead of snapping away.
     const drift=norm(p.position);
     const tangent=norm(cross([0,1,0],drift));
     const spiral=.95*Math.sin(Math.PI*collapse);
     p.position=p.position.map((v,j)=>v+drift[j]*3.7*collapse+tangent[j]*spiral);
     alpha=1-smooth(collapse);
    }
   }
   if(alpha<.006)continue;
   const sheetScale=1-.26*smooth((t-4.4)/2.35); // smaller, denser interior card silhouettes
   const corners=[
    projectCorner(p.position,p.right,p.up,-1,-1,sheetScale),projectCorner(p.position,p.right,p.up,1,-1,sheetScale),
    projectCorner(p.position,p.right,p.up,1,1,sheetScale),projectCorner(p.position,p.right,p.up,-1,1,sheetScale)
   ];
   if(clipCardNearPlane(corners,cam).length<3)continue;
   const projected=corners.map(pt=>project(pt,cam,viewport)),center=project(p.position,cam,viewport);
   const side=dot(p.normal,[0,0,cam].map((c,j)=>c-p.position[j]))>=0?1:0;
   vertex.push(...extrudedCardVertices({corners,normal:p.normal,cameraZ:cam,slot:i,selected:pct,alpha}));
   if(!lockAt&&center&&projected.every(Boolean)&&center.x>-170&&center.x<viewport.w+170&&center.y>-220&&center.y<viewport.h+220)
    visible.push({id,index:i,corners:projected,center,side,selected,depth:center.z});
  }
  return {vertices:new Float32Array(vertex),visible};
 }
 function draw(now){if(dead||readingStarted)return;raf=requestAnimationFrame(draw);const dt=Math.min(64,Math.max(0,now-lastDraw||0));lastDraw=now;
  if(paused){clockFreeze+=dt;return}
  const elapsed=(now-start-clockFreeze)/1000;t=reduced?Math.max(elapsed,7.05):elapsed;
  if(!reduced&&now-(draw.lastFrame||0)<23)return;draw.lastFrame=now;
  const rect=world.getBoundingClientRect();if(rect.width<10||rect.height<10)return;
  const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  viewport={w:rect.width,h:rect.height};if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
  const state=lockAt!==null?'tableau':getStage(t,choices.length);step=state;world.dataset.beat=state;
  ready=t>=BEATS.interactive&&lockAt===null;
  if(lockAt!==null&&!tableauShown&&performance.now()-lockAt>=HANDOFF_SETTLE_MS){
   tableauShown=true;tableau?.finishHandoff();
   onComplete(choices.map(x=>({...x})));
   mount.querySelector('#ps-pause').hidden=true;
   mount.querySelector('#ps-selections').classList.remove('ps-visible');
  }
  mount.querySelector('#ps-stage').textContent=state==='launch'?'DECK IN FLIGHT':state==='distribute'?'CARDS UNFOLDING':state==='enter'?'ENTERING THE SPHERE':state==='inside'?'INSIDE THE UNIVERSE':state==='tableau'?'PAST · PRESENT · FUTURE':'YOUR SELECTION';
  mount.querySelector('#ps-hint').textContent=atlas.stats().failed>0?'RWS artwork unavailable on '+atlas.stats().failed+' cards · Please sync assets':lockAt!==null?(tableauShown?'Choose a card to turn it over':'Your chosen cards are arriving…'):ready?'Pan left or right · Tap a card to choose':'The cards are taking their places…';
  const data=computeGeometry(t);rendered=data.visible;
  atlas.upload();gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.bindVertexArray(vao);gl.uniform1f(uniform.focal,perspectiveFocal());gl.uniform1f(uniform.aspect,rect.width/rect.height);gl.uniform1f(uniform.near,CAMERA_NEAR);gl.uniform1f(uniform.far,100);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlas.tex);gl.uniform1i(uniform.atlas,0);gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,data.vertices,gl.DYNAMIC_DRAW);gl.uniform1f(uniform.time,t);gl.drawArrays(gl.TRIANGLES,0,data.vertices.length/SPHERE_VERTEX_STRIDE);

 }
 let t=0;
 function tap(x,y){if(!ready||dead||lockAt!==null)return null;const rect=canvas.getBoundingClientRect(),localX=x-rect.left,localY=y-rect.top;
  // Forgiving CSS-pixel polygon test; resolve overlapping cards by depth.
  const candidate=pickProjectedCard(rendered,localX,localY,{tolerance:11});if(!candidate)return null;
  const previous=choices;
  choices=selectCard(choices,deckIds,candidate.id,drawOrientation());
  if(previous===choices)return null;
  if(choices.some(c=>c.id===candidate.id)){
   selectedAt.set(candidate.id,performance.now());
   // Record actual selectable 3D corners at the moment each pick occurs.
   pickAnchors.set(candidate.id,{corners:candidate.corners.map(p=>({...p}))});
  }else{selectedAt.delete(candidate.id);pickAnchors.delete(candidate.id);}
  syncSlots();return candidate.id;
 }
 canvas.addEventListener('pointerdown',e=>{if(!ready||lastPointer)return;lastPointer={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,moved:false};canvas.setPointerCapture?.(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!lastPointer||lastPointer.id!==e.pointerId)return;const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;if(Math.hypot(dx,dy)>7)lastPointer.moved=true;if(lastPointer.moved){yaw=orbitYaw(lastPointer.yaw,dx*.0043);}}); // unbounded full 360-degree orbit
 let skipTap=false;
 canvas.addEventListener('pointerup',e=>{if(!lastPointer||lastPointer.id!==e.pointerId)return;skipTap=lastPointer.moved;lastPointer=null;if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId)});
 canvas.addEventListener('click',e=>{if(!ready)return;if(!skipTap)tap(e.clientX,e.clientY);skipTap=false});
 canvas.addEventListener('pointercancel',()=>{lastPointer=null});
 canvas.addEventListener('keydown',e=>{if(!ready)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){yaw=orbitYaw(yaw,(e.key==='ArrowLeft'?-1:1)*.21);e.preventDefault()}});
 raf=requestAnimationFrame(draw);
 return {
  stage:()=>step,selected:()=>choices.map(c=>({...c})),deck:()=>[...deckIds],assetStatus:()=>atlas.stats(),ready:()=>ready,
  visible:()=>rendered.map(p=>({id:p.id,side:p.side,selected:p.selected,x:p.center.x,y:p.center.y,depth:p.depth})),
  time:()=>t,tap,togglePause:changePause,orbitYaw:()=>yaw,artOverlay:()=>tableau?.artOverlay??sessionFoil,hologram:()=>tableau?.hologram??sessionFoil,
  foil:()=>tableau?.artOverlay??sessionFoil,readingChapter:()=>readingChapter,readingReady:()=>tableauShown&&tableau?.revealed===3,beginReading,tableau:()=>({active:tableauShown,revealed:tableau?.revealed||0,artOverlay:tableau?.artOverlay??sessionFoil}),
  dispose(){
   dead=true;cancelAnimationFrame(raf);if(readingTimer!==null)clearTimeout(readingTimer);
   mount.removeEventListener('click',handleReadingControls);disposeSphereResources();world.remove();
  }
 };
}
