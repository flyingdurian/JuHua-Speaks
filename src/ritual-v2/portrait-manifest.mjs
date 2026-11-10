/** Gate C/D v2: every published character state is user-approved concept-derived art. */
export const ARTEMIS_ART_ROOT='/assets/ritual-v2/';
export const EXPRESSIONS=Object.freeze(['neutral','welcome','focused','thoughtful','surprised','reassuring','confident','mystical']);
export const ACTIONS=Object.freeze(['idle','welcoming','presenting','observing','explaining','reassuring','invocation','acknowledgement']);
export const portraitPath=key=>{if(!EXPRESSIONS.includes(key))throw new Error('Unknown Artemis expression');return ARTEMIS_ART_ROOT+'expressions/'+key+'.webp';};
export const posePath=key=>{if(!ACTIONS.includes(key))throw new Error('Unknown Artemis action');return ARTEMIS_ART_ROOT+'actions/'+key+'.webp';};
export const heroPath=ARTEMIS_ART_ROOT+'artemis-hero.webp';
export const STAGE_ART=Object.freeze(['gate','enter','inside','select','collapse','tableau','peek','artemis'].map(id=>({id,path:ARTEMIS_ART_ROOT+'scenes/'+id+'.webp'})));
