import {shuffleDeck} from '../../src/deck.mjs';
import {GATE_B_HANDOFF_KEY,parseGateBHandoff} from '../../src/gate-b-handoff.mjs';
import {mountPostShuffle} from './scene.mjs';
const launch=document.getElementById('ps-start'),button=document.getElementById('finish-shuffle');
let handoff=null;
try{const raw=sessionStorage.getItem(GATE_B_HANDOFF_KEY);if(raw)handoff=parseGateBHandoff(raw)}catch(error){console.warn('Ignoring invalid prior handoff',error)}
let world=null;
button.addEventListener('click',()=>{if(world)return;launch.hidden=true;
 world=mountPostShuffle({mount:document.getElementById('post-shuffle-mount'),deckIds:handoff?.cardIds||shuffleDeck().map(c=>c.id),demo:true});
 window.__POST_SHUFFLE__=world;
});
window.addEventListener('pagehide',()=>world?.dispose(),{once:true});
