# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. The app is a Next.js
shell around a Phaser 4 dungeon prototype; most gameplay behavior lives in
`src/game/scenes/DungeonScene.ts`.

## Review priorities

- Treat changes to `DungeonScene.ts` as high-risk. Check for unintended effects
  across movement, collision, enemy AI, spawning, pickups, HUD state, audio, and
  game restart/cleanup paths.
- Verify isometric coordinate math carefully. Tile/world conversion, depth
  sorting, ellipse hitboxes, line-of-sight checks, and snapped aiming can fail in
  subtle ways without TypeScript errors.
- Inspect `update()` early returns and state flags such as game start, game
  over, player death, and hit-stop. A misplaced guard can freeze gameplay or
  skip essential cleanup.
- Ensure asset keys and frame dimensions stay consistent across
  `src/game/assets/manifest.ts`, preload calls, animation setup, and JSON files
  in `public/assets`.
- For procedural dungeon changes, prefer deterministic tests or seedable random
  sources where practical. Avoid relying only on one random run.
- Watch dependency and package-manager changes closely. This repo currently has
  both `package-lock.json` and `pnpm-lock.yaml`, and several dependencies are
  declared as `latest`.

## Expected validation evidence

- Expect `npm run build` output for code changes that affect the app or game
  runtime.
- If gameplay behavior changes, expect manual browser evidence from
  `npm run dev`, including start, gameplay, death/restart, and any relevant
  pickup/combat edge cases.
- If asset processing scripts or generated assets change, expect evidence that
  the matching script in `package.json` was run and that generated atlas metadata
  matches the runtime frame sizes.
- If only documentation or Cursor configuration changes, a diff review is
  sufficient.

## Known project context

- `src/app/page.tsx` renders `GameCanvas`.
- `src/game/GameCanvas.tsx` creates and destroys the Phaser game from React.
- `src/game/maps/startingDungeon.ts` generates the room-and-corridor map.
- The staircase is currently visual only; do not expect level-exit behavior
  unless a change explicitly adds it.
