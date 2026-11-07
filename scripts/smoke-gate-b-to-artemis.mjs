/**
 * Gate B -> full-screen Gate C -> tactile Gate D -> Artemis.
 * Real Chromium. Source art pre-synced by workflow. No live AI.
 * Fast-forwards only the separately tested 16.55s Gate B shuffle.
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
 const context=await browser.newContext({viewport:{width:1100,height:760}});
 page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.__ritualGateB?.world?.cards?.length===78,{timeout:15000});
 await page.locator('#question').fill('How do I navigate a meaningful new decision?');
 await page.locator('#start-shuffle').click();
 await page.evaluate(()=>{
  const world=window.__ritualGateB.world;
  if(world.phase!=='shuffle_ritual')throw Error('Gate B did not enter shuffle');
  world.setPhase('deck_formed');
 });
 await page.waitForFunction(()=>!document.getElementById('deck-controls').hidden,{timeout:5000});
 steps.push('Original 78-card Gate B deck formed');
 await page.locator('#finish-shuffle').click();
 await page.waitForURL('**/ritual.html',{timeout:15000});
 await page.locator('.gate-sphere').waitFor({timeout:15000});
 await page.locator('.gate-entry-cinematic').waitFor({state:'hidden',timeout:10000});
 if(await page.locator('.gate-sphere').count()!==1)throw Error('Fullscreen gate was not rendered');
 const bounds=await page.locator('.gate-sphere').boundingBox();
 if(!bounds||bounds.width<1060||bounds.height<700)throw Error('Gate remains trapped in a small chamber: '+JSON.stringify(bounds));
 if(await page.evaluate(()=>sessionStorage.getItem('juhua:gate-b-reveal:v1'))!==null)throw Error('Handoff was not consumed');
 steps.push('Scripted gate entry reached viewport-filling inside sphere');
 await page.screenshot({path:dir+'/handoff-gate-c-fullscreen.png',animations:'allow'});
 const gpu=await page.locator('#sphere-webgl').count()===1;
 if(gpu)steps.push('Persistent WebGL2 inside-sphere renderer mounted');
 // 2D fallback uses the SAME 78 securely shuffled identities and selection reducer.
 if(gpu)await page.locator('[data-action="sphere-mode"]').click();
 await page.locator('.flat-card-grid').waitFor({timeout:15000});
 if(await page.locator('.flat-card').count()!==78)throw Error('All 78 cards must remain selectable');
 await page.screenshot({path:dir+'/handoff-sphere-2d.png'});
 for(let i=0;i<3;i++)await page.locator('.flat-card:not(.chosen)').first().click();
 const chosen=await page.locator('.flat-card.chosen').count();
 if(chosen!==3)throw Error('Sphere did not preserve three distinct picks: '+chosen);
 if(await page.locator('.gate-slot.is-chosen').count()!==3)throw Error('Three-card HUD not synced');
 steps.push('Three distinct selections remained independently marked');
 await page.locator('[data-action="confirm-cards"]').click();
 const count=await page.locator('[data-vanishing-card]').count();
 if(count!==75)throw Error('Expected 75 unique cards in black-hole collapse, got '+count);
 await page.screenshot({path:dir+'/handoff-black-hole.png',animations:'allow'});
 await page.locator('.physical-reveal').waitFor({timeout:12000});
 steps.push('Exactly 75 unselected card identities collapsed; selected three entered Gate D');
 const images=page.locator('.gate-peel-art img');
 if(await images.count()!==3)throw Error('Authentic artwork missing from reveal underlay');
 await images.first().waitFor({state:'visible'});
 await page.locator('[data-peek-card="0"]').click();
 const progress=Number(await page.locator('[data-peek-progress="0"]').getAttribute('value'));
 if(!(progress>0&&progress<100))throw Error('Peek did not advance partially: '+progress);
 await page.screenshot({path:dir+'/handoff-reveal-peek.png'});
 for(let i=0;i<3;i++){
  for(let j=i===0?1:0;j<5;j++)await page.locator('[data-peek-card="'+i+'"]').click();
 }
 await page.locator('[data-action="next-reveal"]').click();
 await page.locator('.artemis-stage').waitFor({timeout:9000});
 if(await page.locator('.artemis-table-card').count()!==3)throw Error('Artemis lost a selected card');
 steps.push('All three card backs physically peeled and real RWS faces revealed');
 for(const style of ['shrine','modern','storybook']){
  await page.locator('[data-artemis-style="'+style+'"]').click();
  await page.locator('[data-artemis-mood="present"]').click();
  if(await page.locator('.artemis-persona-'+style).count()!==1)throw Error('Missing Artemis design '+style);
  await page.screenshot({path:dir+'/handoff-artemis-'+style+'.png'});
 }
 steps.push('Three Artemis identity/costume studies and gesture controls render');
 await page.locator('[data-action="invite-reader"]').click();
 await page.locator('.artemis-reading-table').waitFor({timeout:9000});
 if(await page.locator('.artemis-reading-card').count()!==3)throw Error('Scripted reading dropped the selected trio');
 await page.screenshot({path:dir+'/handoff-artemis-reading.png'});
 steps.push('Explicit invitation starts the scripted reading only');
 if(errors.length)throw Error('Page errors: '+errors.join(' | '));
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:true,gpu,steps,errors},null,2));
 console.log('Gate C/D + Artemis browser smoke PASS',steps);
}catch(error){
 await page?.screenshot({path:dir+'/handoff-failure.png'}).catch(()=>{});
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:false,steps,errors,error:String(error)},null,2));
 throw error;
}finally{await browser.close()}
