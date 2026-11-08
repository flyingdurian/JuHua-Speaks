import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const at=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('approved Gate A v7 is the public landing, not a second unused preview',async()=>{
 const index=await at('index.html'),preview=await at('preview/gate-a/index.html');
 assert.match(index,/<base href="\.\/preview\/gate-a\/"\/>/);
 assert.match(index,/<body data-gate-role="production">/);
 assert.match(index,/class="gate-a production-landing"/);
 assert.match(index,/v0\.8\.3/);
 assert.match(index,/src="\.\/gate-a\.mjs"/);
 assert.match(preview,/GATE A v7/);
 assert.doesNotMatch(preview,/data-gate-role="production"/);
});
test('landing question is handed to the old ritual privately, no querystring leaks',async()=>{
 const landing=await at('preview/gate-a/gate-a.mjs'),app=await at('src/app.mjs');
 const old=await at('ritual.html');
 assert.match(landing,/isProductionLanding=document\.body\.dataset\.gateRole==='production'/);
 assert.match(landing,/sessionStorage\.setItem\('juhua:gate-a-question',value\)/);
 assert.match(landing,/new URL\('\.\.\/\.\.\/ritual\.html',import\.meta\.url\)/);
 assert.doesNotMatch(landing,/location\.assign\([^)]*encodeURIComponent/);
 assert.match(app,/sessionStorage\.removeItem\('juhua:gate-a-question'\)/);
 assert.match(app,/step:incomingGateB\?3:incomingGateQuestion\?1:0/);
 assert.match(app,/question:incomingGateB\?\.question\|\|incomingGateQuestion/);
 assert.match(old,/src="\.\/src\/app\.mjs"/);
});
test('public Pages builds root and friend-accessible Gate A v7 preview',async()=>{
 const ci=await at('.github/workflows/ci.yml');
 const css=await at('preview/gate-a/gate-a.css');
 assert.match(ci,/cp index\.html _site\/index\.html/);
 assert.match(ci,/cp ritual\.html _site\/ritual\.html/);
 assert.match(ci,/cp -R preview _site\/preview/);
 assert.match(css,/\.production-landing \.gate-footer \.review-controls/);
 assert.match(css,/\.production-landing\.exiting-landing/);
 assert.doesNotMatch(ci,/cp -R worker _site/);
});
test('published landing version matches the project version',async()=>{
 const pkg=JSON.parse(await at('package.json'));
 const source=await at('src/version.mjs');
 assert.equal(pkg.version,'0.8.3');
 assert.match(source,/APP_VERSION='0\.8\.3'/);
});
