/** Real WebGL2 owner-review recording: Gate B layered deck → inline camera sphere. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile,rename} from 'node:fs/promises';
const dir='artifacts/physical-deck';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'
]});
const context=await browser.newContext({viewport:{width:1024,height:900},recordVideo:{dir,size:{width:1024,height:900}}});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
try{
 await page.goto('http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.__ritualGateB?.world?.cards?.length===78,{timeout:25000});
 await page.locator('#start-shuffle').click();
 // Fast-forward only the preview's automatic timer for this browser smoke.
 await page.evaluate(()=>{const w=window.__ritualGateB.world;if(w.phase!=='shuffle_ritual')throw Error('Gate B did not enter shuffle');w.setPhase('deck_formed')});
 await page.waitForTimeout(1600);
 const diagnostics=await page.evaluate(()=>window.__ritualGateB.world.getDiagnostics());
 assert.equal(diagnostics.deckInstances,78);
 assert.equal(diagnostics.deckShadowMap,true,'WebGL2 depth-shadow FBO required');
 await page.screenshot({path:dir+'/01-78-physical-instanced-deck.png',timeout:60000});
 const oldUrl=page.url();
 await page.locator('#finish-shuffle').click();
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.deck()?.length===78,{timeout:18000});
 assert.equal(page.url(),oldUrl,'No route navigation or flash');
 assert.equal(await page.locator('iframe').count(),0);
 assert.equal(await page.locator('.ritual-black-hole').count(),0);
 await page.waitForTimeout(850);
 await page.screenshot({path:dir+'/02-deck-recedes.png',timeout:60000});
 await page.waitForTimeout(1700);
 await page.screenshot({path:dir+'/03-cards-scatter.png',timeout:60000});
 await page.waitForTimeout(1900);
 await page.screenshot({path:dir+'/04-sphere-approaches.png',timeout:60000});
 await page.waitForFunction(()=>window.__POST_SHUFFLE__?.ready(),{timeout:18000});
 await page.screenshot({path:dir+'/05-inside-celestial-sphere.png',timeout:60000});
 assert.equal(new Set(await page.evaluate(()=>window.__POST_SHUFFLE__.deck())).size,78);
 assert.ok((await page.evaluate(()=>window.__POST_SHUFFLE__.visible())).some(c=>c.side===0),'Inward backs visible');
 for(let i=0;i<3;i++){
  let selected=false;
  for(let k=0;k<30&&!selected;k++){
   const pick=await page.evaluate(n=>{
    const v=window.__POST_SHUFFLE__.visible().filter(c=>c.side===0&&!c.selected&&c.x>40&&c.x<innerWidth-40&&c.y>80&&c.y<innerHeight-85).sort((a,b)=>a.depth-b.depth);
    return v[(n*7)%v.length]||null;
   },k);
   if(!pick)throw Error('No visible inward-facing selectable card');
   if(i===0&&k<4){
    const state=await page.evaluate(p=>({
     hit:document.elementFromPoint(p.x,p.y)?.outerHTML?.slice(0,300),
     selections:window.__POST_SHUFFLE__.selected(),
     stage:window.__POST_SHUFFLE__.stage(),
     visible:window.__POST_SHUFFLE__.visible().length,
     side0:window.__POST_SHUFFLE__.visible().filter(v=>v.side===0).length,
     target:p
    }),pick);console.log('PICK DEBUG',JSON.stringify(state));
   }
   await page.mouse.click(pick.x,pick.y);
   await page.waitForTimeout(90);
   selected=(await page.evaluate(()=>window.__POST_SHUFFLE__.selected().length))===i+1;
   if(i===0&&k<4)console.log('AFTER PICK',JSON.stringify(await page.evaluate(()=>window.__POST_SHUFFLE__.selected())));
  }
  assert.ok(selected,'True card hit-testing failed at selection '+(i+1));
 }
 await page.screenshot({path:dir+'/06-three-chosen.png',timeout:60000});
 assert.equal(await page.locator('#ps-end').isVisible(),true);
 assert.deepEqual(errors,[]);
 await writeFile(dir+'/report.json',JSON.stringify({passed:true,diagnostics,selected:await page.evaluate(()=>window.__POST_SHUFFLE__.selected()),errors},null,2));
 console.log('GPU physical deck / same-page Gate C / 78 original identities / 3 selections: PASS');
}catch(e){
 await page.screenshot({path:dir+'/failure.png',timeout:30000}).catch(()=>{});
 await writeFile(dir+'/report.json',JSON.stringify({passed:false,error:String(e),errors},null,2));
 throw e;
}finally{
 const video=page.video();
 await context.close();
 if(video){try{await rename(await video.path(),dir+'/physical-deck-to-sphere.webm')}catch{}}
 await browser.close();
}