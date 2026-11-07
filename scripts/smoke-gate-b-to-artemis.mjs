/**
 * Real browser smoke: one Start Divination in Gate B, Finish Shuffling,
 * and all Phase 8.2 stages in the SAME browser tab and same origin.
 *
 * We fast-forward only the already-tested 16.55s automatic shuffle gate.
 * No production route is touched and no AI is activated.
 */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/gate-b-v8';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'
]});
let page;
const errors=[],steps=[];
try{
 const context=await browser.newContext({viewport:{width:860,height:720}});
 page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in',
  {waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.__ritualGateB?.world?.cards?.length===78,{timeout:15000});
 await page.locator('#question').fill('How do I navigate a meaningful new decision?');
 await page.locator('#start-shuffle').click();
 await page.evaluate(()=>{
  const w=window.__ritualGateB.world;
  if(w.phase!=='shuffle_ritual')throw Error('Gate B never entered the shuffle');
  // Test-only fast-forward: do not replay a second shuffle.
  w.setPhase('deck_formed');
 });
 await page.waitForFunction(()=>!document.getElementById('deck-controls').hidden,{timeout:5000});
 steps.push('Gate B automatic shuffle formed the original deck');
 await page.locator('#finish-shuffle').click();
 await page.waitForURL('**/ritual.html',{timeout:15000});
 await page.locator('.sphere-page').waitFor({timeout:15000});
 steps.push('Finish Shuffling navigated to full 78-card selection sphere');
 const question=await page.locator('.sphere-page').textContent();
 if(!question.includes('celestial')&&!question.includes('stars'))throw Error('Sphere view did not render');
 if(await page.evaluate(()=>sessionStorage.getItem('juhua:gate-b-reveal:v1'))!==null)throw Error('Handoff was not consumed');
 // Explicitly use accessible fallback here; GPU path is recorded separately.
 if(await page.locator('[data-action="sphere-mode"]').isVisible()){
  await page.locator('[data-action="sphere-mode"]').click();
 }
 await page.locator('.flat-card-grid').waitFor({timeout:15000});
 if(await page.locator('.flat-card').count()!==78)throw Error('Not all 78 cards are selectable');
 await page.screenshot({path:dir+'/handoff-sphere.png'});
 for(let i=0;i<3;i++){
  await page.locator('.flat-card:not(.chosen)').first().click();
 }
 if(await page.locator('[data-action="confirm-cards"]').isVisible())await page.locator('[data-action="confirm-cards"]').click();
 await page.locator('.physical-reveal').waitFor({timeout:12000});
 steps.push('Exactly three cards locked and independent hand reveal is visible');
 await page.screenshot({path:dir+'/handoff-reveal.png'});
 for(let i=0;i<3;i++){
  await page.locator('[data-peek-card="'+i+'"]').click();
 }
 await page.locator('[data-action="next-reveal"]').click();
 await page.locator('.artemis-stage').waitFor({timeout:8000});
 const invited=await page.locator('.artemis-table-card').count();
 if(invited!==3)throw Error('Artemis invitation dropped a card: '+invited);
 steps.push('All three cards revealed; explicit Artemis invitation appears');
 await page.screenshot({path:dir+'/handoff-artemis-invitation.png'});
 await page.locator('[data-action="invite-reader"]').click();
 await page.locator('.artemis-reading-table').waitFor({timeout:8000});
 if(await page.locator('.artemis-reading-card').count()!==3)throw Error('Artemis reading table must preserve the original three cards');
 steps.push('Artemis reading table and staged scripted reading reached');
 await page.screenshot({path:dir+'/handoff-artemis-reading.png'});
 if(errors.length)throw Error('Page errors: '+errors.join(' | '));
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:true,steps,errors},null,2));
 console.log('Gate B → Sphere → Reveal → Artemis browser smoke PASS',steps);
}catch(error){
 await page?.screenshot({path:dir+'/handoff-failure.png'}).catch(()=>{});
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:false,steps,errors,error:String(error)},null,2));
 throw error;
}finally{
 await browser.close();
}
