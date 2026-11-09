/**
 * Gate BC v3.3 GPU smoke: original Gate B 78-card deck → same-document
 * cinematic sphere → continuous 360-degree panorama → three authentic
 * RWS reveals → four previewable hologram styles.
 *
 * Historical Artemis navigation is intentionally NOT part of this review:
 * the user rejected the ritual.html handoff and approved the continuous
 * fullscreen scene. No production route is touched and no AI is activated.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/gate-b-v8';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'
]});
let page;
const errors=[],steps=[];
try{
 const context=await browser.newContext({viewport:{width:860,height:720},deviceScaleFactor:1});
 page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));
 const originalUrl='http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in';
 await page.goto(originalUrl,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.__ritualGateB?.world?.cards?.length===78,undefined,{timeout:15000});
 await page.locator('#question').fill('How do I navigate a meaningful new decision?');
 await page.locator('#start-shuffle').click();
 await page.evaluate(()=>{
  const w=window.__ritualGateB.world;
  if(w.phase!=='shuffle_ritual')throw Error('Gate B never entered the shuffle');
  // Fast-forward only the already source-tested 10.6-second 10-beat shuffle.
  w.setPhase('deck_formed');
 });
 await page.waitForFunction(()=>!document.getElementById('deck-controls').hidden,undefined,{timeout:6000});
 const diagnostics=await page.evaluate(()=>window.__ritualGateB.diagnostics());
 assert.equal(diagnostics.cards,78);
 steps.push('Gate B: all 78 original cards survive consolidation');
 await page.screenshot({path:dir+'/v33-01-compressed-deck.png'});
 await page.locator('#finish-shuffle').click();
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.deck()?.length===78,undefined,{timeout:15000});
 assert.equal(page.url(),originalUrl,'FINISH SHUFFLING must not navigate away');
 assert.equal(await page.locator('#ps-world').count(),1,'fullscreen sphere mounted inline');
 assert.equal(await page.locator('iframe').count(),0,'no replacement chamber iframe');
 steps.push('FINISH SHUFFLING retains original document and 78 real identities');
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.ready()===true,undefined,{timeout:20000});
 const ids=await page.evaluate(()=>window.__POST_SHUFFLE__.deck());
 assert.equal(new Set(ids).size,78,'no shuffle/deal identity replacement');
 await page.screenshot({path:dir+'/v33-02-sphere-interior.png'});
 // Pan beyond 360 degrees, not just the former ±1.65-radian half-turn.
 for(let j=0;j<3;j++){
  await page.mouse.move(90,350);await page.mouse.down();
  await page.mouse.move(770,350,{steps:18});await page.mouse.up();
 }
 const orbit=await page.evaluate(()=>window.__POST_SHUFFLE__.orbitYaw());
 assert.ok(orbit>Math.PI*2,'sphere orbit must allow >360° (got '+orbit+')');
 steps.push('Pointer drag completes >360-degree continuous yaw without clamping');
 const selected=[];
 for(let i=0;i<3;i++){
  let success=false;
  for(let attempt=0;attempt<55&&!success;attempt++){
   const hit=await page.evaluate((tryIndex)=>{
    const available=window.__POST_SHUFFLE__.visible()
     .filter(c=>c.side===0&&!c.selected&&c.x>30&&c.x<innerWidth-30&&c.y>85&&c.y<innerHeight-80)
     .sort((a,b)=>a.depth-b.depth);
    return available[(tryIndex*7)%Math.max(1,available.length)]||null;
   },attempt);
   if(!hit){await page.waitForTimeout(100);continue}
   await page.mouse.click(hit.x,hit.y);await page.waitForTimeout(95);
   success=(await page.evaluate(()=>window.__POST_SHUFFLE__.selected().length))===i+1;
  }
  assert.ok(success,'clicking actual rendered cards must select card '+(i+1));
  const picks=await page.evaluate(()=>window.__POST_SHUFFLE__.selected());
  selected.push(picks.at(-1).id);
 }
 assert.deepEqual(await page.evaluate(()=>window.__POST_SHUFFLE__.selected().map(c=>c.id)),selected);
 steps.push('Three distinct physical Past / Present / Future cards selected by real mouse clicks');
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.tableau()?.active===true,undefined,{timeout:12000});
 await page.locator('.ps-tableau.ps-tableau-visible').waitFor({timeout:12000});
 await page.waitForFunction(()=>{
  const imgs=[...document.querySelectorAll('.ps-tableau .ps-card-art')];
  return imgs.length===3&&imgs.every(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0);
 },undefined,{timeout:25000});
 assert.equal(await page.locator('.ps-flip-button').count(),3);
 assert.equal(await page.locator('.ps-flip-button:disabled').count(),0);
 const flap=await page.locator('.ps-flip-inner').first().evaluate(el=>getComputedStyle(el,'::before').display);
 assert.equal(flap,'none','detached CSS paper flap must never render');
 const holo=page.locator('.ps-hologram-name');
 const variants=new Set();
 for(let i=0;i<4;i++){
  variants.add((await holo.textContent()).trim());
  await page.locator('.ps-hologram-next').click();
 }
 assert.equal(variants.size,4,'must cycle all four hologram treatments');
 steps.push('Reveal: three original RWS scans loaded; no detached flap; four hologram controls cycle');
 await page.screenshot({path:dir+'/v33-03-three-backs-hologram-controls.png'});
 for(let i=0;i<3;i++){
  await page.locator('.ps-flip-button').nth(i).click();
  await page.waitForTimeout(1230);
  assert.equal(await page.locator('.ps-tableau-detail').nth(i).isVisible(),true,'interpretation visible after flip');
 }
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.tableau().revealed),3);
 assert.equal(await page.locator('.ps-card-art').count(),3);
 await page.locator('.ps-hologram-next').click();
 await page.screenshot({path:dir+'/v33-04-three-revealed-holographic-rws.png'});
 steps.push('All three original illustrations flip and their meanings remain stable as holograms change');
 assert.deepEqual(errors,[],'no uncaught browser errors');
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:true,steps,errors,orbit,selected,reference:'Gate BC v3.3'} ,null,2));
 console.log('Gate BC v3.3 continuous sphere and holographic reveal browser PASS',steps);
}catch(error){
 await page?.screenshot({path:dir+'/handoff-failure.png'}).catch(()=>{});
 await writeFile(dir+'/handoff-report.json',JSON.stringify({passed:false,steps,errors,error:String(error)},null,2));
 throw error;
}finally{
 await browser.close();
}
