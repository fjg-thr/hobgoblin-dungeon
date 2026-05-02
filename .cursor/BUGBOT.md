# Bugbot review instructions

This repository is a first playable web prototype for a dark GBA-inspired
isometric dungeon game. It uses Next.js with a client-only Phaser scene.

## Project shape

- App shell: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`
- Phaser mount point: `src/game/GameCanvas.tsx`
- Main gameplay scene: `src/game/scenes/DungeonScene.ts`
- Map generation and collision helpers: `src/game/maps/startingDungeon.ts`
- Asset keys and sprite/audio paths: `src/game/assets/manifest.ts`
- Processed runtime assets live under `public/assets/**`
- Asset-processing and generation scripts live under `tools/**` and `scripts/**`

## What to prioritize in reviews

- Flag server/client boundary regressions. Phaser and browser globals must stay
  behind client-only code paths, dynamic imports, or effects.
- Check Phaser lifecycle changes for leaked games, timers, input handlers,
  sounds, tweens, particles, graphics, and scene objects across unmounts,
  restarts, or game-over/start-screen transitions.
- Verify gameplay state invariants when reviewing combat, pickups, score,
  health, ammo, power-ups, enemy spawning, pathing, and collision changes.
  Regressions here are often off-by-one, stale timestamp, or duplicate-spawn
  bugs rather than type errors.
- Check coordinate-space conversions carefully. Tile coordinates, world
  coordinates, screen coordinates, depth ordering, and isometric projection are
  easy to mix up.
- Treat asset manifest changes as contracts. New or renamed assets should keep
  manifest keys, generated JSON frame metadata, preload calls, animation keys,
  and public file paths in sync.
- Prefer deterministic or bounded behavior for procedural generation, enemy
  pressure, power-up rarity, and audio generation so the game stays playable.
- Keep the prototype's pixel-art constraints intact: nearest-neighbor scaling,
  `pixelArt`, disabled antialiasing, and integer-ish render alignment should not
  be casually removed.
- For UI/CSS changes, preserve fullscreen canvas behavior, keyboard/mouse input
  handling, and accessibility of interactive DOM controls.
- Flag changes that add large assets without updating docs or that check in
  generated intermediates outside the existing asset conventions.

## Verification commands

Use the narrowest command that fits the change:

```bash
npm run build
npx tsc --noEmit
```

`npm run lint` is configured in `package.json`, but this project currently uses
modern Next.js where `next lint` may be unavailable depending on the installed
Next version. If linting fails for that reason, report it as a tooling issue
rather than a code regression.
