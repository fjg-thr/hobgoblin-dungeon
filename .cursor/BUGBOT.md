# Cursor Bugbot review guide

Use this guide when reviewing pull requests for this repository.

## Deployment boundary

- This file provides repository-specific review context for Cursor Bugbot.
- Managed Bugbot enablement is external to this repo: verify Cursor dashboard or
  org settings, Cursor GitHub App access to `fjg-thr/hobgoblin-dungeon`, and any
  Bugbot Admin API credentials or team configuration where applicable.
- After this file is merged to the default branch, smoke test Bugbot on a PR with
  a top-level comment such as `cursor review` or `bugbot run`. Use
  `cursor review verbose=true` or `bugbot run verbose=true` only for diagnostic
  request/log detail.
- PRs that add or change `BUGBOT.md` may not be reviewed with the new rules until
  after the guide lands on the default branch.

## Project context

- Next.js app with a client-only Phaser game mounted by `src/game/GameCanvas.tsx`.
- Main gameplay logic is in `src/game/scenes/DungeonScene.ts`; it owns input,
  scene lifecycle, spawning, combat, HUD, audio, start/game-over UI, and cleanup.
- Procedural map and collision helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are sourced from `src/game/assets/manifest.ts`.
- Static game assets are under `public/assets/**`; generated helper scripts live
  in `tools/` and `scripts/`.

## Review priorities

- For `GameCanvas`, check dynamic imports, client-only Phaser usage, resize
  behavior, single-game initialization, and cleanup on React unmount.
- For `DungeonScene`, look for scene shutdown leaks, dangling input/listener/tween
  state, depth/order regressions, frame-rate dependent movement, null destroyed
  game objects, and gameplay state that is not reset between runs.
- For map/collision changes, verify tile coordinates, blocked-tile rules, prop
  collision boxes, spawn safety, camera bounds, and debug overlay accuracy.
- For asset changes, keep `assetManifest` aligned with files and sprite metadata.
  `public/assets/audio/audio-manifest.json` is auxiliary; runtime audio loading
  comes from `assetManifest.audio`.
- For metadata/share changes, verify `src/app/layout.tsx` paths and any referenced
  OpenGraph image files exist in the expected public or app route location.
- For DOM or future HTML UI, follow existing `src/app/globals.css` patterns. This
  repo currently has no Tailwind or ShadCN setup.

## Known baseline caveats

- README says `Space` or `J` fires, but current runtime input binds shooting to
  `SPACE` plus pointer/click. Do not block unrelated PRs solely on this mismatch.
- README omits seeker ammo, while the scene unlocks seeker pickups/projectiles by
  kill/time thresholds. Treat that as existing code-defined behavior unless a PR
  changes ammo or docs.
- README describes blast as rare late-game, while `POWERUP_CONFIG` controls actual
  unlock timing. Scope failures to PRs that touch power-up behavior or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; if no matching file is
  present, treat it as baseline unless the PR changes metadata/share behavior.
- The repo has both `package-lock.json` and `pnpm-lock.yaml`; avoid unrelated
  lockfile churn.
- Next may rewrite `next-env.d.ts` between dev and build route type paths. Restore
  generated churn unless the PR intentionally changes Next typing behavior.
- Existing `npm ci` output may include baseline audit advisories. Flag new or
  worsened dependency risk, but do not fail unrelated PRs only for the baseline.

## Asset and audio tooling

When PRs touch generated assets, review the relevant helper as well as outputs:

- `tools/process_assets.py`
- `tools/process_actor_death_assets.mjs`
- `tools/process_combat_juice_assets.mjs`
- `tools/process_corporate_goblin_assets.py`
- `tools/process_gpt_tile_powerup_assets.mjs`
- `tools/process_pickup_intent_effect_assets.mjs`
- `tools/process_spreadsheet_brute_assets.py`
- `tools/generate_audio_sfx.mjs`
- `tools/generate_brute_ammo_sprites.mjs`
- `tools/generate_polish_sprites.mjs`
- `tools/generate_powerup_sprites.mjs`
- `scripts/generate-retro-soundtrack.mjs`

## Suggested verification

- `npm ci`
- `npm run build`
- `npx tsc --noEmit --incremental false`
- For gameplay-facing PRs, smoke test movement, click/Space firing, pickups,
  sound toggle, start/how-to-play/game-over screens, resize behavior, and F3 debug
  overlay in a browser.

## Review style

- Lead with concrete bugs, regressions, missing tests, or verification gaps.
- Cite exact files and lines.
- Distinguish known baseline issues from regressions introduced by the PR.
- Prefer narrowly scoped fixes that preserve the game feel and current architecture.
