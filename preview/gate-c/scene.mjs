/** Gate C ceremonial world. Painterly noise, astronomical depth and gilded 3D architecture.
 * All artwork is procedurally drawn into Canvas: there are no raster proxies or substitute cards.
 */
const TAU=Math.PI*2;
const rnd=seed=>{let s=seed>>>0;return()=>((s=(Math.imul(1664525,s)+1013904223)>>>0)/4294967296)};
const lerp=(a,b,t)=>a+(b-a)*t;
const spark=(ctx,x,y,r,alpha=1)=>{ctx.save();ctx.translate(x,y);ctx.globalAlpha*=alpha;const g=ctx.createRadialGradient(0,0,0,0,0,r*4);g.addColorStop(0,'#fff9da');g.addColorStop(.17,'#f8d3ff');g.addColorStop(.42,'#b996fb44');g.addColorStop(1,'#473cad00');ctx.fillStyle=g;ctx.fillRect(-r*4,-r*4,r*8,r*8);ctx.strokeStyle='#ffe6b2';ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(-r*3,0);ctx.lineTo(r*3,0);ctx.moveTo(0,-r*3);ctx.lineTo(0,r*3);ctx.stroke();ctx.restore()};
function fillGlow(ctx,x,y,r,inner,outer){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,inner);g.addColorStop(1,outer);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
function base(ctx,w,h){
 const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#09091d');g.addColorStop(.32,'#171137');g.addColorStop(.65,'#0d102d');g.addColorStop(1,'#060816');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 const random=rnd(0xc05105);ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<135;i++){const px=(random()*.96+.02)*w,py=(random()*.96+.02)*h;const r=Math.min(w,h)*(.05+random()*.24);const hue=[258,277,223,293,247,33][i%6],light=[38,40,30,38,23,18][i%6];fillGlow(ctx,px,py,r,`hsla(${hue},86%,${light}%,${.015+random()*.042})`,'#080a1800')}
 for(let i=0;i<1200;i++){const x=random()*w,y=random()*h,r=Math.pow(random(),3)*1.65+.12;ctx.fillStyle=`rgba(${170+Math.floor(random()*85)},${157+Math.floor(random()*90)},255,${.10+random()*.75})`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
 for(let i=0;i<44;i++)spark(ctx,random()*w,random()*h,.6+random()*1.5,.25+random()*.7);
 ctx.restore();const vign=ctx.createRadialGradient(w*.5,h*.5,h*.2,w*.5,h*.5,w*.82);vign.addColorStop(0,'#0000');vign.addColorStop(1,'#020209d7');ctx.fillStyle=vign;ctx.fillRect(0,0,w,h);
}
function globe(ctx,w,h){const cx=w*.5,cy=h*.47,rx=Math.min(w*.44,h*.70),ry=Math.min(h*.67,w*.55);ctx.save();
 const inner=ctx.createRadialGradient(cx,cy*.93,0,cx,cy,rx*1.3);inner.addColorStop(0,'#eac9ff12');inner.addColorStop(.33,'#9a6af528');inner.addColorStop(.8,'#5944a514');inner.addColorStop(1,'#0b092600');ctx.fillStyle=inner;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,TAU);ctx.fill();
 fillGlow(ctx,cx,cy-ry*.64,rx*.62,'#eac5ff1f','#c9b5ff00');
 ctx.globalCompositeOperation='screen';
 for(let j=0;j<9;j++){ctx.beginPath();ctx.ellipse(cx,cy,rx*(1-j*.026),ry*(1-j*.018),0,0,TAU);ctx.strokeStyle=`rgba(211,176,255,${j===0?.30:.008})`;ctx.lineWidth=j===0?2.5:1;ctx.stroke()}
 for(const ang of [-.86,-.52,-.18,.2,.57,1.05]){ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);ctx.beginPath();ctx.ellipse(0,0,rx*.39,ry,0,0,TAU);ctx.strokeStyle='#d4b77b1e';ctx.lineWidth=1.1;ctx.stroke();ctx.restore()}
 for(let j=-2;j<=2;j++){const y=cy+j*ry*.27;const f=Math.sqrt(Math.max(.05,1-(j*.27)**2));ctx.beginPath();ctx.ellipse(cx,y,rx*f,ry*.14,0,0,TAU);ctx.strokeStyle=j===0?'#be98ff22':'#a38df41b';ctx.stroke()}
 const ring=ctx.createLinearGradient(cx-rx,cy,cx+rx,cy);ring.addColorStop(0,'#cca2fc47');ring.addColorStop(.30,'#f9dda044');ring.addColorStop(.6,'#d3b8ff83');ring.addColorStop(1,'#ebc77c26');ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,-.10,0,TAU);ctx.strokeStyle=ring;ctx.lineWidth=3.2;ctx.stroke();ctx.restore();
}
function astrolabe(ctx,w,h){const cx=w*.5,cy=h*.90,rx=Math.min(w*.40,660),ry=Math.min(h*.15,122);ctx.save();ctx.globalCompositeOperation='screen';fillGlow(ctx,cx,cy,rx*.7,'#e5baf922','#b897e500');
 for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(cx,cy,rx*(1-.13*i),ry*(1-.13*i),0,0,TAU);ctx.strokeStyle=i%2?'#dfbf8055':'#b8a1fc75';ctx.lineWidth=i===0?2.2:.8;ctx.stroke()}
 for(let i=0;i<40;i++){const a=i*TAU/40;const p=[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry],q=[cx+Math.cos(a)*(rx-14),cy+Math.sin(a)*(ry-5)];ctx.beginPath();ctx.moveTo(...p);ctx.lineTo(...q);ctx.strokeStyle=i%5?'#e1c28f4b':'#ffe9b5b2';ctx.stroke()}
 const light=ctx.createLinearGradient(cx,cy-ry,cx,cy+ry);light.addColorStop(0,'#fff2caa1');light.addColorStop(1,'#cf9aff00');ctx.beginPath();ctx.ellipse(cx,cy,rx*.52,ry*.6,0,0,TAU);ctx.strokeStyle=light;ctx.lineWidth=2;ctx.stroke();ctx.restore()}
function voidField(ctx,w,h,time){const cx=w*.53,cy=h*.42,r=Math.min(w*.29,h*.38);ctx.save();ctx.translate(cx,cy);ctx.globalCompositeOperation='screen';fillGlow(ctx,0,0,r*1.68,'#42235ed0','#0b061b00');ctx.rotate(time*.022);
 const random=rnd(0x515c97);for(let arm=0;arm<5;arm++){const base=arm*TAU/5;for(let j=0;j<460;j++){const f=j/460;const a=base+f*TAU*2.85+Math.sin(f*9+arm*2)*.13;const rr=r*(.09+1.4*f);const x=Math.cos(a)*rr,y=Math.sin(a)*rr*.69;ctx.fillStyle=`hsla(${249+arm*13+j%35},90%,${45+Math.floor(f*28)}%,${(.045+f*.3).toFixed(3)})`;ctx.beginPath();ctx.arc(x+(random()-.5)*6,y+(random()-.5)*6,.7+f*2,0,TAU);ctx.fill()}}
 for(let i=0;i<24;i++){const a=i*TAU/24+time*.04,rx=r*(.27+i%8*.19);ctx.beginPath();ctx.ellipse(0,0,rx,rx*.55,a,.30,2.7);ctx.lineWidth=i%4===0?3.5:1.5;ctx.strokeStyle=i%4===0?'#ffd29d77':'#bfa3ff4d';ctx.stroke()}
 const core=ctx.createRadialGradient(0,0,r*.03,0,0,r*.50);core.addColorStop(0,'#000');core.addColorStop(.47,'#030009');core.addColorStop(.64,'#3e1357');core.addColorStop(.79,'#d89bffb9');core.addColorStop(.94,'#7d47b765');core.addColorStop(1,'#0000');ctx.fillStyle=core;ctx.beginPath();ctx.ellipse(0,0,r*.55,r*.40,0,0,TAU);ctx.fill();ctx.restore();}
export function mountSky(canvas,getMode){const context=canvas.getContext('2d',{alpha:false});let cache=null,W=0,H=0,raf=0,disposed=false,last=0;
 function frame(t){if(disposed)return;raf=requestAnimationFrame(frame);if(t-last<33)return;last=t;const rc=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,1.6),w=Math.max(1,Math.round(rc.width*dpr)),h=Math.max(1,Math.round(rc.height*dpr));if(w!==W||h!==H){W=w;H=h;canvas.width=w;canvas.height=h;cache=document.createElement('canvas');cache.width=w;cache.height=h;const c=cache.getContext('2d');base(c,w,h)}context.drawImage(cache,0,0);const mode=getMode();if(mode==='collapse'){voidField(context,w,h,t/1000)}else{globe(context,w,h);astrolabe(context,w,h)} }
 raf=requestAnimationFrame(frame);return ()=>{disposed=true;cancelAnimationFrame(raf)};
}