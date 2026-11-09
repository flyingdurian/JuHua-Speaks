import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const host='http://127.0.0.1:'+(process.env.GATE_B_PORT||4184);
const dir='artifacts/post-shuffle';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:860,height:720},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.goto(host+'/preview/post-shuffle/',{waitUntil:'domcontentloaded'});
 await page.click('#finish-shuffle');await page.waitForFunction(()=>Boolean(window.__POST_SHUFFLE__));
 const deck=await page.evaluate(()=>window.__POST_SHUFFLE__.deck());assert.equal(deck.length,78);assert.equal(new Set(deck).size,78);
 await page.waitForTimeout(350);await page.screenshot({path:dir+'/01-deck-launched.png'});
 await page.waitForTimeout(1850);await page.screenshot({path:dir+'/02-sphere-distribution.png'});
 await page.waitForTimeout(2200);await page.screenshot({path:dir+'/03-fast-orbit.png'});
 await page.waitForTimeout(2650);await page.screenshot({path:dir+'/04-inside-sphere.png'});
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.ready()),true);
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.stage()),'inside');
 const selected=[];
 for(let i=0;i<3;i++){
  let newlySelected=false;
  for(let tries=0;tries<45&&!newlySelected;tries++){
   const pick=await page.evaluate((attempt)=>{
    const v=window.__POST_SHUFFLE__.visible().filter(c=>c.side===0&&!c.selected&&c.x>30&&c.x<innerWidth-30&&c.y>76&&c.y<innerHeight-90).sort((a,b)=>a.depth-b.depth);
    return v[(attempt*3)%Math.max(1,v.length)]||null;
   },tries);
   if(!pick)throw Error('No visible inward-facing cards available');
   await page.mouse.click(pick.x,pick.y);await page.waitForTimeout(75);
   const count=await page.evaluate(()=>window.__POST_SHUFFLE__.selected().length);
   if(count===i+1)newlySelected=true;
  }
  assert.ok(newlySelected,'A real screen click must select card '+(i+1));
  const choices=await page.evaluate(()=>window.__POST_SHUFFLE__.selected());
  assert.equal(choices.length,i+1);selected.push(choices.at(-1).id);
  await page.screenshot({path:dir+'/05-selected-'+(i+1)+'.png'});
 }
 assert.deepEqual(await page.evaluate(()=>window.__POST_SHUFFLE__.selected().map(c=>c.id)),selected);
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.tableau()?.active===true,{timeout:10000});
 assert.equal(await page.locator('.ps-tableau').isVisible(),true,'Three-card tableau must appear in-world');
 assert.equal(await page.locator('.ps-flip-button').count(),3);
 const foil=await page.evaluate(()=>window.__POST_SHUFFLE__.foil());
 assert.ok(['celestial-holographic-wash','chroma-shifting-metallic-sheen','pearlescent-gloss','spectrum-activation-wave'].includes(foil));
 await page.screenshot({path:dir+'/07-three-selected-backs.png',timeout:60000});
 for(let i=0;i<3;i++){
  await page.locator('.ps-flip-button').nth(i).click();
  await page.waitForTimeout(1320);
  assert.equal(await page.locator('.ps-tableau-detail').nth(i).isVisible(),true,'Revealed card must show its meaning');
 }
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.tableau().revealed),3);
 assert.equal(await page.locator('.ps-card-art').count(),3,'RWS front images must stay in the reveal');
 await page.screenshot({path:dir+'/08-three-foil-reveals.png',timeout:60000});
 assert.deepEqual(errors,[]);
 console.log('Post-shuffle browser PASS: continuous universe, 3 physical selections, session foil, 3 RWS flips and descriptions');
}finally{await browser.close()}
