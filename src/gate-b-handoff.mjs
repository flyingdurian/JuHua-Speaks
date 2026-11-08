/**
 * Gate B review -> Phase 8.2 handoff. A single-use, same-origin, same-tab
 * sessionStorage envelope. Never put the question, selection or order in a URL.
 *
 * The physical 78-card choreography is visual; crypto-secure Fisher-Yates
 * determines the selection order ONCE at Start Divination, not after the user
 * clicks Finish. No extra hidden shuffle or new draw is performed on arrival.
 */
import {CARD_IDS} from './deck-config.mjs';
import {createRitualSession,transitionRitual,MIN_SHUFFLE_MS} from './ritual-machine.mjs';
export const GATE_B_HANDOFF_KEY='juhua:gate-b-reveal:v1';
const ALL=new Set(CARD_IDS), LIFE_MS=15*60*1000;
const validQuestion=q=>typeof q==='string'&&q.trim().length>=3&&q.trim().length<=600&&q.length<=600;
function assertIDs(ids){
 if(!Array.isArray(ids)||ids.length!==78||new Set(ids).size!==78||ids.some(id=>!ALL.has(id)))throw Error('Expected all 78 unique original card IDs');
}
export function createGateBHandoff({question,orderedCardIds,issuedAt=Date.now()}){
 if(!validQuestion(question))throw Error('Question must contain 3–600 characters');
 assertIDs(orderedCardIds);
 if(!Number.isSafeInteger(issuedAt)||issuedAt<0)throw Error('Invalid handoff timestamp');
 return {version:1,source:'gate-b-preview',question:question.trim(),
  deckId:'rws',readerId:'artemis',spreadId:'past-present-future',
  locale:'en',cardIds:[...orderedCardIds],issuedAt};
}
export function parseGateBHandoff(raw,now=Date.now()){
 if(typeof raw!=='string'||raw.length>12000)throw Error('Invalid handoff envelope');
 let value;
 try{value=JSON.parse(raw)}catch{throw Error('Invalid handoff JSON')}
 if(!value||value.version!==1||value.source!=='gate-b-preview'||
  value.deckId!=='rws'||value.readerId!=='artemis'||
  value.spreadId!=='past-present-future'||value.locale!=='en')throw Error('Unsupported handoff');
 if(!Number.isFinite(now)||now<0||!Number.isSafeInteger(value.issuedAt)||
  value.issuedAt>now+5000||now-value.issuedAt>LIFE_MS)throw Error('Expired handoff');
 return createGateBHandoff({question:value.question,orderedCardIds:value.cardIds,issuedAt:value.issuedAt});
}
/** Reconstruct only legal reducer transitions, preserving the already finished
 * shuffle gate. The user enters at sphere_selection and must choose three.
 */
export function resumeGateBAtSphere(handoff,now=Date.now()){
 const value=parseGateBHandoff(JSON.stringify(handoff),now);
 let ritual=createRitualSession({deckId:value.deckId,readerId:value.readerId,spreadId:value.spreadId,locale:value.locale});
 ritual=transitionRitual(ritual,'SUBMIT_QUESTION',{question:value.question},now-MIN_SHUFFLE_MS-1000);
 ritual=transitionRitual(ritual,'COLLAPSE_COMPLETE',{},now-MIN_SHUFFLE_MS);
 ritual=transitionRitual(ritual,'MIN_SHUFFLE_ELAPSED',{},now);
 return transitionRitual(ritual,'FINISH_SHUFFLING',{},now);
}
