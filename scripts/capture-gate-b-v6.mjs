import { chromium } from 'playwright';
import {mkdir,rename,writeFile} from 'node:fs/promises';
const dir='artifacts/gate-b-v6';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--disable-web-security','--no-sandbox'
]});
const context=await browser.newContext({viewport:{width:860,height:720},
 recordVideo:{dir,size:{width:860,height:720}}});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:4184/preview/gate-b/',{waitUntil:'networkidle',timeout:60000});
await page.waitForFunction(()=>window.__ritualGateB?.world?.cards?.length===78);
const renderer=await page.evaluate(()=>{
 const w=window.__ritualGateB.world;
 return {type:w.gl?'WebGL2':'Canvas fallback',cardCount:w.cards.length};
});
if(renderer.type!=='WebGL2')throw Error('Actual GPU browser review requires WebGL2: '+JSON.stringify(renderer));
await page.locator('#start-shuffle').click();
let last=0;
for(const t of [1.1,1.9,2.4,3.1,3.7,4.7,5.8,6.5,8.3,10.8]){
 await page.waitForTimeout(Math.max(0,(t-last)*1000));
 await page.screenshot({path:dir+'/frame-'+t.toFixed(1)+'.png'});
 last=t;
}
const state=await page.evaluate(()=>window.__ritualGateB.diagnostics());
await context.close();await browser.close();
await writeFile(dir+'/browser-report.json',JSON.stringify({renderer,state,errors},null,2));
if(errors.length)throw Error('Page errors: '+errors.join(' | '));
console.log('Captured WebGL2 video + 10 screenshots',renderer);
