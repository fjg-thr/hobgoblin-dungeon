# Cursor Bugbot review guidelines

This file gives Cursor Bugbot repository-specific context when reviewing pull
requests. The managed Bugbot service is enabled through the Cursor dashboard and
GitHub App; this repository file only customizes review behavior.

## Project context

- This is a Next.js App Router prototype for a dark GBA-inspired isometric
  dungeon game.
- The React surface is intentionally small: `src/app/page.tsx` renders the game
  canvas, `src/app/layout.tsx` defines metadata, and `src/game/GameCanvas.tsx`
  boots Phaser on the client.
- Core gameplay lives in `src/game/scenes/DungeonScene.ts`. It handles Phaser
  lifecycle, rendering, input, combat, power-ups, scoring, audio, and debug UI.
- Procedural map generation and tile semantics live in
  `src/game/maps/startingDungeon.ts`.
- Static asset paths and sprite metadata conventions are centralized in
  `src/game/assets/manifest.ts`.
- Asset processing and generation scripts live under `tools/` and `scripts/`;
  generated runtime assets live under `public/assets/`.

## Review priorities

1. Preserve client-only Phaser loading. Do not introduce top-level browser or
   Phaser side effects into server-rendered App Router modules.
2. Keep TypeScript strict. Avoid `any`, unchecked casts, and untyped asset
   metadata unless a narrow boundary makes the cast unavoidable.
3. Treat `DungeonScene.ts` changes cautiously. Check lifecycle cleanup, input
   handler registration, timers, tweens, audio objects, collision state, and
   restart/game-over paths for leaks or stale state.
4. Verify gameplay invariants when combat, pickups, enemies, projectiles, or
   map generation change: health cannot go negative, ammo stays bounded, enemy
   actors are removed or respawned consistently, and blocked tiles remain
   impassable.
5. For asset changes, confirm every manifest path has a corresponding
   `public/assets/...` file and every sprite sheet JSON still matches the frame
   dimensions used by Phaser.
6. Metadata changes in `src/app/layout.tsx` should keep share image dimensions,
   paths, and `metadataBase` behavior valid for both local development and
   deployed environments.
7. Generated image/audio assets and lockfiles can be large. Review their
   source script or manifest impact first, and flag unrelated churn.
8. This repo currently has both `package-lock.json` and `pnpm-lock.yaml`.
   Avoid changing package-manager state unless the PR intentionally standardizes
   it.

## Verification guidance

- Prefer `npm ci` for npm-lockfile based installs in CI-like review
  environments.
- Run `npm run build` for the main integration check.
- Run `npx tsc --noEmit --incremental false` for a side-effect-free TypeScript
  check.
- The existing `npm run lint` script uses `next lint`; with this repo's current
  Next.js version that command is not a reliable lint check until the project
  migrates to an explicit ESLint setup.
- Production builds may update generated Next.js type files. Treat generated
  file churn as suspicious unless the PR intentionally changes routing or Next
  configuration.

## Flag as high risk

- New direct DOM access or `window` usage outside client-only code paths.
- Phaser objects created without matching cleanup on scene shutdown or React
  unmount.
- Asset references added outside `assetManifest` without a clear reason.
- Changes that make map generation nondeterministically produce unreachable
  starts, missing stairs, or fully blocked corridors.
- Silent failures in audio, asset loading, or dynamic imports that would hide a
  broken game boot.
