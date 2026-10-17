# Card illustration refresh

Replaces the procedural emblems imported from Claudebound with detailed
pixel-art scenes. Images are generated with the built-in image generation tool,
then packaged as 512 × 512 WebP files with `tools/art-refresh/package.py`.

Exact prompts, output paths, references where used, and completion status are
tracked in `tools/art-refresh/prompts.json`. The original style reference is
`assets/cards/level0/strike.png`: crisp pixel clusters, richly shaded materials,
dark navy shadows, jewel-tone magic, and atmospheric cyan/violet lighting.

## Current status — 2026-10-17

**93 unique illustrations complete; all original prompts are finished.**
The latest batch adds 21 upgrades, completing the four-stage sets for
Mirrorguard, Prism Lance, Arc Bulwark, Lunar Edict, Phantom Resonance,
Sovereign Gale, and Tidebound. Twenty upgradeable cards now have complete
four-stage sets, and all ten side cards have finished artwork. It also adds
Chronospire base artwork for Temporal Barrage and Clockwork Volley.

Shared artwork resolvers use every completed stage in battles, decks, and the
compendium.

## Remaining work

1. Generate base artwork for Delayed Bulwark, Rewind Mend, Accelerate,
   Chrono Spike, and Future Sight.
2. Generate levels 1–3 for all seven Chronospire designs.

**26 illustrations remain in total**, all for Chronospire.

Stop on the first usage-limit response and retain every successful output.
After each batch, visually review the images, update the completion statuses
and shared resolvers, check all card and side-card paths, run the existing tests,
and verify rendering. Refresh the card script versions in `index.html` and
`compendium.html`, the side-deck script version, and the compendium iframe URL.

Maps, movement, card effects, progression, and saved-game data are outside this
artwork pass. The older `generate_*_card_art.py` scripts create the superseded
PNG emblems and should not overwrite the new illustrations.
