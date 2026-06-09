# Cursor Bugbot review guide

Use this repository-specific guide when reviewing pull requests for the
Hobgoblin Ruin Prototype.

## Deployment boundary

- This file supplies project context and review priorities for Cursor Bugbot.
- Managed Bugbot enablement is configured outside the repository in Cursor
  organization settings and GitHub App access. If validating deployment, confirm
  those external settings and perform a pull request review smoke check.

## Project context

- This is a Next.js App Router prototype for a dark GBA-inspired isometric
  dungeon game.
- React owns the page shell and canvas mount point. Phaser owns the game loop,
  scene state, rendering, input, collision, combat, pickups, scoring, audio, and
  restart/game-over flows.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and tile/collision data live in
  `src/game/maps/startingDungeon.ts`.
- Runtime asset keys, frame metadata, and paths live in
  `src/game/assets/manifest.ts`; checked-in assets live under `public/assets`.
- The web shell is intentionally small: `src/app/page.tsx`,
  `src/app/layout.tsx`, `src/app/globals.css`, and `src/game/GameCanvas.tsx`.

## Review priorities

1. Flag regressions that can break movement, collision, camera follow, aiming,
   firing, enemy spawning, combat, pickups, scoring, game-over, restart, or mute
   behavior.
2. Check Phaser lifecycle changes carefully. The game should initialize only on
   the client, avoid duplicate `Phaser.Game` instances, and destroy cleanly on
   React unmount.
3. Keep browser-only APIs behind client boundaries. Files that touch `window`,
   DOM refs, Phaser construction, or pointer/keyboard APIs must remain
   client-only.
4. Verify coordinate-space changes between tile, world, pointer, and screen
   positions. Isometric projection, depth sorting, and collision are sensitive
   to sign and offset mistakes.
5. Review asset changes across all required files: generated PNGs, generated
   JSON metadata, `public/assets/audio/audio-manifest.json` for audio changes,
   and `src/game/assets/manifest.ts`.
6. Preserve the pixel-art presentation: nearest-neighbor rendering, no image
   smoothing, intentional low-resolution sprites, and subtle lighting/effects.
7. Prefer deterministic, bounded work in the scene update loop. Avoid unbounded
   per-frame allocations, timers, tweens, pathfinding, particles, or listeners.
8. Be cautious with broad rewrites of `DungeonScene.ts`; localized changes are
   safer unless a PR is explicitly refactoring that scene.
9. If a change touches metadata, verify referenced public assets exist or are
   generated through a supported App Router metadata route.

## Baseline context to avoid false positives

- The README documents `WASD`/arrow movement, pointer aiming, click firing, and
  `Space` or `J` firing. Treat existing docs/code differences as pre-existing
  unless a PR touches controls or documentation.
- Power-up timing, enemy pressure, and pickup behavior are intentionally tuned in
  code. Review balance changes against implementation details, not only README
  prose.
- Asset generation and processing tools under `tools/` and `scripts/` are part
  of the production pipeline; review path handling, output dimensions, frame
  metadata, and idempotency.

## Verification expectations

Ask for checks appropriate to the diff:

- `git diff --check "$(git merge-base HEAD origin/main)"..HEAD`
- `npm ci` when dependency or lockfile behavior needs validation
- `npm run build` for app, TypeScript, metadata, or asset-manifest changes
- Relevant `npm run process:*` or `npm run generate:*` scripts for asset pipeline
  changes when practical

`npm run lint` currently maps to `next lint`. With the locked Next.js CLI, that
command may fail because `next lint` is no longer available. Do not treat that
known script mismatch as a product regression unless a PR changes lint tooling or
the Next.js version.
