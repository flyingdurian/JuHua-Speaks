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
 await page.locator('#ps-cards').waitFor({timeout:15000});
 steps.push('Finish Shuffling seamlessly mounted the new 78-card world in the same page');
 const frozen=await page.evaluate(()=>{
  const packed=JSON.parse(sessionStorage.getItem('juhua:gate-b-reveal:v1'));
  const actual=window.__POST_SHUFFLE__.deck();
  return {packed:packed.cardIds,actual,href:location.pathname};
 });
 if(frozen.href!=='/preview/gate-b/')throw Error('Post-shuffle sequence navigated away');
 if(frozen.actual.length!==78||new Set(frozen.actual).size!==78)throw Error('Post-shuffle card identities invalid');
 if(JSON.stringify(frozen.packed)!==JSON.stringify(frozen.actual))throw Error('Scene shuffled a second time');
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.ready(),{timeout:15000});
 const cards=await page.evaluate(()=>window.__POST_SHUFFLE__.visible().filter(x=>x.side===1&&!x.selected));
 if(cards.length<8)throw Error('Interior sphere has too few visible card backs');
 steps.push('One camera flight completed and original 78 card identities preserved');
 await page.screenshot({path:dir+'/handoff-sphere.png'});

 if(errors.length)throw Error('Page errors: '+errors.join(' | '));
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:true,steps,errors},null,2));
 console.log('Gate B → Continuous Deck Launch → Interactive Sphere browser smoke PASS',steps);
}catch(error){
 await page?.screenshot({path:dir+'/handoff-failure.png'}).catch(()=>{});
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:false,steps,errors,error:String(error)},null,2));
 throw error;
}finally{
 await browser.close();
}
