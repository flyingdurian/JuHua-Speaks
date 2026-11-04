/**
 * JuHua Speaks 0.5 — the camera is INSIDE the star sphere, at its center.
 * Card fronts are never synthesized: the procedural GPU texture is the shared
 * decorative card BACK only. Original RWS face art remains separate JPEG scans.
 */
export const SPHERE_RADIUS=6.4;
export const CARD_WIDTH=1.06;
export const CARD_HEIGHT=1.72;
export const FIELD_OF_VIEW=Math.PI/2.75; // ~65.5 degrees
const ROWS=6;
const COLS=13;
const ROW_LATITUDES=[-66,-40,-14,14,40,66];
const PI2=Math.PI*2;

/** Predictable 6×13 celestial bands rather than irregular exterior clustering. */
export function sphereLayout(count=78){
 if(!Number.isSafeInteger(count)||count<2)throw new RangeError('Sphere requires at least two cards');
 return Array.from({length:count},(_,i)=>{
  const row=Math.floor(i/COLS),col=i%COLS;
  const latitude=(ROW_LATITUDES[row%ROWS]??0)*Math.PI/180;
  const yaw=PI2*(col+(row%2)*.5+(Math.floor(row/ROWS)*.19))/COLS;
  const normal=[Math.sin(yaw)*Math.cos(latitude),Math.sin(latitude),Math.cos(yaw)*Math.cos(latitude)];
  return {center:normal.map(v=>v*SPHERE_RADIUS),normal,latitude,yaw,row,column:col};
 });
}
export function rotatePoint([x,y,z],rx,ry){
 const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
 const xx=x*cy+z*sy,zz=-x*sy+z*cy;
 return [xx,y*cx-zz*sx,y*sx+zz*cx];
}
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];
export function cardAxes(point,rx=0,ry=0){
 const {yaw,latitude}=point;
 const right=rotatePoint([-Math.cos(yaw),0,Math.sin(yaw)],rx,ry);
 const up=rotatePoint([-Math.sin(latitude)*Math.sin(yaw),Math.cos(latitude),-Math.sin(latitude)*Math.cos(yaw)],rx,ry);
 return {right,up};
}
/** Projection into an inward-looking camera at the origin, facing -Z. */
export function projectPoint(point,width,height){
 if(point[2]>=-.05||width<=0||height<=0)return null;
 const focal=height/(2*Math.tan(FIELD_OF_VIEW/2));
 return {x:width/2+focal*point[0]/-point[2],y:height/2-focal*point[1]/-point[2],scale:focal/-point[2],depth:-point[2]};
}
/** Ray-to-card-plane picking; doesn't accidentally select cards behind the viewer. */
export function pickSphereCard(layout,ids,selection,rx,ry,x,y,width,height){
 if(width<=0||height<=0)return null;
 const focal=height/(2*Math.tan(FIELD_OF_VIEW/2));
 const unnormalized=[(x-width/2)/focal,(height/2-y)/focal,-1];
 const length=Math.hypot(...unnormalized);
 const ray=unnormalized.map(n=>n/length);
 let result=null;
 for(let i=0;i<layout.length;i++){
  if(selection.has(ids[i]))continue;
  const center=rotatePoint(layout[i].center,rx,ry);
  if(center[2]>=-.1)continue;
  const n=rotatePoint(layout[i].normal,rx,ry);
  const facing=dot(n,ray);
  if(facing<=.03)continue;
  const t=dot(n,center)/facing;
  if(t<=0)continue;
  const hit=ray.map(v=>v*t);
  const delta=add(hit,center,-1);
  const {right,up}=cardAxes(layout[i],rx,ry);
  const horizontal=dot(delta,right),vertical=dot(delta,up);
  if(Math.abs(horizontal)>CARD_WIDTH*.51||Math.abs(vertical)>CARD_HEIGHT*.51)continue;
  const score=t+(.01*Math.hypot(horizontal,vertical));
  if(!result||score<result.score)result={id:ids[i],score};
 }
 return result?.id??null;
}
const VERT=`#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec2 a_uv;
layout(location=2) in float a_light;
uniform mat4 u_projection;
out vec2 v_uv;
out float v_light;
void main(){gl_Position=u_projection*vec4(a_position,1.0);v_uv=a_uv;v_light=a_light;}`;
const FRAG=`#version 300 es
precision mediump float;
in vec2 v_uv;in float v_light;
uniform sampler2D u_back;uniform float u_time;
out vec4 outColor;
void main(){
 vec4 tex=texture(u_back,v_uv);
 float streak=pow(max(0.0,1.0-abs(v_uv.x*1.35+v_uv.y*.38-mod(u_time*.11,2.35))),13.0);
 vec3 rgb=tex.rgb*(.74+.26*v_light)+vec3(.17,.15,.10)*streak*.27;
 outColor=vec4(rgb,tex.a);
}`;
function compile(gl,type,source){
 const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const err=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error('WebGL shader: '+err)}
 return shader;
}
function program(gl,vs,fs){
 const a=compile(gl,gl.VERTEX_SHADER,vs),b=compile(gl,gl.FRAGMENT_SHADER,fs),p=gl.createProgram();
 gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);gl.deleteShader(a);gl.deleteShader(b);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const err=gl.getProgramInfoLog(p);gl.deleteProgram(p);throw new Error('WebGL program: '+err)}return p;
}
/** Canvas rendering mirrors the CSS back: navy gradient, two fine gold borders, central sun sigil. */
function cardBackTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=416;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('2D canvas unavailable');
 const grad=ctx.createRadialGradient(128,170,20,128,185,260);
 grad.addColorStop(0,'#3c4c76');grad.addColorStop(.58,'#1b274b');grad.addColorStop(1,'#12172c');
 ctx.fillStyle='#d2ad75';ctx.fillRect(0,0,256,416);ctx.fillStyle=grad;ctx.fillRect(8,8,240,400);
 ctx.lineWidth=2;ctx.strokeStyle='#e5c48c';ctx.strokeRect(14,14,228,388);
 ctx.lineWidth=1;ctx.strokeStyle='#bd9968';ctx.strokeRect(26,26,204,364);
 ctx.beginPath();ctx.arc(128,205,68,0,PI2);ctx.stroke();ctx.beginPath();ctx.arc(128,205,52,0,PI2);ctx.stroke();
 for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(128+Math.sin(a)*69,205+Math.cos(a)*69);ctx.lineTo(128+Math.sin(a)*90,205+Math.cos(a)*90);ctx.stroke()}
 ctx.fillStyle='#f3d39b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='77px Georgia,serif';ctx.fillText('☼',128,204);
 ctx.font='16px Georgia,serif';ctx.fillText('✦     ✧     ✦',128,64);ctx.font='19px Georgia,serif';ctx.fillText('菊 花 说',128,364);
 return canvas;
}
function perspective(aspect){const f=1/Math.tan(FIELD_OF_VIEW/2),near=.08,far=40;
 return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);
}
function appendQuad(point,rot,verts){
 const c=rotatePoint(point.center,rot.rx,rot.ry);
 const {right,up}=cardAxes(point,rot.rx,rot.ry);
 const corners=[[-1,-1,0,1],[1,-1,1,1],[1,1,1,0],[-1,-1,0,1],[1,1,1,0],[-1,1,0,0]];
 const light=Math.max(.2,.5+.5*(-c[2]/SPHERE_RADIUS));
 for(const [sx,sy,u,v] of corners){
  let pos=add(add(c,right,sx*CARD_WIDTH/2),up,sy*CARD_HEIGHT/2);
  verts.push(pos[0],pos[1],pos[2],u,v,light);
 }
}
export function mountWebGLSphere(scene,cards,picks,getRotation,options={}){
 if(!scene||!cards.length||typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.id='sphere-webgl';canvas.className='sphere-webgl';
 canvas.setAttribute('role','button');canvas.setAttribute('tabindex','0');
 canvas.setAttribute('aria-label','Inside the celestial sphere. Drag to look around. Tap visible cards, or press Enter to select the card at the center.');scene.append(canvas);
 let gl;
 try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,powerPreference:'low-power'});}catch{}
 if(!gl){canvas.remove();return null}
 let prog,vao,buffer,texture,frame=0,disposed=false,stopped=false,lastFrame=0,previousTime=null,lastPaintRotation=null;
 const layout=sphereLayout(cards.length),ids=cards.map(c=>c.id),selected=new Set(picks.map(p=>p.card.id));
 const rot=()=>{const o=getRotation();return {rx:o.rx*Math.PI/180,ry:o.ry*Math.PI/180}};
 function dispose(){disposed=true;cancelAnimationFrame(frame);if(!gl.isContextLost()){if(prog)gl.deleteProgram(prog);if(vao)gl.deleteVertexArray(vao);if(buffer)gl.deleteBuffer(buffer);if(texture)gl.deleteTexture(texture)}canvas.remove()}
 try{
  prog=program(gl,VERT,FRAG);vao=gl.createVertexArray();gl.bindVertexArray(vao);
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  const stride=24;for(const [location,size,offset] of [[0,3,0],[1,2,12],[2,1,20]]){gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,stride,offset)}
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cardBackTexture());
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  const uProj=gl.getUniformLocation(prog,'u_projection'),uTime=gl.getUniformLocation(prog,'u_time');
  function paint(time){
   if(disposed||stopped)return;
   if(document.hidden){previousTime=null;frame=requestAnimationFrame(paint);return}
   if(time-lastFrame<28){frame=requestAnimationFrame(paint);return}
   const delta=previousTime===null?0:Math.min(time-previousTime,64);previousTime=time;lastFrame=time;
   options.onFrame?.(delta,time);
   const rect=scene.getBoundingClientRect();if(rect.width<8||rect.height<8){frame=requestAnimationFrame(paint);return}
   const dpr=Math.min(window.devicePixelRatio||1,1.65),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
   gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   gl.useProgram(prog);gl.bindVertexArray(vao);gl.uniformMatrix4fv(uProj,false,perspective(w/h));
   gl.uniform1f(uTime,time/1000);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.uniform1i(gl.getUniformLocation(prog,'u_back'),0);
   const angle=rot(),vertices=[];lastPaintRotation=angle;
   for(let i=0;i<layout.length;i++)if(!selected.has(ids[i]))appendQuad(layout[i],angle,vertices);
   gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
   gl.drawArrays(gl.TRIANGLES,0,vertices.length/6);frame=requestAnimationFrame(paint);
  }
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stopped=true;cancelAnimationFrame(frame);scene.dispatchEvent(new CustomEvent('sphere-webgl-lost',{bubbles:true}))},{once:true});
  scene.classList.add('webgl-active');frame=requestAnimationFrame(paint);
  return {
   canvas,
   pick(clientX,clientY){const b=canvas.getBoundingClientRect(),a=lastPaintRotation||rot();return pickSphereCard(layout,ids,selected,a.rx,a.ry,clientX-b.left,clientY-b.top,b.width,b.height)},
   pickCenter(){const b=canvas.getBoundingClientRect(),a=lastPaintRotation||rot();return pickSphereCard(layout,ids,selected,a.rx,a.ry,b.width/2,b.height/2,b.width,b.height)},
   projectCard(id){
    const index=ids.indexOf(id);if(index<0)return null;
    const b=canvas.getBoundingClientRect(),a=lastPaintRotation||rot();
    const screen=projectPoint(rotatePoint(layout[index].center,a.rx,a.ry),b.width,b.height);
    if(!screen)return null;
    return {x:b.left+screen.x,y:b.top+screen.y,width:CARD_WIDTH*screen.scale,height:CARD_HEIGHT*screen.scale};
   },
   hideCard(id){selected.add(id)},
   dispose
  };
 }catch(error){dispose();scene.classList.remove('webgl-active');console.warn('GPU sphere unavailable:',error);return null}
}
