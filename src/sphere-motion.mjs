/** Gentle ambient orbit. A full revolution takes about 90 seconds. */
export const ORBIT_DEGREES_PER_SECOND = 4;
export const DRAG_RESUME_DELAY_MS = 1100;
export const FLIGHT_DURATION_MS = 920;

export function nextOrbitYaw(currentYaw, elapsedMs, enabled = true) {
 if (!Number.isFinite(currentYaw)) throw new TypeError('Invalid yaw');
 if (!enabled || !Number.isFinite(elapsedMs) || elapsedMs <= 0) return currentYaw;
 // Background tabs must never cause a sudden multi-revolution jump.
 return (currentYaw + ORBIT_DEGREES_PER_SECOND * Math.min(elapsedMs, 64) / 1000) % 360;
}

/** A smooth lift from the star field toward the player's hand. Screen coordinates. */
export function cardFlightFrames(from, to) {
 for (const point of [from, to]) if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new TypeError('Invalid card-flight coordinates');
 const dx = to.x - from.x, dy = to.y - from.y;
 const warp = (ratioX, ratioY, lift, scale, opacity, rotation) => ({
  offset: ratioX,
  transform: `translate3d(${(dx*ratioX).toFixed(2)}px, ${(dy*ratioY-lift).toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
  opacity
 });
 return [
  warp(0,0,0,1,1,-8),
  warp(.13,.05,18,1.30,1,-3),
  warp(.34,.18,74,1.20,1,7),
  warp(.68,.63,52,.87,1,1),
  warp(.93,.93,5,.52,.95,0),
  warp(1,1,0,.30,0,0)
 ];
}
