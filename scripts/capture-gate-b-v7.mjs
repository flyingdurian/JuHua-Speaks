import { chromium } from 'playwright';
import {mkdir,rename,writeFile} from 'node:fs/promises';
const dir='artifacts/gate-b-v7';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--disable-web-security','--no-sandbox'
]});
const context=await browser.newContext({viewport:{width:860,height:720},
 recordVideo:{dir,size:{width:860,height:720}}});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in',{waitUntil:'networkidle',timeout:60000});
await page.waitForFunction(()=>window.__ritualGateB?.world?.cards?.length===78);
const renderer=await page.evaluate(()=>{
 const w=window.__ritualGateB.world;
 return {type:w.gl?'WebGL2':'Canvas fallback',cardCount:w.cards.length};
});
if(renderer.type!=='WebGL2')throw Error('Actual GPU browser review requires WebGL2: '+JSON.stringify(renderer));
await page.locator('#start-shuffle').click();
// Capture a full, real-time browser movie first. GPU frames are not inferred
// from screenshot wait durations (which can be slow under SwiftShader).
await page.waitForTimeout(17400);
const frameSamples=[];
for(const t of [1.25,2.1,3.0,3.8,4.65,5.2,5.85,6.75,7.5,8.25,9.2,10.7,11.8,13.5,14.65,16.55]){
 await page.evaluate(age=>{
  const w=window.__ritualGateB.world;
  w.setPaused(false);
  w.setPhase('shuffle_ritual');
  w.elapsed=w.shuffleStartedAt+age;
 },t);
 await page.waitForTimeout(105);
 const observed=await page.evaluate(()=>window.__ritualGateB.world.getShuffleState());
 await page.screenshot({path:dir+'/frame-'+t.toFixed(1)+'.png',animations:'allow',timeout:60000});
 frameSamples.push({requested:t,observed:observed.age,beat:observed.beat});
}
const state=await page.evaluate(()=>window.__ritualGateB.diagnostics());
await context.close();await browser.close();
await writeFile(dir+'/browser-report.json',JSON.stringify({renderer,state,frameSamples,errors},null,2));
if(errors.length)throw Error('Page errors: '+errors.join(' | '));
console.log('Captured WebGL2 video + 16 screenshots',renderer);
