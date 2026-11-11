import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SYNTHESIS_TRANSITION_MS,SYNTHESIS_ART,ARTEMIS_CHAT_AVATARS,
 selectArtemisMood,chatAvatarFor} from '../preview/post-shuffle/ArtemisSynthesisAssets.mjs';
import {renderSynthesisChat} from '../preview/post-shuffle/SynthesisChat.mjs';
const source=path=>readFile(new URL(path,import.meta.url),'utf8');

test('exact owner assets are addressed and all eight avatars have unambiguous moods',()=>{
 assert.equal(SYNTHESIS_TRANSITION_MS,2600);
 assert.match(SYNTHESIS_ART.conjuring,/artemis_conjuring_transition\.png$/);
 assert.match(SYNTHESIS_ART.focused,/artemis_synthesis_focused\.png$/);
 assert.match(SYNTHESIS_ART.mobilePanel,/ui_reading_frame_panel_mobile\.png$/);
 assert.deepEqual(Object.keys(ARTEMIS_CHAT_AVATARS).sort(),[
  'confident','focused_observation','mystical','neutral',
  'reassuring','surprised','thoughtful','warm_welcome'].sort());
 for(const src of Object.values(ARTEMIS_CHAT_AVATARS))assert.match(src,/avatar_artemis_[a-z_]+\.png$/);
 assert.equal(selectArtemisMood({purpose:'intro'}),'warm_welcome');
 assert.equal(selectArtemisMood({purpose:'analysis'}),'focused_observation');
 assert.equal(selectArtemisMood({purpose:'typing'}),'mystical');
 assert.equal(selectArtemisMood({purpose:'guidance'}),'thoughtful');
 assert.equal(selectArtemisMood({purpose:'reassurance'}),'reassuring');
 assert.equal(selectArtemisMood({purpose:'conclusion'}),'confident');
 assert.equal(selectArtemisMood({purpose:'surprise'}),'surprised');
 assert.equal(selectArtemisMood({purpose:'unknown',text:'start by taking one step'}),'confident');
 assert.match(chatAvatarFor({purpose:'analysis'}),/avatar_artemis_focused_observation/);
});
test('thinking avatar and animated dots precede result; response shows an analytical avatar',()=>{
 const before=renderSynthesisChat({question:'What now?',status:'generating',mode:'scripted-demo'});
 assert.match(before,/synthesis-typing-dots/);
 assert.match(before,/avatar_artemis_face_mystical\\.png/);
 assert.match(before,/Synthesizing/);
 assert.doesNotMatch(before,/synthesis-guidance-cta/);
 const after=renderSynthesisChat({question:'What now?',status:'ready',
  response:'The cards invite a reflective pause.'});
 assert.match(after,/avatar_artemis_face_focused_observation\\.png/);
 assert.match(after,/synthesis-guidance-cta/);
 assert.doesNotMatch(after,/synthesis-typing-dots/);
 const followup=renderSynthesisChat({question:'What now?',status:'followup-generating',
  response:'Initial reading is complete.',guidance:{id:'the_star',name:'The Star',
   orientation:'upright',meaning:'Hope'},history:[]});
 assert.match(followup,/avatar_artemis_face_thoughtful\\.png/);
 assert.match(followup,/synthesis-typing-dots/);
});
test('Begin Interpretation restores scripted reading; only final Ask Artemis starts synthesis',async()=>{
 const scene=await source('../preview/post-shuffle/scene.mjs');
 const controller=await source('../preview/post-shuffle/SynthesisController.mjs');
 const tableau=await source('../preview/post-shuffle/TarotTableau.mjs');
 assert.match(tableau,/BEGIN INTERPRETATION/);
 assert.match(scene,/const directSynthesis=false/);
 assert.match(scene,/if\(readingChapter===3\)/);
 assert.match(scene,/renderReadingHandoff\(\)/);
 const stage=await source('../preview/post-shuffle/reading-stage.mjs');
 assert.match(stage,/chapter===3\?'Ask Artemis'/);
 assert.match(stage,/The cards are ready to speak/);
 assert.match(controller,/buildCardConjuringScene/);
 assert.match(controller,/const cards=\[\.\.\.stage\.querySelectorAll\('\.reading-art-card'\)\]/);
 assert.match(controller,/image\.cloneNode\(true\)/);
 assert.match(controller,/foil\.cloneNode\(true\)/);
 assert.match(controller,/SYNTHESIS_TRANSITION_MS/);
 assert.match(controller,/showFocusedReadingArt/);
});
test('panel uses corner-safe nine slicing, no aspect-ratio stretching',async()=>{
 const css=await source('../preview/post-shuffle/artemis-synthesis-remake.css');
 const gate=await source('../preview/gate-b/index.html');
 const preview=await source('../preview/post-shuffle/index.html');
 assert.match(css,/border-image-slice:170 175 170 175 fill/);
 assert.match(css,/ui_reading_frame_panel_mobile\.png/);
 assert.match(css,/ui_reading_frame_panel\.png/);
 assert.match(css,/artemis-conjuring-art/);
 assert.match(css,/artemis-focused-chat-art/);
 assert.match(css,/artemisCardOffering/);
 assert.match(css,/synthesis-typing-dots/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 for(const file of [gate,preview])assert.match(file,/artemis-synthesis-remake\.css/);
});
test('HTML injection is escaped in both pinned question and synthesis reply',()=>{
 const html=renderSynthesisChat({question:'<img src=x onerror=1>',status:'ready',
  response:'<script>alert(1)</script>'});
 assert.ok(!html.includes('<script>'));
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/&lt;img src=x onerror=1&gt;/);
});
