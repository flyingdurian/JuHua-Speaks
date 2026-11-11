/**
 * Artemis synthesis art manifest.
 * Assets are sourced EXCLUSIVELY from the owner supplied production PNGs:
 *   image(20261111-063002).png  -> conjuring
 *   image(20261111-063013).png  -> focused reading
 *   JuHua_Artemis_Mobile_Chat_Avatars_and_Reading_Panel(1).zip
 * Package outputs are committed at assets/artemis/synthesis/.
 * Use relative urls because Gate B runs in a nested preview path.
 */
export const SYNTHESIS_ASSET_ROOT='../../assets/artemis/synthesis/';
export const SYNTHESIS_ART=Object.freeze({
 conjuring:SYNTHESIS_ASSET_ROOT+'artemis_conjuring_transition.png',
 focused:SYNTHESIS_ASSET_ROOT+'artemis_synthesis_focused.png',
 mobilePanel:SYNTHESIS_ASSET_ROOT+'ui_reading_frame_panel_mobile.png'
});
export const ARTEMIS_CHAT_AVATARS=Object.freeze({
 neutral:SYNTHESIS_ASSET_ROOT+'avatar_artemis_face_neutral.png',
 warm_welcome:SYNTHESIS_ASSET_ROOT+'avatar_artemis_face_warm_welcome.png',
 focused_observation:SYNTHESIS_ASSET_ROOT+'avatar_artemis_face_focused_observation.png',
 thoughtful:SYNTHESIS_ASSET_ROOT+'avatar_artemis_face_thoughtful.png',
 surprised:SYNTHESIS_ASSET_ROOT+'avatar_artemis_face_surprised.png',
 reassuring:SYNTHESIS_ASSET_ROOT+'avatar_artemis_face_reassuring.png',
 confident:SYNTHESIS_ASSET_ROOT+'avatar_artemis_face_confident.png',
 mystical:SYNTHESIS_ASSET_ROOT+'avatar_artemis_face_mystical.png'
});
// Originals are retained as network-error fallbacks if a developer has only
// installed the 11 initial assets and not the eight face crops yet.
export const ARTEMIS_CHAT_AVATAR_ORIGINALS=Object.freeze(
 Object.fromEntries(Object.entries(ARTEMIS_CHAT_AVATARS).map(([k,v])=>
 [k,v.replace('/avatar_artemis_face_','/avatar_artemis_')]))
);
const direct=Object.freeze({
 intro:'warm_welcome',typing:'mystical',thinking:'thoughtful',
 analysis:'focused_observation',reflection:'thoughtful',
 reassurance:'reassuring',conclusion:'confident',
 guidance:'thoughtful',error:'reassuring',
 ritual:'mystical',surprise:'surprised'
});
/**
 * Mood is a PRESENTATION hint, independent of the LLM prompt/persona.
 * Make deterministic choices by message purpose first. Only use transparent
 * lexical cues to distinguish warmth from analysis in generic answers.
 * Never infer a visitor's mental state from tarot text.
 */
export function selectArtemisMood({purpose='analysis',text=''}={}){
 if(direct[purpose])return direct[purpose];
 const sample=String(text).toLowerCase().slice(0,1000);
 if(/\b(unexpected|surprising|unusual|astonishing)\b/.test(sample))return 'surprised';
 if(/\b(you can|a clear next step|i recommend|start by)\b/.test(sample))return 'confident';
 if(/\b(gentle|support|rest|comfort|safe|kindness)\b/.test(sample))return 'reassuring';
 if(/\b(perhaps|reflect|consider|wonder|question)\b/.test(sample))return 'thoughtful';
 return 'focused_observation';
}
export function chatAvatarFor({purpose='analysis',text=''}={}){
 return ARTEMIS_CHAT_AVATARS[selectArtemisMood({purpose,text})]||ARTEMIS_CHAT_AVATARS.neutral;
}
export const SYNTHESIS_TRANSITION_MS=2600;
