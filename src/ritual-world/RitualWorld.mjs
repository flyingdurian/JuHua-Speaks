/**
 * Gate A: one durable WebGL2 canvas, camera and 78 card entities.
 * No dependency on the v0.8.2 cinematic renderer or its trajectories.
 * DOM overlays may update without disposing this renderer.
 * Card fronts resolve by immutable DeckConfig card IDs; historical art is never redrawn.
 */
import {makeLandingCardEntities,sampleLandingPose,landingOpacity,entranceScale,landingAttitude,landingVisible,createVisualSeed,orbitDiagnostics} from './OrbitalField.mjs';
export {makeLandingCardEntities,sampleLandingPose} from './OrbitalField.mjs';
import {appendPremiumCard} from './CardSurface.mjs';
import {createInstancedDeck} from './InstancedDeck.mjs';
import {paintCelestialBack} from './EngravedBack.mjs';
import {PHYSICAL_CARD,samplePhysicalShuffle,deckPose,shuffleDuration,shuffleBeat,SHUFFLE_CHOICES,assertShuffleGeometry} from './ShuffleChoreography.mjs';
import {CARD_ECHO_HISTORY,sequenceOneEchoEnvelope,projectedCardSpeed,cardEchoOpacity,shouldEchoCard} from './TemporalEcho.mjs';
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
 in vec2 vUv;in float vLight;uniform sampler2D atlas;uniform float passAlpha;uniform float echoTone;out vec4 color;
 void main(){vec4 base=texture(atlas,vUv);vec3 lit=base.rgb*(.72+.28*clamp(vLight,0.0,1.0));vec3 tinted=mix(lit,lit*.91+vec3(.11,.12,.18),echoTone);color=vec4(tinted,passAlpha);} // Main 78 sheets stay fully opaque; ghost pass is time-sampled only.`);
 const p=gl.createProgram();gl.attachShader(p,vert);gl.attachShader(p,frag);gl.linkProgram(p);
 gl.deleteShader(vert);gl.deleteShader(frag);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
};
const perspective=(aspect,fov=58) => {
 const q=1/Math.tan(fov*Math.PI/360),n=.08,f=160;
 return new Float32Array([q/aspect,0,0,0,0,q,0,0,0,0,(f+n)/(n-f),-1,0,0,2*n*f/(n-f),0]);
};
const ATLAS_COLS=9,ATLAS_ROWS=9,TILE_W=256,TILE_H=448,ATLAS_W=ATLAS_COLS*TILE_W,ATLAS_H=ATLAS_ROWS*TILE_H;
const BACK_SLOT=78,EDGE_SLOT=79;
const slotUv=(slot,u,v)=>[(slot%ATLAS_COLS+2/TILE_W+u*(1-4/TILE_W))/ATLAS_COLS,(Math.floor(slot/ATLAS_COLS)+2/TILE_H+v*(1-4/TILE_H))/ATLAS_ROWS];
function backing(ctx,x,y){
 paintCelestialBack(ctx,x,y,TILE_W,TILE_H);
}
function makeAtlas(){
 const canvas=document.createElement('canvas');canvas.width=ATLAS_W;canvas.height=ATLAS_H;
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('2D atlas unavailable');
 ctx.fillStyle='#0a1123';ctx.fillRect(0,0,ATLAS_W,ATLAS_H);
 for(let i=0;i<78;i++){
  const x=(i%ATLAS_COLS)*TILE_W,y=Math.floor(i/ATLAS_COLS)*TILE_H;
  // Authentic fronts stream in asynchronously. Until loaded, display the
  // existing engraved back, never a fabricated RWS illustration or blank quad.
  backing(ctx,x,y);
 }
 backing(ctx,(BACK_SLOT%ATLAS_COLS)*TILE_W,Math.floor(BACK_SLOT/ATLAS_COLS)*TILE_H);
 const ex=(EDGE_SLOT%ATLAS_COLS)*TILE_W,ey=Math.floor(EDGE_SLOT/ATLAS_COLS)*TILE_H;
 // Entire Gate B shuffle (early compact deck, three mini-decks and merge)
 // uses the SAME uniform matte paper side as the seven suspended packet
 // sleeves. No artificially painted barcode/granite hatch texture.
 ctx.fillStyle='#dddedc';ctx.fillRect(ex,ey,TILE_W,TILE_H);
 return {canvas,ctx};
}
function pushQuad(verts,A,B,C,D,slot,brightness){
 const uv=(u,v)=>slotUv(slot,u,v);
 const points=[[A,0,0],[B,1,0],[C,1,1],[A,0,0],[C,1,1],[D,0,1]];
 for(const [p,u,v] of points){const t=uv(u,v);verts.push(p[0],p[1],p[2],t[0],t[1],brightness)}
}
function appendBox(verts,card,position,time,entranceMode='inside-out'){
 if(!landingVisible(card,time,entranceMode))return; // Opaque cards; late arrivals are initially offstage.
 appendPremiumCard(verts,card,position,landingAttitude(card,position,time),entranceScale(card,time,entranceMode),
   card.light,slotUv,{backSlot:BACK_SLOT,edgeSlot:EDGE_SLOT});
}

export class RitualWorld{
 constructor({mount,cards,faceAssetForId,visualSeed=createVisualSeed(),entranceMode='inside-out',onStatus=()=>{}}){
  if(!mount)throw Error('RitualWorld requires persistent mount');
  this.mount=mount;this.visualSeed=visualSeed;this.cards=makeLandingCardEntities(cards,visualSeed);this.faceAssetForId=faceAssetForId;
  this.onStatus=onStatus;this.disposed=false;this.phase='landing';this.start=performance.now();this.last=0;this.elapsed=0;this.entranceMode=entranceMode;
  this.shuffleStyle='auto';this.shuffleStartedAt=0;this.shuffleLandingAt=0;this.shuffleRound=0;
  this.pause=false;this.frame=0;this.failedAssets=[];this.loadedCount=0;this.atlas=makeAtlas();this.images=[];this.lastRendered=0;
  this.canvas=document.createElement('canvas');this.canvas.className='ritual-world-canvas';this.canvas.setAttribute('aria-hidden','true');mount.append(this.canvas);
  const gl=this.canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,powerPreference:'high-performance'});
  if(!gl){this.canvas.remove();throw Error('WebGL2 unavailable (use fallback landing)')}
  if(gl.getParameter(gl.MAX_TEXTURE_SIZE)<Math.max(ATLAS_W,ATLAS_H)){this.canvas.remove();throw Error('High-resolution atlas exceeds GPU limit; using Canvas fallback')}
  this.gl=gl;this.program=program(gl);this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);
  this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
  for(const [loc,size,offset] of [[0,3,0],[1,2,12],[2,1,20]]){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,24,offset)}
  this.texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic')||gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  this.uploadAtlas();gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);
  this.instancedDeck=createInstancedDeck(gl,{atlasTexture:this.texture});this.deckFormedAt=0;
  this.locProj=gl.getUniformLocation(this.program,'projection');this.locAtlas=gl.getUniformLocation(this.program,'atlas');this.locPassAlpha=gl.getUniformLocation(this.program,'passAlpha');this.locEchoTone=gl.getUniformLocation(this.program,'echoTone');
  this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.contextLost=true;this.pause=true;onStatus({state:'context-lost'})},{once:true});
  this.setPhase('landing');this.loadCardFaces();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(mount);
  this.tick=this.tick.bind(this);this.frame=requestAnimationFrame(this.tick);
 }
 setPhase(phase){if(!['landing','question_submitted','shuffle_ritual','deck_formed','sphere_selection','three_reveal'].includes(phase))throw Error('Unsupported world phase');if(phase==='deck_formed'&&this.phase!=='deck_formed')this.deckFormedAt=this.elapsed;this.phase=phase;this.onStatus({state:phase,cards:this.cards.length})}
 beginAutoShuffle(){
  if(this.phase!=='landing')throw Error('Auto shuffle requires landing');
  assertShuffleGeometry(this.cards,{style:'auto',landingAt:this.elapsed,worldTime:this.elapsed,entranceMode:this.entranceMode});
  this.shuffleStyle='auto';this.shuffleLandingAt=this.elapsed;this.shuffleStartedAt=this.elapsed;
  this.setPhase('shuffle_ritual');this.shuffleRound++;
 }
 playShuffle(style){
  if(this.phase!=='deck_formed')throw Error('Shuffle choice requires a formed deck');
  if(!SHUFFLE_CHOICES.includes(style))throw Error('Unknown physical shuffle style');
  assertShuffleGeometry(this.cards,{style,landingAt:this.shuffleLandingAt,worldTime:this.elapsed});
  this.shuffleStyle=style;this.shuffleStartedAt=this.elapsed;this.shuffleRound++;
  this.setPhase('shuffle_ritual');
 }
 resetGateB(){this.setPhase('landing');this.restartEntrance(this.entranceMode);this.shuffleStyle='auto';this.shuffleStartedAt=0}
 getShuffleState(){
  const age=Math.max(0,this.elapsed-this.shuffleStartedAt);
  return {phase:this.phase,style:this.shuffleStyle,age,beat:this.phase==='shuffle_ritual'?shuffleBeat(this.shuffleStyle,age):this.phase,duration:shuffleDuration(this.shuffleStyle),round:this.shuffleRound};
 }
 setPaused(value){this.pause=!!value}
 restartEntrance(mode){if(!['inside-out','outside-in'].includes(mode))throw Error('Unsupported landing entrance');this.entranceMode=mode;this.elapsed=0;this.last=0;this.lastRendered=0;this.onStatus({state:'entrance',entrance:mode})}
 // UV v=0 addresses the TOP of the artwork. Keep canvas uploads unflipped for correct upright RWS fronts.
 uploadAtlas(){const gl=this.gl;if(this.disposed||gl.isContextLost())return;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.atlas.canvas)}
 uploadTile(index,image){const gl=this.gl;if(this.disposed||gl.isContextLost())return;const small=document.createElement('canvas');small.width=TILE_W;small.height=TILE_H;small.getContext('2d').drawImage(image,2,2,TILE_W-4,TILE_H-4);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texSubImage2D(gl.TEXTURE_2D,0,(index%ATLAS_COLS)*TILE_W,Math.floor(index/ATLAS_COLS)*TILE_H,gl.RGBA,gl.UNSIGNED_BYTE,small)}
 loadCardFaces(){
  // Individual immutable IDs, 78 distinct source URLs; async texture loading never changes identity/order.
  const queue=[...this.cards].sort((a,b)=>(Number(b.featured)-Number(a.featured))||a.orbitSlot-b.orbitSlot);
  let index=0;const workers=Array.from({length:4},()=>{const next=()=>{
   if(this.disposed||index>=queue.length)return;
   const card=queue[index++],url=this.faceAssetForId(card.id),img=new Image();img.decoding='async';this.images.push(img);
   img.onload=()=>{if(this.disposed)return;const x=(card.index%ATLAS_COLS)*TILE_W,y=Math.floor(card.index/ATLAS_COLS)*TILE_H;
    this.atlas.ctx.drawImage(img,x+2,y+2,TILE_W-4,TILE_H-4);this.loadedCount++;this.uploadTile(card.index,img);
    if(this.loadedCount===78){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)}img.onload=null;img.onerror=null;this.images.splice(this.images.indexOf(img),1);this.onStatus({state:this.phase,loaded:this.loadedCount,cards:78});next()};
   img.onerror=()=>{if(this.disposed)return;this.failedAssets.push(card.id);this.images.splice(this.images.indexOf(img),1);this.onStatus({state:this.phase,failed:this.failedAssets.length});next()};
   img.src=url;
  };next()});return workers;
 }
 resize(){if(this.disposed)return;const r=this.mount.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,1.5);
  const w=Math.max(2,Math.round(r.width*dpr)),h=Math.max(2,Math.round(r.height*dpr));if(w!==this.canvas.width||h!==this.canvas.height){this.canvas.width=w;this.canvas.height=h;this.gl.viewport(0,0,w,h)}}
 tick(now){if(this.disposed||this.contextLost)return;this.frame=requestAnimationFrame(this.tick);if(document.hidden||this.pause)return;
  const dt=Math.min(70,now-this.last||0);this.last=now;this.elapsed+=dt/1000;
  if(this.phase==='shuffle_ritual'&&this.elapsed-this.shuffleStartedAt>=shuffleDuration(this.shuffleStyle))this.setPhase('deck_formed');
  if(now-this.lastRendered<28)return;this.lastRendered=now;
  this.resize();const gl=this.gl;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  if(this.phase==='deck_formed'){
   // The finished deck is a dynamic 78-instance GPU draw, never a combined
   // slab. Shadow-map depth pass casts real inter-sheet occlusion.
   // Settled deck stays at the reference's small, suspended scale.
    // The progress parameter now eases to a slight pullback, never a dolly-in.
    const closeup=Math.max(0,Math.min(1,(this.elapsed-this.deckFormedAt)/1.8));
   this.instancedDeck.render(this.cards,this.elapsed,closeup,this.canvas.width,this.canvas.height);
   this.onStatus({state:this.phase,rendered:78,instances:78,elapsed:this.elapsed,loaded:this.loadedCount,failed:this.failedAssets.length});
   return;
  }
  gl.useProgram(this.program);gl.bindVertexArray(this.vao);
  gl.uniformMatrix4fv(this.locProj,false,perspective(this.canvas.width/this.canvas.height));gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.uniform1i(this.locAtlas,0);
  const age=this.elapsed-this.shuffleStartedAt;
  // Actual temporal copies of the SAME 78 textured meshes. Alpha blending
  // is enabled only during Gate B Sequence 1; never during approved Gate A
  // landing, globe, deck assembly or user selection.
  const echoes=this.phase==='shuffle_ritual'&&this.shuffleStyle==='auto'
     &&age>1.37&&age<5.42&&sequenceOneEchoEnvelope(age)>.002;
  if(echoes){
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   gl.depthMask(false);gl.uniform1f(this.locEchoTone,.75);
   const pNow=this.cards.map(card=>samplePhysicalShuffle(card,{
    style:'auto',age,landingAt:this.shuffleLandingAt,worldTime:this.elapsed,
    entranceMode:this.entranceMode
   }).position);
   const pPast=this.cards.map(card=>samplePhysicalShuffle(card,{
    style:'auto',age:age-.068,landingAt:this.shuffleLandingAt,
    worldTime:this.elapsed-.068,entranceMode:this.entranceMode
   }).position);
   const speeds=pNow.map((p,i)=>projectedCardSpeed(p,pPast,.068,this.canvas.height));
   for(const echo of CARD_ECHO_HISTORY){
    const ghostVertices=[];
    let peakAlpha=0;
    for(let i=0;i<this.cards.length;i++){
     const card=this.cards[i];
     if(!shouldEchoCard(card,age))continue;
     const alpha=cardEchoOpacity(age,echo.lag,speeds[i]);
     if(alpha<.012)continue;
     const sample=samplePhysicalShuffle(card,{
      style:'auto',age:age-echo.lag,landingAt:this.shuffleLandingAt,
      worldTime:this.elapsed-echo.lag,entranceMode:this.entranceMode
     });
     // Banded per-card alpha is achieved by clustering similar-speed sheets.
     // Only material card geometry is replayed; no duplicate logical cards.
     peakAlpha=Math.max(peakAlpha,alpha);
     appendPremiumCard(ghostVertices,{...card,...PHYSICAL_CARD},sample.position,
       sample.attitude,sample.scale,card.light,slotUv,{backSlot:BACK_SLOT,edgeSlot:EDGE_SLOT});
    }
    if(ghostVertices.length&&peakAlpha>.001){
     gl.uniform1f(this.locPassAlpha,peakAlpha);
     gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
     gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ghostVertices),gl.DYNAMIC_DRAW);
     gl.drawArrays(gl.TRIANGLES,0,ghostVertices.length/6);
    }
   }
   gl.disable(gl.BLEND);gl.depthMask(true);gl.uniform1f(this.locEchoTone,0);
  }
  gl.uniform1f(this.locPassAlpha,1);gl.uniform1f(this.locEchoTone,0);
  const vertices=[];
  for(const card of this.cards){
   if(this.phase==='landing'){
    appendBox(vertices,card,sampleLandingPose(card,this.elapsed,this.entranceMode),this.elapsed,this.entranceMode);
   }else{
    const age=this.elapsed-this.shuffleStartedAt;
    const sample=this.phase==='shuffle_ritual'
     ?samplePhysicalShuffle(card,{style:this.shuffleStyle,age,landingAt:this.shuffleLandingAt,worldTime:this.elapsed,entranceMode:this.entranceMode})
     :deckPose(card,this.elapsed);
    appendPremiumCard(vertices,{...card,...PHYSICAL_CARD},sample.position,sample.attitude,sample.scale,card.light,slotUv,{backSlot:BACK_SLOT,edgeSlot:EDGE_SLOT});
   }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.TRIANGLES,0,vertices.length/6);
  this.onStatus({state:this.phase,rendered:78,elapsed:this.elapsed,loaded:this.loadedCount,failed:this.failedAssets.length});
 }
 getDiagnostics(){return {phase:this.phase,cards:this.cards.length,loaded:this.loadedCount,failed:this.failedAssets.length,elapsed:this.elapsed,visualSeed:this.visualSeed,entranceMode:this.entranceMode,opaqueCards:true,shuffle:this.getShuffleState(),stackedCards:this.phase==='deck_formed'?78:0,...orbitDiagnostics(this.cards,this.elapsed),webgl:this.gl.getParameter(this.gl.VERSION),textureTile:[TILE_W,TILE_H],cardGeometry:'78 separated WebGL2 instanced thin cards',deckShadowMap:this.instancedDeck.shadowMapped,deckInstances:78,deckPacketCount:this.instancedDeck.packetCount,canvasWidth:this.canvas.width,canvasHeight:this.canvas.height}}
 dispose(){if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver?.disconnect();for(const img of this.images){img.onload=null;img.onerror=null}
  const gl=this.gl;if(!gl.isContextLost()){gl.deleteTexture(this.texture);gl.deleteBuffer(this.buffer);gl.deleteVertexArray(this.vao);gl.deleteProgram(this.program);this.instancedDeck.dispose()}this.canvas.remove();}
}
