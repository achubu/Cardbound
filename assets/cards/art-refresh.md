# Card illustration refresh

Replaces the simple procedural emblems imported from Claudebound with detailed
pixel-art scenes matching the original Cardbound card illustrations.

Generated with the built-in image generation tool. The style reference is
`assets/cards/level0/strike.png`: crisp pixel clusters, richly shaded materials,
dark navy shadows, jewel-tone magic, and atmospheric cyan/violet lighting.

The prompt set, output paths, and completion status are in
`tools/art-refresh/prompts.json`. Generation stopped at the image service's
usage limit after 27 illustrations. The remaining 64 prompts are pending.

Completed four-stage sets: Arc Jab, Breach Spike, Bulwark Bash,
Chain Lightning, and Overclock.

Partially completed sets: Static Shield (0, 2, 3), Thornlash (0, 1, 2), and
Wildfire (1). Their other levels reuse the nearest completed lower stage, or
the first available stage. This affects only the illustration, never stats.
The other 23 card designs, including Static and the ten side cards, retain
their previous artwork until replacement illustrations can be generated.

Completed assets are 512 × 512 WebP files in `assets/cards/level0/` through
`assets/cards/level3/`. The shared `cardArtPath` function supplies them to
battles, deck views, and the compendium.
The rest of the original collection retains its existing artwork and formats.

`tools/art-refresh/package.py` resizes and encodes the generated illustrations
without changing composition. The older `generate_*_card_art.py` scripts create
the superseded PNG emblems; they do not produce the current WebP illustrations.

This refresh does not change map files, movement, card effects, progression,
or saved-game data.
