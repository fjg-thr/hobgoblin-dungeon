# Bugbot review guide

This repository is a Next.js and TypeScript prototype for a Phaser-powered
isometric dungeon game. Reviews should focus on issues that could break gameplay,
asset loading, or the deployed web app.

## Review priorities

- Treat runtime exceptions in `src/game/scenes/DungeonScene.ts` and Phaser scene
  lifecycle changes as high priority, especially around initialization order,
  timers, tweens, input handlers, and cleanup on scene restart.
- Verify that any new asset referenced from game code is also present in
  `public/assets` and registered consistently in `src/game/assets/manifest.ts`
  or the relevant sprite-sheet JSON.
- Watch for coordinate, depth-sorting, collision, and camera-follow regressions
  in `src/game/maps/startingDungeon.ts` and scene movement/combat logic.
- Flag changes that can make controls inaccessible or inconsistent with the
  README, including keyboard, mouse, click-to-fire, mute, start, how-to-play,
  and game-over interactions.
- For React/Next.js files, check that client-only Phaser code remains behind
  client component boundaries and does not run during server rendering.
- Prefer deterministic, bounded game-loop work. Flag unbounded object creation,
  uncancelled intervals, leaking event listeners, or per-frame allocations that
  can accumulate during long runs.

## TypeScript and style expectations

- Keep TypeScript strictness intact. Avoid `any`, non-null assertions, and broad
  casts unless the surrounding Phaser API leaves no narrower option.
- Prefer small helpers with descriptive names over expanding already-large scene
  methods when touching shared gameplay behavior.
- Preserve existing pixel-art rendering assumptions: nearest-neighbor assets,
  low-resolution UI styling, and explicit sprite-frame dimensions.
- Do not introduce new dependencies for simple gameplay, asset, or UI changes
  unless the dependency is already part of the project stack or clearly justified.

## Verification signals

When relevant, expect changes to pass:

```bash
npm run build
```

If a review concerns generated assets, also check that generated manifests and
source assets stay in sync with the documented asset-processing scripts.
