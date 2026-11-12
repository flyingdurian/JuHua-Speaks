/* One registry drives the sliders, storage, export and regression checks. */
export const GROUPS = [
 [
  "Reading · Artemis",
  "Portrait, framing, hero and chamber. Adjust the original artwork without redrawing it.",
  [
   [
    "--artemis-top",
    "Portrait Y / base",
    "px",
    -160,
    220,
    1
   ],
   [
    "--layout-reading-art-x",
    "Portrait X",
    "px",
    -240,
    240,
    1
   ],
   [
    "--layout-reading-art-y",
    "Portrait Y / fine",
    "px",
    -180,
    180,
    1
   ],
   [
    "--artemis-scale",
    "Portrait scale",
    "",
    0.35,
    2.2,
    0.01
   ],
   [
    "--artemis-portrait-width",
    "Portrait width",
    "px",
    100,
    1100,
    1
   ],
   [
    "--artemis-portrait-height",
    "Portrait height",
    "px",
    100,
    850,
    1
   ],
   [
    "--layout-reading-portrait-opacity",
    "Portrait opacity",
    "",
    0,
    1,
    0.01
   ],
   [
    "--layout-reading-halo",
    "Halo opacity",
    "",
    0,
    1,
    0.01
   ],
   [
    "--layout-reading-glow",
    "Reading/card glow opacity",
    "",
    0,
    1,
    0.01
   ],
   [
    "--reading-hero-height",
    "Hero height",
    "px",
    180,
    1000,
    1
   ],
   [
    "--layout-reading-hero-x",
    "Hero X",
    "px",
    -200,
    200,
    1
   ],
   [
    "--layout-reading-hero-y",
    "Hero Y",
    "px",
    -200,
    200,
    1
   ],
   [
    "--reading-atmosphere-top",
    "Chamber top",
    "px",
    -150,
    220,
    1
   ],
   [
    "--reading-atmosphere-pan",
    "Chamber vertical pan",
    "px",
    -400,
    200,
    1
   ],
   [
    "--reading-atmosphere-overdraw",
    "Chamber extra height",
    "px",
    0,
    400,
    1
   ]
  ]
 ],
 [
  "Reading · table and cards",
  "One painted chamber, original tabletop matte, and the three RWS cards.",
  [
   [
    "--table-top",
    "Table back edge",
    "%",
    20,
    95,
    0.5
   ],
   [
    "--layout-table-x",
    "Table X",
    "px",
    -250,
    250,
    1
   ],
   [
    "--layout-table-width",
    "Table width",
    "%",
    40,
    160,
    1
   ],
   [
    "--reading-table-perspective",
    "Table perspective",
    "px",
    150,
    2200,
    10
   ],
   [
    "--reading-table-tilt",
    "Table tilt",
    "deg",
    0,
    75,
    0.5
   ],
   [
    "--layout-table-opacity",
    "Table light opacity",
    "",
    0,
    1,
    0.01
   ],
   [
    "--layout-table-display",
    "3D surface",
    "select",
    [
     "block",
     "none"
    ]
   ],
   [
    "--layout-cards-x",
    "Spread X",
    "px",
    -240,
    240,
    1
   ],
   [
    "--cards-y-offset",
    "Spread Y (negative = up)",
    "px",
    -250,
    250,
    1
   ],
   [
    "--reading-spread-bottom",
    "Spread bottom anchor",
    "%",
    0,
    40,
    0.5
   ],
   [
    "--reading-spread-width",
    "Spread width",
    "px",
    150,
    1300,
    1
   ],
   [
    "--reading-spread-gap",
    "Card gap",
    "px",
    0,
    100,
    1
   ],
   [
    "--layout-cards-scale",
    "Spread scale",
    "",
    0.4,
    1.8,
    0.01
   ],
   [
    "--reading-card-width",
    "Card width",
    "px",
    45,
    270,
    1
   ],
   [
    "--reading-card-perspective",
    "Card perspective",
    "px",
    150,
    2200,
    10
   ],
   [
    "--reading-card-tilt",
    "Card pitch (42° baseline)",
    "deg",
    0,
    70,
    0.5
   ],
   [
    "--layout-card-shadows",
    "Contact shadow opacity",
    "",
    0,
    1,
    0.01
   ],
   [
    "--layout-card-label-size",
    "Card label font",
    "px",
    7,
    24,
    0.5
   ],
   [
    "--layout-card-meaning-size",
    "Card meaning font",
    "px",
    7,
    20,
    0.5
   ]
  ]
 ],
 [
  "Reading · dialogue and CTAs",
  "Tune scripted text, ornaments and navigation independently of synthesis.",
  [
   [
    "--layout-reading-header-x",
    "Question/header X",
    "px",
    -180,
    180,
    1
   ],
   [
    "--layout-reading-header-y",
    "Question/header Y",
    "px",
    -120,
    160,
    1
   ],
   [
    "--reading-header-min-height",
    "Header minimum height",
    "px",
    0,
    180,
    1
   ],
   [
    "--layout-reading-panel-x",
    "Panel X",
    "px",
    -200,
    200,
    1
   ],
   [
    "--layout-reading-panel-y",
    "Panel Y",
    "px",
    -200,
    240,
    1
   ],
   [
    "--layout-reading-panel-width",
    "Panel width",
    "%",
    45,
    100,
    1
   ],
   [
    "--reading-panel-height",
    "Panel height",
    "px",
    180,
    800,
    1
   ],
   [
    "--reading-panel-gap",
    "Panel gap",
    "px",
    0,
    120,
    1
   ],
   [
    "--layout-reading-panel-top",
    "Frame content top",
    "px",
    0,
    140,
    1
   ],
   [
    "--layout-reading-panel-side",
    "Frame content sides",
    "px",
    0,
    120,
    1
   ],
   [
    "--layout-reading-panel-bottom",
    "Frame content bottom",
    "px",
    0,
    140,
    1
   ],
   [
    "--layout-reading-nameplate-y",
    "Nameplate Y",
    "px",
    -80,
    100,
    1
   ],
   [
    "--layout-reading-title-size",
    "Reading title font",
    "px",
    10,
    44,
    0.5
   ],
   [
    "--layout-reading-text-size",
    "Reading body font",
    "px",
    9,
    28,
    0.5
   ],
   [
    "--layout-reading-controls-x",
    "Previous/Next X",
    "px",
    -160,
    160,
    1
   ],
   [
    "--layout-reading-controls-y",
    "Previous/Next Y",
    "px",
    -120,
    120,
    1
   ],
   [
    "--layout-reading-controls-scale",
    "Previous/Next scale",
    "",
    0.6,
    1.5,
    0.01
   ],
   [
    "--layout-reading-controls-align",
    "Navigation alignment",
    "select",
    [
     "center",
     "flex-start",
     "flex-end",
     "space-between",
     "space-around"
    ]
   ],
   [
    "--layout-reading-controls-gap",
    "Navigation gap",
    "px",
    0,
    50,
    1
   ],
   [
    "--layout-reading-next-width",
    "Next minimum width",
    "px",
    0,
    280,
    1
   ],
   [
    "--layout-reading-prev-width",
    "Previous minimum width",
    "px",
    0,
    220,
    1
   ]
  ]
 ],
 [
  "Synthesis · Artemis and atmosphere",
  "Independent focused portrait or real fallback, lower-waist mask, glow and mist.",
  [
   [
    "--chat-hero-height",
    "Chat hero height",
    "px",
    120,
    800,
    1
   ],
   [
    "--layout-chat-hero-x",
    "Chat hero X",
    "px",
    -200,
    200,
    1
   ],
   [
    "--layout-chat-hero-y",
    "Chat hero Y",
    "px",
    -200,
    200,
    1
   ],
   [
    "--layout-chat-art-x",
    "Focused portrait X",
    "px",
    -240,
    240,
    1
   ],
   [
    "--layout-chat-art-y",
    "Focused portrait Y",
    "px",
    -200,
    220,
    1
   ],
   [
    "--layout-chat-art-scale",
    "Focused portrait scale",
    "",
    0.35,
    2.2,
    0.01
   ],
   [
    "--layout-chat-art-width",
    "Focused portrait width",
    "px",
    100,
    1100,
    1
   ],
   [
    "--layout-chat-art-height",
    "Focused portrait height",
    "px",
    100,
    900,
    1
   ],
   [
    "--layout-chat-art-opacity",
    "Portrait opacity",
    "",
    0,
    1,
    0.01
   ],
   [
    "--layout-chat-glow-opacity",
    "Glow opacity",
    "",
    0,
    1,
    0.01
   ],
   [
    "--layout-chat-glow-radius",
    "Glow radius",
    "px",
    0,
    100,
    1
   ],
   [
    "--layout-chat-mask-start",
    "Opaque mask end",
    "%",
    0,
    100,
    1
   ],
   [
    "--layout-chat-mask-mid",
    "Mask transition middle",
    "%",
    0,
    100,
    1
   ],
   [
    "--layout-chat-mask-end",
    "Mask fade end",
    "%",
    0,
    100,
    1
   ],
   [
    "--chat-mist-height",
    "Mist height",
    "px",
    0,
    350,
    1
   ],
   [
    "--layout-chat-mist-opacity",
    "Mist opacity",
    "",
    0,
    1,
    0.01
   ],
   [
    "--layout-chat-mist-y",
    "Mist bottom offset",
    "px",
    -150,
    150,
    1
   ],
   [
    "--layout-chat-mist-blur",
    "Mist blur",
    "px",
    0,
    40,
    0.5
   ],
   [
    "--layout-chat-background-x",
    "Chamber position X",
    "%",
    0,
    100,
    1
   ],
   [
    "--layout-chat-background-y",
    "Chamber position Y",
    "%",
    0,
    100,
    1
   ]
  ]
 ],
 [
  "Synthesis · ornate frame and hierarchy",
  "Control the actual nine-sliced frame border separately from the inner text safe area.",
  [
   [
    "--layout-chat-panel-x",
    "Chat panel X",
    "px",
    -200,
    200,
    1
   ],
   [
    "--layout-chat-panel-y",
    "Chat panel Y",
    "px",
    -200,
    220,
    1
   ],
   [
    "--layout-chat-panel-width",
    "Chat panel width",
    "%",
    45,
    100,
    1
   ],
   [
    "--layout-chat-panel-min-height",
    "Panel minimum height",
    "px",
    180,
    1000,
    1
   ],
   [
    "--layout-chat-panel-height",
    "Panel explicit height (reset = auto)",
    "px",
    180,
    1100,
    1
   ],
   [
    "--layout-chat-frame-top",
    "Ornament top border",
    "px",
    0,
    120,
    1
   ],
   [
    "--layout-chat-frame-side",
    "Ornament side border",
    "px",
    0,
    100,
    1
   ],
   [
    "--layout-chat-frame-bottom",
    "Ornament bottom border",
    "px",
    0,
    160,
    1
   ],
   [
    "--layout-chat-panel-top",
    "Content top padding",
    "px",
    0,
    140,
    1
   ],
   [
    "--layout-chat-panel-side",
    "Content side padding",
    "px",
    0,
    100,
    1
   ],
   [
    "--layout-chat-panel-bottom",
    "Content bottom padding",
    "px",
    0,
    140,
    1
   ],
   [
    "--layout-chat-heading-x",
    "Unified Reading X",
    "px",
    -160,
    160,
    1
   ],
   [
    "--layout-chat-heading-y",
    "Unified Reading Y",
    "px",
    -100,
    150,
    1
   ],
   [
    "--layout-chat-heading-size",
    "Heading font",
    "px",
    10,
    42,
    0.5
   ],
   [
    "--layout-chat-heading-gap",
    "Heading bottom gap",
    "px",
    0,
    60,
    1
   ],
   [
    "--layout-chat-question-x",
    "Pinned question X",
    "px",
    -160,
    160,
    1
   ],
   [
    "--layout-chat-question-y",
    "Pinned question Y",
    "px",
    -100,
    150,
    1
   ],
   [
    "--layout-chat-question-height",
    "Question max height",
    "px",
    40,
    300,
    1
   ],
   [
    "--layout-chat-question-size",
    "Question font",
    "px",
    9,
    26,
    0.5
   ],
   [
    "--layout-chat-question-gap",
    "Question bottom gap",
    "px",
    0,
    60,
    1
   ]
  ]
 ],
 [
  "Synthesis · transcript, messages and avatars",
  "The real scrolling log remains independent of the pinned question and composer.",
  [
   [
    "--layout-chat-transcript-x",
    "Transcript X",
    "px",
    -150,
    150,
    1
   ],
   [
    "--layout-chat-transcript-y",
    "Transcript Y",
    "px",
    -150,
    150,
    1
   ],
   [
    "--layout-chat-transcript-max-height",
    "Transcript max height (reset = none)",
    "px",
    60,
    1200,
    1
   ],
   [
    "--layout-chat-transcript-top",
    "Transcript top padding",
    "px",
    0,
    80,
    1
   ],
   [
    "--layout-chat-transcript-side",
    "Transcript side padding",
    "px",
    0,
    70,
    1
   ],
   [
    "--layout-chat-transcript-bottom",
    "Transcript bottom padding",
    "px",
    0,
    100,
    1
   ],
   [
    "--layout-chat-message-size",
    "Message font",
    "px",
    9,
    28,
    0.5
   ],
   [
    "--layout-chat-avatar-size",
    "Avatar size",
    "px",
    24,
    150,
    1
   ],
   [
    "--layout-chat-message-gap",
    "Avatar/message gap",
    "px",
    0,
    50,
    1
   ],
   [
    "--layout-chat-message-spacing",
    "Message vertical spacing",
    "px",
    0,
    60,
    1
   ]
  ]
 ],
 [
  "Synthesis · composer and legacy CTA fix",
  "Align the actual input and ASK hit targets with the mobile artwork; inspect or hide stale controls.",
  [
   [
    "--layout-chat-footer-x",
    "Composer X",
    "px",
    -180,
    180,
    1
   ],
   [
    "--layout-chat-footer-y",
    "Composer Y",
    "px",
    -180,
    180,
    1
   ],
   [
    "--layout-chat-footer-width",
    "Composer width",
    "%",
    40,
    100,
    1
   ],
   [
    "--layout-chat-footer-top",
    "Composer top padding",
    "px",
    0,
    90,
    1
   ],
   [
    "--layout-chat-footer-bottom",
    "Composer bottom padding",
    "px",
    0,
    150,
    1
   ],
   [
    "--layout-chat-row-gap",
    "Input/ASK gap",
    "px",
    0,
    50,
    1
   ],
   [
    "--layout-chat-row-align",
    "Button row alignment",
    "select",
    [
     "stretch",
     "center",
     "flex-start",
     "flex-end",
     "baseline"
    ]
   ],
   [
    "--layout-chat-input-x",
    "Input X",
    "px",
    -150,
    150,
    1
   ],
   [
    "--layout-chat-input-y",
    "Input Y",
    "px",
    -120,
    120,
    1
   ],
   [
    "--layout-chat-input-height",
    "Input/ASK height",
    "px",
    24,
    100,
    1
   ],
   [
    "--layout-chat-input-font",
    "Input font",
    "px",
    9,
    24,
    0.5
   ],
   [
    "--layout-chat-input-share",
    "Mobile input slot width",
    "%",
    20,
    80,
    1
   ],
   [
    "--layout-chat-ask-x",
    "ASK X",
    "px",
    -150,
    150,
    1
   ],
   [
    "--layout-chat-ask-y",
    "ASK Y",
    "px",
    -120,
    120,
    1
   ],
   [
    "--layout-chat-ask-width",
    "Desktop ASK width",
    "px",
    45,
    240,
    1
   ],
   [
    "--layout-chat-ask-font",
    "ASK font",
    "px",
    9,
    24,
    0.5
   ],
   [
    "--layout-chat-ask-scale",
    "ASK scale",
    "",
    0.5,
    1.8,
    0.01
   ],
   [
    "--layout-legacy-cta-display",
    "Retired CTAs (hide / inspect)",
    "select",
    [
     "none",
     "revert"
    ]
   ]
  ]
 ]
];
GROUPS.push(["Direct manipulation · individual layers","Fine-grained element handles",[["--layout-reading-title-x","Reading title X","px",-300,300,1],["--layout-reading-title-y","Reading title Y","px",-300,300,1],["--layout-reading-text-x","Reading text X","px",-300,300,1],["--layout-reading-text-y","Reading text Y","px",-300,300,1],["--layout-reading-next-x","Next button X","px",-300,300,1],["--layout-reading-next-y","Next button Y","px",-300,300,1],["--layout-reading-next-scale","Next button scale","",0.4,2,0.01],["--layout-reading-prev-x","Previous button X","px",-300,300,1],["--layout-reading-prev-y","Previous button Y","px",-300,300,1],["--layout-reading-prev-scale","Previous button scale","",0.4,2,0.01],["--layout-chat-avatar-x","Avatar X","px",-300,300,1],["--layout-chat-avatar-y","Avatar Y","px",-300,300,1],["--layout-chat-message-x","Message X","px",-300,300,1],["--layout-chat-message-y","Message Y","px",-300,300,1],["--layout-chat-guidance-x","Guidance card X","px",-300,300,1],["--layout-chat-guidance-y","Guidance card Y","px",-300,300,1],["--layout-chat-guidance-scale","Guidance scale","",0.4,2,0.01],["--layout-chat-input-scale","Input scale","",0.4,2,0.01],["--layout-reading-halo-x","Halo X","px",-300,300,1],["--layout-reading-halo-y","Halo Y","px",-300,300,1],["--layout-reading-halo-scale","Halo scale","",0.4,2,0.01],["--layout-reading-glow-x","Reading glow X","px",-300,300,1],["--layout-reading-glow-y","Reading glow Y","px",-300,300,1],["--layout-reading-glow-scale","Reading glow scale","",0.4,2,0.01],["--layout-chat-mist-x","Mist X","px",-300,300,1],["--layout-chat-mist-width","Mist width","%",10,180,1],["--layout-reading-chamber-x","Chamber X","px",-300,300,1],["--layout-reading-chamber-scale","Chamber scale","",0.5,2,0.01],["--layout-reading-footer-x","Reading footer X","px",-300,300,1],["--layout-reading-footer-y","Reading footer Y","px",-300,300,1],["--layout-reading-footer-size","Reading footer text size","px",6,30,0.5]]]);
GROUPS.push(["Direct manipulation · individual Tarot cards","Independent offsets, scale and pitch; original artwork/identity retained",[["--layout-card-1-x","Card 1 X","px",-300,300,1],["--layout-card-1-y","Card 1 Y","px",-300,300,1],["--layout-card-1-scale","Card 1 scale","",0.3,2,0.01],["--layout-card-1-pitch","Card 1 pitch","deg",0,70,0.5],["--layout-card-2-x","Card 2 X","px",-300,300,1],["--layout-card-2-y","Card 2 Y","px",-300,300,1],["--layout-card-2-scale","Card 2 scale","",0.3,2,0.01],["--layout-card-2-pitch","Card 2 pitch","deg",0,70,0.5],["--layout-card-3-x","Card 3 X","px",-300,300,1],["--layout-card-3-y","Card 3 Y","px",-300,300,1],["--layout-card-3-scale","Card 3 scale","",0.3,2,0.01],["--layout-card-3-pitch","Card 3 pitch","deg",0,70,0.5]]]);
export const CONTROLS=GROUPS.flatMap(([, ,controls])=>controls);
export const NAMES=CONTROLS.map(c=>c[0]);
export const PROFILES=Object.freeze({desktop:'(min-width:721px)',mobile:'(max-width:720px) and (min-height:681px)',compact:'(max-width:720px) and (max-height:680px)'});
export function profileFor(width,height){return width>720?'desktop':height<=680?'compact':'mobile'}
export function formatCSS(values,profile='root'){
 const lines=NAMES.filter(name=>Object.hasOwn(values,name)).map(name=>'  '+name+': '+values[name]+';');
 // Only explicit edits are exported; untouched baseline properties stay unchanged.
 const root=':root {\n'+lines.join('\n')+'\n}';
 return profile==='root'?root:'@media '+PROFILES[profile]+' {\n'+root.split('\n').map(line=>'  '+line).join('\n')+'\n}';
}
