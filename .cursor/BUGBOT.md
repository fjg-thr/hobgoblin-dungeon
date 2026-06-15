# Cursor Bugbot review guidance

This repository is configured for Cursor Bugbot by providing repo-specific review
instructions in this file. Bugbot itself is enabled outside the repository in the
Cursor dashboard after the Cursor GitHub App has access to the repository.

## Managed service setup

- In Cursor, connect GitHub and enable Bugbot for this repository from the Bugbot
  dashboard.
- Confirm the Cursor GitHub App can read repository contents, inspect pull
  requests, create review comments, and publish the `Cursor Bugbot` check.
- If branch protection should require Bugbot, require the `Cursor Bugbot` check.
  Findings commonly produce a neutral check unless the organization enables
  fail-on-unresolved-issues.
- To request a manual review on a pull request, leave a top-level comment with
  `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true`, then check dashboard/GitHub App repository access
  and the generated request ID.

## Project context

Hobgoblin Ruin is a small Next.js app that mounts a Phaser game scene:

- `src/app/page.tsx` renders the game shell.
- `src/game/GameCanvas.tsx` dynamically imports Phaser on the client and owns the
  Phaser `Game` lifecycle. Watch for duplicate games, leaked scenes, and cleanup
  regressions.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, UI, input, audio,
  enemy, projectile, pickup, power-up, and debug-overlay behavior.
- `src/game/maps/startingDungeon.ts` generates the dungeon map and prop layout.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded game
  assets, including audio. `public/assets/audio/audio-manifest.json` is auxiliary
  and should stay consistent when audio assets change.
- `public/assets/**` contains runtime sprites, generated sheets, JSON metadata,
  tiles, UI art, effects, and audio.
- `tools/**` and `scripts/**` contain asset/audio generator and processor
  tooling. Generated outputs should only change when the related source prompt or
  generator change is intentional.

## Review priorities

Prioritize issues that can break shipped behavior:

1. Gameplay correctness in `DungeonScene`: movement, aiming, firing, enemy
   spawning, collisions, pickup collection, power-up timing, hit/damage handling,
   scoring, game-over/restart flow, and debug mode.
2. Phaser lifecycle and resource cleanup: event listeners, timers, tweens, input
   handlers, audio, game object destruction, and React unmount behavior.
3. Asset integrity: every asset path referenced by `assetManifest` or the scene
   should exist under `public/assets`, and sprite-sheet frame sizes/metadata
   should match scene assumptions.
4. TypeScript/Next.js build health: preserve strict typing, client-only Phaser
   imports, route/page conventions, and generated Next type files.
5. User-facing behavior: start/how-to-play/game-over UI, audio mute behavior,
   keyboard and pointer controls, readable HUD text, and mobile/responsive sizing.
6. Repository hygiene: keep dependency and lockfile changes intentional, avoid
   committing build artifacts, and keep generated asset churn scoped.

## Known baseline notes

Do not block unrelated pull requests solely for these existing mismatches unless
the change touches the relevant behavior or documentation:

- `README.md` says `Space` or `J` fires. Runtime input currently binds firing to
  `Space` plus pointer/click controls, and the in-game how-to-play card says
  `Click or press SPACE to fire`.
- The README documents standard ammo and power-ups but does not describe seeker
  ammo. Current code includes seeker ammo, seeker pickups, and seeker projectiles.
- The README describes blast as a rare late-game power-up. Current code unlocks
  blast from the `POWERUP_CONFIG` thresholds in `DungeonScene`, which may be
  earlier than the README implies.
- This repo currently uses plain CSS in `src/app/globals.css`; do not require
  Tailwind-specific patterns unless Tailwind is intentionally introduced.

## Suggested validation

For most code-changing PRs, request or run:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

Notes:

- `npm run lint` currently invokes `next lint`, which is not reliable with the
  installed Next version. Prefer build plus `npx tsc --noEmit` unless lint
  tooling is changed intentionally.
- `npm run build` or TypeScript checks may rewrite `next-env.d.ts` or create
  `tsconfig.tsbuildinfo`; those generated artifacts should be restored/removed
  unless the PR intentionally changes generated typing behavior.
- This package has no `npm start` script. Runtime smoke tests should use a
  Next-appropriate start command only when smoke-test infrastructure is added.
