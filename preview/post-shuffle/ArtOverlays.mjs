/**
 * Gate BC v3.4: original Tarot artwork is never replaced or recolored.
 * These four sparse, neutral-gold line engravings are painted onto transparent
 * Canvas tiles above the fully decoded Rider–Waite–Smith illustration.
 * No holographic diffraction, rainbow wash, chrome, hue shift or source edits.
 */
export const ART_OVERLAY_STYLES=Object.freeze([
 'celestial-lattice','constellation-map','alchemical-glyphs','scroll-texture'
]);
export const ART_OVERLAY_LABELS=Object.freeze({
 'celestial-lattice':'Celestial Lattice',
 'constellation-map':'Constellation Map',
 'alchemical-glyphs':'Alchemical Glyphs',
 'scroll-texture':'Scroll Texture'
});
const TAU=Math.PI*2;
function stroke(ctx,a,b,alpha=.24,width=.65){
 ctx.strokeStyle='rgba(220,187,128,'+alpha+')';ctx.lineWidth=width;
 ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
}
function dot(ctx,x,y,r=.95,alpha=.45){
 ctx.fillStyle='rgba(232,205,156,'+alpha+')';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
}
function ring(ctx,x,y,r,alpha=.18){
 ctx.strokeStyle='rgba(226,192,133,'+alpha+')';ctx.lineWidth=.6;
 ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
}
function lattice(ctx){
 // Intersecting sacred-triangle / hexagonal geometry, with open artwork zones.
 const side=54,rowHeight=side*Math.sqrt(3)/2;
 for(let row=-1;row<=10;row++){
  const y=row*rowHeight;
  for(let col=-2;col<=6;col++){
   const x=col*side+(row%2?side/2:0);
   stroke(ctx,[x,y],[x+side/2,y+rowHeight],.21,.55);
   stroke(ctx,[x+side/2,y+rowHeight],[x+side,y],.21,.55);
   if((row+col)%3===0)ring(ctx,x+side/2,y+rowHeight/3,13,.17);
  }
 }
 for(let n=0;n<4;n++)ring(ctx,128,224,28+n*17,.13);
}
function constellation(ctx){
 const nodes=Array.from({length:46},(_,i)=>({
  x:12+(i*61+i*i*13)%231,y:15+(i*71+i*i*9)%413,
  major:i%9===0
 }));
 nodes.forEach((p,i)=>{
  if(i%3!==0){
   const previous=nodes[(i+37)%nodes.length];
   if(Math.hypot(p.x-previous.x,p.y-previous.y)<117)stroke(ctx,[p.x,p.y],[previous.x,previous.y],.17,.65);
  }
  dot(ctx,p.x,p.y,p.major?1.55:.63,p.major?.64:.38);
  if(p.major){
   stroke(ctx,[p.x-4,p.y],[p.x+4,p.y],.33,.6);
   stroke(ctx,[p.x,p.y-4],[p.x,p.y+4],.33,.6);
   ring(ctx,p.x,p.y,5.8,.21);
  }
 });
}
function glyphs(ctx){
 const signs=['☉','☽','☿','♀','♂','♃','♄','♆','☿','☽','☉','♄'];
 ctx.textAlign='center';ctx.textBaseline='middle';
 for(let row=0;row<7;row++)for(let col=0;col<4;col++){
  const x=27+col*67+(row%2?17:0),y=30+row*67;
  const symbol=signs[(row*5+col*7)%signs.length];
  ctx.font='17px "Noto Sans Symbols 2","DejaVu Sans",Georgia,serif';
  ctx.fillStyle='rgba(218,183,121,.24)';ctx.fillText(symbol,x,y);
  if((col+row)%3===0){
   ring(ctx,x,y,14,.16);
   stroke(ctx,[x-21,y+22],[x+21,y+22],.15,.6);
  }
  dot(ctx,x-17,y-15,.7,.20);
 }
}
function scroll(ctx){
 // Gongbi-style fine contours and hand-engraved diagonal hatched ribbons,
 // drifting as one very slow texture, not rainbow foil or a light sweep.
 for(let row=-1;row<16;row++){
  const yy=row*32;
  for(let x=-38;x<298;x+=5){
   const y=yy+6*Math.sin(x*.037+row*.38);
   stroke(ctx,[x,y],[x+4,y+.8*Math.cos(x*.048+row)],.12,.50);
  }
  for(let k=-1;k<=11;k++){
   const x=k*28+((row%2)*14),y=yy+9*Math.sin(x*.037+row*.38);
   stroke(ctx,[x,y+3],[x+11,y+14],.18,.52);
  }
 }
 for(let i=0;i<6;i++){
  const y=28+i*78;
  for(let k=0;k<24;k++){
   const x=k*12-8;
   stroke(ctx,[x,y+3*Math.sin(k*.6+i)],[x+12,y+3*Math.sin((k+1)*.6+i)],.16,.56);
  }
 }
}
export function paintArtOverlay(ctx,style,width=256,height=448){
 if(!ART_OVERLAY_STYLES.includes(style))throw new RangeError('Unknown art overlay style');
 if(!ctx||!(width>0)||!(height>0))throw new RangeError('Art overlay requires a canvas context');
 ctx.save();ctx.clearRect(0,0,width,height);ctx.scale(width/256,height/448);
 if(style==='celestial-lattice')lattice(ctx);
 else if(style==='constellation-map')constellation(ctx);
 else if(style==='alchemical-glyphs')glyphs(ctx);
 else scroll(ctx);
 ctx.restore();
}
export function artOverlayDataUrls(){
 const tiles={};
 for(const style of ART_OVERLAY_STYLES){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=448;
  paintArtOverlay(canvas.getContext('2d'),style);
  tiles[style]=canvas.toDataURL('image/png');
 }
 return tiles;
}
