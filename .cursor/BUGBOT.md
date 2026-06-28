# Cursor Bugbot review guide

Bugbot should use this as repository-specific context when reviewing PRs for
Hobgoblin Ruin Prototype. The managed Bugbot service is enabled outside this
repo through Cursor/GitHub settings; this file only defines review priorities
and verification expectations.

## Project map

- Next.js app entry points live in `src/app/`; the game is mounted from
  `src/app/page.tsx` through `src/game/GameCanvas.tsx`.
- Most gameplay behavior is in `src/game/scenes/DungeonScene.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts`. Treat
  `assetManifest.audio` as the audio source of truth used by the scene.
- Static assets live under `public/assets/**`; generated metadata JSON files
  should stay in sync with their PNG or WAV companions.
- `README.md` describes player-facing behavior, setup, controls, assets, and
  known limitations.

## Managed Bugbot deployment checklist

Because these checks require service or organization access, reviewers should
ask for evidence when a PR claims to deploy or configure Bugbot:

- Cursor dashboard/org settings have Bugbot enabled for this repository.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- Any Admin API credentials or service configuration are stored outside git.
- After this guide reaches the default branch, a test PR can trigger a review
  with a top-level GitHub comment: `cursor review` or `bugbot run`.
- For diagnostics, the top-level comment can be `cursor review verbose=true`
  or `bugbot run verbose=true` to request additional logs/request details.

Do not treat this file as proof that the hosted service is enabled.

## Review priorities

- Preserve the current Next.js + React + TypeScript + Phaser architecture.
- Prefer small, focused changes over broad rewrites of `DungeonScene.ts`.
- For gameplay edits, inspect movement, camera, collision, spawning,
  projectile lifecycles, pickups, power-up timing, score/ammo/health HUD
  updates, pause/start/game-over states, and scene cleanup.
- For UI/metadata edits, use semantic HTML and the existing
  `src/app/globals.css` patterns. This repo does not configure Tailwind.
- For Phaser UI overlays, review pointer zones, keyboard/mouse affordances,
  responsive placement, readable canvas text, and hit target sizing.
- For asset changes, verify imported paths exist, metadata frame dimensions
  match the sheet, and generated files are deterministic enough to review.
- For audio changes, verify runtime keys are in `assetManifest.audio` and
  loaded/played by `DungeonScene`; keep `public/assets/audio/audio-manifest.json`
  consistent when it is intentionally touched.
- For dependency changes, keep Phaser pinned unless the PR intentionally tests a
  Phaser upgrade. Verify both npm and pnpm lockfiles when both are changed.

## Current behavior caveats

- README mentions firing with `Space` or `J`, but the current runtime binds
  keyboard firing to `SPACE` plus pointer/click firing. Do not block unrelated
  PRs solely for this existing mismatch; do flag input/control PRs that make it
  worse or fail to update docs.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast.
  Current code also includes seeker ammo unlocked by progression thresholds.
- README describes blast as rare late-game; current code unlocks it through
  `POWERUP_CONFIG`. Treat that as an existing docs/code mismatch unless the PR
  intentionally changes power-up progression.
- Next generated route types can rewrite `next-env.d.ts` between dev and build
  paths. Do not accept accidental churn to that file unless the PR intentionally
  changes Next type generation.

## Suggested verification

Use the smallest set that matches the PR, then broaden for risky changes:

```bash
npm ci
npx tsc --noEmit --incremental false
npm run build
```

For dependency or lockfile changes, also run:

```bash
npm audit --omit=dev
pnpm audit --prod
```

For metadata/share-image changes, confirm the referenced asset is tracked:

```bash
test -f public/opengraph-image.png
git ls-files --error-unmatch public/opengraph-image.png
```

For asset regeneration, use the exact local tooling rather than broad wildcard
script names:

```bash
python3 tools/process_assets.py
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
python3 tools/process_corporate_goblin_assets.py
node tools/process_gpt_tile_powerup_assets.mjs
node tools/process_pickup_intent_effect_assets.mjs
python3 tools/process_spreadsheet_brute_assets.py
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_powerup_sprites.mjs
node tools/generate_brute_ammo_sprites.mjs
```

## Bugbot PR smoke test

After this guide is on the default branch and the service is enabled, open or
update a small PR and add a top-level GitHub comment containing `cursor review`
or `bugbot run`. Confirm Bugbot posts a review. If it does not, check Cursor
dashboard settings, GitHub App repository access, organization policy, and
verbose trigger output before changing repo files.
