# Bugbot review guide

This repository is a first-playable Next.js prototype for a dark, GBA-inspired isometric dungeon game. The browser game is implemented with Phaser and rendered through a client-only React component.

## Project shape

- `src/app/page.tsx` renders the game shell.
- `src/game/GameCanvas.tsx` is a `"use client"` boundary that dynamically imports Phaser and `DungeonScene` to avoid server-side Phaser loading.
- `src/game/scenes/DungeonScene.ts` owns the main game loop, enemy AI, combat, pickups, HUD, audio, and Phaser rendering.
- `src/game/maps/startingDungeon.ts` generates the dungeon map, tile codes, collision metadata, props, and spawn points.
- `src/game/assets/manifest.ts` is the typed source of truth for asset keys and public asset paths.
- Asset processing and generation scripts live under `tools/`; generated assets are committed under `public/assets/`.

## Review priorities

- Flag any change that imports `phaser` or browser-only APIs across a server-rendered Next.js boundary. Keep Phaser bootstrapping inside client-only code or dynamic imports.
- Check Phaser lifecycle changes for duplicate game instances, unremoved event listeners, timers, tweens, sounds, or scene objects that can leak across remounts/restarts.
- Treat `assetManifest` keys, sprite sheet dimensions, animation frame ranges, and public file paths as coupled contracts. Flag mismatches between manifest entries, loader usage, metadata JSON, and committed assets.
- For map or collision changes, verify that tile codes stay consistent with `TileCode`, `tileAssetForCode`, `isTileBlocked`, spawn selection, pathfinding, projectile collision, and debug rendering.
- For gameplay changes, look for frame-rate dependent behavior. Movement, cooldowns, spawn timers, invulnerability windows, and power-up durations should remain time/delta based.
- For combat or pickup changes, verify object lifetime and cleanup: dead enemies, projectiles, glows, popups, shadows, sounds, and tweens should not continue affecting state after removal.
- Preserve keyboard/mouse controls documented in `README.md` unless the documentation is updated in the same change.
- Prefer narrow TypeScript types and existing local helpers over broad casts or duplicated constants.

## Verification expectations

- Run `npm run build` for changes to TypeScript, Next.js, Phaser scene code, asset manifests, or public asset references.
- If changing generated asset scripts, run the relevant script from `package.json` and inspect the resulting committed assets/metadata.
