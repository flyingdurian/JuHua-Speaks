/**
 * Gate B → fullscreen sphere browser smoke. This intentionally stops at
 * three selected cards: rejected legacy ritual/reveal/Artemis is NOT used.
 * The filename remains for existing CI references; assertions are current.
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
 const context=await browser.newContext({viewport:{width:1100,height:770}});
 page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in',
  {waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.__ritualGateB?.world?.cards?.length===78,{timeout:15000});
 await page.locator('#question').fill('How can I make this decision with more clarity?');
 await page.locator('#skip-to-deck').click();
 await page.waitForFunction(()=>window.__ritualGateB?.phase==='deck_formed',{timeout:12000});
 await page.locator('#finish-shuffle').waitFor({state:'visible'});
 steps.push('Landing demo skip reaches the same 78-layer resting deck');
 await page.screenshot({path:dir+'/handoff-resting-deck.png'});
 await page.locator('#finish-shuffle').click();
 const preserved=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('juhua:gate-b-reveal:v1')).cardIds);
 assert.equal(preserved.length,78);
 assert.equal(new Set(preserved).size,78);
 await page.waitForURL('**/preview/gate-c14/?from=gate-b',{timeout:15000});
 await page.waitForFunction(()=>window.__JUHUA_C14__?.stage()==='sphere',{timeout:15000});
 const recovered=await page.evaluate(()=>window.__JUHUA_C14__.deck());
 assert.deepEqual(recovered,preserved,'Gate C may not silently reshuffle the private 78-card order');
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('juhua:gate-b-reveal:v1')),null);
 assert.equal(await page.locator('.orbit-card').count(),78);
 assert.equal(await page.locator('.scene-cube,.scene-gate,.sphere-page,.physical-reveal').count(),0);
 steps.push('Finish Shuffling reaches fullscreen Gate C sphere, never rejected ritual.html or cube');
 await page.screenshot({path:dir+'/handoff-sphere.png'});
 // Exercise actual DOM click path for all three choices.
 for(let i=0;i<3;i++){
  await page.locator('.orbit-card:not([hidden])').first().dispatchEvent('click');
  await page.waitForFunction(n=>window.__JUHUA_C14__.selected().length===n,i+1);
 }
 const chosen=await page.evaluate(()=>window.__JUHUA_C14__.selected());
 assert.equal(chosen.length,3);
 assert.equal(new Set(chosen.map(x=>x.id)).size,3);
 for(const choice of chosen){
  const hidden=await page.locator('.orbit-card[data-card-id="'+choice.id+'"]').evaluate(el=>el.hidden);
  assert.equal(hidden,true,'Selected card must leave the sphere and appear in the foreground');
 }
 assert.equal(await page.locator('.dock-back.chosen').count(),3);
 assert.equal(await page.locator('#finish-label').isVisible(),true);
 steps.push('Three unique cards leave the sphere into Past / Present / Future foreground');
 await page.screenshot({path:dir+'/handoff-three-cards.png'});
 if(errors.length)throw Error('Page errors: '+errors.join(' | '));
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:true,steps,errors},null,2));
 console.log('Gate B → full-screen sphere → staged three-card lineup PASS',steps);
}catch(error){
 await page?.screenshot({path:dir+'/handoff-failure.png'}).catch(()=>{});
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:false,steps,errors,error:String(error)},null,2));
 throw error;
}finally{
 await browser.close();
}
