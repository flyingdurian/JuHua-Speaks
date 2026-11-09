import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ORBIT_DEGREES_PER_SECOND,DRAG_RESUME_DELAY_MS,FLIGHT_DURATION_MS,nextOrbitYaw,cardFlightFrames} from '../src/sphere-motion.mjs';
import {sphereLayout,projectPoint,pickSphereCard,rotatePoint} from '../src/webgl-sphere.mjs';

test('ambient spin advances gently, wraps, never jumps after tab suspension and can pause',()=>{
 assert.ok(ORBIT_DEGREES_PER_SECOND>0&&ORBIT_DEGREES_PER_SECOND<=5);
 assert.equal(nextOrbitYaw(10,1000),10+ORBIT_DEGREES_PER_SECOND*.064);
 assert.equal(nextOrbitYaw(12,0),12);
 assert.equal(nextOrbitYaw(12,100,false),12);
 assert.equal(nextOrbitYaw(12,Infinity),12);
 assert.ok(nextOrbitYaw(359.9,64)<1);
 assert.ok(DRAG_RESUME_DELAY_MS>=600);
});
test('user clicks a card at its displayed orientation as the universe rotates',()=>{
 const layout=sphereLayout(), ids=layout.map((_,i)=>`card-${i}`), selected=new Set();
 const width=980,height=530;
 for(const degrees of [-170,-75,-15,0,45,120,179]){
  const angle=degrees*Math.PI/180;
  const visible=layout.map((p,i)=>({p,i,s:projectPoint(rotatePoint(p.center,0,angle),width,height)}))
   .filter(x=>x.s&&x.s.x>80&&x.s.x<width-80&&x.s.y>70&&x.s.y<height-70);
  assert.ok(visible.length>=3,`Visible cards at ${degrees} degrees`);
  const hittable=visible.some(x=>pickSphereCard(layout,ids,selected,0,angle,x.s.x,x.s.y,width,height)===ids[x.i]);
  assert.ok(hittable,`At least one centered card is hittable at ${degrees} degrees`);
 }
});
test('card flight reaches the exact hand slot, with a luminous lift and no source persistence',()=>{
 const a={x:233,y:188},b={x:630,y:788};const frames=cardFlightFrames(a,b);
 assert.equal(frames[0].offset,0);assert.equal(frames.at(-1).offset,1);
 assert.match(frames[0].transform,/translate3d\(0\.00px, 0\.00px, 0\)/);
 assert.match(frames.at(-1).transform,/translate3d\(397\.00px, 600\.00px, 0\)/);
 assert.ok(frames.some(x=>x.offset>.2&&x.transform.includes('74.00px')===false));
 assert.equal(frames.at(-1).opacity,0);
 assert.ok(FLIGHT_DURATION_MS>=650&&FLIGHT_DURATION_MS<=1500);
 assert.throws(()=>cardFlightFrames({x:Infinity,y:1},b),/Invalid/);
});
test('UI keeps pick state until the card lands, offers pause and reduced-motion alternative',async()=>{
 const src=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8');
 const gl=await readFile(new URL('../src/webgl-sphere.mjs',import.meta.url),'utf8');
 assert.match(src,/catchCard\(BY_ID\.get\(id\)/);
 assert.match(src,/confirmThreeCards\(\)/);
 assert.match(src,/animation\.onfinish=.*selectCard\(card\);render\(\)/);
 assert.match(src,/data-action=\\?"toggle-orbit/);
 assert.match(src,/motionReduced\(\)/);
 assert.match(gl,/hideCard\(id\)\{hidden\.add\(id\)\}/);
 assert.match(gl,/lastPaintRotation\|\|rot\(\)/);
});
