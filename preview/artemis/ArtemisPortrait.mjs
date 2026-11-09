/**
 * Artemis v1 editable vector portrait rig.
 * One stable Japanese-inspired celestial reader identity; 16 named expression
 * and gesture states can be previewed without swapping unrelated anatomy.
 * High-resolution commissioned renders can replace the vector at this seam.
 */
import {ARTEMIS_PORTRAITS} from './ArtemisMachine.mjs';
export function portraitExpression(id){
 if(!ARTEMIS_PORTRAITS.includes(id))throw new RangeError('Unknown Artemis portrait');
 return Object.freeze({
  id,happy:['welcoming','warm_welcome','reassuring','confident','presenting','explaining'].includes(id),
  closed:['reading','focused','invocation'].includes(id),
  concerned:['thinking','reflective','observing'].includes(id),
  surprised:['surprised','intrigued'].includes(id),
  gesturing:['welcoming','presenting','acknowledge','explaining','confident'].includes(id)
 });
}
const eye=(x,m)=>m.closed
 ? '<path d="M'+(x-20)+' 214 Q'+x+' 224 '+(x+20)+' 211" fill="none" stroke="#543b62" stroke-width="4" stroke-linecap="round"/>'
 : '<path d="M'+(x-21)+' 211 Q'+x+' '+(m.surprised?184:192)+' '+(x+22)+' 211 Q'+x+' '+(m.surprised?228:224)+' '+(x-21)+' 211Z" fill="#fff5f3" stroke="#573756" stroke-width="2"/>'+
 '<ellipse cx="'+(x+2)+'" cy="211" rx="12" ry="'+(m.surprised?16:13)+'" fill="#765a9f"/>'+
 '<ellipse cx="'+(x+2)+'" cy="211" rx="6" ry="9" fill="#34244c"/><circle cx="'+(x-2)+'" cy="206" r="3.5" fill="#fff7ff"/>';
export function artemisPortraitSvg(id='idle'){
 const m=portraitExpression(id);
 const mouth=m.surprised?'<ellipse cx="190" cy="283" rx="7" ry="10" fill="#a85675"/>'
  :'<path d="M176 280 Q190 '+(m.happy?'297':'285')+' 204 280" fill="none" stroke="#9b516e" stroke-width="3" stroke-linecap="round"/>';
 const brows=m.concerned
  ?'<path d="M135 188 Q151 184 170 196 M210 196 Q230 184 247 188" fill="none" stroke="#423046" stroke-width="3"/>'
  :'<path d="M135 188 Q151 180 170 187 M210 187 Q230 180 247 188" fill="none" stroke="#423046" stroke-width="3"/>';
 const gesture=m.gesturing?'<path d="M84 420 Q47 390 32 413 Q19 433 37 461 Q56 484 86 476 L127 454" fill="#f1c5be" stroke="#af889f" stroke-width="3"/>':'';
 return [
 '<svg class="artemis-portrait-svg" viewBox="0 0 380 500" role="img" aria-label="Artemis — '+id.replaceAll('_',' ')+'" xmlns="http://www.w3.org/2000/svg">',
 '<defs><radialGradient id="ap-aura"><stop stop-color="#ad76d3" stop-opacity=".51"/><stop offset=".6" stop-color="#52256c" stop-opacity=".18"/><stop offset="1" stop-color="#1a112d" stop-opacity="0"/></radialGradient>',
 '<linearGradient id="ap-hair" x2="1" y2="1"><stop stop-color="#191124"/><stop offset=".53" stop-color="#493258"/><stop offset="1" stop-color="#110f22"/></linearGradient>',
 '<linearGradient id="ap-skin" x2=".7" y2="1"><stop stop-color="#ffe4d8"/><stop offset=".65" stop-color="#f2c6c0"/><stop offset="1" stop-color="#ce9aa8"/></linearGradient>',
 '<linearGradient id="ap-robe" x2=".7" y2="1"><stop stop-color="#69568d"/><stop offset=".48" stop-color="#342544"/><stop offset="1" stop-color="#191727"/></linearGradient></defs>',
 '<ellipse cx="190" cy="242" rx="180" ry="222" fill="url(#ap-aura)"/>',
 '<g opacity=".75" fill="none" stroke="#ad88d4"><circle cx="190" cy="216" r="151" stroke-width="1"/><circle cx="190" cy="216" r="163" stroke-width=".6" stroke-dasharray="3 13"/></g>',
 '<path d="M96 157 C72 45 133 11 201 29 C302 22 329 112 295 216 C323 300 325 427 355 497 H36 C71 407 69 303 85 220Z" fill="url(#ap-hair)" stroke="#6e588b" stroke-width="2"/>',
 '<path d="M85 499 C73 403 115 363 142 338 C169 314 221 313 255 340 C296 370 322 405 330 499Z" fill="url(#ap-robe)" stroke="#bd9e78" stroke-width="2"/>',
 gesture,
 '<path d="M159 322 C160 341 165 355 190 368 C213 353 219 342 220 318" fill="url(#ap-skin)"/>',
 '<path d="M143 349 L190 427 L239 349 L275 386 L223 500 H157 L107 384Z" fill="#241c37" stroke="#d0ac72" stroke-width="2"/>',
 '<path d="M161 350 L190 403 L219 350 M122 407 Q189 439 258 408 M113 453 Q190 478 269 453" fill="none" stroke="#cfaf73" stroke-width="1.5"/>',
 '<path d="M115 141 C116 87 150 62 196 63 C244 61 277 104 267 159 L265 242 C257 304 236 337 190 345 C145 336 122 302 115 240Z" fill="url(#ap-skin)" stroke="#cb9cad" stroke-width="1.6"/>',
 '<path d="M126 162 C143 144 152 106 162 95 C174 133 207 147 246 151 C227 120 213 101 199 87 C232 88 267 129 273 171 C286 91 244 40 183 50 C115 50 92 96 126 162Z" fill="url(#ap-hair)" stroke="#221c32" stroke-width="1"/>',
 brows,eye(153,m),eye(226,m),
 '<path d="M188 228 L183 260 Q190 263 197 260" fill="none" stroke="#be8694" stroke-width="2"/>',
 '<ellipse cx="133" cy="258" rx="17" ry="8" fill="#df829b" opacity=".24"/><ellipse cx="249" cy="258" rx="17" ry="8" fill="#df829b" opacity=".24"/>',
 mouth,
 '<g fill="none" stroke="#d0ae6c" stroke-width="2.2"><circle cx="113" cy="251" r="10"/><circle cx="267" cy="251" r="10"/><path d="M113 225L113 241 M267 225L267 241"/></g>',
 '<g transform="translate(95 98)" stroke="#caa3d6" stroke-width="1.4"><path d="M0 0 C-24 -17 -40 -2 -20 14 C-41 26 -30 46 -8 30 C-1 57 19 46 14 24 C45 35 44 8 20 7 C31 -18 13 -28 0 0Z" fill="#9460bc"/><circle cx="3" cy="13" r="7" fill="#e6bc71"/></g>',
 '<path d="M190 164 L195 172 L190 180 L185 172Z" fill="#aa89cf"/>',
 '<g fill="#dfc995"><circle cx="60" cy="136" r="2"/><circle cx="319" cy="106" r="1.8"/><circle cx="42" cy="320" r="1.4"/><circle cx="331" cy="303" r="1.3"/></g></svg>'
 ].join('');
}