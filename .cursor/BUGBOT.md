# Cursor Bugbot review guidance

Use this guide when reviewing this Next.js App Router shell that mounts a
browser-only Phaser 4 dungeon prototype.

## Product and runtime context

- The entry route is `src/app/page.tsx`; it renders `src/game/GameCanvas.tsx`.
- `GameCanvas` must stay a client component. It dynamically imports `phaser`
  and `DungeonScene` inside `useEffect`, creates the game only in the browser,
  and destroys it during cleanup. Flag server-side Phaser imports, duplicate game
  boot, or missing `destroy(true)` cleanup.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; map
  generation and collision helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime assets and audio are loaded from `src/game/assets/manifest.ts`.
  `public/assets/audio/audio-manifest.json` is auxiliary; do not treat it as the
  runtime source of truth unless code changes make it so.

## High-risk review areas

- Player/enemy state resets, game-over/start-over flows, Phaser timers/tweens,
  resize listeners, keyboard/pointer handlers, and scene shutdown cleanup.
- Isometric coordinate transforms, collision boxes, depth ordering, prop
  blockers, projectile hitboxes, seeker projectile targeting, and generated map
  invariants. Small math changes can create invisible blockers or unreachable
  areas.
- Asset atlas edits: spritesheet PNGs, JSON metadata, frame dimensions, row
  ordering, and `assetManifest` entries must stay synchronized.
- Audio or dependency changes: keep `package.json`, `package-lock.json`, and
  `pnpm-lock.yaml` consistent when dependencies change.
- DOM/metadata changes should use existing semantic HTML and
  `src/app/globals.css`. Review Phaser canvas UI for keyboard/mouse affordance,
  pointer zones, responsive placement, and readable small-viewport text.

## Known baseline drift

- README says `Space` or `J` fires; current runtime uses `SPACE` plus
  pointer/click firing. Do not block unrelated PRs solely for the missing `J`
  binding, but do flag control/input-doc changes that preserve or worsen the
  mismatch.
- README documents standard ammo and common power-ups, while code also has
  seeker ammo/pickups/projectiles after progression thresholds. Treat seeker
  behavior as code-defined unless a PR intentionally updates docs or balance.
- README calls blast a rare late-game power-up; actual timing is controlled by
  `POWERUP_CONFIG` in `DungeonScene.ts`. Scope this mismatch to balance/docs PRs.

## Metadata and public assets

- `src/app/layout.tsx` references `/opengraph-image.png`; current main tracks
  `public/opengraph-image.png`. Flag metadata/share-image changes that add
  broken public asset references or drift from the image dimensions/alt text.

## Asset and generator checks

When generated assets change, verify that source prompts, tooling, and committed
outputs stay coherent:

- `tools/process_assets.py`
- `tools/process_actor_death_assets.mjs`
- `tools/process_combat_juice_assets.mjs`
- `tools/process_corporate_goblin_assets.py`
- `tools/process_gpt_tile_powerup_assets.mjs`
- `tools/process_pickup_intent_effect_assets.mjs`
- `tools/process_spreadsheet_brute_assets.py`
- `tools/generate_powerup_sprites.mjs`
- `tools/generate_polish_sprites.mjs`
- `tools/generate_brute_ammo_sprites.mjs`
- `tools/generate_audio_sfx.mjs`
- `scripts/generate-retro-soundtrack.mjs`

Prefer exact commands over wildcard script names; use `python3
tools/process_corporate_goblin_assets.py` for the corporate goblin processor.

## Suggested verification by change type

- Markdown-only guidance/docs: `git diff --check $(git merge-base origin/main HEAD) HEAD`.
- Runtime TypeScript/gameplay: `npx tsc --noEmit --incremental false` and
  `npm run build`.
- Browser behavior: smoke-test `npm run dev`; verify start screen, WASD/arrows,
  pointer aim, click or `SPACE` firing, ammo pickup, enemy damage, game over,
  restart, mute toggle, and `F3` debug overlay.
- Asset changes: confirm referenced files exist under `public/assets`, metadata
  frame sizes match the PNG/spritesheet layout, and `assetManifest` points to the
  committed paths.
- Dependency changes: run relevant install/audit/build paths for both tracked
  lockfiles when feasible. `next lint` is not reliable for this Next version.

Watch for generated `next-env.d.ts` churn after local Next commands. Restore it
unless the PR intentionally changes generated Next typing behavior.

## Managed Bugbot boundary

This file gives Bugbot project-specific review context. Managed Bugbot enablement
still happens outside the repo through Cursor dashboard/org settings, GitHub App
repository access, service configuration, or Bugbot Admin API credentials. If
those are unavailable, state that repo guidance was added but external enablement
could not be proven from code alone.

For manual PR review triggers, use a top-level GitHub comment such as
`cursor review` or `bugbot run`. For troubleshooting, use `cursor review
verbose=true` or `bugbot run verbose=true` to request diagnostic detail.
