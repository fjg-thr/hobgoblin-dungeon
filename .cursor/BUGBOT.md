# Bugbot Review Instructions

Review this repository as a Next.js TypeScript game prototype that runs a Phaser scene in
the browser. Prioritize findings that would break gameplay, builds, metadata, or asset
loading.

## Project context

- The app shell is Next.js and React under `src/app` and `src/game/GameCanvas.tsx`.
- Phaser is loaded client-side only; avoid changes that import or instantiate Phaser from
  server components or build-time code.
- Core gameplay logic lives in `src/game/scenes/DungeonScene.ts`.
- Map generation and tile blocking live in `src/game/maps/startingDungeon.ts`.
- Static assets are served from `public/assets` and declared in
  `src/game/assets/manifest.ts`.
- Generated asset-processing scripts live in `tools/` and `scripts/`.
- Social preview metadata lives in `src/app/layout.tsx`; if image URLs change, confirm
  the referenced public files exist and match the declared dimensions.

## Review focus

- Flag TypeScript strict-mode regressions, unsafe casts, and state that can become
  `null` or stale during React unmounts or Phaser scene shutdown.
- Check that gameplay changes preserve collision, enemy pathing, projectile lifetimes,
  health/ammo bounds, power-up timers, scoring, and game-over transitions.
- Verify browser-only APIs such as `window`, audio, canvas, pointer input, and Phaser
  objects stay behind client-side boundaries.
- For asset changes, confirm manifest paths, frame sizes, animation metadata, and
  filenames match files under `public/assets`.
- Watch for performance risks in the Phaser update loop, especially allocations,
  unbounded arrays, timers that are not cleaned up, or pathfinding work done every frame.
- Prefer small, typed helpers over duplicating gameplay math across the scene.
- Call out user-facing regressions in keyboard, mouse, mute, restart, start screen, and
  debug-overlay controls.

## Verification expectations

When relevant to the pull request, expect authors to run:

```bash
npm run build
npx tsc --noEmit --incremental false
```

If a change touches generated assets or processing scripts, also expect the matching
asset-generation command from `package.json` or `tools/` to be run and checked in with
the generated outputs.
