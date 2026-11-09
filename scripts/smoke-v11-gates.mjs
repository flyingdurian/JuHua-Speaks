/**
 * V11 real Chromium end-to-end: Gate B -> in-page Gate C -> three-card
 * singularity -> Flip Reveal -> Artemis. No AI and no production deploy.
 */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/v11-review';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'
]});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
const page=await context.newPage(),errors=[],steps=[];
page.on('pageerror',e=>errors.push('Gate B: '+String(e)));
try{
 await page.goto('http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.__ritualGateB?.world?.cards?.length===78);
 await page.screenshot({path:dir+'/01-landing.png',timeout:60000});
 await page.locator('#question').fill('How do I approach an important decision?');
 await page.locator('#start-shuffle').click();
 await page.evaluate(()=>{
  const w=window.__ritualGateB.world;
  if(w.phase!=='shuffle_ritual')throw Error('Gate B did not start');
  w.setPhase('deck_formed'); // Only browser smoke; real running preview uses 10.95s.
 });
 await page.waitForFunction(()=>!document.getElementById('deck-controls').hidden);
 await page.screenshot({path:dir+'/02-suspended-deck.png',timeout:60000});
 await page.locator('#finish-shuffle').click();
 const portal=page.locator('iframe.gate-b-handoff-frame');
 await portal.waitFor({timeout:30000});
 const gate=page.frameLocator('iframe.gate-b-handoff-frame');
 await gate.locator('.sphere-page').waitFor({timeout:30000});
 const frame=await portal.contentFrame();
 frame.on('pageerror',e=>errors.push('Gate C: '+String(e)));
 await page.waitForFunction(()=>document.querySelector('.gate-b-handoff-layer')?.classList.contains('is-ready'),{timeout:15000});
 // Check full-height, edge-to-edge interactive GPU world (not chamber).
 await gate.locator('#sphere-scene').waitFor({timeout:12000});
 await gate.locator('#sphere-webgl').waitFor({timeout:12000});
 await page.waitForTimeout(2400);
 const dims=await gate.locator('#sphere-scene').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,vw:innerWidth,vh:innerHeight}});
 if(Math.abs(dims.width-dims.vw)>4||Math.abs(dims.height-dims.vh)>6)throw Error('Sphere not full-viewport: '+JSON.stringify(dims));
 if(await gate.locator('canvas#sphere-webgl').count()!==1)throw Error('WebGL sphere canvas not mounted');
 if(await gate.locator('.sphere-page').count()!==1)throw Error('Sphere must appear precisely once');
 await page.screenshot({path:dir+'/03-inside-sphere.png',timeout:60000});
 steps.push('Continuous in-page handoff reached fullscreen 3D sphere at '+dims.vw+'x'+dims.vh);
 // Also test accessible 2D selection, preserving 78 immutable identities.
 await gate.locator('[data-action="sphere-mode"]').click();
 await gate.locator('.flat-card-grid').waitFor({timeout:12000});
 if(await gate.locator('.flat-card').count()!==78)throw Error('78-card selection set is incomplete');
 const original=await gate.locator('.flat-card').evaluateAll(nodes=>nodes.map(x=>x.getAttribute('data-pick')));
 if(new Set(original).size!==78)throw Error('Duplicate Tarot IDs on interior selection');
 for(let i=0;i<3;i++)await gate.locator('.flat-card:not(.chosen)').first().click();
 await page.screenshot({path:dir+'/04-three-selected.png',timeout:60000});
 if(await gate.locator('[data-action="confirm-cards"]').isDisabled())throw Error('Three selected cards cannot be confirmed');
 await gate.locator('[data-action="confirm-cards"]').click();
 const residual=await gate.locator('.ritual-vortex-transition.v11-exit .ritual-vortex-debris [data-residual-card]').count().catch(()=>0);
 // Overlay belongs to iframe's document.body, not the inner sphere section.
 // Check early before the 1.7-second transition destroys it.
 if(residual!==75)throw Error('Exit did not retain 75 individually identified departing cards; got '+residual);
 await gate.locator('.gate-d-reveal').waitFor({timeout:12000});
 if(await gate.locator('[data-flip-card]').count()!==3)throw Error('Expected three flip targets');
 if(await gate.locator('[data-peek-card]').count()!==0)throw Error('Rejected peek interaction returned');
 await page.screenshot({path:dir+'/05-flip-stage.png',timeout:60000});
 for(let i=0;i<3;i++)await gate.locator('[data-flip-card="'+i+'"]').click();
 await gate.locator('[data-action="next-reveal"]').click();
 await gate.locator('.artemis-stage').waitFor({timeout:10000});
 if(await gate.locator('.artemis-table-card').count()!==3)throw Error('Artemis dropped a chosen card');
 await page.screenshot({path:dir+'/06-artemis.png',timeout:60000});
 await gate.locator('[data-action="invite-reader"]').click();
 await gate.locator('.artemis-reading-table').waitFor({timeout:10000});
 if(await gate.locator('.artemis-reading-card').count()!==3)throw Error('Artemis reading table lost cards');
 await page.screenshot({path:dir+'/07-actual-reading.png',timeout:60000});
 steps.push('78 distinct cards => 3 chosen + 75 black-hole cards => 3 flip cards => Artemis');
 if(errors.length)throw Error('Browser page errors: '+errors.join(' | '));
 await writeFile(dir+'/report.json',JSON.stringify({passed:true,steps,dimensions:dims,residual,errors},null,2));
 console.log('V11 END-TO-END PASS',JSON.stringify(steps));
}catch(error){
 await page.screenshot({path:dir+'/failure.png',timeout:30000}).catch(()=>{});
 await writeFile(dir+'/report.json',JSON.stringify({passed:false,steps,error:String(error),errors},null,2));
 throw error;
}finally{await browser.close()}
