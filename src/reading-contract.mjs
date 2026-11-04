/** Shared client/server shape. The server NEVER trusts client-supplied meanings. */
import {BY_ID} from './deck.mjs';
const SPREADS=['crossroads','insight'];
const LENSES=['western','chinese','universal'];
const ORIENTATIONS=['upright','reversed'];
export function normalizeReadingRequest(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Invalid request');
 const {question,options,spread,lens,locale,picks,deckId}=input;
 if(typeof question!=='string'||question.trim().length<3||question.length>600)throw new TypeError('Question must be 3–600 characters');
 if(!SPREADS.includes(spread)||!LENSES.includes(lens)||!['en','zh'].includes(locale))throw new TypeError('Unknown spread, lens, or language');
 if(deckId!=='rws')throw new TypeError('Illustrated deck not enabled');
 if(!Array.isArray(options)||options.length!==2||options.some(x=>typeof x!=='string'||x.length>160))throw new TypeError('Invalid options');
 if(!Array.isArray(picks)||picks.length!==3)throw new TypeError('Exactly three cards required');
 const cards=picks.map(p=>{
  if(!p||typeof p.id!=='string'||!ORIENTATIONS.includes(p.orientation)||!BY_ID.has(p.id))throw new TypeError('Invalid card or orientation');
  const c=BY_ID.get(p.id);return {id:c.id,orientation:p.orientation,name:c.name,zh:c.zh,meaning:c[p.orientation]};
 });
 if(new Set(cards.map(x=>x.id)).size!==3)throw new TypeError('Duplicate card selection');
 const positions=spread==='crossroads'?['Path A','Path B','Guidance']:['Past','Present','Future'];
 return {question:question.trim(),options:options.map(x=>x.trim()),spread,lens,locale,deckId,cards:cards.map((c,i)=>({...c,position:positions[i]}))};
}
export function validateAiReading(input,request){
 if(!input||typeof input!=='object'||typeof input.summary!=='string'||input.summary.length<40||input.summary.length>4000||typeof input.reflection!=='string'||input.reflection.length<10||input.reflection.length>1500)throw new TypeError('Malformed AI reading');
 if(!Array.isArray(input.cards)||input.cards.length!==3)throw new TypeError('AI reading lacks three cards');
 const cards=input.cards.map((c,i)=>{
  if(!c||c.id!==request.cards[i].id||typeof c.interpretation!=='string'||c.interpretation.length<30||c.interpretation.length>3000||typeof c.evidenceQuestion!=='string'||c.evidenceQuestion.length<10||c.evidenceQuestion.length>700)throw new TypeError('AI card interpretation does not match selected spread');
  return {id:c.id,interpretation:c.interpretation,evidenceQuestion:c.evidenceQuestion};
 });
 if(!Array.isArray(input.nextSteps)||input.nextSteps.length!==2||input.nextSteps.some(x=>typeof x!=='string'||x.length<8||x.length>800))throw new TypeError('AI steps invalid');
 return {mode:'ai',cards,summary:input.summary,reflection:input.reflection,nextSteps:input.nextSteps};
}
export const AI_RESPONSE_SCHEMA={type:'object',properties:{
 summary:{type:'string'},cards:{type:'array',items:{type:'object',properties:{id:{type:'string'},interpretation:{type:'string'},evidenceQuestion:{type:'string'}},required:['id','interpretation','evidenceQuestion'],additionalProperties:false}},
 reflection:{type:'string'},nextSteps:{type:'array',items:{type:'string'}}
},required:['summary','cards','reflection','nextSteps'],additionalProperties:false};
