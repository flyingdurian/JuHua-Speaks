/**
 * JuHua celestial card reverse — shared by Gate B suspended stack and Gate C.
 * Deterministic Canvas 2D engraving, scaled into either atlas. This is original
 * card-back decoration only; authentic RWS fronts remain unchanged.
 *
 * Reference: midnight-indigo back, ivory/gold double borders, central star wheel,
 * opposing crescents, orbital dots and small constellation lines.
 */
export const CELESTIAL_BACK_VERSION='ref1-celestial-engraving-v2';
export const CELESTIAL_BACK_COLORS=Object.freeze({
 midnight:'#071226', navy:'#0b1b36', gold:'#c9ad74', highlight:'#ecd8a9'
});
const TAU=Math.PI*2;
const G=CELESTIAL_BACK_COLORS;
function line(ctx,points,width=1,color=G.gold){
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function circle(ctx,x,y,r,color=G.gold,width=1){
 ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
}
function dot(ctx,x,y,r=1.2,color=G.highlight){
 ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.fill();
}
function star(ctx,x,y,outer=7,inner=1.8,points=8,fill=G.highlight){
 ctx.beginPath();
 for(let i=0;i<points*2;i++){
  const t=-Math.PI/2+i*Math.PI/points,rad=i%2?inner:outer;
  const px=x+Math.cos(t)*rad,py=y+Math.sin(t)*rad;
  if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
 }
 ctx.closePath();ctx.fillStyle=fill;ctx.fill();
}
function crescent(ctx,x,y,flip=false){
 ctx.save();ctx.translate(x,y);if(flip)ctx.rotate(Math.PI);
 // A cut-out silhouette without erasing neighbouring atlas tiles.
 ctx.beginPath();ctx.arc(0,0,12,0,TAU);ctx.fillStyle=G.highlight;ctx.fill();
 ctx.beginPath();ctx.arc(6,-3,10.9,0,TAU);ctx.fillStyle=G.midnight;ctx.fill();
 ctx.restore();
}
function border(ctx,x,y,w,h,r,width,color){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();
}
function compass(ctx){
 ctx.save();ctx.translate(128,224);
 ctx.strokeStyle='rgba(235,211,164,.78)';ctx.lineWidth=.8;
 // Oblique nested orbits, not a solid medallion texture.
 for(const [rx,ry,tilt] of [[49,35,-.34],[43,49,.39]]){
  ctx.save();ctx.rotate(tilt);ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.stroke();ctx.restore();
 }
 circle(ctx,0,0,38,'#ad976c',1);
 circle(ctx,0,0,32,'rgba(235,208,150,.62)',.65);
 for(let k=0;k<24;k++){
  const t=k*TAU/24;
  dot(ctx,Math.cos(t)*45,Math.sin(t)*45,.55,'#d2ba89');
 }
 for(let k=0;k<8;k++){
  const t=k*TAU/8,r=k%2?34:39;
  line(ctx,[[Math.cos(t)*r,Math.sin(t)*r],[Math.cos(t)*47,Math.sin(t)*47]],.9,'#d9bd88');
 }
 star(ctx,0,0,29,5,8,'#e7d5ad');
 star(ctx,0,0,12,1.9,8,G.midnight);
 dot(ctx,0,0,2.8,'#f1dfb9');
 ctx.restore();
}
export function paintCelestialBack(ctx,x,y,width,height){
 if(!ctx||!(width>0)||!(height>0))throw new RangeError('Celestial back needs a Canvas context and positive dimensions');
 ctx.save();ctx.translate(x,y);ctx.scale(width/256,height/448);
 // Inky field with rich navy center and guarded black edges.
 const base=ctx.createLinearGradient(0,0,256,448);
 base.addColorStop(0,'#0f2242');base.addColorStop(.46,G.navy);
 base.addColorStop(1,G.midnight);
 ctx.fillStyle=base;ctx.fillRect(0,0,256,448);
 const glow=ctx.createRadialGradient(121,210,15,128,224,212);
 glow.addColorStop(0,'rgba(56,80,125,.23)');glow.addColorStop(1,'rgba(4,12,29,0)');
 ctx.fillStyle=glow;ctx.fillRect(0,0,256,448);
 // Visible double foil perimeter, engraved fine interior hairline.
 border(ctx,7,7,242,434,7,1.6,'#d2b780');
 border(ctx,13,13,230,422,6,.8,'#e3d0a5');
 border(ctx,20,21,216,406,4,.6,'rgba(201,173,116,.7)');
 // Corner arcs and short engraved filigree.
 for(const sx of [1,-1])for(const sy of [1,-1]){
  ctx.save();ctx.translate(sx===1?26:230,sy===1?26:422);ctx.scale(sx,sy);
  ctx.strokeStyle='#cbb382';ctx.lineWidth=.85;ctx.beginPath();ctx.arc(0,0,11,0,Math.PI/2);ctx.stroke();
  line(ctx,[[0,13],[0,21],[7,28]],.75,'#b59c72');
  dot(ctx,11,11,1.1);ctx.restore();
 }
 // Constellation points arranged as bilateral patterns. No repeating stripes.
 for(const side of [-1,1]){
  const pts=[[30,88],[49,112],[41,151],[61,177],[39,273],[59,302],[45,344],[31,373]];
  const mirror=([px,py])=>[128+side*(128-px),py];
  line(ctx,pts.slice(0,4).map(mirror),.65,'rgba(218,190,139,.54)');
  line(ctx,pts.slice(4).map(mirror),.65,'rgba(218,190,139,.54)');
  for(const p of pts){const v=mirror(p);dot(ctx,v[0],v[1],1.45);}
 }
 // Upper/lower crescent motifs connected to central wheel.
 star(ctx,128,73,7,1.7,8);
 star(ctx,128,375,7,1.7,8);
 for(const sy of [-1,1]){
  const y=224+sy*103;
  crescent(ctx,128,y,sy===1);
  const sideY=224+sy*61;
  circle(ctx,128,sideY,2.4,'rgba(220,191,140,.9)',1);
  line(ctx,[[128,sideY+sy*9],[128,y-sy*19]],.8,'#c8ae79');
  for(const dx of [-46,46]){
   star(ctx,128+dx,y,4.2,.8,8,'#ddc99f');
   dot(ctx,128+dx*.75,y+sy*24,.8,'#c9b78e');
  }
 }
 compass(ctx);
 // Sparse stellar dust, deterministic and limited to the open field.
 for(let i=0;i<118;i++){
  const px=27+((i*73+i*i*19)%202),py=32+((i*67+i*i*11)%382);
  const inWheel=Math.hypot((px-128)/1.05,(py-224)/1.25)<65;
  const inCrescent=(Math.abs(px-128)<19&&[121,327].some(q=>Math.abs(py-q)<20));
  if(inWheel||inCrescent)continue;
  dot(ctx,px,py,i%11===0?1.1:.42,i%4===0?'#c9b78a':'rgba(225,212,176,.62)');
 }
 ctx.restore();
}
