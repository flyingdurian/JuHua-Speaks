/**
 * JuHua Speaks' dependency-free GPU card sphere. The generated texture is ONLY
 * decorative card-BACK artwork. Authentic illustrated card faces are always
 * separate, untouched Pamela Colman Smith image assets.
 *
 * WebGL is progressive enhancement: the semantic CSS 3D buttons remain the
 * canonical fallback when WebGL is unavailable or disabled.
 */
export const SPHERE_RADIUS=3.12;
const FOV=Math.PI/4.6;
const CAMERA_DISTANCE=9.3;
const WIDTH=.83, HEIGHT=1.35;
const GOLDEN_ANGLE=Math.PI*(3-Math.sqrt(5));

export function sphereLayout(count=78){
 if(!Number.isSafeInteger(count)||count<2)throw new RangeError('Sphere requires two or more cards');
 return Array.from({length:count},(_,i)=>{
  const y=1-2*i/(count-1),r=Math.sqrt(Math.max(0,1-y*y)),a=i*GOLDEN_ANGLE;
  const n=[Math.cos(a)*r,y,Math.sin(a)*r];
  return {center:n.map(v=>v*SPHERE_RADIUS),normal:n};
 });
}
export function rotatePoint([x,y,z],rx,ry){
 const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
 const xx=x*cy+z*sy,zz=-x*sy+z*cy;
 return [xx,y*cx-zz*sx,y*sx+zz*cx];
}
export function projectPoint(point,width,height){
 const z=CAMERA_DISTANCE-point[2];
 if(z<=.1||width<=0||height<=0)return null;
 const focal=height/(2*Math.tan(FOV/2));
 return {x:width/2+focal*point[0]/z,y:height/2-focal*point[1]/z,scale:focal/z,depth:z};
}
export function pickSphereCard(layout,ids,selection,rx,ry,x,y,width,height){
 let best=null;
 for(let i=0;i<layout.length;i++){
  const id=ids[i];if(selection.has(id))continue;
  const normal=rotatePoint(layout[i].normal,rx,ry);
  // Only outward-facing, front-side cards should accept a click.
  if(normal[2]<.18)continue;
  const center=projectPoint(rotatePoint(layout[i].center,rx,ry),width,height);
  if(!center)continue;
  const dx=Math.abs(x-center.x),dy=Math.abs(y-center.y);
  const hw=WIDTH*center.scale*.56,hh=HEIGHT*center.scale*.57;
  if(dx>hw||dy>hh)continue;
  const score=(dx/hw)**2+(dy/hh)**2;
  if(!best||center.depth<best.depth-.06||(Math.abs(center.depth-best.depth)<.06&&score<best.score))best={id,depth:center.depth,score};
 }
 return best?.id??null;
}
function compile(gl,type,source){
 const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const why=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error('WebGL shader: '+why)}return shader;
}
function program(gl,vert,frag){
 const v=compile(gl,gl.VERTEX_SHADER,vert),f=compile(gl,gl.FRAGMENT_SHADER,frag),p=gl.createProgram();
 gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const why=gl.getProgramInfoLog(p);gl.deleteProgram(p);throw new Error('WebGL program: '+why)}return p;
}
const VERT=`#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec2 a_uv;
layout(location=2) in float a_light;
uniform mat4 u_projection;
out vec2 v_uv;
out float v_light;
void main(){gl_Position=u_projection*vec4(a_position.x,a_position.y,a_position.z-9.3,1.0);v_uv=a_uv;v_light=a_light;}
`;
const FRAG=`#version 300 es
precision mediump float;
in vec2 v_uv;
in float v_light;
uniform sampler2D u_back;
uniform float u_time;
out vec4 outColor;
void main(){
 vec4 tex=texture(u_back,v_uv);
 float shimmer=pow(max(0.0,1.0-abs(v_uv.x*1.45+v_uv.y*.5-mod(u_time*.16,2.3))),10.0);
 vec3 col=tex.rgb*(.66+.34*v_light)+vec3(.18,.14,.08)*shimmer*.32;
 outColor=vec4(col,tex.a);
}
`;
function backTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=416;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas texture unavailable');
 const bg=ctx.createLinearGradient(0,0,256,416);bg.addColorStop(0,'#121b37');bg.addColorStop(.5,'#35446c');bg.addColorStop(1,'#11142c');ctx.fillStyle=bg;ctx.fillRect(0,0,256,416);
 ctx.strokeStyle='#e5be7c';ctx.lineWidth=6;ctx.strokeRect(7,7,242,402);ctx.lineWidth=1.2;ctx.strokeRect(18,18,220,380);
 ctx.strokeStyle='rgba(240,205,145,.68)';
 for(const r of [42,62,83]){ctx.beginPath();ctx.arc(128,208,r,0,Math.PI*2);ctx.stroke()}
 ctx.save();ctx.translate(128,208);
 for(let i=0;i<12;i++){
  ctx.rotate(Math.PI/6);ctx.beginPath();ctx.moveTo(0,49);ctx.quadraticCurveTo(18,66,0,89);ctx.quadraticCurveTo(-18,66,0,49);ctx.stroke();
 }
 ctx.fillStyle='#efce99';ctx.font='79px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('☼',0,0);ctx.restore();
 ctx.fillStyle='#ddbc80';ctx.font='17px Georgia';ctx.textAlign='center';ctx.fillText('✦     ✧     ✦',128,61);ctx.font='18px Georgia';ctx.fillText('菊 花 说',128,361);
 return canvas;
}
function perspective(aspect){const f=1/Math.tan(FOV/2),near=.1,far=30;
 return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);
}
function cardVertices(center,normal,rotation,verts){
 const n=rotatePoint(normal,rotation.rx,rotation.ry);
 const c=rotatePoint(center,rotation.rx,rotation.ry);
 // Build tangent axes in world space so fronts face outward on the sphere.
 const tangentLength=Math.hypot(normal[2],normal[0]);
 const right0=tangentLength>.0001?[normal[2]/tangentLength,0,-normal[0]/tangentLength]:[1,0,0];
 const up0=[-normal[1]*right0[2],normal[2]*right0[0]-normal[0]*right0[2],-normal[1]*right0[0]];
 const right=rotatePoint(right0,rotation.rx,rotation.ry),up=rotatePoint(up0,rotation.rx,rotation.ry);
 const coords=[[-1,-1,0,1],[1,-1,1,1],[1,1,1,0],[-1,-1,0,1],[1,1,1,0],[-1,1,0,0]];
 const light=.56+.44*Math.max(0,n[2]);
 for(const [xx,yy,u,v] of coords){verts.push(c[0]+right[0]*xx*WIDTH/2+up[0]*yy*HEIGHT/2+n[0]*.06,c[1]+right[1]*xx*WIDTH/2+up[1]*yy*HEIGHT/2+n[1]*.06,c[2]+right[2]*xx*WIDTH/2+up[2]*yy*HEIGHT/2+n[2]*.06,u,v,light)}
}
export function mountWebGLSphere(scene,cards,picks,getRotation){
 if(!scene||!cards.length||typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.className='sphere-webgl';canvas.id='sphere-webgl';canvas.setAttribute('aria-label','GPU rendered three-dimensional card sphere');
 canvas.setAttribute('role','img');scene.append(canvas);
 let gl;
 try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});}catch{}
 if(!gl){canvas.remove();return null}
 let prog,buffer,texture,vao,frame=0,disposed=false,stopped=false,lastFrame=0;
 const layout=sphereLayout(cards.length),ids=cards.map(c=>c.id),selected=new Set(picks.map(p=>p.card.id));
 const rotation=()=>{const o=getRotation();return {rx:o.rx*Math.PI/180,ry:o.ry*Math.PI/180}};
 function cleanup(){disposed=true;cancelAnimationFrame(frame);if(gl&&!gl.isContextLost()){if(prog)gl.deleteProgram(prog);if(texture)gl.deleteTexture(texture);if(buffer)gl.deleteBuffer(buffer);if(vao)gl.deleteVertexArray(vao)}canvas.remove();}
 try{
  prog=program(gl,VERT,FRAG);vao=gl.createVertexArray();gl.bindVertexArray(vao);
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  const stride=6*4;for(const [loc,size,offset] of [[0,3,0],[1,2,3*4],[2,1,5*4]]){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,stride,offset)}
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,backTexture());
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  const uProj=gl.getUniformLocation(prog,'u_projection'),uTime=gl.getUniformLocation(prog,'u_time');
  function draw(time){if(disposed||stopped)return;if(document.hidden||time-lastFrame<30){frame=requestAnimationFrame(draw);return}lastFrame=time;const rect=scene.getBoundingClientRect();if(rect.width<10||rect.height<10){frame=requestAnimationFrame(draw);return}
    const dpr=Math.min(window.devicePixelRatio||1,1.5);const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(prog);gl.bindVertexArray(vao);
    gl.uniformMatrix4fv(uProj,false,perspective(w/h));gl.uniform1f(uTime,time/1000);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(gl.getUniformLocation(prog,'u_back'),0);
    const angle=rotation(),vertices=[];
    for(let i=0;i<layout.length;i++){if(!selected.has(ids[i]))cardVertices(layout[i].center,layout[i].normal,angle,vertices)}
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,vertices.length/6);
    frame=requestAnimationFrame(draw)
  }
  const lost=e=>{e.preventDefault();stopped=true;cancelAnimationFrame(frame);scene.classList.remove('webgl-active');canvas.style.display='none';scene.querySelector('#orb')?.removeAttribute('aria-hidden')};
  canvas.addEventListener('webglcontextlost',lost,{once:true});
  // An explicit 2D switch is always offered next to the sphere for accessibility.
  scene.classList.add('webgl-active');scene.querySelector('#orb')?.setAttribute('aria-hidden','true');frame=requestAnimationFrame(draw);
  return {pick(clientX,clientY){const r=canvas.getBoundingClientRect();return pickSphereCard(layout,ids,selected,rotation().rx,rotation().ry,clientX-r.left,clientY-r.top,r.width,r.height)},dispose(){cleanup()},canvas};
 }catch(error){cleanup();console.warn('WebGL sphere unavailable; reverting to CSS 3D',error);scene.classList.remove('webgl-active');return null}
}
