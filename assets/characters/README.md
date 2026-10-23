# Fixed cast

- `protagonist.jpeg`: user-provided male main character. Used on the start screen, character sheet, and in the world. Display name remains Adventurer until the author supplies a name.
- `story-character.jpeg` (now in `unused assets/assets/characters/`): user-provided female character, reserved for future story implementation. Not selectable or spawned.

Original JPEG references are preserved unchanged. Their checkerboard backgrounds are baked into the images, not transparency. The world uses `protagonist-walk.png`, a transparent 4×4 animation sheet generated from the male reference. Rows: down, left, right, up. Columns: neutral, step, neutral, opposite step. Walking advances at 120 ms per frame only while position changes; idle retains facing and gently breathes. Menus, battles, and collisions stop the gait. Story names, dialogue, and relationships are intentionally undefined.

## Detailed movement sprites — 2026-10-23

The world now uses `protagonist-{down,left,right,up}-v2.webp`; the old sheet
above is retained as a source/reference. Each new directional atlas has a
standing pose and eight walk phases in a 3×3 grid. Generated frames are about
418×418 pixels, compared with the old sheet's approximately 314×314 cells.
Packaging finds the true transparent row gutters, retains the native pixels,
aligns the shirt torso and grounded foot, and pads to 448×448 cells. WebP encoding is
lossless and retains alpha. No direction is created by mirroring another.

The Aetherlink stays on the **anatomical left forearm**: viewer-right in the
front view and viewer-left from behind. It is on the near arm in the
left-facing view and the occluded far arm in the right-facing view. The
right wrist keeps its plain dark band.

The gait advances with actual distance traveled, holds facing on diagonals,
and returns to standing when stopped. Animation uses smooth image sampling;
the breathing effect honors reduced-motion preferences. Tap routes consume
remaining frame time across waypoints. Movement uses small collision steps
at the same 175px/s speed, including below 30fps, and no longer jumps forward
on the first press of the touch arrows.

Original generated PNGs, exact built-in image-generation prompts, frame
anchors and atlas metadata are in `hero-v2/`. Repackage with
`node tools/package_hero_sprites.cjs` (ImageMagick required). Review all
directions and poses at `tools/hero-preview.html`.

Generated with the built-in image-generation tool. Prompt: create a transparent 4×4 pixel-art walking sheet matching the reference male, with down/left/right/up rows, neutral/step/neutral/opposite-step columns, consistent alignment, blond hair, navy polo, tan trousers, brown shoes and tool belt, and cyan wrist device; omit floating hologram panels, checkerboard, text, and grid lines.
