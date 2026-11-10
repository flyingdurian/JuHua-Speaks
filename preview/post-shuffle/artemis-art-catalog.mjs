/**
 * Immutable source-pack contract for the 31 owner-approved Artemis PNG files.
 * The source package is not mirrored into GitHub by this metadata declaration.
 * npm run assets:artemis -- /path/to/extracted/Artemis_Asset_Candidates
 * validates each original file and publishes the runtime registration atomically.
 */
export const ARTEMIS_PORTRAIT_SLOTS=Object.freeze([
 'idle','warmWelcome','welcomingGesture','reading','thinking','focused',
 'invocation','acknowledgement','explaining','presenting','reassuring',
 'reflective','observing','intrigued','confident','surprisedSoft'
]);
export const ARTEMIS_SOURCE_FILES=Object.freeze({
 idle:'portraits/artemis_idle.png',
 warmWelcome:'portraits/artemis_warm_welcome.png',
 welcomingGesture:'portraits/artemis_welcoming_gesture.png',
 reading:'portraits/artemis_reading.png',
 thinking:'portraits/artemis_thinking.png',
 focused:'portraits/artemis_focused.png',
 invocation:'portraits/artemis_invocation.png',
 acknowledgement:'portraits/artemis_acknowledgement.png',
 explaining:'portraits/artemis_explaining.png',
 presenting:'portraits/artemis_presenting.png',
 reassuring:'portraits/artemis_reassuring.png',
 reflective:'portraits/artemis_reflective.png',
 observing:'portraits/artemis_observing.png',
 intrigued:'portraits/artemis_intrigued.png',
 confident:'portraits/artemis_confident.png',
 surprisedSoft:'portraits/artemis_surprised_soft.png',
 background:'backgrounds/bg_artemis_reading_stage_main.png',
 transition:'backgrounds/bg_artemis_transition_gate.png',
 halo:'fx/fx_artemis_halo_ring.png',
 sigils:'fx/fx_artemis_sigils_soft.png',
 goldParticles:'fx/fx_artemis_particles_gold.png',
 violetParticles:'fx/fx_artemis_particles_violet.png',
 readingGlow:'fx/fx_reading_glow_base.png',
 cardGlow:'fx/fx_card_spread_glow.png',
 panel:'ui/ui_reading_frame_panel.png',
 nameplate:'ui/ui_artemis_nameplate.png',
 title:'ui/ui_your_reading_titleplate.png',
 begin:'ui/ui_begin_reading_button.png',
 continue:'ui/ui_continue_button.png',
 corners:'ui/ui_panel_corner_ornaments.png',
 arrow:'ui/ui_arrow_next_gold.png'
});
export const ARTEMIS_SOURCE_COUNT=31;
if(Object.keys(ARTEMIS_SOURCE_FILES).length!==ARTEMIS_SOURCE_COUNT)throw Error('Art source mapping does not cover exactly 31 delivered PNGs');
