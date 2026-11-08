import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
await mkdir('artifacts/gate-c14',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.goto('http://127.0.0.1:4186/preview/gate-c14/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(420);if(errors.length)throw Error('Scene initialization: '+errors.join(' | '));
 assert.equal(await page.evaluate(()=>window.__JUHUA_C14__.stage()),'gate');
 await page.screenshot({path:'artifacts/gate-c14/01-fullscreen-gate.png'});
 await page.locator('[data-action="enter"]').click();
 assert.equal(await page.evaluate(()=>window.__JUHUA_C14__.stage()),'cube');
 await page.waitForTimeout(610);
 await page.screenshot({path:'artifacts/gate-c14/02-rotating-cube.png'});
 await page.waitForTimeout(2800);
 assert.equal(await page.evaluate(()=>window.__JUHUA_C14__.stage()),'cube');
 await page.screenshot({path:'artifacts/gate-c14/02-fly-through-transition.png'});
 await page.waitForTimeout(1110);
 assert.equal(await page.evaluate(()=>window.__JUHUA_C14__.stage()),'sphere');
 assert.equal(await page.evaluate(()=>window.__JUHUA_C14__.stage()),'sphere');
 assert.equal(await page.locator('button.orbit-card').count(),78);
 assert.equal(await page.evaluate(()=>new Set(window.__JUHUA_C14__.deck()).size),78);
 await page.waitForTimeout(350);await page.screenshot({path:'artifacts/gate-c14/03-entry-cloud.png'});
 await page.waitForTimeout(2200);await page.screenshot({path:'artifacts/gate-c14/03-inside-sphere.png'});
 const blackSky=await page.locator('.deep-sky').evaluate(el=>getComputedStyle(el).backgroundColor);
 assert.equal(blackSky,'rgb(1, 1, 3)','Inside the sphere must be black space rather than an ornate purple wall');
 const selected=[];
 for(let i=0;i<3;i++){
  const id=await page.evaluate(()=>{
   const all=[...document.querySelectorAll('button.orbit-card')];
   for(const node of all){if(node.hidden)continue;const b=node.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2;
    if(b.width>54&&x>innerWidth*.2&&x<innerWidth*.8&&y>innerHeight*.25&&y<innerHeight*.66&&document.elementFromPoint(x,y)===node)return {id:node.dataset.cardId,x,y};
   }return null;
  });
  assert.ok(id,'Need a truly tappable visible card, not an offscreen identity');
  await page.mouse.click(id.x,id.y);
  selected.push(id.id);
  assert.deepEqual(await page.evaluate(()=>window.__JUHUA_C14__.selected().map(p=>p.id)),selected);
  assert.equal(await page.locator('button.orbit-card[data-card-id="'+id.id+'"]').isVisible(),true,'Selected card must remain in the sphere');
  if(i===0){await page.waitForTimeout(1190);await page.screenshot({path:'artifacts/gate-c14/04-gold-halo-selection.png'})}
 }
 assert.equal(await page.evaluate(()=>window.__JUHUA_C14__.stage()),'select');
 await page.screenshot({path:'artifacts/gate-c14/04-three-selected-stop.png'});
 await page.locator('[data-undo="'+selected[1]+'"]').click();
 assert.equal(await page.evaluate(()=>window.__JUHUA_C14__.selected().length),2);
 await page.locator('button.orbit-card[data-card-id="'+selected[1]+'"]').click({force:true});
 assert.equal(await page.evaluate(()=>window.__JUHUA_C14__.selected().length),3);
 assert.equal(await page.locator('[data-action="collapse"]').count(),0);
 assert.deepEqual(errors,[]);
 console.log('Gate C video-v2 browser PASS: cinematic cube, black starfield, 78 identities, 3 genuine pointer taps, retained selected cards, undo and stage boundary');
}finally{await browser.close()}
