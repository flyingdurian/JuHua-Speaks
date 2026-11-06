# Gate A v3 — Dual-video landing audit

**Evidence:** Two synchronized 20-second side-by-side videos uploaded by the Product Owner, one with the normal CTA and one with the CTA hidden. Reference on the left, Gate A v2 on the right. These private videos are not committed to the repository.

## Evidence-led conclusions

| Condition | ChatARot reference | Gate A v2 failure | v3 correction |
|---|---|---|---|
| Entrance, 0–3 seconds | Spherical cloud emerges quickly with no giant central card collage | Large front faces explode near the camera and obscure the experience | 1.9-second scale-controlled, fade-in camera flyout |
| Both films, steady orbit | Visibly rounded, layered celestial card volume with depth and perspective | Flat gallery of evenly spaced art cards with limited motion | One compact 3D spheroid; coherent rotation and stronger true depth |
| Without CTA | Many blue card backs, fewer original illustrated faces, frequent edge-on slivers | Nearly every front constantly points to the camera | Real independent yaw, pitch, roll; front, back and edge revealed by physical orientation |
| Foreground | Occasional very large cards pass an edge then recede | Near passes feel detached from the shell | Four continuous, bounded eccentric foreground passes |
| Background | Purple-gray nebulae visible around a star-filled void | Mostly dark, less atmospheric | Multiple original procedurally animated nebula layers |
| Overlay | Small readable center CTA, floating above cards | Overly dominant title hides some spatial cues | Less dominant typography and optional preview-only Hide CTA toggle |

## Key interpretation

The previous requirement for all 78 original RWS illustrations means each of the 78 individually identified physical cards MUST have its authentic front loaded and correctly mapped. It does not mean all 78 pictures should continuously face the viewer. The reference unmistakably displays a majority of navy card backs at a given instant, a minority of illustrated fronts and some very thin edge-on cards. v3 displays physical card sides while maintaining all 78 licensed historical fronts in the atlas. Decorative visual orientation and seeded orbit do not affect any subsequent draw, card identity or reading.

## Implementation notes

- OrbitalField.mjs: 78 canonical IDs, golden-angle randomized shell, radius 23.5 and center depth -40, coherent 0.043rad/s rotation, 1.9-second flyout, bounded near passes and physical card attitude.
- RitualWorld.mjs: front/back/edge geometry in real orientation; no camera-facing billboards; original 78 JPEG front atlas slots retained.
- CanvasOrbit.mjs: same orbital coordinates and attitude as GPU renderer; physical side selection for front/back.
- Preview: original procedural nebula layers, CTA hide/show button and H shortcut that does not recreate the GPU world.
- Runtime still audits/loads all 78 historic RWS JPEGs before launching, and does not replace missing imagery with generated illustrations.
- Production v0.8.2, Step 6 reading and Exodia local API remain unchanged.

## Visual gate

Use npm run preview:gate-a and visit http://127.0.0.1:4183/preview/gate-a/. Allow the image import on first run. Check the status reaches 78 FACES LOADED. Record 20 seconds normally; press H and record another 20 seconds without the CTA. Compare both recordings with the source videos. Look for a circular card-field silhouette, changing true sides, coherent slow orbit, visible atmospheric clouds, occasional edge passes and no unreadable central card collage. Refresh three times to check random starts. GPU and mobile browser acceptance must be explicitly reviewed before any merge or Gate B.

**Review policy:** This remains an isolated draft PR. Automated tests do not certify motion quality. No new GPU-captured demonstration of this exact v3 implementation has been verified in the current environment, and the earlier Gate A v1 recording is not evidence for v3.
