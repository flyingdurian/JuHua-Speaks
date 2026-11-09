/**
 * Artemis ritual conversation, independent of the camera and card renderer.
 * All transitions are explicit and deterministic. It never draws or changes
 * original Past / Present / Future card identities.
 */
export const ARTEMIS_PHASES=Object.freeze([
 'intro','welcome','reading_prepare','reading_loading','reading_present',
 'guidance_offer','guidance_draw','guidance_result','followup_idle','followup_response'
]);
export const ARTEMIS_PORTRAITS=Object.freeze([
 'idle','welcoming','warm_welcome','reading','thinking','focused',
 'invocation','acknowledge','explaining','presenting','reassuring',
 'reflective','observing','intrigued','confident','surprised'
]);
export const PHASE_PORTRAITS=Object.freeze({
 intro:'idle',welcome:'warm_welcome',reading_prepare:'reading',
 reading_loading:'invocation',reading_present:'explaining',
 guidance_offer:'presenting',guidance_draw:'focused',
 guidance_result:'acknowledge',followup_idle:'reflective',
 followup_response:'reassuring'
});
const NEXT=Object.freeze({
 intro:['welcome'],welcome:['reading_prepare'],
 reading_prepare:['reading_loading'],
 reading_loading:['reading_present'],
 reading_present:['guidance_offer','followup_idle'],
 guidance_offer:['guidance_draw','followup_idle'],
 guidance_draw:['guidance_result'],guidance_result:['followup_idle'],
 followup_idle:['followup_response','guidance_offer'],
 followup_response:['followup_idle']
});
const freezeCard=c=>Object.freeze({id:c.id,orientation:c.orientation});
export function createArtemisSession({picks,locale='en',question='',reader='artemis'}={}){
 if(!Array.isArray(picks)||picks.length!==3||picks.some(c=>!c||typeof c.id!=='string'||!['upright','reversed'].includes(c.orientation))||
  new Set(picks.map(c=>c.id)).size!==3)throw new Error('Artemis requires three distinct revealed Tarot cards');
 if(!['en','zh'].includes(locale))throw new Error('Unsupported reading language');
 if(typeof question!=='string'||question.length>600)throw new Error('Question too long');
 if(reader!=='artemis')throw new Error('Only Artemis is available in this stage');
 return Object.freeze({
  phase:'intro',portrait:PHASE_PORTRAITS.intro,
  picks:Object.freeze(picks.map(freezeCard)),locale,question:question.trim(),
  guidance:null,reading:null,followups:Object.freeze([]),demo:true,revision:0
 });
}
export function artemisTransition(state,next,{reading=null,guidance=null,followup=null}={}){
 if(!state||!ARTEMIS_PHASES.includes(state.phase)||!NEXT[state.phase]?.includes(next))
  throw new Error('Illegal Artemis phase transition: '+state?.phase+' → '+next);
 if(next==='reading_present'&&(!reading||typeof reading.summary!=='string'||!Array.isArray(reading.cards)||reading.cards.length!==3))
  throw new Error('A complete three-card reading is required');
 if(next==='guidance_result'&&(!guidance||typeof guidance.id!=='string'||!['upright','reversed'].includes(guidance.orientation)||
  state.picks.some(c=>c.id===guidance.id)))
  throw new Error('Guidance must be one new unselected card');
 if(next==='followup_response'&&(!followup||typeof followup.question!=='string'||typeof followup.answer!=='string'||
  followup.question.trim().length<2||followup.answer.trim().length<2))
  throw new Error('A real follow-up answer and question are required');
 const history=next==='followup_response'?[...state.followups,Object.freeze({...followup})]:state.followups;
 if(history.length>12)throw new Error('Demo follow-up limit reached');
 return Object.freeze({
  ...state,phase:next,portrait:PHASE_PORTRAITS[next],revision:state.revision+1,
  ...(reading?{reading}:{}),...(guidance?{guidance:freezeCard(guidance)}:{}),
  followups:Object.freeze(history)
 });
}
export function portraitForPhase(phase){
 if(!Object.hasOwn(PHASE_PORTRAITS,phase))throw new Error('Unknown Artemis state');
 return PHASE_PORTRAITS[phase];
}
export function chooseGuidanceCard(deck,picks,randomInt){
 if(!Array.isArray(deck)||deck.length!==78||typeof randomInt!=='function')throw new Error('Guidance draw needs the whole original deck');
 const seen=new Set(picks.map(c=>c.id));
 const remaining=deck.filter(c=>!seen.has(c.id));
 if(remaining.length!==75)throw new Error('Exactly 75 unselected cards must remain');
 const n=randomInt(remaining.length);
 if(!Number.isInteger(n)||n<0||n>=remaining.length)throw new Error('Invalid secure guidance draw');
 return Object.freeze({id:remaining[n].id,orientation:randomInt(2)===0?'upright':'reversed'});
}