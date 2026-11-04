/** Milestone 8.0 named ritual reducer. Pure, deterministic and testable. */
import {CARD_IDS} from './deck-config.mjs';
const VALID_CARDS=new Set(CARD_IDS);
export const MIN_SHUFFLE_MS=5000;
export const DEFAULT_SHUFFLE_MS=6500;
export const RITUAL_STATES=Object.freeze([
 'landing','question_submitted','shuffle_ritual','deck_formed','sphere_selection',
 'three_locked','three_reveal','reader_invitation','main_reading',
 'guidance_prompt','guidance_selection','guidance_reveal','guidance_reading'
]);
const phaseError=(phase,event)=>new Error('Illegal ritual transition: '+event+' in '+phase);
const requirePhase=(session,event,...phases)=>{if(!phases.includes(session.phase))throw phaseError(session.phase,event);};
export function createRitualSession({deckId='rws',readerId='artemis',spreadId='past-present-future',locale='en'}={}){
 return Object.freeze({phase:'landing',revision:0,deckId,readerId,spreadId,locale,question:'',
   selected:Object.freeze([]),locked:Object.freeze([]),revealed:Object.freeze([false,false,false]),
   shuffleStartedAt:null,lockedAt:null,preflight:null,
   guidanceQuestion:'',guidanceCard:null});
}
const freeze=(session,changes)=>Object.freeze({...session,...changes,revision:session.revision+1});
const requireQuestion=q=>{if(typeof q!=='string'||q.trim().length<3||q.length>600)throw new TypeError('Question must be 3–600 characters');return q.trim();};
function requireCard(id){if(!VALID_CARDS.has(id))throw new RangeError('Unknown Tarot card');}
export function transitionRitual(session,event,payload={},now=Date.now()){
 if(!session||!RITUAL_STATES.includes(session.phase))throw new TypeError('Unknown ritual session');
 if(event==='RESET')return createRitualSession({deckId:session.deckId,readerId:session.readerId,spreadId:session.spreadId,locale:session.locale});
 if(!Number.isFinite(now)||now<0)throw new TypeError('Invalid time');
 switch(event){
 case 'SUBMIT_QUESTION':requirePhase(session,event,'landing');
  return freeze(session,{phase:'question_submitted',question:requireQuestion(payload.question),preflight:payload.preflight||null});
 case 'COLLAPSE_COMPLETE':requirePhase(session,event,'question_submitted');
  return freeze(session,{phase:'shuffle_ritual',shuffleStartedAt:now});
 case 'MIN_SHUFFLE_ELAPSED':requirePhase(session,event,'shuffle_ritual');
  if(now-session.shuffleStartedAt<MIN_SHUFFLE_MS)throw new Error('The shuffle ritual has not completed its minimum duration');
  return freeze(session,{phase:'deck_formed'});
 case 'FINISH_SHUFFLING':requirePhase(session,event,'deck_formed');
  return freeze(session,{phase:'sphere_selection'});
 case 'TOGGLE_CARD':requirePhase(session,event,'sphere_selection');
  requireCard(payload.cardId);
  if(session.selected.some(p=>p.cardId===payload.cardId)){
   return freeze(session,{selected:Object.freeze(session.selected.filter(p=>p.cardId!==payload.cardId))});
  }
  if(session.selected.length===3)throw new Error('Select no more than three Tarot cards');
  if(!['upright','reversed'].includes(payload.orientation))throw new Error('Invalid orientation');
  return freeze(session,{selected:Object.freeze([...session.selected,Object.freeze({cardId:payload.cardId,orientation:payload.orientation})])});
 case 'CONFIRM_THREE':{
  if(session.phase==='three_locked')return session; // repeated click may not resubmit generation
  requirePhase(session,event,'sphere_selection');
  if(session.selected.length!==3||new Set(session.selected.map(p=>p.cardId)).size!==3)throw new Error('Exactly three distinct Tarot cards must be selected');
  return freeze(session,{phase:'three_locked',locked:Object.freeze(session.selected.map((p,i)=>Object.freeze({...p,positionId:['past','present','future'][i]}))),lockedAt:now});
 }
 case 'VORTEX_COMPLETE':requirePhase(session,event,'three_locked');
  return freeze(session,{phase:'three_reveal'});
 case 'REVEAL_CARD':requirePhase(session,event,'three_reveal');
  if(!Number.isInteger(payload.index)||payload.index<0||payload.index>2)throw new RangeError('Invalid revealed index');
  return freeze(session,{revealed:Object.freeze(session.revealed.map((v,i)=>i===payload.index?true:v))});
 case 'ALL_REVEALED':requirePhase(session,event,'three_reveal');
  if(!session.revealed.every(Boolean))throw new Error('All three Tarot cards must be revealed');
  return freeze(session,{phase:'reader_invitation'});
 case 'INVITE_READER':requirePhase(session,event,'reader_invitation');
  return freeze(session,{phase:'main_reading'});
 case 'START_GUIDANCE':requirePhase(session,event,'main_reading');
  return freeze(session,{phase:'guidance_prompt'});
 case 'SUBMIT_GUIDANCE_QUESTION':requirePhase(session,event,'guidance_prompt');
  return freeze(session,{phase:'guidance_selection',guidanceQuestion:requireQuestion(payload.question)});
 case 'LOCK_GUIDANCE_CARD':requirePhase(session,event,'guidance_selection');
  requireCard(payload.cardId);
  if(session.locked.some(c=>c.cardId===payload.cardId))throw new Error('Guidance card must be new');
  if(!['upright','reversed'].includes(payload.orientation))throw new Error('Invalid guidance orientation');
  return freeze(session,{phase:'guidance_reveal',guidanceCard:Object.freeze({cardId:payload.cardId,orientation:payload.orientation,positionId:'guidance'})});
 case 'REVEAL_GUIDANCE':requirePhase(session,event,'guidance_reveal');
  return freeze(session,{phase:'guidance_reading'});
 default:throw phaseError(session.phase,event);
 }
}
export function canConfirmThree(session){return session.phase==='sphere_selection'&&session.selected.length===3;}
export function isLocked(session){return ['three_locked','three_reveal','reader_invitation','main_reading','guidance_prompt','guidance_selection','guidance_reveal','guidance_reading'].includes(session.phase);}
