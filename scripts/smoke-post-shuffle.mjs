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
 // Deterministic reference-aligned frames; software GPU and JPEG loads must
 // never silently move the screenshots into the wrong animation beat.
 for(const [seconds,name] of [[.55,'01-deck-launched'],[2.45,'02-sphere-distribution'],[4.0,'03-fast-orbit'],[7.5,'04-inside-sphere']]){
  await page.evaluate(t=>window.__POST_SHUFFLE__.seek(t),seconds);
  await page.waitForTimeout(440);
  assert.ok(Math.abs(await page.evaluate(()=>window.__POST_SHUFFLE__.time())-seconds)<.02);
  await page.screenshot({path:dir+'/'+name+'.png'});
 }
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.ready()),true);
 assert.equal(await page.evaluate(()=>window.__POST_SHUFFLE__.stage()),'inside');
 const selected=[];
 for(let i=0;i<3;i++){
  let newlySelected=false;
  for(let tries=0;tries<45&&!newlySelected;tries++){
   const pick=await page.evaluate((attempt)=>{
    const world=window.__POST_SHUFFLE__;
    const v=world.visible().filter(c=>c.side===1&&!c.selected&&c.x>30&&c.x<innerWidth-30&&c.y>76&&c.y<innerHeight-90).sort((a,b)=>a.depth-b.depth);
    const valid=v.filter(c=>world.hitTest(c.x,c.y).length>0);
    return valid[(attempt*3)%Math.max(1,valid.length)]||null;
   },tries);
   if(!pick)throw Error('No visible inward-facing cards available');
   await page.mouse.click(pick.x,pick.y);await page.waitForTimeout(75);
   const count=await page.evaluate(()=>window.__POST_SHUFFLE__.selected().length);
   if(count===i+1)newlySelected=true;
  }
  assert.ok(newlySelected,'A real screen click must select card '+(i+1)+'; diagnostics: '+JSON.stringify(await page.evaluate(()=>{
   const w=window.__POST_SHUFFLE__;
   return {state:w.stage(),visible:w.visible().length,backs:w.visible().filter(c=>c.side===1).length,errors:[]};
  })));
  const choices=await page.evaluate(()=>window.__POST_SHUFFLE__.selected());
  assert.equal(choices.length,i+1);selected.push(choices.at(-1).id);
  await page.screenshot({path:dir+'/05-selected-'+(i+1)+'.png'});
 }
 assert.deepEqual(await page.evaluate(()=>window.__POST_SHUFFLE__.selected().map(c=>c.id)),selected);
 assert.equal(await page.locator('#ps-end').isVisible(),true);
 assert.deepEqual(errors,[]);
 console.log('Post-shuffle browser PASS: 78 unique identities, continuity, camera interior, 3 actual pointer selects, 7 screenshots');
}finally{await browser.close()}
