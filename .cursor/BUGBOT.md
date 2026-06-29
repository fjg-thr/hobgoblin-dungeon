# Cursor Bugbot review guide

Use these instructions when reviewing pull requests for the Hobgoblin Ruin
prototype. This Next.js/React app mounts a browser-only Phaser 4 dungeon scene
from `src/game/scenes/DungeonScene.ts`.

## Review priorities

- Treat `src/game/scenes/DungeonScene.ts` as the highest-risk file: it owns
  player input, combat, spawning, power-up state, audio, UI overlays, and Phaser
  lifecycles. Watch for missed cleanup of timers, event handlers, pooled
  objects, tweens, sounds, and keyboard/pointer subscriptions.
- Changes in `src/game/maps/startingDungeon.ts` can affect collision,
  reachability, camera bounds, and safe spawn placement. Check map generation
  changes against enemy, pickup, and player spawn assumptions.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded
  assets. If a PR adds, renames, or removes an asset under `public/assets`, make
  sure the manifest path, metadata JSON, frame size, key, and runtime loader code
  remain synchronized.
- `public/assets/audio/audio-manifest.json` is auxiliary; do not treat it as a
  replacement for `assetManifest.audio` in runtime reviews.
- `src/game/GameCanvas.tsx` isolates Phaser from server rendering. For app or
  framework changes, verify Phaser still loads only in the browser and that game
  destruction handles React remounts cleanly.
- `src/app/layout.tsx` metadata must match files served from `public/`. Treat
  the current missing `/opengraph-image.png` as baseline drift for unrelated
  PRs, but flag metadata or public share-asset changes that keep or add broken
  references.

## Gameplay and UX checks

- Runtime firing currently uses `Space` and pointer/click input. The README also
  mentions `J`; do not block unrelated PRs only because of that existing
  mismatch, but flag PRs that touch controls or instructions without reconciling
  code, UI text, and README behavior.
- Seeker ammo is implemented in code even though the README does not fully
  document it. Review seeker projectile and pickup changes against the code
  paths, not only the README.
- Blast timing is governed by `POWERUP_CONFIG` in `DungeonScene.ts`; the README
  describes it as a rare late-game power-up. Treat any discrepancy as an
  existing docs/code mismatch unless the PR intentionally changes progression.
- Phaser canvas controls are not normal DOM controls. For UI and accessibility
  changes, review keyboard and pointer affordances, readable overlay placement,
  responsive scaling, and whether DOM metadata or surrounding page semantics are
  still adequate.
- This repo does not currently configure Tailwind. For DOM styling changes, use
  existing `src/app/globals.css` conventions unless the PR explicitly adds a
  broader styling system.

## Asset and audio generation

- Generated or processed assets should be reproducible from the checked-in tools
  when practical. Relevant helpers include:
  - `python3 tools/process_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/generate_powerup_sprites.mjs`
  - `node tools/generate_polish_sprites.mjs`
  - `node tools/generate_brute_ammo_sprites.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
- If a PR changes generated files, check for stale source prompts, metadata JSON,
  dimensions, animation frame counts, nearest-neighbor scaling assumptions, and
  accidentally committed intermediate files.

## Verification guidance

- For TypeScript, gameplay, app shell, or manifest changes, prefer:
  - `npx tsc --noEmit --incremental false`
  - `npm run build`
- Keep `package.json`, `package-lock.json`, and `pnpm-lock.yaml` synchronized
  for dependency changes. Reject one-lockfile-only churn unless package-manager
  ownership changes.
- `next lint` is not reliable for this Next.js baseline, so do not treat its
  absence as a failed verification unless the PR changes lint tooling.
- Build and dev commands can rewrite `next-env.d.ts` between `.next/types` and
  `.next/dev/types`; flag that churn unless the PR intentionally changes Next
  route typing behavior.
- For Markdown-only Bugbot guidance changes, `git diff --check` is usually
  enough local verification.

## Managed Bugbot boundaries

- This file gives Cursor Bugbot project-specific review context. Enabling the
  hosted Bugbot service, GitHub App repository access, team rules, repository
  rules, and Admin API credentials is managed in Cursor/GitHub settings outside
  this repository.
- Manual PR review triggers can be requested with top-level PR comments:
  `cursor review` or `bugbot run`. For diagnostics, use
  `cursor review verbose=true` or `bugbot run verbose=true`.
- Hosted Bugbot may only apply new `BUGBOT.md` instructions after this file is
  merged to a branch that Bugbot reads, typically the default branch.
