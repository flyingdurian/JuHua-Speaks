/**
 * Gate B -> C owner-review browser smoke: physical piles, cinematic entry,
 * truly fullscreen sphere, 3 gold-halo picks, then an interactive three-card
 * reveal using original RWS artwork. Intentionally does not invoke Artemis.
 */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='artifacts/gate-b-v8';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'
]});
let page;
const errors=[],steps=[];
try{
 const ctx=await browser.newContext({viewport:{width:1200,height:800}});
 page=await ctx.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in',
  {waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.__ritualGateB?.world?.cards?.length===78,null,{timeout:15000});
 await page.locator('#question').fill('How can I make this decision with more clarity?');
 await page.locator('#skip-to-deck').click();
 await page.waitForFunction(()=>window.__ritualGateB?.phase==='deck_formed',null,{timeout:12000});
 await page.locator('#finish-shuffle').waitFor({state:'visible'});
 steps.push('Landing demo skip preserves the physical 78-layer resting deck');
 await page.screenshot({path:dir+'/handoff-resting-deck.png'});
 await page.locator('#finish-shuffle').click();
 const preserved=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('juhua:gate-b-reveal:v1')).cardIds);
 assert.equal(preserved.length,78);assert.equal(new Set(preserved).size,78);
 assert.equal(await page.evaluate(()=>window.__ritualGateB.phase),'sphere_transition');
 await page.waitForFunction(()=>window.__ritualGateB.shuffle.entryAge>.7,null,{timeout:3500});
 steps.push('Finish Shuffling animates real 78-sheet sphere expansion; not immediate navigation');
 await page.screenshot({path:dir+'/sphere-entry-in-motion.png'});
 await page.waitForURL('**/preview/gate-c14/?from=gate-b',{timeout:20000});
 await page.waitForFunction(()=>window.__JUHUA_C14__?.stage()==='sphere',null,{timeout:15000});
 const recovered=await page.evaluate(()=>window.__JUHUA_C14__.deck());
 assert.deepEqual(recovered,preserved,'Gate C must never silently reshuffle the transferred 78 cards');
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('juhua:gate-b-reveal:v1')),null);
 assert.equal(await page.locator('.orbit-card').count(),78);
 assert.equal(await page.locator('.dock,.dock-back,.scene-cube,.scene-gate,.physical-reveal').count(),0);
 assert.ok((await page.locator('#sphere-message').textContent()).includes('0 selected'));
 steps.push('Full-viewport interior sphere without the rejected THREE PATHS dock');
 await page.screenshot({path:dir+'/handoff-sphere.png'});
 for(let i=0;i<3;i++){
  await page.locator('.orbit-card:not([hidden]):not(.is-chosen)').first().dispatchEvent('click');
  await page.waitForFunction(n=>window.__JUHUA_C14__.selected().length===n,i+1,{timeout:5000});
  assert.equal(await page.locator('.orbit-card.is-chosen').count(),i+1);
 }
 const ids=await page.evaluate(()=>window.__JUHUA_C14__.selected().map(c=>c.id));
 assert.equal(new Set(ids).size,3);
 steps.push('Three 3D sphere cards lift and glow with animated gold foil');
 await page.screenshot({path:dir+'/three-selected-halos.png'});
 await page.waitForFunction(()=>window.__JUHUA_C14__.stage()==='reveal',null,{timeout:6000});
 assert.equal(await page.locator('.peek-card').count(),3);
 assert.equal(await page.locator('.trio-role').count(),3);
 assert.equal(await page.locator('.dock').count(),0);
 steps.push('75 remaining cards collapse; three selections appear large in the reveal');
 await page.screenshot({path:dir+'/three-floating-cards.png'});
 const first=await page.locator('[data-peek-index="0"]').boundingBox();
 if(!first)throw new Error('First peel card is not visibly interactive');
 await page.mouse.move(first.x+first.width*.91,first.y+first.height*.52);
 await page.mouse.down();
 await page.mouse.move(first.x+first.width*.19,first.y+first.height*.52,{steps:12});
 await page.mouse.up();
 const progress=await page.evaluate(()=>window.__JUHUA_C14__.peekStates()[0].progress);
 assert.ok(progress>.4&&progress<1,'Right-edge drag must cause partial art exposure');
 steps.push('Physical edge drag partially exposes authentic card art, with no whole-card flip');
 await page.screenshot({path:dir+'/partial-card-peek.png'});
 await page.evaluate(()=>{
  window.__JUHUA_C14__.peek(0,1,'right');
  window.__JUHUA_C14__.peek(1,1,'corner');
  window.__JUHUA_C14__.peek(2,1,'bottom');
 });
 assert.equal(await page.locator('.trio-card-meta.is-visible').count(),3);
 const images=await page.locator('.peek-art img').evaluateAll(a=>a.map(x=>({ok:x.complete&&x.naturalWidth>0,src:x.src})));
 assert.equal(images.length,3);
 assert.ok(images.every(x=>x.ok),'Historical RWS artwork must load for each selected card');
 steps.push('Upright/reversed original RWS illustrations and short descriptions appear');
 await page.waitForTimeout(320);
 const contrast=await page.locator('.trio-card-meta.is-visible p').first().evaluate(el=>getComputedStyle(el).color);
 assert.notEqual(contrast,'rgb(0, 0, 0)','Revealed meaning cannot be invisible dark text');
 await page.screenshot({path:dir+'/three-revealed-cards.png'});
 if(errors.length)throw Error('Browser errors: '+errors.join(' | '));
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:true,steps,errors,progress},null,2));
 console.log('Gate B → sphere fly-through → 3 gold selections → tactile reveal PASS',steps);
}catch(error){
 await page?.screenshot({path:dir+'/handoff-failure.png'}).catch(()=>{});
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:false,steps,errors,error:String(error)},null,2));
 throw error;
}finally{await browser.close()}
