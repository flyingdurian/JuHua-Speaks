/**
 * Artemis character package — one locked Modern Occult Hostess × Dreamlike
 * Storybook Diviner identity. Vector layers are intentional reusable stage art.
 * Costume, hair, facial geometry and identity never change between states.
 */
export const ARTEMIS_IDENTITY=Object.freeze({
 id:'artemis-modern-storybook-v1',
 label:'Modern Occult × Dreamlike Storybook',
 palette:Object.freeze(['midnight-violet','moon-silver','lavender','muted-gold']),
 silhouette:'Long midnight-violet hair, lilac camellia, tailored occult bodice, sheer moonlit sleeves'
});
export const ARTEMIS_EXPRESSIONS=Object.freeze([
 Object.freeze({id:'neutral',label:'Neutral',zh:'平静'}),
 Object.freeze({id:'welcome',label:'Warm welcome',zh:'温暖欢迎'}),
 Object.freeze({id:'focus',label:'Focused observation',zh:'专注观察'}),
 Object.freeze({id:'thoughtful',label:'Thoughtful',zh:'沉思'}),
 Object.freeze({id:'intrigued',label:'Surprised / intrigued',zh:'好奇惊讶'}),
 Object.freeze({id:'reassuring',label:'Reassuring',zh:'温柔安慰'}),
 Object.freeze({id:'confident',label:'Confident presenter',zh:'自信解读'}),
 Object.freeze({id:'mystical',label:'Mystical ritual',zh:'神秘仪式'})
]);
export const ARTEMIS_ACTIONS=Object.freeze([
 Object.freeze({id:'idle',label:'Idle',zh:'静候'}),
 Object.freeze({id:'welcome',label:'Welcoming gesture',zh:'迎接'}),
 Object.freeze({id:'present',label:'Present three cards',zh:'展示三张牌'}),
 Object.freeze({id:'observe',label:'Read / observe',zh:'观察牌面'}),
 Object.freeze({id:'speak',label:'Explain / speak',zh:'讲解'}),
 Object.freeze({id:'reassure',label:'Reassuring gesture',zh:'安慰'}),
 Object.freeze({id:'invoke',label:'Mystic invocation',zh:'施展仪式'}),
 Object.freeze({id:'acknowledge',label:'Selection acknowledgement',zh:'点头致意'})
]);
const valid=(catalog,id,fallback)=>catalog.some(x=>x.id===id)?id:fallback;
export function resolveArtemisPose({expression='neutral',action='idle'}={}){
 return Object.freeze({
  expression:valid(ARTEMIS_EXPRESSIONS,expression,'neutral'),
  action:valid(ARTEMIS_ACTIONS,action,'idle')
 });
}
/** Narration-driven, predictable. No mood classification of user questions. */
export function readingArtemisPose(beat){
 const poses=[
  {expression:'welcome',action:'present'},
  {expression:'focus',action:'observe'},
  {expression:'thoughtful',action:'speak'},
  {expression:'confident',action:'present'},
  {expression:'reassuring',action:'acknowledge'}
 ];
 const index=Number.isFinite(beat)?Math.min(4,Math.max(0,Math.trunc(beat)+1)):0;
 return resolveArtemisPose(poses[index]);
}
const EXPRESSIONS={
 neutral:{brows:['M188 204Q201 199 213 205','M249 205Q261 199 274 204'],eyes:12,iris:223,mouth:'M222 274 Q232 279 243 274'},
 welcome:{brows:['M188 204Q201 197 213 204','M249 204Q261 197 274 204'],eyes:9,iris:223,mouth:'M219 270 Q232 286 245 270'},
 focus:{brows:['M188 207Q201 202 214 207','M249 207Q261 202 274 207'],eyes:8,iris:226,mouth:'M224 275 Q233 277 241 275'},
 thoughtful:{brows:['M188 202Q201 197 212 205','M250 207Q261 202 274 206'],eyes:10,iris:224,mouth:'M224 274 Q232 278 239 273'},
 intrigued:{brows:['M188 200Q201 191 213 200','M249 200Q261 191 274 200'],eyes:17,iris:224,mouth:'M232 272 C226 270 226 283 232 283 C239 283 240 269 232 272'},
 reassuring:{brows:['M188 207Q201 202 214 205','M249 205Q261 202 274 207'],eyes:9,iris:224,mouth:'M219 270 Q232 284 245 270'},
 confident:{brows:['M188 202Q201 197 214 204','M249 204Q261 197 274 202'],eyes:12,iris:224,mouth:'M220 272 Q232 281 245 272'},
 mystical:{brows:['M188 207Q201 202 214 207','M249 207Q261 202 274 207'],eyes:9,iris:225,mouth:'M224 274 Q233 278 241 274'}
};
const ARMS={
 idle:'<path d="M155 355 Q118 380 117 460 L136 507 Q157 512 172 485 L179 400Z" fill="url(#artemis-sheer)" stroke="#b59cc6" stroke-width="1.5"/><path d="M312 356Q345 377 351 455L333 500Q309 502 302 471L292 391Z" fill="url(#artemis-sheer)" stroke="#b59cc6" stroke-width="1.5"/><path d="M143 471Q149 481 155 469" stroke="#e4b69e" stroke-width="9" stroke-linecap="round"/><path d="M318 468Q327 483 334 471" stroke="#e4b69e" stroke-width="9" stroke-linecap="round"/>',
 welcome:'<path d="M155 355Q122 383 113 459L133 502Q156 501 177 447L183 392Z" fill="url(#artemis-sheer)" stroke="#a99dce"/><path d="M312 358 Q350 356 378 304 L406 306 Q408 323 393 347 L347 416Q322 422 291 395Z" fill="url(#artemis-sheer)" stroke="#d8bde8"/><path d="M392 305 Q408 293 415 295 Q427 300 417 310L405 325Z" fill="#f0cabc" stroke="#b68e89"/>',
 present:'<path d="M158 361Q123 348 87 399L79 422Q93 448 124 434L182 398Z" fill="url(#artemis-sheer)" stroke="#b8a2dc"/><path d="M305 359Q346 346 376 400L380 425Q366 447 332 433L285 399Z" fill="url(#artemis-sheer)" stroke="#b8a2dc"/><path d="M85 405Q70 398 59 412Q64 429 84 423" fill="#efc6bb"/><path d="M375 405Q390 400 401 413Q395 429 378 423" fill="#efc6bb"/>',
 observe:'<path d="M153 356Q116 387 118 459L134 497Q152 499 170 467L179 392Z" fill="url(#artemis-sheer)" stroke="#b8a2dc"/><path d="M313 354Q339 361 340 405Q335 420 316 431L278 333Q276 310 292 308L325 364Z" fill="url(#artemis-sheer)" stroke="#c7aedf"/><path d="M287 312Q278 295 271 288Q262 289 265 304L278 327Z" fill="#edc3b8"/>',
 speak:'<path d="M157 355Q116 385 118 460L135 497Q158 503 175 458L181 392Z" fill="url(#artemis-sheer)" stroke="#b8a2dc"/><path d="M313 353Q345 359 385 348L386 380Q362 406 314 420L293 384Z" fill="url(#artemis-sheer)" stroke="#cfb6df"/><path d="M380 349Q399 341 407 352Q408 366 386 382Z" fill="#efc8b7"/>',
 reassure:'<path d="M156 353Q113 380 119 455L134 495Q162 500 176 463L178 394Z" fill="url(#artemis-sheer)" stroke="#b8a2dc"/><path d="M312 357Q331 372 329 403Q297 429 255 417L239 398Q244 381 265 385L295 388Z" fill="url(#artemis-sheer)" stroke="#cfb6df"/><path d="M241 395Q218 385 212 402Q214 415 242 416" fill="#f0c5b6"/>',
 invoke:'<path d="M158 355Q121 341 92 375L94 422Q113 438 142 405L185 393Z" fill="url(#artemis-sheer)" stroke="#d9c3fa"/><path d="M307 354Q341 342 368 374L367 423Q347 439 327 409L284 390Z" fill="url(#artemis-sheer)" stroke="#d9c3fa"/><path d="M96 377Q88 362 105 356Q119 360 119 377Z" fill="#efd0c3"/><path d="M365 379Q378 360 360 356Q348 359 348 376Z" fill="#efd0c3"/>',
 acknowledge:'<path d="M155 357Q118 383 121 456L138 492Q158 499 173 469L180 391Z" fill="url(#artemis-sheer)" stroke="#b8a2dc"/><path d="M311 356Q336 374 334 432L315 478Q290 478 294 455L294 387Z" fill="url(#artemis-sheer)" stroke="#b8a2dc"/><path d="M301 455Q313 463 320 449" stroke="#e8b9a7" stroke-width="9" stroke-linecap="round"/>'
};
function face(expression){
 const x=EXPRESSIONS[expression];
 const eyes=[200,262].map((cx,i)=>'<path d="M'+(cx-16)+' 224 Q'+cx+' '+(224-x.eyes*.55)+' '+(cx+16)+' 224" fill="none" stroke="#362b42" stroke-width="3" stroke-linecap="round"/>'+
  '<ellipse cx="'+cx+'" cy="'+x.iris+'" rx="8.5" ry="'+(x.eyes*.53)+'" fill="#eee7ef"/>'+
  '<ellipse cx="'+cx+'" cy="'+x.iris+'" rx="5.5" ry="'+(x.eyes*.43)+'" fill="url(#artemis-iris)"/>'+
  '<ellipse cx="'+(cx-1.7)+'" cy="'+(x.iris-2)+'" rx="1.8" ry="2.1" fill="#fff9ec"/>').join('');
 return '<g class="artemis-face-details">'+
  '<path d="'+x.brows[0]+'" fill="none" stroke="#4c344d" stroke-width="3.4" stroke-linecap="round"/>'+
  '<path d="'+x.brows[1]+'" fill="none" stroke="#4c344d" stroke-width="3.4" stroke-linecap="round"/>'+eyes+
  '<path d="M231 233Q225 249 232 252" fill="none" stroke="#c88e8e" stroke-width="1.5"/>'+
  '<path d="'+x.mouth+'" fill="none" stroke="#b76e83" stroke-width="2.8" stroke-linecap="round"/>'+
  '<path d="M176 249Q187 254 196 251 M267 252Q276 255 288 249" fill="none" stroke="#dd91a4" stroke-width="5" opacity=".18"/></g>';
}
export function renderArtemisPortrait(pose={},additionalClass=''){
 const chosen=resolveArtemisPose(pose);
 const aria='Artemis, a celestial tarot guide, '+chosen.expression+' expression, '+chosen.action+' gesture';
 return '<svg class="artemis-avatar artemis-expression-'+chosen.expression+' artemis-pose-'+chosen.action+' '+String(additionalClass||'')+'" viewBox="0 0 460 550" role="img" aria-label="'+aria+'" xmlns="http://www.w3.org/2000/svg">'+
 '<defs>'+
 '<linearGradient id="artemis-hair" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#120d27"/><stop offset=".38" stop-color="#30203e"/><stop offset=".72" stop-color="#66557f"/><stop offset="1" stop-color="#1b1832"/></linearGradient>'+
 '<linearGradient id="artemis-sheen" x1="0" x2="1"><stop stop-color="#1c1831"/><stop offset=".56" stop-color="#46395b"/><stop offset="1" stop-color="#15172e"/></linearGradient>'+
 '<linearGradient id="artemis-sheer" x1="0" x2="1"><stop stop-color="#514474" stop-opacity=".9"/><stop offset=".7" stop-color="#ae91c9" stop-opacity=".8"/><stop offset="1" stop-color="#5d4a8b" stop-opacity=".78"/></linearGradient>'+
 '<linearGradient id="artemis-skin" x1="0" x2="1"><stop stop-color="#d79ea0"/><stop offset=".52" stop-color="#f8d5c4"/><stop offset="1" stop-color="#e8b1af"/></linearGradient>'+
 '<radialGradient id="artemis-iris"><stop stop-color="#a67fbd"/><stop offset=".72" stop-color="#684579"/><stop offset="1" stop-color="#372a56"/></radialGradient>'+
 '<radialGradient id="artemis-aura"><stop stop-color="#c4a3e9" stop-opacity=".4"/><stop offset="1" stop-color="#8c77ad" stop-opacity="0"/></radialGradient>'+
 '</defs>'+
 '<g class="artemis-moon-ring" fill="none" stroke="#e2c68f" stroke-opacity=".43"><circle cx="234" cy="189" r="164" stroke-width="1.5"/><circle cx="234" cy="189" r="145" stroke-opacity=".23"/><path d="M69 189A165 165 0 0 1 396 189" stroke-width="2" stroke-dasharray="5 17"/></g>'+
 '<ellipse cx="234" cy="244" rx="188" ry="225" fill="url(#artemis-aura)" opacity=".45"/>'+
 '<g class="artemis-hair-layer"><path d="M150 118Q102 119 110 255Q114 321 79 446Q117 447 147 397Q130 479 161 501Q184 477 198 427Q242 484 289 486Q303 464 310 434Q338 469 357 445Q323 335 343 236Q357 145 298 114Q215 67 150 118Z" fill="url(#artemis-hair)" stroke="#c9b2db" stroke-opacity=".2" stroke-width="2"/>'+
 '<path d="M137 148Q121 294 137 414M315 158Q335 293 315 430M164 132Q153 312 180 432M292 125Q299 283 285 418" fill="none" stroke="#bca1d2" stroke-opacity=".27" stroke-width="3"/></g>'+
 '<g class="artemis-arms">'+ARMS[chosen.action]+'</g>'+
 '<path d="M169 333Q151 339 135 350Q112 359 95 479Q140 530 229 531Q311 529 362 479Q351 373 323 347Q307 338 293 333Z" fill="url(#artemis-sheen)" stroke="#9a84b4" stroke-width="2"/>'+
 '<path d="M178 340L224 426L281 340Q310 361 309 419L294 528H169L156 419Q159 365 178 340Z" fill="#18172d" stroke="#c7ad7e" stroke-opacity=".8" stroke-width="1.5"/>'+
 '<path d="M181 351L231 433L278 351M180 527Q223 499 294 528M199 394L263 394" stroke="#d5ba8b" stroke-width="2" fill="none" stroke-opacity=".78"/>'+
 '<path d="M205 331L213 363Q229 377 246 363L257 331" fill="#e3b9b0" stroke="#b8878a" stroke-width="1"/>'+
 '<path d="M209 340Q230 375 253 339" fill="none" stroke="#e9d0a1" stroke-width="2"/>'+
 '<path d="M230 371L219 403L232 422L245 403Z" fill="#48365e" stroke="#e9d0a1" stroke-width="1.6"/>'+
 '<circle cx="232" cy="407" r="5" fill="#f0d39b"/>'+
 '<g class="artemis-head"><path d="M168 157Q165 115 229 112Q302 113 308 164Q316 214 293 282Q267 320 232 328Q197 318 177 290Q156 243 168 157Z" fill="url(#artemis-skin)" stroke="#c28a97" stroke-width="1.5"/>'+
 '<path d="M178 274Q193 307 231 318Q270 310 289 270" fill="none" stroke="#fff0d2" opacity=".35" stroke-width="3"/>'+
 face(chosen.expression)+
 '</g>'+
 '<g class="artemis-fringe"><path d="M168 199Q142 156 161 116Q181 91 230 95Q283 84 312 116Q326 153 297 194Q303 171 277 140Q270 175 240 186Q255 153 249 136Q212 180 170 188Z" fill="url(#artemis-hair)" stroke="#a58ab6" stroke-width="1.3"/>'+
 '<path d="M171 133Q204 108 237 109M267 111Q304 127 295 169" stroke="#d0b5e1" stroke-opacity=".5" stroke-width="3" fill="none"/>'+
 '<path d="M166 160Q140 226 153 306Q167 329 172 340Q159 284 176 225" fill="url(#artemis-hair)"/>'+
 '<path d="M300 159Q326 222 312 313Q302 341 292 350Q310 277 290 217" fill="url(#artemis-hair)"/></g>'+
 '<g class="artemis-flower" transform="translate(165 133)">'+
 '<path d="M0 0Q-18 -28 0 -36Q20 -22 0 0 M0 0Q21 -22 33 -9Q27 12 0 0 M0 0Q14 19 0 30Q-17 13 0 0 M0 0Q-27 12 -33 -10Q-18 -23 0 0" fill="#a79cc8" stroke="#e8d4fa" stroke-width="1.3"/>'+
 '<circle r="8" fill="#ecce95"/><circle r="3" fill="#fff9e0"/></g>'+
 '<path d="M171 158Q167 176 168 203" stroke="#e2bb8d" stroke-width="2"/><path d="M172 200Q159 220 171 230Q183 220 172 200" fill="none" stroke="#e0c897" stroke-width="2"/>'+
 '<path d="M294 159Q299 175 295 203" stroke="#e2bb8d" stroke-width="2"/><path d="M295 203Q284 220 295 230Q308 220 295 203" fill="none" stroke="#e0c897" stroke-width="2"/>'+
 '<g class="artemis-celestial-focus" opacity="0"><circle cx="231" cy="358" r="43" fill="none" stroke="#f7dbb0" stroke-width="2"/><circle cx="231" cy="358" r="29" fill="none" stroke="#c7aaff"/><path d="M231 307L244 358L231 410L218 358Z" fill="none" stroke="#d5b9ff"/><circle cx="231" cy="358" r="9" fill="#f9e6c1"/></g>'+
 '<path d="M86 511Q230 545 374 510" stroke="#d7b7ec" opacity=".3" stroke-width="2" fill="none"/></svg>';
}