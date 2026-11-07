import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gateSelectionMarkup,renderGateSphere} from '../src/gate-sphere-view.mjs';
import {peekOrigin,peekProgress,peekDirection,renderPhysicalReveal} from '../src/physical-reveal.mjs';
import {ARTEMIS_EXPRESSIONS,ARTEMIS_ACTIONS,renderArtemisInvitation} from '../src/artemis-stage.mjs';
import {ARTEMIS_IDENTITY,resolveArtemisPose,renderArtemisPortrait,readingArtemisPose} from '../src/artemis-character.mjs';

const at=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const h=x=>String(x),t=en=>en,btn=(a,c)=>'<button data-action="'+a+'">'+c+'</button>';
const cardBack=()=>'<span class="card-back">BACK</span>';
const cardFace=(c)=>'<span class="card-face" data-card="'+c.id+'">ART-'+c.id+'</span>';
const roleNames=()=>['Past','Present','Future'];
const cards=Array.from({length:78},(_,i)=>({id:'card-'+i,name:'Tarot '+i,zh:'塔罗',upright:'Meaning',reversed:'Meaning'}));
const state=(picks=[])=>({picks,locale:'en',sphereMode:'gpu',orbitPaused:false,question:'A meaningful question?',peekProgress:[0,0,0],peekAxes:[{ax:0,ay:1,mode:'edge-x',signX:1},{ax:0,ay:1,mode:'edge-x',signX:1},{ax:0,ay:1,mode:'edge-x',signX:1}],revealedCards:[false,false,false],artemisStyle:'shrine',artemisMood:'welcome'});

test('full-screen Gate C renders one immersive sphere and preserved 3-slot HUD',()=>{
 const s=state();
 const out=renderGateSphere({state:s,t,h,btn,cardBack,roleNames,flatCardTable:()=>'<div>2D</div>'});
 assert.match(out,/id="sphere-scene"/);
 assert.match(out,/gate-sphere/);
 assert.match(out,/gate-selection-area/);
 assert.match(out,/Past/);
 assert.match(out,/Present/);
 assert.match(out,/Future/);
 assert.match(out,/Confirm three cards/);
 const selected=[0,1,2].map(i=>({card:cards[i],orientation:'upright'}));
 const hud=gateSelectionMarkup({state:state(selected),t,h,btn,cardBack,roleNames});
 assert.equal((hud.match(/is-chosen/g)||[]).length,3);
 assert.equal((hud.match(/data-unselect=/g)||[]).length,3);
});

test('physical edge/corner/bottom peeks preserve direction and can advance progressively',()=>{
 assert.equal(peekDirection(peekOrigin(3,120,200,360)),'left');
 assert.equal(peekDirection(peekOrigin(197,150,200,360)),'right');
 assert.equal(peekDirection(peekOrigin(100,355,200,360)),'bottom');
 assert.equal(peekDirection(peekOrigin(2,3,200,360)),'top-left');
 assert.equal(peekDirection(peekOrigin(198,357,200,360)),'bottom-right');
 assert.ok(peekProgress(.25,40,0,200,360,peekOrigin(3,120,200,360))>.25);
 const s=state([0,1,2].map(i=>({card:cards[i],orientation:'upright'})));
 const out=renderPhysicalReveal({state:s,t,h,btn,eyebrow:x=>x,cardBack,cardFace,description:()=>'',roleNames});
 for(const id of [0,1,2])assert.match(out,new RegExp('ART-card-'+id));
 assert.match(out,/gate-peel-cover/);
 assert.match(out,/gate-peel-fold/);
 assert.match(out,/data-reveal-instant/);
});

test('Artemis locks one consistent B+C identity across eight faces and eight gestures',()=>{
 assert.match(ARTEMIS_IDENTITY.label,/Modern Occult/);assert.match(ARTEMIS_IDENTITY.label,/Dreamlike Storybook/);
 assert.equal(ARTEMIS_EXPRESSIONS.length,8);assert.equal(ARTEMIS_ACTIONS.length,8);
 assert.equal(new Set(ARTEMIS_EXPRESSIONS.map(x=>x.id)).size,8);
 assert.equal(new Set(ARTEMIS_ACTIONS.map(x=>x.id)).size,8);
 const s=state([0,1,2].map(i=>({card:cards[i],orientation:'upright'})));
 s.revealedCards=[true,true,true];s.artemisExpression='welcome';s.artemisAction='present';
 const output=renderArtemisInvitation({state:s,t,h,btn,eyebrow:x=>x,cardFace,description:()=>'',roleNames});
 for(const x of ARTEMIS_EXPRESSIONS)assert.match(output,new RegExp('data-artemis-expression="'+x.id+'"'));
 for(const x of ARTEMIS_ACTIONS)assert.match(output,new RegExp('data-artemis-action="'+x.id+'"'));
 assert.match(output,/artemis-avatar/);assert.doesNotMatch(output,/data-artemis-style|data-artemis-mood/);
 const combinations=new Set();
 for(const face of ARTEMIS_EXPRESSIONS)for(const gesture of ARTEMIS_ACTIONS){
  const art=renderArtemisPortrait({expression:face.id,action:gesture.id});
  assert.match(art,/artemis-flower/);assert.match(art,/artemis-fringe/);assert.match(art,/artemis-arms/);
  combinations.add(art);
 }
 assert.equal(combinations.size,64);
 assert.deepEqual(resolveArtemisPose({expression:'bad',action:'bad'}),{expression:'neutral',action:'idle'});
 assert.deepEqual(readingArtemisPose(-1),{expression:'welcome',action:'present'});
 assert.deepEqual(readingArtemisPose(3),{expression:'reassuring',action:'acknowledge'});
 assert.throws(()=>renderArtemisInvitation({state:state(),t,h,btn,eyebrow:x=>x,cardFace,description:()=>'',roleNames}),/Three revealed cards required/);
});

test('selection does not destroy the WebGL canvas and black hole has 75 actual identities',async()=>{
 const [app,gpu,css]=await Promise.all([at('src/app.mjs'),at('src/webgl-sphere.mjs'),at('src/styles.css')]);
 assert.match(app,/function refreshGateSelection/);
 assert.match(app,/webglSphere\?\.syncSelection\?\./);
 assert.match(gpu,/syncSelection\(nextPicks\)/);
 assert.match(app,/remaining=state\.shuffled\.filter\(card=>!locked\.has\(card\.id\)\)/);
 assert.match(app,/data-vanishing-card/);
 assert.match(app,/gateEntering:Boolean\(incomingGateB\)/);
 assert.match(css,/gate-spiral-collapse/);
 assert.match(css,/gate-entry-cinematic/);
 assert.match(css,/gate-peel-card\[data-peek-direction="bottom"\]/);
 assert.doesNotMatch(app.slice(app.indexOf('function selectCard(card){'),app.indexOf('function toggleCard(card)')),/\brender\(\)/);
});
