/**
 * Reference-style physical deck: 78 instances of ONE thin-card prototype,
 * not one extruded 78-card brick. Each instance has an independent position,
 * orientation, thickness and open air-gap; a real depth shadow pass creates
 * occlusion on neighbouring cards under side lighting.
 *
 * Gate B only: the original Gate A landing and authored shuffle trajectories
 * still use CardSurface. This renderer appears once the deck settles.
 */
import {CARD_PERIMETER} from './CardSurface.mjs';
import {deckPose,PHYSICAL_CARD} from './ShuffleChoreography.mjs';

const COUNT=78,STRIDE=9*4,INSTANCE_STRIDE=15*4,SHADOW_SIZE=1024;
export const DECK_SHEET_STEP=.0170;
export const DECK_SHEET_THICKNESS=.0092;
export const DECK_AIR_GAP=DECK_SHEET_STEP-DECK_SHEET_THICKNESS;
export const DECK_INSTANCE_COUNT=COUNT;
const identity=n=>Math.max(0,Math.min(1,n));
const smooth=t=>{t=identity(t);return t*t*(3-2*t)};
const vecDot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const vecCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const q=Math.hypot(...a)||1;return a.map(v=>v/q)};
const compile=(gl,type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const m=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error('Instanced deck shader: '+m)}return s};
const makeProgram=(gl,vert,frag)=>{const a=compile(gl,gl.VERTEX_SHADER,vert),b=compile(gl,gl.FRAGMENT_SHADER,frag);const p=gl.createProgram();gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);gl.deleteShader(a);gl.deleteShader(b);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Instanced deck link: '+gl.getProgramInfoLog(p));return p};

const VERTEX=String.raw`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=1) in vec2 aUv;
layout(location=2) in vec3 aNormal;
layout(location=3) in float aSurface;
layout(location=4) in vec3 iCenter;
layout(location=5) in vec3 iRight;
layout(location=6) in vec3 iUp;
layout(location=7) in vec3 iNormal;
layout(location=8) in float iScale;
layout(location=9) in float iFaceSlot;
layout(location=10) in float iEdgeTone;
uniform mat4 uCamera;
uniform mat4 uLightMatrix;
out vec2 vUV;
out vec3 vNormal;
out vec3 vShadowCoord;
flat out float vSurface;
flat out float vFaceSlot;
flat out float vEdgeTone;
vec3 position(){
 return iCenter+
 iRight*(aPos.x*1.28*.5*iScale)+
 iUp*(aPos.y*2.12*.5*iScale)+
 iNormal*(aPos.z*.0092);
}
void main(){
 vec3 world=position();
 gl_Position=uCamera*vec4(world,1.);
 vec4 shadow=uLightMatrix*vec4(world,1.);
 vShadowCoord=shadow.xyz/shadow.w*.5+.5;
 vNormal=normalize(iRight*aNormal.x+iUp*aNormal.y+iNormal*aNormal.z);
 vUV=aUv;vSurface=aSurface;vFaceSlot=iFaceSlot;vEdgeTone=iEdgeTone;
}`;
const FRAGMENT=String.raw`#version 300 es
precision highp float;
in vec2 vUV;
in vec3 vNormal;
in vec3 vShadowCoord;
flat in float vSurface;
flat in float vFaceSlot;
flat in float vEdgeTone;
uniform sampler2D uAtlas;
uniform sampler2D uShadow;
uniform vec3 uLightDir;
uniform vec2 uShadowTexel;
out vec4 color;
float shadowVisibility(){
 if(vShadowCoord.x<0.||vShadowCoord.x>1.||vShadowCoord.y<0.||vShadowCoord.y>1.||vShadowCoord.z>1.)return 1.;
 // Actual card instances are rendered into this light-depth map first.
 // The 3x3 PCF preserves real gaps instead of painting fake edge stripes.
 float lit=0.;
 float bias=.0013;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
   float d=texture(uShadow,vShadowCoord.xy+vec2(float(x),float(y))*uShadowTexel).r;
   lit+=vShadowCoord.z-bias<=d?1.:0.;
 }
 return lit/9.;
}
void main(){
 vec3 base;
 if(vSurface>1.5){
  // Real separate edge faces: warm paper alternating with restrained
  // navy/ink edge tint, lit per sheet. NOT a slab-side painted texture.
  float ink=smoothstep(.72,.88,vEdgeTone);
  base=mix(vec3(.83,.81,.75),vec3(.09,.15,.28),ink*.84);
 }else{
  float slot=vSurface<.5?vFaceSlot:78.;
  vec2 uv=(vec2(mod(slot,9.),floor(slot/9.))+vec2(mix(.009,.991,vUV.x),mix(.009,.991,vUV.y)))/9.;
  base=texture(uAtlas,uv).rgb;
 }
 float diffuse=max(0.,dot(normalize(vNormal),normalize(uLightDir)));
 float shadow=shadowVisibility();
 float rim=pow(1.-abs(normalize(vNormal).z),2.)*.08;
 vec3 lit=base*(.31+diffuse*(.62*shadow+.08))+vec3(.085,.075,.057)*rim;
 color=vec4(lit,1.);
}`;
const DEPTH_VERT=String.raw`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
layout(location=4) in vec3 iCenter;
layout(location=5) in vec3 iRight;
layout(location=6) in vec3 iUp;
layout(location=7) in vec3 iNormal;
layout(location=8) in float iScale;
uniform mat4 uLightMatrix;
void main(){
 vec3 world=iCenter+iRight*(aPos.x*1.28*.5*iScale)+
 iUp*(aPos.y*2.12*.5*iScale)+iNormal*(aPos.z*.0092);
 gl_Position=uLightMatrix*vec4(world,1.);
}`;
const DEPTH_FRAG=String.raw`#version 300 es
precision mediump float;
void main(){}
`;

function mesh(){
 const vertices=[];
 const push=(p,n,surface)=>vertices.push(p[0],p[1],p[2],(p[0]+1)/2,(1-p[1])/2,...n,surface);
 const tri=(a,b,c,n,part)=>{push(a,n,part);push(b,n,part);push(c,n,part)};
 const points=CARD_PERIMETER;
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length];
  const A=[a[0],a[1],.5],B=[b[0],b[1],.5];
  const C=[a[0],a[1],-.5],D=[b[0],b[1],-.5];
  tri([0,0,.5],A,B,[0,0,1],0);
  tri([0,0,-.5],D,C,[0,0,-1],1);
  const edgeN=norm([a[0]+b[0],a[1]+b[1],0]);
  tri(A,C,D,edgeN,2);tri(A,D,B,edgeN,2);
 }
 return new Float32Array(vertices);
}
function lookAt(eye,target){
 const z=norm(eye.map((v,i)=>v-target[i]));
 const x=norm(vecCross([0,1,0],z));
 const y=vecCross(z,x);
 return new Float32Array([
  x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,
  -vecDot(x,eye),-vecDot(y,eye),-vecDot(z,eye),1
 ]);
}
function ortho(width,height,near,far){
 const [l,r,b,t]=[-width/2,width/2,-height/2,height/2];
 return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(far-near),0,-(r+l)/(r-l),-(t+b)/(t-b),-(far+near)/(far-near),1]);
}
function mul(a,b){
 const c=new Float32Array(16);
 for(let col=0;col<4;col++)for(let row=0;row<4;row++){
  for(let k=0;k<4;k++)c[col*4+row]+=a[k*4+row]*b[col*4+k];
 }
 return c;
}
function camera(aspect){
 const f=1/Math.tan(58*Math.PI/360),n=.08,far=160;
 return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+n)/(n-far),-1,0,0,2*n*far/(n-far),0]);
}
export function deckInstanceLayout(cards,worldTime=0,closeup=1){
 if(!Array.isArray(cards)||cards.length!==COUNT||new Set(cards.map(c=>c.id)).size!==COUNT)
  throw Error('The physical deck must contain 78 different Tarot cards');
 // The suspended reference deck remains small in deep space. The former
 // +11.55 Z dolly pushed the card stack into the camera and magnified stripes.
 const progress=smooth(closeup),zoom=1-.105*progress,moveZ=-1.1*progress;
 const instances=cards.map(card=>{
  const pose=deckPose(card,worldTime);
  const normal=pose.attitude.normal;
  const rank=card.orbitSlot,cluster=Math.floor(rank/7);
  // Physically independent sheets with clustered, in-plane micro-stagger.
  // These offsets preserve all inter-sheet air gaps along the stack normal.
  const sideways=.012*Math.sin(cluster*2.37)+.0045*Math.sin(rank*1.71);
  const vertical=.008*Math.cos(cluster*1.13)+.003*Math.cos(rank*2.09);
  const bow=.012*Math.sin(Math.PI*(rank+.5)/78);
  const p=pose.position.map((v,i)=>v+
   pose.attitude.right[i]*sideways+pose.attitude.up[i]*(vertical+bow));
  return {
   id:card.id,rank,position:[p[0]*zoom,p[1]*zoom,p[2]+moveZ],
   right:pose.attitude.right,up:pose.attitude.up,normal,
   scale:pose.scale*zoom,frontSlot:card.index,
   edgeTone:((Math.imul(cluster+31,2654435761)>>>0)%100)/100
  };
 });
 return instances;
}
export function createInstancedDeck(gl,{atlasTexture}){
 const main=makeProgram(gl,VERTEX,FRAGMENT),depth=makeProgram(gl,DEPTH_VERT,DEPTH_FRAG);
 const vao=gl.createVertexArray(),geometry=gl.createBuffer(),instances=gl.createBuffer();
 const vertices=mesh();gl.bindVertexArray(vao);
 gl.bindBuffer(gl.ARRAY_BUFFER,geometry);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
 for(const [loc,size,offset] of [[0,3,0],[1,2,12],[2,3,20],[3,1,32]]){
  gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,STRIDE,offset);
 }
 gl.bindBuffer(gl.ARRAY_BUFFER,instances);gl.bufferData(gl.ARRAY_BUFFER,COUNT*INSTANCE_STRIDE,gl.DYNAMIC_DRAW);
 for(const [loc,size,offset] of [[4,3,0],[5,3,12],[6,3,24],[7,3,36],[8,1,48],[9,1,52],[10,1,56]]){
  gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,INSTANCE_STRIDE,offset);gl.vertexAttribDivisor(loc,1);
 }
 gl.bindVertexArray(null);

 let shadowTexture=null,shadowFramebuffer=null,shadows=true;
 const oldFbo=gl.getParameter(gl.FRAMEBUFFER_BINDING);
 shadowTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shadowTexture);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,SHADOW_SIZE,SHADOW_SIZE,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
 for(const [param,val] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,param,val);
 shadowFramebuffer=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFramebuffer);
 gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shadowTexture,0);
 gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
 shadows=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
 gl.bindFramebuffer(gl.FRAMEBUFFER,oldFbo);
 const light=norm([-.86,.69,.78]);
 const uMain={
  camera:gl.getUniformLocation(main,'uCamera'),lightMatrix:gl.getUniformLocation(main,'uLightMatrix'),
  atlas:gl.getUniformLocation(main,'uAtlas'),shadow:gl.getUniformLocation(main,'uShadow'),
  lightDir:gl.getUniformLocation(main,'uLightDir'),texel:gl.getUniformLocation(main,'uShadowTexel')
 };
 const uDepth=gl.getUniformLocation(depth,'uLightMatrix');
 function render(cards,worldTime,closeup,width,height){
  const layout=deckInstanceLayout(cards,worldTime,closeup);
  const packed=new Float32Array(COUNT*15);
  for(let i=0;i<COUNT;i++){
   const c=layout[i],off=i*15;
   packed.set([...c.position,...c.right,...c.up,...c.normal,c.scale,c.frontSlot,c.edgeTone],off);
  }
  gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,instances);gl.bufferSubData(gl.ARRAY_BUFFER,0,packed);
  const centerZ=layout.reduce((n,c)=>n+c.position[2],0)/COUNT;
  const target=[0,-.17,centerZ];
  const eye=target.map((v,i)=>v+light[i]*11);
  const lightMatrix=mul(ortho(8.8,9.2,.1,28),lookAt(eye,target));
  if(shadows){
   gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFramebuffer);
   gl.viewport(0,0,SHADOW_SIZE,SHADOW_SIZE);gl.clearDepth(1);gl.clear(gl.DEPTH_BUFFER_BIT);
   gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.colorMask(false,false,false,false);
   gl.useProgram(depth);gl.uniformMatrix4fv(uDepth,false,lightMatrix);
   gl.drawArraysInstanced(gl.TRIANGLES,0,vertices.length/9,COUNT);
   gl.colorMask(true,true,true,true);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);
  gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);
  gl.useProgram(main);
  gl.uniformMatrix4fv(uMain.camera,false,camera(width/Math.max(1,height)));
  gl.uniformMatrix4fv(uMain.lightMatrix,false,lightMatrix);
  gl.uniform3fv(uMain.lightDir,light);
  gl.uniform2f(uMain.texel,1/SHADOW_SIZE,1/SHADOW_SIZE);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlasTexture);gl.uniform1i(uMain.atlas,0);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,shadows?shadowTexture:null);gl.uniform1i(uMain.shadow,1);
  gl.drawArraysInstanced(gl.TRIANGLES,0,vertices.length/9,COUNT);
  gl.activeTexture(gl.TEXTURE0);gl.bindVertexArray(null);
 }
 function dispose(){
  gl.deleteVertexArray(vao);gl.deleteBuffer(geometry);gl.deleteBuffer(instances);
  gl.deleteProgram(main);gl.deleteProgram(depth);
  if(shadowTexture)gl.deleteTexture(shadowTexture);
  if(shadowFramebuffer)gl.deleteFramebuffer(shadowFramebuffer);
 }
 return {render,dispose,get shadowMapped(){return shadows},instanceCount:COUNT};
}
