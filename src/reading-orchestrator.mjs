/**
 * Two-stage reading contracts. Phase 8.1 calls preflight locally only.
 * Never generate a full AI reading before user confirmation of exactly 3 cards.
 */
import {classifyQuestion} from './demo-reading.mjs';
import {isLocked} from './ritual-machine.mjs';
export function prepareQuestionPreflight({question,locale='en',spreadId='past-present-future',deckId='rws',readerId='artemis'}){
 if(typeof question!=='string'||question.trim().length<3||question.length>600)throw new TypeError('Question must be 3–600 characters');
 const intent=classifyQuestion(question).id;
 return Object.freeze({version:1,intent:intent==='relationship'?'love':intent==='money'?'decision':intent==='growth'?'growth':intent,locale,spreadId,deckId,readerId,contextTags:[],safetyFlags:[],modelRequired:false,summaryReady:false});
}
export function buildLockedMainReadingRequest(ritual,requestId){
 if(!isLocked(ritual)||ritual.locked.length!==3)throw new Error('Cannot generate final reading before three cards are confirmed');
 if(typeof requestId!=='string'||!requestId)throw new TypeError('Request ID is required');
 return Object.freeze({version:1,requestId,kind:'main',question:ritual.question,deckId:ritual.deckId,readerId:ritual.readerId,spreadId:ritual.spreadId,locale:ritual.locale,preflight:ritual.preflight,
  cards:ritual.locked.map(c=>({cardId:c.cardId,position:c.positionId,orientation:c.orientation}))});
}
export function buildGuidanceContext(ritual,question,requestId,mainReadingSummary){
 if(ritual.phase!=='guidance_reveal'&&ritual.phase!=='guidance_reading')throw new Error('Guidance card must be locked first');
 return {version:1,kind:'guidance',requestId,sessionQuestion:ritual.question,guidanceQuestion:question,
  deckId:ritual.deckId,readerId:ritual.readerId,originalThree:ritual.locked.map(c=>({...c})),
  guidanceCard:{...ritual.guidanceCard},mainReadingSummary};
}
