# Cursor Bugbot review guidance

Use this repository guidance when reviewing pull requests for the Hobgoblin Ruin prototype. The project is a Next.js app that mounts a Phaser dungeon game from `src/game/GameCanvas.tsx` and implements most runtime behavior in `src/game/scenes/DungeonScene.ts`.

## Deployment boundary

- This file gives hosted Cursor Bugbot repository-specific review context after it is merged to the default branch.
- This file alone does not enable the managed Bugbot service. Confirm service enablement outside the repo through Cursor dashboard/org settings, GitHub App repository access for `fjg-thr/hobgoblin-dungeon`, Admin API credentials/configuration if used, and a smoke-check review on a pull request when available.
- Manual PR review triggers may use a top-level `cursor review` or `bugbot run` comment. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` to collect request IDs and detailed logs.
- PRs that add or change this file may not be reviewed with the newly changed guidance until after the PR lands on the default branch.

## Project shape

- `src/app/page.tsx` renders the game shell; `src/app/layout.tsx` owns metadata and OpenGraph/Twitter share image settings.
- `src/game/GameCanvas.tsx` dynamically imports Phaser on the client and creates the `DungeonScene` with resize scaling.
- `src/game/scenes/DungeonScene.ts` owns game state, controls, combat, spawns, power-ups, audio, title/how-to-play UI, and debug overlay behavior.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. In particular, `assetManifest.audio` is what the scene loads; `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when touched.
- `src/game/maps/startingDungeon.ts` owns dungeon generation, tile codes, blocked-tile logic, and prop metadata.
- The app currently uses plain CSS in `src/app/globals.css`; do not expect Tailwind or shadcn/ui patterns in this repository.

## High-priority review checks

- For gameplay changes in `DungeonScene.ts`, check that state resets work across start, restart, game over, and scene shutdown. Watch for timers, pooled objects, input listeners, audio handles, and arrays that survive a run.
- For controls, verify runtime behavior rather than README text alone. Current firing is bound to `Space` and pointer/click firing in code; README also mentions `J`, so only block on that mismatch for PRs changing controls or control docs.
- For enemy spawns, remember initial goblins are seeded from `dungeon.enemyStarts`. Additional goblins ramp with target enemy count, while brutes unlock through `BRUTE_UNLOCK_KILLS` / `BRUTE_UNLOCK_MS`.
- For seeker ammo, review the code-defined behavior even though README does not document it yet. Seeker pickups/projectiles unlock after `SEEKER_UNLOCK_KILLS` / `SEEKER_UNLOCK_MS` and use their own ammo caps, pickup amounts, drop chance, target acquisition, speed, range, and damage constants.
- For power-ups, `POWERUP_CONFIG` controls unlock gates, spawn weights, sprite rows, and presentation metadata. Effect durations and mechanics live nearby in constants and collection/update logic, such as `QUICKSHOT_DURATION_MS`, `HASTE_DURATION_MS`, `WARD_DURATION_MS`, and `blastShotReady`.
- For collisions, compare changes against `isTileBlocked`, actor radii, projectile hitboxes, prop collision boxes, safe spawn distance, and tile/world conversion helpers. Small coordinate changes can affect pathing and fairness.
- For responsive UI changes, test compact/tiny viewport branches for the Phaser title screen and how-to-play modal. Preserve modal close behavior, pointer hit zones, and copy consistency with runtime input.
- For audio changes, keep `assetManifest.audio`, generated WAV files under `public/assets/audio`, and `public/assets/audio/audio-manifest.json` in sync when any of them are touched. Confirm mute toggle behavior and background loop lifecycle.
- For metadata or share-card changes, keep `src/app/layout.tsx`, `public/opengraph-image.png`, dimensions, and alt text aligned. The current image metadata expects a 1360 x 752 asset.
- For asset pipeline changes, verify the relevant generation/processing tool as well as the committed output files. Relevant commands include `npm run process:assets`, `npm run process:death-assets`, `npm run process:combat-juice`, `npm run generate:powerups`, `npm run generate:combat-assets`, `node tools/generate_audio_sfx.mjs`, `node scripts/generate-retro-soundtrack.mjs`, `python3 tools/process_corporate_goblin_assets.py`, and `python3 tools/process_spreadsheet_brute_assets.py`.

## Verification expectations

- Prefer `npm run build` plus `npx tsc --noEmit --incremental false` for source changes. `next lint` is not reliable in this Next 16 project.
- `npm run build` may rewrite `next-env.d.ts`; do not include that generated churn unless the PR intentionally changes Next type generation.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because `incremental` is enabled. Prefer `--incremental false`, and flag generated build artifacts if committed unintentionally.
- For lockfile/dependency changes, check both `package-lock.json` and `pnpm-lock.yaml` because both are tracked.
- For visual/gameplay changes, ask for or run a browser smoke test that covers load, start screen, how-to-play modal, movement, firing, pickups, enemy contact damage, game over/restart, mute, and a narrow viewport.
- For documentation-only changes, verify that examples match current runtime behavior or explicitly call out intentional roadmap/known-limitation wording.

## PR review tone

- Prioritize correctness, runtime regressions, missing verification, and user-visible game feel issues.
- Call out external service assumptions separately from repository-file changes. If dashboard, GitHub App, Admin API, or live PR-smoke-check access is unavailable, state that the review can only confirm repository guidance, not managed Bugbot enablement.
- Keep suggestions scoped to the touched subsystem. Avoid blocking unrelated PRs on existing README/runtime mismatches, first-pass asset quality, or future milestone limitations unless the PR claims to fix them.
