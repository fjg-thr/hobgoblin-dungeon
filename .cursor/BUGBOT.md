# Cursor Bugbot review guidance

Use this file as repository-specific context when reviewing pull requests for
Hobgoblin Ruin Prototype. This project is a Next.js app with a React entry
point and a Phaser game scene; most user-facing behavior lives in
`src/game/scenes/DungeonScene.ts`.

## Deployment boundary

- This file provides review guidance only. Managed Cursor Bugbot enablement is
  configured outside the repository through Cursor dashboard or organization
  settings, GitHub App repository access, and any Admin API or service
  credentials used by maintainers.
- After this guidance lands on the default branch, verify hosted Bugbot by
  opening or updating a pull request and adding a top-level `cursor review` or
  `bugbot run` comment. For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request additional run detail.
- Do not treat a PR that changes this file as proof that hosted Bugbot is
  enabled. If service access is unavailable, state that repository guidance is
  present but managed Bugbot operation was not externally verified.

## Project shape

- Runtime asset loading is driven by `src/game/assets/manifest.ts`; keep
  manifest keys, public asset paths, frame dimensions, and Phaser load calls in
  sync.
- `public/assets/audio/audio-manifest.json` is auxiliary. Runtime audio source
  of truth is `assetManifest.audio`.
- The game canvas and Phaser boot live behind `src/game/GameCanvas.tsx` and
  `src/app/page.tsx`. Metadata and app shell concerns live in
  `src/app/layout.tsx` and `src/app/globals.css`.
- Tailwind is not configured in this repository. For DOM styling, prefer the
  existing CSS patterns. For Phaser UI, review canvas text, hit zones, depth,
  pointer affordances, and responsive placement rather than Tailwind classes.

## Review focus

- Controls: runtime movement supports WASD and arrow keys. Shooting is bound to
  Space and pointer/click firing in `DungeonScene.ts`; flag changes that make
  README/control-copy inconsistent, especially around the documented `J` key.
- Start screen and how-to-play UI: check compact and tiny viewport branches,
  modal close behavior, pointer hit zones, and keyboard flow before approving
  title-screen or help-copy changes.
- Combat and progression: initial goblins are seeded from
  `dungeon.enemyStarts`; additional goblins ramp with pressure. Brutes unlock
  after `BRUTE_UNLOCK_KILLS` or `BRUTE_UNLOCK_MS`. Do not describe all goblins
  as progression-gated.
- Ammo: regular ammo is documented in README. Seeker ammo exists in code and
  unlocks after kill or time thresholds; review seeker pickups/projectiles as
  code-defined behavior even when README copy is not updated.
- Power-ups: `POWERUP_CONFIG` controls unlock gates, weights, sprite rows,
  popup text, colors, and presentation metadata. Durations and effects are
  implemented in nearby constants and collection logic such as
  `QUICKSHOT_DURATION_MS`, `HASTE_DURATION_MS`, `WARD_DURATION_MS`, and
  `blastShotReady`.
- Metadata/share images: `src/app/layout.tsx` references
  `/opengraph-image.png`. If a PR touches metadata or social image behavior,
  verify the referenced asset exists in the deployed app or require updated
  metadata, dimensions, and alt text.

## Verification expectations

- Prefer `npm run build` plus `npx tsc --noEmit --incremental false` for source
  changes. `next lint` is not reliable with this repo's current Next version.
- `npm run build` may rewrite `next-env.d.ts`; do not include that churn unless
  the PR intentionally changes generated Next typings.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because
  incremental compilation is enabled. Prefer `--incremental false` and remove
  generated artifacts if they appear.
- For asset or audio changes, verify both file existence under `public/assets`
  and manifest references. Relevant generators include
  `tools/generate_audio_sfx.mjs`, `scripts/generate-retro-soundtrack.mjs`,
  `tools/process_corporate_goblin_assets.py`, and
  `tools/process_spreadsheet_brute_assets.py`.
