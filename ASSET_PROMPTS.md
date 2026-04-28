# Asset Prompts

Most source images were generated with `gpt-image-2` through the Codex image generation tool, then processed locally with chroma-key removal and nearest-neighbor resizing. The simple power-up, brute enemy, and ammo spritesheets were generated locally as deterministic pixel art so the prototype mechanics stay tiny, crisp, and easy to iterate.

## Main Character Sprite Sheet

Use case: game asset generation. Create a game-ready pixel art sprite sheet on a perfectly flat solid #00ff00 chroma-key background for background removal. Use the attached hobgoblin winged mascot image only as the primary visual reference, but reinterpret it into dark GBA inspired pixel art, not photorealistic and not painterly. Subject: small hobgoblin body, pointed ears, dark hood, burgundy leaf crown detail, golden feathered wings, leather armor, mischievous confident expression, red wooden staff. Sprite sheet requirements: isometric three quarter view, 64 by 64 pixels per frame, consistent scale across frames, readable at small size, crisp silhouette, low resolution pixel aesthetic, no text, no watermark. Layout: 4 directional rows if feasible: southeast, southwest, northeast, northwest. Each direction has idle animation with 4 frames followed by walk animation with 6 frames, total 10 columns per row, uniform grid, generous padding inside each frame. Dark moody fantasy palette, GBA era dungeon-game style. The background must be one uniform #00ff00 color with no shadows, gradients, texture, floor plane, or lighting variation. Do not use #00ff00 anywhere in the subject.

## Isometric Dungeon Tileset

Use case: game asset generation. Create a cohesive dark GBA inspired pixel art isometric dungeon tileset on a perfectly flat solid #00ff00 chroma-key background for background removal. Asset type: web game tileset. Style: isometric three quarter view, limited moody palette, crisp readable silhouettes, transparent-ready background, no text, no watermark, no photorealism, no painterly rendering, game ready asset, consistent pixel scale, underground hobgoblin ruin. Tile requirements: ground tile size 64 by 32 pixels, consistent perspective, repeatable edges where needed. Layout as a clean grid with labeled-by-position only, no written labels: include stone floor tile, cracked stone floor tile, mossy stone floor tile, dark wall block, corner wall, stairs down, chasm edge, wooden bridge tile, torch prop, bone pile prop, small treasure prop, red hobgoblin banner prop, rubble prop, wooden post prop, small candle prop. Environment details: mossy stone floors, cracked tiles, dark walls, red banners, bones, candles, wooden posts, chasm edges, torch-lit ruins. Avoid bright fantasy and generic mobile game art. The background must be one uniform #00ff00 color with no shadows, gradients, texture, floor plane, or lighting variation. Do not use #00ff00 anywhere in the tiles or props.

Post-processing note: `vertical_wall.png` is a local transparent PNG derivative cropped from the generated `corner_wall` tile so the map can render straight interior wall faces without requesting a new visual style.

## Effects And UI Sheet

Use case: game asset generation. Create a compact sprite sheet of dark GBA inspired pixel art effects and UI assets on a perfectly flat solid #00ff00 chroma-key background for background removal. Asset type: web game effects and interface pieces. Style: limited moody fantasy palette, crisp pixel art, transparent-ready, no text, no watermark, no photorealism, no painterly rendering, game ready asset, consistent pixel scale. Include six separated assets arranged in a clean grid with generous padding and no written labels: soft circular shadow blob, warm torch glow sprite, small dust particle sprite, small dark UI panel, debug label background, simple keyboard control hint panel with icon-like key shapes but no letters or readable text. Dark hobgoblin ruin tone, muted charcoal stone, deep red accents, warm amber glow. The background must be one uniform #00ff00 color with no shadows, gradients, texture, floor plane, or lighting variation. Do not use #00ff00 anywhere in the assets.

## Goblin Enemy Sprite Sheet

Use case: stylized-concept
Asset type: web game sprite sheet source for Phaser, later chroma-keyed to transparent PNG
Primary request: Create a dark GBA inspired pixel art goblin enemy sprite sheet for an isometric dungeon game. The goblin is hostile and small, with green-gray skin, pointed ears, hunched posture, ragged dark leather armor, a rusty short dagger, angry readable face, and a compact silhouette distinct from the winged hobgoblin hero.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal; background must be one uniform color with no shadows, gradients, texture, lighting variation, floor plane, text, or watermark; do not use #ff00ff anywhere in the subject.
Style/medium: dark GBA inspired pixel art game asset, isometric three quarter view, limited moody palette, crisp readable silhouette, no photorealism, no painterly rendering, game ready asset, consistent pixel scale.
Composition/framing: one cohesive sprite sheet arranged in 4 rows by 10 columns on the flat #ff00ff background; each cell represents a 64 by 64 pixel frame with generous padding. Rows are directions in this order: southeast, southwest, northeast, northwest. In each row, first 4 frames are idle poses and next 6 frames are walk/attack-ready chase poses. Keep the goblin's feet on a consistent baseline in every frame; do not crop any frame.
Constraints: transparent-background-ready via chroma key, consistent scale across frames, readable at small size, no enemies other than this single goblin repeated in frames, no text, no watermark, avoid bright fantasy, avoid generic mobile game art.

## Staff Projectile Sprite Sheet

Use case: stylized-concept
Asset type: web game projectile sprite sheet source for Phaser, later chroma-keyed to transparent PNG
Primary request: Create a dark GBA inspired pixel art projectile sprite sheet for the winged hobgoblin hero's red wooden staff shot. The projectile should look like a small ember-red arcane bolt, a carved red-wood shard with dim gold sparks, suitable for shooting from a staff in a moody dungeon.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal; background must be one uniform color with no shadows, gradients, texture, lighting variation, floor plane, text, or watermark; do not use #00ff00 anywhere in the projectile.
Style/medium: dark GBA inspired pixel art game asset, isometric three quarter view, limited moody palette, crisp readable silhouette, no photorealism, no painterly rendering, game ready asset, consistent pixel scale.
Composition/framing: one sprite sheet arranged in 2 rows by 8 columns on the flat #00ff00 background; each cell represents a 32 by 32 pixel frame with generous padding. Row 1 is the bolt flying animation, 8 frames with subtle flicker and directional streak. Row 2 is small impact spark burst, 8 frames expanding and fading. Keep each frame centered and uncropped.
Constraints: transparent-background-ready via chroma key, readable at small size, no characters, no text, no watermark, avoid bright neon fantasy, preserve dark GBA pixel-art mood.

## Hobgoblin UI Game Over Sheet

Use case: stylized-concept
Asset type: web game UI asset sheet for Phaser, later chroma-keyed to transparent PNG
Primary request: Create a fun but dark GBA inspired pixel art UI sheet for a hobgoblin dungeon game. Include exactly three separated game-ready UI graphics: 1) a compact lives indicator frame shaped like a mischievous hobgoblin charm with three small ruby heart/gem sockets and tiny golden wing accents, 2) a large dramatic game over plaque or banner frame with cracked dark stone, burgundy cloth, bones, gold trim, and empty center space for code-rendered text, 3) a small start-over button frame with dark stone, red wood, gold wing accents, and empty center space for code-rendered text.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal; background must be one uniform color with no shadows, gradients, texture, lighting variation, floor plane, text, or watermark; do not use #00ff00 anywhere in the graphics.
Style/medium: dark GBA inspired pixel art game asset, limited moody fantasy palette, crisp readable silhouette, no photorealism, no painterly rendering, game ready asset, consistent pixel scale.
Composition/framing: one 1024 by 1024 source image with the three graphics arranged in a clean vertical grid with generous padding between them. Top graphic around 360x120 pixels, middle graphic around 560x260 pixels, bottom graphic around 300x110 pixels. Keep edges crisp and uncropped.
Constraints: no readable letters or words inside the image, no extra icons outside the three graphics, transparent-background-ready via chroma key, avoid bright fantasy, avoid generic mobile game art.

## Flame And Heart Effects Sheet

Use case: stylized-concept
Asset type: web game sprite sheet source for Phaser, later chroma-keyed to transparent PNG
Primary request: Create a compact dark GBA inspired pixel art sprite sheet with simple looping UI/effect sprites for a hobgoblin dungeon prototype. Include exactly four separated rows of animation frames: Row 1 torch flame loop, 8 frames, warm amber/orange flame for a standing dungeon torch, no torch stand, flame only with a few sparks. Row 2 small candle flame loop, 8 frames, smaller warm yellow flame, flame only. Row 3 ruby heart/gem life icon, 3 identical still frames of a shiny red heart-shaped gemstone matching a hobgoblin UI lives panel. Row 4 heart vanish animation, 8 frames showing the same ruby heart/gem popping into tiny red/gold pixel shards and fading away.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal; background must be one uniform color with no shadows, gradients, texture, lighting variation, floor plane, text, or watermark; do not use #00ff00 anywhere in the sprites.
Style/medium: dark GBA inspired pixel art game asset, limited moody fantasy palette, crisp readable silhouettes, no photorealism, no painterly rendering, game ready asset, consistent pixel scale.
Composition/framing: one 1024 by 1024 source image arranged as a precise grid on the flat background. Use 8 columns for rows 1, 2, and 4. Each animation frame sits inside an implied 64 by 64 pixel cell with generous padding and consistent baseline. Row 3 has three 64 by 64 cells centered under the other rows. Keep each sprite centered and uncropped. No labels or text.
Constraints: transparent-background-ready via chroma key, cleanly separated frames, readable at small size, no characters, no props except flame/gem sprites, no text, no watermark, avoid bright neon fantasy, preserve dark GBA pixel-art mood.

## Simple Power-Up Sprite Sheet

Use case: local deterministic pixel-art asset generation.
Asset type: web game pickup sprite sheet for Phaser.
Primary request: Create three simple animated dark GBA inspired pixel art power-up pickup sprites: a green quickshot rune/charm, a blue haste wing charm, and a rare purple/gold ward shield charm.
Style/medium: crisp low-resolution pixel art, transparent background, readable at small size, limited moody fantasy palette, no text, no watermark, no photorealism, no painterly rendering.
Composition/framing: one 3-row by 8-column sprite sheet, 32 by 32 pixels per frame. Row 1 quickshot, row 2 haste, row 3 ward. Each row loops subtly with spark/pulse/bob animation.
Constraints: transparent PNG, game-ready, nearest-neighbor-safe, no extra objects, no readable text.
Implementation note: generated by `tools/generate_powerup_sprites.mjs` as a dependency-free local asset script.

## Brute Enemy Sprite Sheet

Use case: gpt-image-2 game asset generation.
Asset type: larger villain sprite sheet source for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art game asset sheet, transparent-background-ready on perfectly flat #00ff00 chroma-key background, no watermark. Create a game-ready sprite sheet for a larger dungeon villain brute: hulking green-gray goblin-like creature, bigger than a small goblin, horned head, bulky dark leather and iron armor, heavy club, angry silhouette, underground hobgoblin ruin mood. Isometric three-quarter view. Arrange exactly 4 rows by 10 columns; each cell represents a 64 by 64 pixel frame with generous padding and consistent foot baseline. Rows are southeast, southwest, northeast, northwest. First 4 frames per row are idle, next 6 frames walk/attack-ready motion. Crisp readable pixel art, limited moody palette, no text, no photorealism, no painterly rendering, consistent pixel scale. The #00ff00 background must be perfectly flat and should not appear in the subject.
Implementation note: source saved as `public/assets/source/brute-gpt-image-2-source.png`, then chroma-keyed and resized to `public/assets/characters/brute-sprite-sheet.png`.

## GPT-Image-2 Actor Death Sprite Sheet

Use case: gpt-image-2 game asset generation.
Asset type: character death animation source for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art death / dying animation source sprite sheet for exactly three existing game actors: row 1 winged hobgoblin hero, row 2 small dagger goblin villain, row 3 hulking brute goblin villain. Each row has exactly 8 frames left to right showing the actor collapsing/dying in place: stagger, knees buckle, falling, impact, sprawled, fading with small dust and red-gold pixel motes, final nearly still defeated pose. Keep it stylized and readable, not gory. Arrange as a precise 3 rows by 8 columns sprite sheet on a perfectly flat solid #ff00ff chroma-key background. Each cell is a 64 by 64 pixel frame with generous padding. Use the same southeast-facing three-quarter direction for all frames. No text, labels, watermark, extra characters, large blood, or generic mobile-game art.
Implementation note: source saved as `public/assets/source/actor-deaths-gpt-image-2-source.png`, then chroma-keyed and resized to `public/assets/characters/actor-deaths-sprite-sheet.png`. The final hobgoblin death row is derived from `public/assets/characters/hobgoblin-sprite-sheet.png` during processing so the main character keeps the exact in-game hood, wings, staff, proportions, and palette.

## GPT-Image-2 Combat Juice Effects

Use case: gpt-image-2 game asset generation.
Asset type: compact combat effect source for Phaser, chroma-keyed and resized locally.
Primary request: Create a dark GBA inspired pixel art combat effects sprite sheet on a perfectly flat solid #ff00ff chroma-key background. Arrange exactly 2 rows by 8 columns with generous padding and no labels. Row 1: small red-gold hit impact sparks, 8 frames, centered, punchy and readable for staff projectile hits. Row 2: stronger smoky enemy death poof, 8 frames, expanding dust cloud with ember chips and tiny stone flecks, stylized and not gory. Each implied cell must fit cleanly into a 64 by 64 game frame after processing. Keep the palette moody dungeon fantasy, crisp pixel art, no photorealism, no painterly rendering, no text, no watermark, and do not use #ff00ff inside the effects.
Implementation note: source saved as `public/assets/source/combat-juice-gpt-image-2-source.png`, then chroma-keyed and resized to `public/assets/effects/combat-juice-sprite-sheet.png`.

## Ammo Pickup Sprite Sheet

Use case: local deterministic pixel-art asset generation.
Asset type: collectible ammo pickup sprite sheet for Phaser.
Primary request: Create a small red staff-shard ammo pickup for a dark GBA inspired isometric dungeon prototype.
Style/medium: crisp low-resolution pixel art, transparent background, warm red/gold palette, no text, no watermark, no photorealism, no painterly rendering.
Composition/framing: one 1-row by 8-column sprite sheet, 32 by 32 pixels per frame, subtle bob/flicker loop.
Constraints: transparent PNG, readable at small size, game-ready.
Implementation note: generated by `tools/generate_brute_ammo_sprites.mjs` as a dependency-free local asset script.

## GPT-Image-2 Start Title Sprite Sheet

Use case: gpt-image-2 game UI asset generation.
Asset type: animated start screen title sprite sheet source for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art game UI sprite sheet, transparent-background-ready on perfectly flat #00ff00 chroma-key background, no watermark. Create an animated title plaque sprite sheet for the start screen of a dungeon game. The asset must include the exact title text: HOBGOBLIN DUNGEON. Arrange exactly 4 horizontal frames in one row. Each frame should be the same composition: dark carved stone plaque, burgundy cloth, small golden wings, ruby accents, moody torch glow, crisp readable pixel lettering. Subtle frame-to-frame glow shimmer only. No other words. No photorealism, no painterly rendering, no generic mobile art, limited moody fantasy palette, GBA-era pixel art, game-ready asset, consistent pixel scale. The #00ff00 background must be one uniform flat color and must not appear in the subject.
Implementation note: source saved as `public/assets/source/start-title-gpt-image-2-source.png`, then chroma-keyed and resized to `public/assets/ui/start-title-sprite-sheet.png`.

## GPT-Image-2 Game Over Sprite Sheet

Use case: gpt-image-2 game UI asset generation.
Asset type: animated game over sprite sheet source for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art game UI sprite sheet, transparent-background-ready on perfectly flat #00ff00 chroma-key background, no watermark. Create an animated GAME OVER graphic sprite sheet for a dungeon game. The asset must include the exact text: GAME OVER. Arrange exactly 4 horizontal frames in one row. Each frame should show a dramatic cracked dark stone plaque with burgundy cloth, bones, gold trim, ruby glow, and moody torch-lit fantasy dungeon style. Subtle frame-to-frame glow/flicker only. No other words. Crisp readable pixel lettering, limited moody palette, no photorealism, no painterly rendering, game-ready asset, consistent pixel scale. The #00ff00 background must be one uniform flat color and must not appear in the subject.
Implementation note: source saved as `public/assets/source/game-over-gpt-image-2-source.png`, then chroma-keyed and resized to `public/assets/ui/game-over-sprite-sheet.png`.

## GPT-Image-2 Health Meter Sprite Sheet

Use case: gpt-image-2 game UI asset generation.
Asset type: animated life meter source for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art game UI sprite sheet, transparent-background-ready on perfectly flat #00ff00 chroma-key background, no watermark. Create a brighter animated health meter sprite sheet for a hobgoblin dungeon game. The health meter has a dark hooded hobgoblin charm center, gold wings, dark stone frame, and exactly three large ruby heart sockets that glow brightly. Arrange exactly 4 horizontal frames in one row, same composition in every frame with subtle glow pulse. No text. Crisp readable pixel art, limited moody fantasy palette, no photorealism, no painterly rendering, game-ready asset, consistent pixel scale. The #00ff00 background must be one uniform flat color and must not appear in the subject.
Implementation note: source saved as `public/assets/source/life-meter-gpt-image-2-source.png`, then chroma-keyed, resized, and locally cleared inside the heart sockets so separate hearts can disappear one by one.

## GPT-Image-2 Score And Ammo HUD Sheet

Use case: gpt-image-2 game UI asset generation.
Asset type: animated score/ammo HUD panel sprite sheet source for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art game UI sprite sheet, transparent-background-ready on perfectly flat #00ff00 chroma-key background, no watermark. Create generated HUD plaques for SCORE and AMMO for a fantasy dungeon arcade UI. Arrange as a 2-row by 4-column sprite sheet: top row SCORE plaque loop, bottom row AMMO plaque loop. Each frame is a dark stone and red wood plaque with gold trim, ruby accents, and exact readable label text SCORE on top row and AMMO on bottom row. Leave room on the right side of each plaque for code-rendered numbers. Subtle frame-to-frame shine only. Crisp pixel art, limited moody palette, no photorealism, no painterly rendering, game-ready asset, consistent pixel scale. The #00ff00 background must be one uniform flat color and must not appear in the subject.
Implementation note: source saved as `public/assets/source/hud-panels-gpt-image-2-source.png`, then chroma-keyed and resized to `public/assets/ui/hud-panels-sprite-sheet.png`.

## GPT-Image-2 Haste Sparkle Sprite Sheet

Use case: gpt-image-2 game effect asset generation.
Asset type: animated haste sparkle source for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art game effect sprite sheet, transparent-background-ready on perfectly flat #00ff00 chroma-key background, no watermark. Create a haste power-up sparkle / star-mode aura effect for a small fantasy character. Arrange exactly 8 horizontal frames in one row. Each frame is a ring of tiny gold, blue, and pink star sparkles that can overlay around the player, with subtle rotation and twinkle between frames. No character, no text, transparent-ready, crisp readable pixel art, limited moody fantasy palette, no photorealism, no painterly rendering, game-ready asset, consistent pixel scale. The #00ff00 background must be one uniform flat color and must not appear in the sparkles.
Implementation note: source saved as `public/assets/source/haste-sparkle-gpt-image-2-source.png`, then chroma-keyed and resized to `public/assets/effects/haste-sparkle-sprite-sheet.png`.

## Low Wall Tile Derivatives

Use case: gpt-image-2 game tile asset generation.
Asset type: shorter wall tile variants for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art isometric dungeon wall asset sheet, transparent-background-ready on perfectly flat #00ff00 chroma-key background, no watermark. Create lower-height dungeon wall tiles for an underground hobgoblin ruin, more fun textured graphics: moss in cracks, chipped stones, tiny red runes, dark mortar, occasional gold flecks, weathered stone blocks. Keep the walls about half-height compared to tall dungeon walls, readable but not blocking the player. Arrange exactly 3 horizontal assets with generous padding: low straight wall, low vertical/side wall, low corner wall. Each should fit a 96 by 64 pixel game frame after resizing, consistent isometric perspective, consistent baseline, seamless repeatable edges. Crisp dark GBA-era pixel art, limited moody palette, no photorealism, no painterly rendering, no text. The #00ff00 background must be perfectly flat and must not appear in the assets.
Implementation note: source saved as `public/assets/source/low-walls-gpt-image-2-source.png`, then component-cropped, chroma-keyed, and resized into `low_dark_wall`, `low_vertical_wall`, and `low_corner_wall`.

## GPT-Image-2 Clean Bridge Tile

Use case: gpt-image-2 game tile asset generation.
Asset type: cleaner wooden bridge source for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art isometric dungeon bridge tile asset, transparent-background-ready on perfectly flat #00ff00 chroma-key background, no watermark. Create a cleaner wooden bridge tile for an underground hobgoblin ruin with fewer ropes: sturdy dark planks, two subtle side rails, only a few rope posts at the ends, no dense rope clutter. Isometric perspective matching 64 by 32 ground tiles, bridge should read clearly as walkable over a chasm. Arrange exactly 1 asset centered with generous padding, fit a 96 by 64 game frame after resizing, consistent baseline. Crisp dark GBA-era pixel art, limited moody palette, no photorealism, no painterly rendering, no text. The #00ff00 background must be perfectly flat and must not appear in the asset.
Implementation note: source saved as `public/assets/source/clean-bridge-gpt-image-2-source.png`, then cropped to the deck area so repeated bridge tiles do not create excessive rope posts.

## GPT-Image-2 Heart Shimmer Sheet

Use case: gpt-image-2 game UI asset generation.
Asset type: separate animated heart sprite sheet for Phaser, chroma-keyed and resized locally.
Primary request: dark GBA inspired pixel art heart life icon sprite sheet, transparent-background-ready on perfectly flat #00ff00 chroma-key background, no watermark. Create an animated ruby heart gemstone icon for a hobgoblin dungeon health meter. Arrange exactly 4 horizontal frames in one row. Every frame must keep the heart in the exact same center position and size, with no movement; only a red shimmer/glint changes across frames. The heart should be separate from any background frame, shiny red gem with dark outline and gold highlight, readable at small size. Fit each frame into a 64 by 64 pixel game cell after resizing. Crisp pixel art, limited moody fantasy palette, no photorealism, no painterly rendering, no text. The #00ff00 background must be perfectly flat and must not appear in the heart.
Implementation note: source saved as `public/assets/source/life-heart-shimmer-gpt-image-2-source.png`, then chroma-keyed and resized to `public/assets/ui/life-heart-shimmer-sprite-sheet.png`.

## GPT-Image-2 Dungeon Wall Refresh

Use case: stylized-concept
Asset type: game-ready isometric dungeon wall source sheet for a web Phaser game
Primary request: Generate a compact source sheet with three separate dark dungeon low wall assets: 1) a northeast-southwest low stone wall segment, 2) a northwest-southeast low stone wall segment, 3) a matching low corner wall. Each wall is half-height, readable behind characters, with collision implied but visually low enough to see the player. Make them gothic dungeon themed with cracked stone blocks, small red hobgoblin rune insets, moss in seams, chipped caps, dark mortar, and subtle green grime.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal.
Style/medium: dark GBA inspired pixel art game asset sheet, isometric view, limited moody palette, crisp readable silhouette, no photorealism, no painterly rendering.
Composition/framing: three isolated wall assets arranged left to right with generous separation and padding, consistent scale and perspective, no floor plane, no shadows, no text labels.
Lighting/mood: underground ruin, moody grey stone, muted red runes, low contrast but readable caps and faces.
Constraints: background must be one uniform #ff00ff with no gradients or texture; do not use #ff00ff in the assets; no characters, no enemies, no watermark, no text; game ready asset, consistent pixel scale.
Implementation note: source saved as `public/assets/source/gpt-low-walls-source.png`, then chroma-keyed and component-cropped into `low_dark_wall`, `low_vertical_wall`, and `low_corner_wall`.

## GPT-Image-2 Bright Cleaner Bridge Tile

Use case: stylized-concept
Asset type: game-ready isometric dungeon bridge tile source for a web Phaser game
Primary request: Generate one dark GBA inspired pixel art wooden bridge tile, isometric diamond perspective, sized visually as a 64 by 32 ground tile when processed, simple readable shape, fewer ropes than a rope bridge, mostly sturdy dark wood planks with only two short side posts and minimal rope rails, designed to connect dungeon floor tiles cleanly.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal.
Style/medium: dark GBA inspired pixel art game asset, crisp readable silhouette, transparent-ready source, no photorealism, no painterly rendering.
Composition/framing: one isolated bridge asset centered with generous padding, bridge aligned to isometric ground tile perspective, no duplicate variants, no shadow, no floor plane.
Lighting/mood: moody underground dungeon palette, dark wood, muted brass rope ties, subtle moss.
Constraints: background must be one uniform #ff00ff color with no gradients or shadows; do not use #ff00ff in the asset; no text, no watermark, no enemies, no characters; game ready asset, consistent pixel scale.
Implementation note: source saved as `public/assets/source/gpt-bridge-source.png`, then chroma-keyed, cropped, and slightly brightened into `public/assets/tiles/wooden_bridge.png`.

## GPT-Image-2 Blast Power-Up And Blast Animation

Use case: stylized-concept
Asset type: game-ready power-up object and blast animation sprite sheet for a Phaser isometric dungeon game
Primary request: Generate a compact pixel art sprite sheet on one image. Top row: 8 frames of a rare blast power-up pickup object, a dark goblin-rune bomb orb with a red-gold core and small stone wings, idling in place with subtle glow only, no position shifting. Bottom row: 8 frames of a radial magical blast impact animation, expanding circular shockwave of red-gold runes, smoky dust, and ember sparks, centered in each frame, game-ready for a 64 by 64 frame animation.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal.
Style/medium: dark GBA inspired pixel art game asset sprite sheet, limited moody dungeon palette, crisp readable silhouette, no photorealism, no painterly rendering.
Composition/framing: exactly 2 rows by 8 columns, each frame visually square and evenly spaced, consistent pixel scale, centered subjects, generous padding, no shadows outside the frame art, no text labels.
Lighting/mood: underground hobgoblin ruin, red-gold magical blast, smoky dark fantasy, readable at small size.
Constraints: background must be one uniform #ff00ff with no gradients or texture; do not use #ff00ff in any asset; no characters, no enemies, no watermark, no text; animation should not move the pickup object's position, only shimmer/glow changes.
Implementation note: source saved as `public/assets/source/gpt-blast-powerup-source.png`, then chroma-keyed into the fourth row of `powerups-sprite-sheet.png` and a separate `blast-sprite-sheet.png`.

## GPT-Image-2 Complete Low Wall Direction Sheet

Use case: stylized-concept
Asset type: complete game-ready isometric dungeon low wall direction sheet for Phaser
Primary request: Generate a complete set of low half-height dungeon wall assets for an isometric pixel art game. Include exactly eight isolated assets: top row four straight wall segments labeled only by position, not text: north-facing straight wall, south-facing straight wall, east-facing straight wall, west-facing straight wall; bottom row four corner wall pieces: northeast corner, northwest corner, southeast corner, southwest corner. The assets must be visually distinct correct orientations, not mirrored upside down, with consistent top caps, wall faces, red hobgoblin rune insets, chipped stone, moss seams, dark mortar, and subtle green grime. These are low walls that keep the player visible but still imply collision.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal.
Style/medium: dark GBA inspired pixel art game asset sheet, isometric three-quarter view, limited moody palette, crisp readable silhouettes, no photorealism, no painterly rendering.
Composition/framing: exactly 2 rows by 4 columns, eight separated assets with generous padding, no text labels, no floor plane, no shadows, consistent scale and baseline, each asset should fit a 96 by 64 pixel game frame after cropping.
Lighting/mood: underground hobgoblin ruin, grey stone, muted red runes, moss, readable cap highlights.
Constraints: background must be one uniform #ff00ff with no gradients or texture; do not use #ff00ff in any asset; no characters, no enemies, no watermark, no text; game ready asset, consistent pixel scale.
Implementation note: source saved as `public/assets/source/gpt-low-wall-directions-source.png`, then chroma-keyed and component-cropped into `low_wall_north`, `low_wall_south`, `low_wall_east`, `low_wall_west`, `low_corner_ne`, `low_corner_nw`, `low_corner_se`, and `low_corner_sw`.

## GPT-Image-2 Single-Tile Low Wall Direction Sheet

Use case: stylized-concept
Asset type: complete single-tile isometric dungeon low wall direction sheet for Phaser
Primary request: dark GBA inspired pixel art game asset sheet, isometric dungeon low wall single tile segments, limited moody palette, crisp readable silhouette, transparent-ready flat #ff00ff chroma key background, no text, no watermark, no photorealism, no painterly rendering, game ready asset, consistent pixel scale. Create exactly 8 isolated assets arranged in a clean 4 columns x 2 rows grid with generous spacing. Each asset must fit one isometric ground tile footprint, 64 by 32 pixel tile perspective, final intended frame 96 by 64 with transparent padding. Top row: one-tile north-facing wall segment, one-tile south-facing wall segment, one-tile east-facing wall segment, one-tile west-facing wall segment. Bottom row: one-tile northeast corner, one-tile northwest corner, one-tile southeast corner, one-tile southwest corner. Style: underground hobgoblin ruin low stone walls about half height, carved dark stone blocks, moss seams, tiny red rune insets, chipped capstones, readable side faces, seamless edges when repeated, no extra props, no floor tiles, no shadows outside the asset, no labels.
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for background removal.
Style/medium: dark GBA inspired pixel art game asset sheet, isometric three-quarter view, limited moody palette, crisp readable silhouettes, no photorealism, no painterly rendering.
Composition/framing: exactly 2 rows by 4 columns, eight separated assets with generous padding, no text labels, no floor plane, no shadows, consistent scale and baseline, each asset should fit a 96 by 64 pixel game frame after cropping.
Lighting/mood: underground hobgoblin ruin, grey stone, muted red runes, moss, readable cap highlights.
Constraints: background must be one uniform #ff00ff with no gradients or texture; do not use #ff00ff in any asset; no characters, no enemies, no watermark, no text; game ready asset, consistent pixel scale.
Implementation note: source saved as `public/assets/source/gpt-low-wall-directions-source.png`, then chroma-keyed and center-cropped to true one-tile segments before export to `low_wall_north`, `low_wall_south`, `low_wall_east`, `low_wall_west`, `low_corner_ne`, `low_corner_nw`, `low_corner_se`, and `low_corner_sw`.
