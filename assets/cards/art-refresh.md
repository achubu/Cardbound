# Card illustration refresh

Replaces the procedural emblems imported from Claudebound with detailed
pixel-art scenes. Images are generated with the built-in image generation tool,
then packaged as 512 × 512 WebP files with `tools/art-refresh/package.py`.

Exact prompts, output paths, references where used, and completion status are
tracked in `tools/art-refresh/prompts.json`. The original style reference is
`assets/cards/level0/strike.png`: crisp pixel clusters, richly shaded materials,
dark navy shadows, jewel-tone magic, and atmospheric cyan/violet lighting.

## Current status — 2026-10-18

**117 unique illustrations complete.** The latest batch adds 24 Chronospire
illustrations: five missing base scenes and nineteen upgrade stages. Temporal
Barrage, Delayed Bulwark, Clockwork Volley, Future Sight, Rewind Mend, and
Chrono Spike now have complete four-stage sets. Accelerate has its base and
level-1 artwork. Twenty-six upgradeable cards now have complete four-stage
sets, and all ten side cards have finished artwork.

Shared artwork resolvers use every completed stage in battles, decks, and the
compendium.

## Remaining work

Generate Accelerate levels 2 and 3 after the image-generation allowance resets.

**2 illustrations remain in total**, both for Chronospire.

Stop on the first usage-limit response and retain every successful output.
After each batch, visually review the images, update the completion statuses
and shared resolvers, check all card and side-card paths, run the existing tests,
and verify rendering. Refresh the card script versions in `index.html` and
`compendium.html`, the side-deck script version, and the compendium iframe URL.

Maps, movement, card effects, progression, and saved-game data are outside this
artwork pass. The older `generate_*_card_art.py` scripts create the superseded
PNG emblems and should not overwrite the new illustrations.
