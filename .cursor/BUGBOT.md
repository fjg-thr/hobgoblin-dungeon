# Cursor Bugbot Review Guide

This repository uses Cursor Bugbot for pull request review context. Bugbot is a
managed Cursor service: this file supplies project-specific rules, but enabling
or disabling automatic reviews happens outside the repo in the Cursor dashboard
and through GitHub App repository access.

## Operating Notes

- Apply this guide after it is merged to the default branch. PRs that add or
  update this file may be reviewed with previously available Bugbot rules.
- Automatic review cadence, "only when mentioned", and "run once" behavior are
  dashboard settings, not GitHub Actions in this repo.
- Manual top-level PR comments that should trigger a review when Bugbot is
  connected: `cursor review` or `bugbot run`.
- For troubleshooting, use the verbose variants: `cursor review verbose=true`
  or `bugbot run verbose=true`.
- Do not treat the presence of this file as proof that the managed service is
  enabled. Confirm Cursor dashboard/org settings, GitHub App access to
  `fjg-thr/hobgoblin-dungeon`, and a live PR smoke review when access permits.

## Project Map

- `src/app/page.tsx` renders the client-only game shell.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene`, then
  destroys the Phaser game on React unmount. Be strict about SSR safety,
  duplicate Phaser instances, and cleanup for changes in this area.
- `src/game/scenes/DungeonScene.ts` owns gameplay: input, spawning, combat,
  power-ups, pickups, audio playback, HUD, camera, and debug overlays.
- `src/game/maps/startingDungeon.ts` generates the dungeon layout and tile
  blocking data. Collision-sensitive changes should stay consistent with
  `isTileBlocked`, tile codes, and playable tile selection.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets and
  audio loaded by `DungeonScene`.
- `public/assets/**` contains runtime art/audio. JSON metadata must match the
  dimensions and frame assumptions used by the Phaser loaders.
- `tools/**` and `scripts/**` contain asset/audio generation or processing
  tooling. Review generated output and source-tool changes together.
- The app currently uses regular CSS in `src/app/globals.css`; there is no
  Tailwind configuration in this repo.

## Review Priorities

1. Flag runtime bugs that can break the playable prototype: Phaser boot loops,
   SSR-only browser API access, scene lifecycle leaks, missing asset loads,
   bad animation frame ranges, broken input, collision regressions, or state
   that is not reset between runs.
2. Treat gameplay balance changes as bugs only when they contradict code-level
   invariants, documented behavior touched by the PR, or player-visible UI.
3. For asset changes, verify every path referenced from `assetManifest` exists
   in `public/assets`, and verify metadata dimensions agree with loader frame
   widths/heights.
4. For audio changes, check `src/game/assets/manifest.ts` first. The auxiliary
   `public/assets/audio/audio-manifest.json` can drift and should not be used as
   the runtime source of truth unless a PR explicitly changes that contract.
5. For React/Next changes, check accessibility and semantic markup, but follow
   existing CSS patterns instead of assuming Tailwind or ShadCN are configured.
6. For dependency or toolchain changes, require evidence from install/build/type
   checks because this project uses `latest` Next/React/TypeScript packages.

## Known Baseline Context

These are existing repo conditions. Do not block unrelated PRs solely because
of them, but do flag them when a PR touches the relevant behavior or docs.

- README says `Space` or `J` fires. Runtime code currently binds keyboard fire
  to `Space`; pointer/click aiming and firing is also implemented.
- README describes blast as rare late-game. Runtime `POWERUP_CONFIG.blast`
  unlocks after 2 kills or 16 seconds.
- README lists standard ammo and several power-ups, but runtime code also has
  seeker ammo/projectiles that unlock after 4 kills or 30 seconds.
- `src/app/layout.tsx` references `/opengraph-image.png`, but no
  `opengraph-image.*` file is present in `public`.
- `next lint` is not a reliable verification command for the current Next
  version in this repo.

## Suggested Verification

For code changes, prefer checks that match the changed surface:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Use focused manual smoke checks for gameplay-affecting PRs:

- Start screen boots without duplicate canvases.
- `WASD`/arrow movement, `Space` firing, pointer aim/click firing, and `F3`
  debug toggle still work.
- Ammo, seeker ammo, quickshot, haste, ward, blast, heart pickups, mute toggle,
  game over, and restart state reset behave consistently after a fresh run.
- Asset/audio PRs load without missing-file or frame-range errors in the
  browser console.

If verification commands rewrite generated files such as `next-env.d.ts` or
create `tsconfig.tsbuildinfo`, treat that as local build output unless the PR
intentionally changes generated typing behavior.

## Review Output Expectations

- Lead with concrete bugs and regressions, including file and line references.
- Distinguish existing baseline issues from regressions introduced by the PR.
- Avoid broad style comments unless they affect correctness, accessibility,
  maintainability of touched code, or future review accuracy.
- If no bugs are found, say so briefly and mention any verification gaps or
  managed-service checks that still require dashboard/GitHub access.
