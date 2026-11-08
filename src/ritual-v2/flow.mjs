/** Gate C/D v2 — authoritative sequence, independent of effects. */
export const STAGES=Object.freeze(['gate','enter','inside','selection','collapse','tableau','peek','artemis']);
export const EXPRESSION_STATES=Object.freeze(['neutral','welcome','focused','thoughtful','surprised','reassuring','confident','mystical']);
export const ACTION_STATES=Object.freeze(['idle','welcoming','presenting','observing','explaining','reassuring','invocation','acknowledgement']);
export const ROLES=Object.freeze(['Past','Present','Future']);
export const clamp=n=>Number.isFinite(n)?Math.min(1,Math.max(0,n)):0;
export function beginSelection(ids){
 if(!Array.isArray(ids)||ids.length!==78||new Set(ids).size!==78)throw new Error('Exactly 78 unique Tarot cards required');
 return {stage:'gate',deck:[...ids],selected:[],revealed:[false,false,false],peeks:[0,0,0],peelModes:['corner','left','bottom'],readerBeat:0};
}
export function advanceStage(state,to){
 const from=STAGES.indexOf(state.stage),next=STAGES.indexOf(to);
 if(from<0||next!==from+1)throw new Error('Illegal transition: '+state.stage+' -> '+to);
 if(to==='collapse'&&state.selected.length!==3)throw new Error('Three choices must be locked');
 if(to==='artemis'&&state.revealed.some(v=>!v))throw new Error('Complete all three peeks first');
 return {...state,stage:to};
}
export function chooseCard(state,id,orientation='upright'){
 if(state.stage!=='inside'&&state.stage!=='selection')throw new Error('Selection not open');
 if(!state.deck.includes(id))throw new Error('Unknown Tarot identity');
 const has=state.selected.findIndex(c=>c.id===id);
 if(has>=0)return {...state,stage:'selection',selected:state.selected.filter(c=>c.id!==id)};
 if(state.selected.length===3)return state;
 if(!['upright','reversed'].includes(orientation))throw new Error('Invalid orientation');
 return {...state,stage:'selection',selected:[...state.selected,{id,orientation}]};
}
export function collapseIds(state){const chosen=new Set(state.selected.map(c=>c.id));return state.deck.filter(id=>!chosen.has(id));}
export function peekGeometry(progress,mode='corner'){
 const p=clamp(progress)*100;
 const pct=v=>Math.round(v*100)/100+'%';
 const clips={
  left:'polygon('+pct(p)+' 0,100% 0,100% 100%,'+pct(p)+' 100%)',
  right:'polygon(0 0,'+pct(100-p)+' 0,'+pct(100-p)+' 100%,0 100%)',
  bottom:'polygon(0 0,100% 0,100% '+pct(100-p)+',0 '+pct(100-p)+')',
  corner:'polygon('+pct(p)+' 0,100% 0,100% 100%,0 100%,0 '+pct(p)+')'
 };
 if(!clips[mode])throw new Error('Unknown peel direction');
 return {progress:clamp(progress),clipPath:clips[mode],bend:Math.min(62,p*.65),complete:progress>=.985};
}
export function dragPeek(start,deltaX,deltaY,width,height,mode){
 if(width<=0||height<=0)throw new RangeError('Invalid card size');
 const d=mode==='bottom'?-deltaY/height:mode==='right'?-deltaX/width:mode==='corner'?(deltaX/width+deltaY/height)/1.5:deltaX/width;
 return clamp(start+1.2*d);
}
export function updatePeek(state,index,amount,mode=state.peelModes[index]){
 if(state.stage!=='peek'||index<0||index>2)throw new Error('Peek unavailable');
 if(state.revealed[index])return state;
 const peeks=[...state.peeks],peelModes=[...state.peelModes],revealed=[...state.revealed];
 peeks[index]=clamp(amount);peelModes[index]=mode;
 if(peeks[index]>=.985){peeks[index]=1;revealed[index]=true;}
 return {...state,peeks,peelModes,revealed};
}
export function readerStateForBeat(beat){
 const scenes=[
  {expression:'welcome',action:'welcoming',text:'Welcome. These cards are yours; let us listen to their story.'},
  {expression:'focused',action:'observing',text:'I am looking closely at the past and the pattern it carries.'},
  {expression:'thoughtful',action:'presenting',text:'The present reveals the choice that asks for your attention.'},
  {expression:'confident',action:'explaining',text:'The future suggests a direction, not an unavoidable fate.'},
  {expression:'reassuring',action:'reassuring',text:'You remain the author of your choices. Take what resonates.'}
 ];
 return scenes[Math.max(0,Math.min(scenes.length-1,Math.trunc(beat)||0))];
}
