/** Mutable *copy*, stable technical identifiers. Future rebrands change this file only. */
export const BRAND=Object.freeze({
 id:'tarot-ritual', // stable internal ID, must NOT change with display brand
 displayName:Object.freeze({en:'JuHua Speaks',zh:'菊花说'}),
 lockup:Object.freeze({en:'菊花说 · JuHua Speaks',zh:'菊花说 · JuHua Speaks'}),
 tagline:Object.freeze({en:'Tarot in the stars',zh:'星辰之间，塔罗之语'}),
 cardBackLabel:'菊 花 说',
 pageTitle:'JuHua Speaks — Immersive Tarot',
 accent:'#e9c78f'
});
export function brandText(locale='en',key='displayName'){
 const part=BRAND[key];
 return typeof part==='string'?part:part?.[locale==='zh'?'zh':'en']||BRAND.displayName.en;
}
