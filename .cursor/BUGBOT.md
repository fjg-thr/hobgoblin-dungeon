# Cursor Bugbot review guidance

Review this repository as a Next.js App Router application that embeds a Phaser 4
isometric dungeon prototype. Prioritize concrete bugs, runtime regressions, and
state/asset mismatches over style-only feedback.

## Project shape

- The React shell is intentionally small:
  - `src/app/page.tsx` renders `src/game/GameCanvas.tsx`.
  - `src/game/GameCanvas.tsx` dynamically imports Phaser and
    `src/game/scenes/DungeonScene.ts` to avoid server-side rendering issues.
- Most game behavior lives in `src/game/scenes/DungeonScene.ts`.
- Map generation and tile blocking live in `src/game/maps/startingDungeon.ts`.
- Runtime asset keys, paths, and sprite dimensions live in
  `src/game/assets/manifest.ts`.
- Public assets are served from `/assets/...` under `public/assets`.

## High-signal review checks

- For Phaser lifecycle changes, verify objects, tweens, timers, input handlers,
  and scale/listener callbacks are cleaned up on scene reset, restart, shutdown,
  or component unmount.
- Treat edits to `DungeonScene.ts` as high blast radius. Check that new run-state
  fields are reset consistently for first start, restart, game over, death, and
  hit-stop paths.
- Confirm `startGame()`, `restartGame()`, `prepareNewDungeon()`, and run timer
  setup remain in parity when new gameplay state is added.
- When assets or sprite sheets change, verify `manifest.ts`, preload dimensions,
  animation frame math, texture keys, and on-disk files stay aligned. Runtime
  loading does not consume the companion JSON metadata directly.
- For new map tile codes, ensure `TileCode`, `tileAssetForCode`,
  `isTileBlocked`, rendering, collision, and any needed manifest entries are all
  updated together.
- Watch for Phaser 3 examples copied into this codebase; the pinned dependency is
  `phaser@4.0.0-rc.4`.
- Preserve React Strict Mode safety in `GameCanvas.tsx`: avoid duplicate Phaser
  instances, leaked listeners, or async imports that create a game after unmount.
- Check coordinate-space changes carefully. Tile-space, world-space, camera, and
  isometric projection math are deliberately distinct.
- For input/UI changes, verify pointer bounds and resize handling stay correct
  after viewport changes.
- For audio changes, keep mute state, scene restart, and browser autoplay
  constraints in mind.

## Testing expectations

- This repository currently has no automated test runner or CI workflow.
- Prefer findings that can be reproduced by build/type errors or a concrete
  gameplay path.
- Useful manual smoke paths for PRs:
  1. Start the game.
  2. Move with WASD or arrow keys.
  3. Aim and shoot with mouse, click, Space, or J.
  4. Collect ammo, hearts, and power-ups.
  5. Survive until brutes and seeker ammo can appear.
  6. Toggle mute.
  7. Reach game over and restart.

## Do not flag as bugs

- The staircase is intentionally visible but non-functional.
- Collision is intentionally simple and custom, not Phaser physics.
- Generated first-pass pixel art and procedural audio are known limitations.
- Asset metadata JSON files are tooling/documentation companions unless the code
  explicitly reads them.
- Lack of unit tests is a known project limitation; only call it out when a PR
  adds risky behavior without any practical verification note.
