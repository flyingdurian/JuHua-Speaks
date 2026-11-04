/**
 * Visual DeckConfig registry. Each visual deck maps 78 immutable semantic IDs.
 * Image files and meaning dictionary are intentionally separate concerns.
 */
import {DECK,localCardUrl,commonsThumbnailUrl} from './deck.mjs';
export const CARD_IDS=Object.freeze(DECK.map(c=>c.id));
const meaningMap=new Map(DECK.map(c=>[c.id,c]));
const base={cardIds:CARD_IDS,semanticDictionaryId:'rws-v1',backStyle:'obsidian-star',backTexture:null};
export const DECK_CONFIGS=Object.freeze({
 rws:Object.freeze({...base,id:'rws',displayName:Object.freeze({en:'Rider–Waite–Smith',zh:'经典韦特塔罗'}),rightsStatus:'public-domain',assetVersion:'1909-taionwc-v1',available:true,localOnly:false,attribution:'Pamela Colman Smith, 1909',faceAsset(cardId){const c=meaningMap.get(cardId);return c?localCardUrl(c):null},fallbackAsset(cardId){const c=meaningMap.get(cardId);return c?commonsThumbnailUrl(c):null}}),
 'chinese-custom':Object.freeze({...base,id:'chinese-custom',displayName:Object.freeze({en:'Chinese / Eastern Mythology (planned)',zh:'中华神话塔罗（筹备中）'}),rightsStatus:'pending-user-original-art',assetVersion:'unpublished',available:false,localOnly:false,attribution:'Future user-created illustrations',faceAsset(){return null},fallbackAsset(){return null}}),
 'chinese-tarot':Object.freeze({...base,id:'chinese-tarot',displayName:Object.freeze({en:'Chinese Tarot — private local preview',zh:'中国塔罗 — 仅本机预览'}),rightsStatus:'private-only',assetVersion:'session-only',available:false,localOnly:true,attribution:'User-provided authorized private files',faceAsset(cardId,localImages){return localImages?.get(cardId)||null},fallbackAsset(){return null}})
});
export function getDeckConfig(id='rws'){const config=DECK_CONFIGS[id];if(!config)throw new RangeError('Unknown DeckConfig: '+id);return config;}
export function resolveFaceSource(deckId,cardId,localImages){if(!meaningMap.has(cardId))throw new RangeError('Unknown card: '+cardId);return getDeckConfig(deckId).faceAsset(cardId,localImages);}
export function deckIsReady(deckId,localImages){
 const d=getDeckConfig(deckId);
 if(d.localOnly)return localImages instanceof Map&&CARD_IDS.every(id=>Boolean(localImages.get(id)));
 return d.available&&CARD_IDS.every(id=>Boolean(d.faceAsset(id)));
}
export function assertDeckReady(deckId,localImages){if(!deckIsReady(deckId,localImages))throw new Error('Deck art is incomplete or not licensed for this mode');return getDeckConfig(deckId);}
export function meaningForCard(cardId){const c=meaningMap.get(cardId);if(!c)throw new RangeError('Unknown card');return c;}
export function getTextureDescriptor(deckId){const d=getDeckConfig(deckId);return {style:d.backStyle,image:d.backTexture,assetVersion:d.assetVersion};}
