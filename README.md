# Hobgoblin Ruin Prototype

A first playable web prototype for a dark GBA-inspired isometric dungeon game. The player controls a winged hobgoblin through regenerated dungeon ruins with collision, camera follow, a start screen, life meter, finite ammo, generated pixel-art assets, ramping enemy pressure, powerups, scoring, and a debug overlay.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Cursor Bugbot

This repository includes project-specific review guidance in
`.cursor/BUGBOT.md`. To deploy Cursor Bugbot for automated code review, a
repository or organization admin must enable Bugbot for this repo in the Cursor
dashboard. After it is enabled, Bugbot can review pull requests automatically on
updates or manually when someone comments `cursor review` or `bugbot run`.

## Controls

- `WASD` or arrow keys: move in isometric directions
- Move the mouse to aim; shots snap to 15-degree angles
- `Space` or `J`: fire the staff bolt toward the current aim point
- Click: aim and fire once
- Ammo is finite; collect red staff-shard pickups to reload
- Collect animated power-ups: quickshot fires faster, haste moves faster, ward blocks damage, and rare late-game blast detonates nearby enemies
- After kill milestones, touch heart pickups to restore missing hearts
- Lower-right `SOUND` / `MUTED` button: toggle all game audio
- `F3`: toggle collision boxes, player bounds, and tile coordinates

## Asset List

- `public/assets/characters/hobgoblin-sprite-sheet.png`
- `public/assets/characters/hobgoblin-sprite-sheet.json`
- `public/assets/characters/goblin-sprite-sheet.png`
- `public/assets/characters/goblin-sprite-sheet.json`
- `public/assets/characters/brute-sprite-sheet.png`
- `public/assets/characters/brute-sprite-sheet.json`
- `public/assets/characters/actor-deaths-sprite-sheet.png`
- `public/assets/characters/actor-deaths-sprite-sheet.json`
- `public/assets/effects/staff-bolt-sprite-sheet.png`
- `public/assets/effects/staff-bolt-sprite-sheet.json`
- `public/assets/effects/powerups-sprite-sheet.png`
- `public/assets/effects/powerups-sprite-sheet.json`
- `public/assets/effects/blast-sprite-sheet.png`
- `public/assets/effects/blast-sprite-sheet.json`
- `public/assets/effects/combat-juice-sprite-sheet.png`
- `public/assets/effects/combat-juice-sprite-sheet.json`
- `public/assets/effects/ammo-pickup-sprite-sheet.png`
- `public/assets/effects/ammo-pickup-sprite-sheet.json`
- `public/assets/effects/haste-sparkle-sprite-sheet.png`
- `public/assets/effects/haste-sparkle-sprite-sheet.json`
- `public/assets/effects/flame-heart-effects-source.png`
- `public/assets/effects/flame-heart-effects.json`
- `public/assets/effects/torch-flame-loop.png`
- `public/assets/effects/candle-flame-loop.png`
- `public/assets/tiles/dungeon-tileset.png`
- `public/assets/tiles/dungeon-tileset.json`
- `public/assets/tiles/vertical_wall.png`
- `public/assets/tiles/low_dark_wall.png`
- `public/assets/tiles/low_vertical_wall.png`
- `public/assets/tiles/low_corner_wall.png`
- Directional low wall assets in `public/assets/tiles/low_wall_*.png` and `public/assets/tiles/low_corner_*.png`
- `public/assets/ui/hobgoblin-ui-sheet-source.png`
- `public/assets/ui/hobgoblin-ui-sheet.json`
- `public/assets/ui/start-title-sprite-sheet.png`
- `public/assets/ui/start-title-sprite-sheet.json`
- `public/assets/ui/game-over-sprite-sheet.png`
- `public/assets/ui/game-over-sprite-sheet.json`
- `public/assets/ui/life-meter-sprite-sheet.png`
- `public/assets/ui/life-meter-sprite-sheet.json`
- `public/assets/ui/hud-panels-sprite-sheet.png`
- `public/assets/ui/hud-panels-sprite-sheet.json`
- `public/assets/ui/life_meter_frame_empty.png`
- `public/assets/ui/life-heart.png`
- `public/assets/ui/life-heart-burst.png`
- `public/assets/ui/life-heart-shimmer-sprite-sheet.png`
- `public/assets/ui/game_over_panel.png`
- `public/assets/ui/start_over_button.png`
- Procedural first-pass sound effects, low-volume dungeon ambience, and a looping 8-bit dungeon theme in `public/assets/audio`
- Individual tile/prop PNGs in `public/assets/tiles`
- Effects in `public/assets/effects`
- UI panels in `public/assets/ui`

Visual source sheets were generated from the prompts in `ASSET_PROMPTS.md`, then processed locally with chroma-key alpha removal and nearest-neighbor resizing. The latest brute, actor death, combat juice, start title, game over, health meter, score/ammo panels, haste sparkle, lower wall, cleaner bridge, and heart shimmer sheets are backed by saved `gpt-image-2` source images under `public/assets/source`, then processed into Phaser-friendly sprite sheets.

## Known Limitations

- The character sheet is a generated first pass; directional frames are present, but a later milestone should replace it with tighter hand-polished animation.
- Collision uses simple tile/proximity checks, not a full physics system.
- The staircase is visible but does not transition to another level.
- Each new run creates a fresh room-and-corridor dungeon using the existing tile and prop set.
- Combat is intentionally simple: goblins ramp in gradually, larger brutes unlock later and spawn randomly, enemies attack only at close range, contact causes damage unless ward is active, staff bolts consume ammo and despawn on impact, and heart pickups restore missing hearts without increasing max health.
- Power-up rarity is progression-gated: quickshot appears from the start, haste unlocks after early kills or time survived, ward is rare until deeper into the run, and blast is a late rare power-up.
- Lighting is intentionally subtle and sprite-based to preserve the pixel-art look.
- Sound design is first-pass procedural WAV audio with a scene-level mute toggle; the retro dungeon theme is generated locally from square/triangle/noise channels, and richer authored Foley can come in a later pass.

## Next Recommended Milestone

Add one short objective loop: walk to the staircase, collect a simple key or relic, and trigger a level-exit state. Keep combat and inventory modest until movement, camera, collision, and map generation have been polished.
