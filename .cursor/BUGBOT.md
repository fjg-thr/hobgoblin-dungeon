# Cursor Bugbot review guidance

This repository is a Next.js/React/TypeScript web prototype that hosts a Phaser-based
isometric dungeon game. Review changes as production-facing gameplay code unless a PR
is explicitly labeled as throwaway asset experimentation.

## Deployment boundary

- This file gives Cursor Bugbot repository-specific review context. It does not enable
  or prove the hosted Bugbot service by itself.
- Managed Bugbot deployment still requires the external Cursor dashboard/org setting,
  GitHub App repository access, and any Admin API or service configuration used by the
  team.
- After this file is merged to the default branch, smoke-check Bugbot on a small PR with
  a top-level `cursor review` or `bugbot run` comment. For diagnostics, use
  `cursor review verbose=true` or `bugbot run verbose=true` and capture the request ID
  or service logs if available.
- PRs that add or update this file may not be reviewed using the updated instructions
  until the change is present on the default branch.

## Review priorities

1. Protect runtime correctness in `src/game/scenes/DungeonScene.ts`, especially Phaser
   scene lifecycle, input handlers, timers/tweens, camera behavior, collision, and object
   cleanup on restart or shutdown.
2. Preserve the game loop: start screen, how-to-play modal, movement, pointer aim,
   `SPACE` firing, click-to-fire, finite ammo, heart pickups, power-ups, enemy spawning,
   scoring, game over, restart, mute toggle, and debug overlay.
3. Treat `src/game/assets/manifest.ts` as the runtime source of truth for loaded assets
   and audio. `public/assets/audio/audio-manifest.json` is auxiliary and should stay
   consistent when touched, but it is not what `DungeonScene` loads directly.
4. Check generated/static assets under `public/assets/**` for matching manifest keys,
   frame dimensions, row ordering, and metadata JSON. A missing PNG, stale dimensions, or
   mismatched frame count is usually a runtime break.
5. Keep Next.js metadata and document structure valid in `src/app/layout.tsx` and
   `src/app/page.tsx`. Metadata/share-image changes should verify that
   `/opengraph-image.png` or any replacement asset exists in the deployed app and that
   dimensions and alt text remain accurate.

## Gameplay context to keep straight

- Runtime firing is bound to `SPACE` and pointer/click firing. README mentions `J`, but
  current code does not bind `J`; only block control-documentation PRs when they make
  that mismatch worse or claim `J` works without implementing it.
- Initial goblins come from `dungeon.enemyStarts`. Additional goblins ramp with target
  enemy count. Brutes unlock after the configured kill/time thresholds.
- Power-up spawn weights and unlock gates live in `POWERUP_CONFIG`. Effect durations and
  behavior live nearby in constants and collection logic: quickshot reduces cooldown,
  haste increases movement speed and effects, ward blocks hits, and blast charges one
  explosive shot.
- Seeker ammo/projectiles are implemented in code and unlock after progression
  thresholds even though README copy focuses on regular ammo and common power-ups. Review
  code behavior directly for seeker changes.
- The how-to-play modal and title/game-over screens are Phaser-rendered canvas UI with
  responsive compact/tiny branches and pointer hit zones. Watch for regressions in small
  viewport layout, close/restart/start behavior, and control copy consistency.

## UI and accessibility expectations

- This repo currently uses plain CSS in `src/app/globals.css`; Tailwind is not configured.
  For DOM UI changes, follow existing CSS patterns and semantic HTML.
- Phaser canvas UI cannot satisfy DOM accessibility by itself. For gameplay UI changes,
  look for clear keyboard/mouse affordances, visible focus-equivalent states where
  practical, readable contrast, responsive placement, and no hidden pointer-only dead
  ends in start, modal, mute, or restart flows.

## Asset and audio workflow checks

- Asset processing scripts live under `tools/`; audio generation scripts live under both
  `tools/` and `scripts/`. Relevant commands include:
  - `npm run process:assets`
  - `npm run process:death-assets`
  - `npm run process:combat-juice`
  - `npm run generate:powerups`
  - `npm run generate:combat-assets`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
- Generated binary assets may be absent in sparse/materialized checkouts. If a PR changes
  asset references, verify against the actual repository/deploy artifact before approving
  claims that an asset exists.

## Verification guidance

- Prefer `npm run build` plus `npx tsc --noEmit --incremental false` for source changes.
  `next lint` is not reliable here because recent Next versions no longer ship the old
  lint command behavior.
- `npm run build` can rewrite `next-env.d.ts`; do not include that generated churn unless
  the PR intentionally changes Next generated type behavior.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because incremental builds
  are enabled. Prefer `--incremental false` and remove the artifact if it appears.
- For documentation-only Bugbot guidance changes, at minimum verify the file exists and
  run `git diff --check`. A full `npm run build` and `npx tsc --noEmit --incremental false`
  pass is still useful before merging deployment PRs.
