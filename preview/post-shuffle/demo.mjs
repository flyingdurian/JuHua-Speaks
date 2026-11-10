import {shuffleDeck} from '../../src/deck.mjs';
import {GATE_B_HANDOFF_KEY,parseGateBHandoff} from '../../src/gate-b-handoff.mjs';
import {mountPostShuffle} from './scene.mjs';
import {reviewDeckOrder,selectionReviewRequested} from './ReviewEntry.mjs';
const launch=document.getElementById('ps-start'),button=document.getElementById('finish-shuffle');
let handoff=null;
try{const raw=sessionStorage.getItem(GATE_B_HANDOFF_KEY);if(raw)handoff=parseGateBHandoff(raw)}catch(error){console.warn('Ignoring invalid prior handoff',error)}
let world=null;
const seedString=new URLSearchParams(location.search).get('seed');
const reviewSeed=seedString!==null&&/^\d+$/.test(seedString)?Number(seedString):2165840022;
function launchPostShuffle(skipToSelection=false){
 if(world)return;
 const deckIds=skipToSelection?reviewDeckOrder(Number.isSafeInteger(reviewSeed)?reviewSeed:2165840022):
  handoff?.cardIds||shuffleDeck().map(c=>c.id);
 world=mountPostShuffle({mount:document.getElementById('post-shuffle-mount'),deckIds,skipToSelection,demo:skipToSelection});
 launch.hidden=true;window.__POST_SHUFFLE__=world;
}
button.addEventListener('click',()=>launchPostShuffle(false));
document.getElementById('skip-to-selection').addEventListener('click',()=>launchPostShuffle(true));
if(selectionReviewRequested(location.search))launchPostShuffle(true);
window.addEventListener('pagehide',()=>world?.dispose(),{once:true});
