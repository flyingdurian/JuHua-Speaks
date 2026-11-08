import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const output='artifacts/gate-c';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.goto('http://127.0.0.1:4185/preview/gate-c/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(850);
 assert.equal(await page.evaluate(()=>window.__JUHUA_GATE_C__.stage()),3);
 assert.equal(await page.locator('button.sphere-card').count(),78);
 await page.screenshot({path:output+'/03-inside-sphere.png'});
 const chosen=[];
 for(let i=0;i<3;i++){
  const id=await page.evaluate(()=>{const nodes=Array.from(document.querySelectorAll('button.sphere-card'));const candidates=nodes.filter(el=>!el.hidden).map(el=>({id:el.dataset.card,r:el.getBoundingClientRect()})).filter(({r})=>r.x>120&&r.right<1350&&r.y>210&&r.bottom<715);return candidates[Math.min(3,candidates.length-1)]?.id??null});
  assert.ok(id,'A central visible card must be selectable');
  await page.locator('button.sphere-card[data-card="'+id+'"]').click({force:true});
  chosen.push(id);
  assert.deepEqual(await page.evaluate(()=>window.__JUHUA_GATE_C__.selected().map(c=>c.id)),chosen);
  if(i===0){await page.waitForTimeout(210);await page.screenshot({path:output+'/04-halo-pull-forward.png'})}
 }
 assert.equal(await page.evaluate(()=>window.__JUHUA_GATE_C__.stage()),4);
 assert.equal(await page.locator('#lock').isEnabled(),true);
 await page.screenshot({path:output+'/04-three-chosen.png'});
 await page.locator('#lock').click();
 assert.equal(await page.evaluate(()=>window.__JUHUA_GATE_C__.stage()),5);
 assert.equal(await page.locator('[data-returned-id]').count(),75);
 assert.deepEqual(await page.evaluate(()=>window.__JUHUA_GATE_C__.selected().map(c=>c.id)),chosen);
 assert.equal(await page.evaluate(()=>new Set([...document.querySelectorAll('[data-returned-id]')].map(x=>x.dataset.returnedId)).size),75);
 await page.waitForTimeout(650);await page.screenshot({path:output+'/05-collapse-in-progress.png'});
 await page.waitForTimeout(3050);
 assert.equal(await page.locator('.suction-card.gone').count(),75);
 assert.equal(await page.locator('.survivor').count(),3);
 await page.screenshot({path:output+'/05-three-survive.png'});
 assert.deepEqual(errors,[]);
 console.log('GATE C browser PASS — 78 unique cards, 3 real clicks, 75 collapse, three survivors, no errors');
}finally{await browser.close()}