import {shuffleDeck} from '../../src/deck.mjs';
import {GATE_B_HANDOFF_KEY,parseGateBHandoff} from '../../src/gate-b-handoff.mjs';
import {mountPostShuffle} from './scene.mjs';
const launch=document.getElementById('ps-start'),button=document.getElementById('finish-shuffle'),toolbar=document.getElementById('ps-review');
let handoff=null;
try{const raw=sessionStorage.getItem(GATE_B_HANDOFF_KEY);if(raw)handoff=parseGateBHandoff(raw)}catch(error){console.warn('Ignoring invalid prior handoff',error)}
// Sample once, never reshuffle a replay or seek.
const deckIds=handoff?.cardIds||shuffleDeck().map(c=>c.id);
let world=null;
function play(){world?.dispose();launch.hidden=true;toolbar.hidden=false;
 world=mountPostShuffle({mount:document.getElementById('post-shuffle-mount'),deckIds,demo:true});
 window.__POST_SHUFFLE__=world;
}
button.addEventListener('click',play);
document.getElementById('ps-replay').addEventListener('click',play);
document.getElementById('ps-interior').addEventListener('click',()=>{if(!world)play();world.seek(7.5)});
window.addEventListener('keydown',event=>{
 if(event.altKey||event.metaKey||event.ctrlKey||/INPUT|TEXTAREA/.test(document.activeElement?.tagName||''))return;
 if(event.key.toLowerCase()==='r')play();
 if(event.key.toLowerCase()==='i'){if(!world)play();world.seek(7.5)}
});
if(new URLSearchParams(location.search).get('autostart')==='1')play();
window.addEventListener('pagehide',()=>world?.dispose(),{once:true});
