/** Pure interaction state for a slow, user-controlled card-corner reveal. */
export function clampReveal(progress){return Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0))}
export function progressFromCardDrag(startProgress,startX,x,width){
 if(!Number.isFinite(width)||width<=0)return clampReveal(startProgress);
 return clampReveal(startProgress+(startX-x)/width);
}
/** Moving two fingers toward one another lets the edge open like a poker hand. */
export function progressFromPinch(startProgress,startDistance,currentDistance,width){
 if(!Number.isFinite(width)||width<=0)return clampReveal(startProgress);
 return clampReveal(startProgress+(startDistance-currentDistance)/width);
}
export function nextRevealProgress(current,delta=.15){return clampReveal(current+delta)}
export function isRevealed(progress){return clampReveal(progress)>=.999}
export function allCardsRevealed(revealed){return Array.isArray(revealed)&&revealed.length===3&&revealed.every(Boolean)}
