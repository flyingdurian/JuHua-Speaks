/** Data-driven reader definitions. Availability is a product decision, not hard-coded AI behavior. */
export const DEFAULT_READER_ID='artemis';
export const READERS=Object.freeze([
 {id:'artemis',name:{en:'Artemis',zh:'阿尔忒弥斯'},focus:'balanced',tone:'elegant, emotionally intelligent, reflective',portraitAsset:null,promptTemplateId:'reader-balanced-v1',supportedLocales:['en','zh'],enabled:true,sortOrder:0},
 {id:'cassiel',name:{en:'Cassiel',zh:'卡西尔'},focus:'decisions',tone:'structured and evidence-grounded',portraitAsset:null,promptTemplateId:'reader-decisions-v1',supportedLocales:['en','zh'],enabled:false,sortOrder:1},
 {id:'selene',name:{en:'Selene',zh:'塞勒涅'},focus:'symbolism',tone:'poetic and vivid but grounded',portraitAsset:null,promptTemplateId:'reader-symbols-v1',supportedLocales:['en','zh'],enabled:false,sortOrder:2},
 {id:'orion',name:{en:'Orion',zh:'俄里翁'},focus:'blind-spots',tone:'clear, kind and direct',portraitAsset:null,promptTemplateId:'reader-honest-v1',supportedLocales:['en','zh'],enabled:false,sortOrder:3},
 {id:'lian',name:{en:'Lian',zh:'莲'},focus:'gentle-guidance',tone:'warm, actionable and respectful',portraitAsset:null,promptTemplateId:'reader-warm-v1',supportedLocales:['en','zh'],enabled:false,sortOrder:4},
 {id:'mnemosyne',name:{en:'Mnemosyne',zh:'谟涅摩叙涅'},focus:'history-patterns',tone:'contextual, privacy-first and non-predictive',portraitAsset:null,promptTemplateId:'reader-patterns-v1',supportedLocales:['en','zh'],enabled:false,sortOrder:5}
]);
export function readerById(id=DEFAULT_READER_ID){const r=READERS.find(x=>x.id===id);if(!r)throw new RangeError('Unknown reader');return r;}
export function availableReaders(locale='en'){return READERS.filter(r=>r.enabled&&r.supportedLocales.includes(locale)).sort((a,b)=>a.sortOrder-b.sortOrder);}
