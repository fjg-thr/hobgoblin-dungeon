# Bugbot review instructions

This repository is a Next.js app that hosts a Phaser-powered dungeon prototype.
Use these notes when reviewing pull requests for logic bugs, edge cases, and
regressions.

## Project shape

- `src/app/*` contains the Next.js app shell.
- `src/game/GameCanvas.tsx` is a client component that dynamically boots Phaser.
- `src/game/scenes/DungeonScene.ts` contains most runtime gameplay state,
  simulation, input, collision, enemy AI, pickups, audio, and UI overlays.
- `src/game/maps/startingDungeon.ts` defines procedural map layout and tile
  blocking rules.
- `src/game/assets/manifest.ts` is the typed source of truth for asset keys and
  public asset paths.
- `public/assets/**` contains generated sprites, metadata, and audio used at
  runtime.
- `tools/**` and `scripts/**` generate or process assets.

## Review priorities

1. Flag gameplay state bugs that can leave stale Phaser objects, timers, input
   handlers, tweens, audio nodes, or pooled effects alive after scene shutdown,
   restart, game over, or React unmount.
2. Check that movement, collision, projectile, enemy, pickup, and power-up
   changes preserve tile-space vs world-space conversions and clamp large frame
   deltas so the simulation stays stable after tab throttling.
3. Verify new client-side code does not access `window`, `document`, Phaser, or
   other browser-only APIs from server components or module scope that can run
   during Next.js server rendering.
4. For asset manifest changes, ensure every referenced file exists under
   `public/assets`, frame dimensions match the sheet metadata, and typed keys
   stay consistent with scene usage.
5. For procedural generation changes, look for unreachable rooms, blocked spawn
   points, unsafe pickups, or paths that can trap the player or enemies.
6. For combat and progression changes, verify cooldowns, ammo counts, health,
   invulnerability windows, score, and spawn caps cannot go negative, exceed
   intended limits, or desynchronize HUD text from actual state.
7. For audio changes, confirm mute state applies to all active and future sounds
   and that loops stop on scene shutdown.
8. Avoid broad style-only comments. Prioritize concrete correctness issues with
   a reproducible path and expected vs actual behavior.

## Validation commands

Ask authors to run the narrowest relevant checks. Common commands:

```bash
npm run build
npx tsc --noEmit
```

The `npm run lint` script currently calls `next lint`, which is not available in
newer Next.js versions. Prefer build and TypeScript checks unless the lint script
is updated in the same pull request.
