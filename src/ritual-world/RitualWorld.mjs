/**
 * Gate A: one durable WebGL2 canvas, camera and 78 card entities.
 * No dependency on the v0.8.2 cinematic renderer or its trajectories.
 * DOM overlays may update without disposing this renderer.
 * Card fronts resolve by immutable DeckConfig card IDs; historical art is never redrawn.
 */
const TAU = Math.PI * 2;
const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
const hash = (x) => { x = Math.imul(x ^ x >>> 16, 0x7feb352d); x = Math.imul(x ^ x >>> 15,0x846ca68b); return ((x ^ x >>> 16) >>> 0) / 4294967296; };
const v3 = (x=0,y=0,z=0) => [x,y,z];
const dot = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm = a => {const len=Math.hypot(...a)||1;return a.map(n=>n/len)};
const rotAround = (a,b,rad) => {
 const c=Math.cos(rad),s=Math.sin(rad),v=cross(b,a),d=dot(b,a);
 return [a[0]*c+v[0]*s+b[0]*d*(1-c),a[1]*c+v[1]*s+b[1]*d*(1-c),a[2]*c+v[2]*s+b[2]*d*(1-c)];
};
const shader=(gl,type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
const program=(gl)=>{
 const vert=shader(gl,gl.VERTEX_SHADER,`#version 300 es
 precision highp float;
 layout(location=0) in vec3 pos;layout(location=1) in vec2 uv;layout(location=2) in float brightness;
 uniform mat4 projection;out vec2 vUv;out float vLight;
 void main(){gl_Position=projection*vec4(pos,1.0);vUv=uv;vLight=brightness;}`);
 const frag=shader(gl,gl.FRAGMENT_SHADER,`#version 300 es
 precision mediump float;
 in vec2 vUv;in float vLight;uniform sampler2D atlas;out vec4 color;
 void main(){vec4 base=texture(atlas,vUv);color=vec4(base.rgb*vLight,base.a);}`);
 const p=gl.createProgram();gl.attachShader(p,vert);gl.attachShader(p,frag);gl.linkProgram(p);
 gl.deleteShader(vert);gl.deleteShader(frag);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
};
const perspective=(aspect,fov=58) => {
 const q=1/Math.tan(fov*Math.PI/360),n=.08,f=160;
 return new Float32Array([q/aspect,0,0,0,0,q,0,0,0,0,(f+n)/(n-f),-1,0,0,2*n*f/(n-f),0]);
};
const ATLAS_COLS=9,ATLAS_ROWS=9,TILE_W=128,TILE_H=220,ATLAS_W=ATLAS_COLS*TILE_W,ATLAS_H=ATLAS_ROWS*TILE_H;
const BACK_SLOT=78,EDGE_SLOT=79;
const slotUv=(slot,u,v)=>[(slot%ATLAS_COLS+u)/ATLAS_COLS,(Math.floor(slot/ATLAS_COLS)+v)/ATLAS_ROWS];
function backing(ctx,x,y){
 const g=ctx.createLinearGradient(x,y,x+TILE_W,y+TILE_H);
 g.addColorStop(0,'#07132d');g.addColorStop(.5,'#183059');g.addColorStop(1,'#050e20');
 ctx.fillStyle='#c6ab78';ctx.fillRect(x,y,TILE_W,TILE_H);
 ctx.fillStyle=g;ctx.fillRect(x+3,y+3,TILE_W-6,TILE_H-6);
 ctx.strokeStyle='#e8cf95';ctx.lineWidth=1.3;ctx.strokeRect(x+8,y+9,TILE_W-16,TILE_H-18);
 ctx.strokeStyle='#bba678';ctx.lineWidth=.6;ctx.strokeRect(x+14,y+15,TILE_W-28,TILE_H-30);
 const midX=x+TILE_W/2,midY=y+TILE_H/2;
 for(let k=0;k<2;k++){ctx.beginPath();ctx.arc(midX,midY,27+k*8,0,TAU);ctx.stroke()}
 for(let i=0;i<16;i++){const a=i*TAU/16;ctx.beginPath();ctx.moveTo(midX+Math.sin(a)*36,midY+Math.cos(a)*36);ctx.lineTo(midX+Math.sin(a)*42,midY+Math.cos(a)*42);ctx.stroke()}
 ctx.fillStyle='#e9d49f';ctx.font='31px Georgia';ctx.textAlign='center';ctx.fillText('☽',midX,midY+11);
 ctx.font='8px Georgia';ctx.fillText('✦   ✧   ✦',midX,y+34);ctx.fillText('✦   ✧   ✦',midX,y+TILE_H-25);
}
function makeAtlas(){
 const canvas=document.createElement('canvas');canvas.width=ATLAS_W;canvas.height=ATLAS_H;
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('2D atlas unavailable');
 ctx.fillStyle='#0a1123';ctx.fillRect(0,0,ATLAS_W,ATLAS_H);
 for(let i=0;i<78;i++){
  const x=(i%ATLAS_COLS)*TILE_W,y=Math.floor(i/ATLAS_COLS)*TILE_H;
  ctx.fillStyle='#efdec2';ctx.fillRect(x,y,TILE_W,TILE_H);
  ctx.fillStyle='#aa9a80';ctx.fillRect(x+5,y+5,TILE_W-10,TILE_H-10);
  ctx.fillStyle='#17172a';ctx.fillRect(x+9,y+9,TILE_W-18,TILE_H-18);
  ctx.fillStyle='#e8d1a3';ctx.textAlign='center';ctx.font='10px Georgia';ctx.fillText('RWS',x+TILE_W/2,y+TILE_H/2);
 }
 backing(ctx,(BACK_SLOT%ATLAS_COLS)*TILE_W,Math.floor(BACK_SLOT/ATLAS_COLS)*TILE_H);
 const ex=(EDGE_SLOT%ATLAS_COLS)*TILE_W,ey=Math.floor(EDGE_SLOT/ATLAS_COLS)*TILE_H;
 ctx.fillStyle='#be9c69';ctx.fillRect(ex,ey,TILE_W,TILE_H);
 for(let i=0;i<TILE_H;i+=5){ctx.fillStyle=i%3?'#d5bd84':'#76624a';ctx.fillRect(ex,ey+i,TILE_W,1)}
 return {canvas,ctx};
}
function pushQuad(verts,A,B,C,D,slot,brightness){
 const uv=(u,v)=>slotUv(slot,u,v);
 const points=[[A,0,0],[B,1,0],[C,1,1],[A,0,0],[C,1,1],[D,0,1]];
 for(const [p,u,v] of points){const t=uv(u,v);verts.push(p[0],p[1],p[2],t[0],t[1],brightness)}
}
function appendBox(verts,card,position,time){
 const toward=norm([-position[0],-position[1],-position[2]]);
 let right=norm(cross([0,1,0],toward));
 if(Math.hypot(...right)<.01)right=[1,0,0];
 let up=norm(cross(toward,right));
 const roll=card.roll+Math.sin(time*.31+card.phase)*.07;
 right=rotAround(right,toward,roll);up=rotAround(up,toward,roll);
 // Local card front points away from the camera. A few historical fronts are flipped toward the camera.
 const visibleFront=card.frontVisible;
 if(visibleFront){right=right.map(v=>-v)}
 const depth=.038;
 const W=card.width*.5,H=card.height*.5;
 const locate=(sx,sy,sz)=>[position[0]+right[0]*W*sx+up[0]*H*sy+toward[0]*depth*sz,
  position[1]+right[1]*W*sx+up[1]*H*sy+toward[1]*depth*sz,
  position[2]+right[2]*W*sx+up[2]*H*sy+toward[2]*depth*sz];
 const f0=locate(-1,1,1),f1=locate(1,1,1),f2=locate(1,-1,1),f3=locate(-1,-1,1);
 const b0=locate(-1,1,-1),b1=locate(1,1,-1),b2=locate(1,-1,-1),b3=locate(-1,-1,-1);
 // Card is a thin bevelled solid with independent front/back/edge surfaces.
 pushQuad(verts,f0,f1,f2,f3,visibleFront?card.index:BACK_SLOT,card.light);
 pushQuad(verts,b1,b0,b3,b2,visibleFront?BACK_SLOT:card.index,card.light*.75);
 pushQuad(verts,f0,b0,b1,f1,EDGE_SLOT,.86);
 pushQuad(verts,f2,b2,b3,f3,EDGE_SLOT,.86);
 pushQuad(verts,f1,b1,b2,f2,EDGE_SLOT,.82);
 pushQuad(verts,f3,b3,b0,f0,EDGE_SLOT,.82);
}
export function makeLandingCardEntities(deck){
 if(!Array.isArray(deck)||deck.length!==78||new Set(deck.map(c=>c.id)).size!==78)throw Error('Exactly 78 unique Tarot cards required');
 return deck.map((c,i)=>Object.freeze({id:c.id,index:i,name:c.name,width:.88+hash(i*17+13)*.32,height:1.55+hash(i*29+7)*.45,
   phase:(i*0.618033988749895%1)*TAU,layer:i<5?'near':i<20?'mid':'far',
   heightBand:(hash(i*47+9)-.5)*2,roll:(hash(i*31+11)-.5)*.3,
   frontVisible:i%13===4||i===2||i===17,light:.62+hash(i*13)*.38}));
}
export function sampleLandingPose(card,seconds){
 const i=card.index;const near=card.layer==='near',mid=card.layer==='mid';
 const speed=near?.031:mid?.017:.009+hash(i+8)*.006;
 const phase=card.phase+seconds*speed;
 const baseX=near?16:mid?27:39;
 const centerZ=near?-28:mid?-44:-62;
 const radiusZ=near?20:mid?21:23;
 const theta=phase;
 const x=Math.sin(theta)*(baseX+hash(i*9)*8)+(near?(i%2?4.4:-4.4):0);
 const z=centerZ-Math.cos(theta)*radiusZ;
 const y=card.heightBand*(near?2.6:mid?8:14)+Math.sin(theta*.75+i)*.54;
 return [x,y,z];
}
export class RitualWorld{
 constructor({mount,cards,faceAssetForId,starSeed=2026,onStatus=()=>{}}){
  if(!mount)throw Error('RitualWorld requires persistent mount');
  this.mount=mount;this.cards=makeLandingCardEntities(cards);this.faceAssetForId=faceAssetForId;
  this.onStatus=onStatus;this.disposed=false;this.phase='landing';this.start=performance.now();this.last=0;this.elapsed=0;
  this.pause=false;this.frame=0;this.failedAssets=[];this.loadedCount=0;this.atlas=makeAtlas();this.images=[];
  this.canvas=document.createElement('canvas');this.canvas.className='ritual-world-canvas';this.canvas.setAttribute('aria-hidden','true');mount.append(this.canvas);
  const gl=this.canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,powerPreference:'high-performance'});
  if(!gl){this.canvas.remove();throw Error('WebGL2 unavailable (use fallback landing)')}
  this.gl=gl;this.program=program(gl);this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);
  this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
  for(const [loc,size,offset] of [[0,3,0],[1,2,12],[2,1,20]]){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,24,offset)}
  this.texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  this.uploadAtlas();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  this.locProj=gl.getUniformLocation(this.program,'projection');this.locAtlas=gl.getUniformLocation(this.program,'atlas');
  this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.contextLost=true;this.pause=true;onStatus({state:'context-lost'})},{once:true});
  this.setPhase('landing');this.loadCardFaces();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(mount);
  this.tick=this.tick.bind(this);this.frame=requestAnimationFrame(this.tick);
 }
 setPhase(phase){if(!['landing','question_submitted','shuffle_ritual','deck_formed','sphere_selection','three_reveal'].includes(phase))throw Error('Unsupported world phase');this.phase=phase;this.onStatus({state:phase,cards:this.cards.length})}
 setPaused(value){this.pause=!!value}
 uploadAtlas(){const gl=this.gl;if(this.disposed||gl.isContextLost())return;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.atlas.canvas)}
 uploadTile(index,image){const gl=this.gl;if(this.disposed||gl.isContextLost())return;const small=document.createElement('canvas');small.width=TILE_W;small.height=TILE_H;small.getContext('2d').drawImage(image,0,0,TILE_W,TILE_H);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texSubImage2D(gl.TEXTURE_2D,0,(index%ATLAS_COLS)*TILE_W,Math.floor(index/ATLAS_COLS)*TILE_H,gl.RGBA,gl.UNSIGNED_BYTE,small)}
 loadCardFaces(){
  // Individual immutable IDs, 78 distinct source URLs; async texture loading never changes identity/order.
  const queue=[...this.cards].sort((a,b)=>Number(b.frontVisible)-Number(a.frontVisible));
  let index=0;const workers=Array.from({length:4},()=>{const next=()=>{
   if(this.disposed||index>=queue.length)return;
   const card=queue[index++],url=this.faceAssetForId(card.id),img=new Image();img.decoding='async';this.images.push(img);
   img.onload=()=>{if(this.disposed)return;const x=(card.index%ATLAS_COLS)*TILE_W,y=Math.floor(card.index/ATLAS_COLS)*TILE_H;
    this.atlas.ctx.drawImage(img,x,y,TILE_W,TILE_H);this.loadedCount++;this.uploadTile(card.index,img);this.onStatus({state:this.phase,loaded:this.loadedCount,cards:78});next()};
   img.onerror=()=>{if(this.disposed)return;this.failedAssets.push(card.id);this.onStatus({state:this.phase,failed:this.failedAssets.length});next()};
   img.src=url;
  };next()});return workers;
 }
 resize(){if(this.disposed)return;const r=this.mount.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,1.5);
  const w=Math.max(2,Math.round(r.width*dpr)),h=Math.max(2,Math.round(r.height*dpr));if(w!==this.canvas.width||h!==this.canvas.height){this.canvas.width=w;this.canvas.height=h;this.gl.viewport(0,0,w,h)}}
 tick(now){if(this.disposed||this.contextLost)return;this.frame=requestAnimationFrame(this.tick);if(document.hidden||this.pause)return;
  const dt=Math.min(70,now-this.last||0);this.last=now;this.elapsed+=dt/1000;
  if(now-this.lastRendered<28)return;this.lastRendered=now;
  this.resize();const gl=this.gl;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.bindVertexArray(this.vao);
  gl.uniformMatrix4fv(this.locProj,false,perspective(this.canvas.width/this.canvas.height));gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.uniform1i(this.locAtlas,0);
  const vertices=[];
  for(const card of this.cards)appendBox(vertices,card,sampleLandingPose(card,this.elapsed),this.elapsed);
  gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.TRIANGLES,0,vertices.length/6);
  this.onStatus({state:this.phase,rendered:78,elapsed:this.elapsed,loaded:this.loadedCount,failed:this.failedAssets.length});
 }
 getDiagnostics(){return {phase:this.phase,cards:this.cards.length,loaded:this.loadedCount,failed:this.failedAssets.length,elapsed:this.elapsed,webgl:this.gl.getParameter(this.gl.VERSION),canvasWidth:this.canvas.width,canvasHeight:this.canvas.height}}
 dispose(){if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver?.disconnect();for(const img of this.images){img.onload=null;img.onerror=null}
  const gl=this.gl;if(!gl.isContextLost()){gl.deleteTexture(this.texture);gl.deleteBuffer(this.buffer);gl.deleteVertexArray(this.vao);gl.deleteProgram(this.program)}this.canvas.remove();}
}
