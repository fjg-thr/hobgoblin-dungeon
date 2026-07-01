# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. The repo is a
Next.js + React + TypeScript shell that boots a Phaser 4 dungeon prototype from
`src/game/GameCanvas.tsx` and `src/game/scenes/DungeonScene.ts`.

## Deployment boundary

- This file gives Cursor Bugbot repository-specific review context.
- It does not enable the hosted Bugbot service by itself. Enablement still
  requires Cursor dashboard/GitHub App repository access or the Cursor Bugbot
  Admin API.
- After this file is merged to the default branch, use a top-level PR comment
  such as `cursor review` or `bugbot run` to smoke-test manual review. Use
  `cursor review verbose=true` or `bugbot run verbose=true` when diagnostics,
  request IDs, or extra logs are needed.

## What to prioritize

- Block regressions that prevent `npm run build` or TypeScript checking from
  succeeding.
- Treat runtime crashes in the game loop, asset preloading, audio startup, or
  scene lifecycle as high priority.
- Flag changes that break player controls, combat feedback, collision, camera
  behavior, responsive canvas sizing, or game restart/start flows.
- Check that generated or processed asset changes stay connected to their
  manifests and runtime loaders.
- Keep review comments focused on changed behavior. Do not block unrelated PRs
  solely for existing README/code mismatches called out below.

## Verification commands

Prefer these checks for source changes:

```bash
npm run build
npx tsc --noEmit --incremental false
```

Notes:

- `next lint` is not reliable for this Next version, even though
  `npm run lint` exists.
- For Markdown-only Bugbot guide changes, `git diff --check` is sufficient.
- If running Next commands rewrites `next-env.d.ts` between
  `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`, restore it unless
  the task intentionally changes generated route typing behavior.
- This repo tracks both `package-lock.json` and `pnpm-lock.yaml`; dependency
  changes should keep the relevant lockfiles consistent.
- `phaser` is pinned to `4.0.0-rc.4`; do not suggest changing it unless the PR
  explicitly updates Phaser and validates the game runtime.

## Project-specific review rules

### Next.js and React shell

- `src/app/page.tsx` should stay a small host for `GameCanvas`.
- `GameCanvas` is client-only and dynamically imports Phaser. Preserve cleanup
  on unmount with `gameRef.current?.destroy(true)` and avoid server-side Phaser
  imports.
- Full-window canvas sizing relies on `Phaser.Scale.RESIZE` and the
  `game-shell`/`game-page` styles in `src/app/globals.css`; review DOM or style
  changes for mobile/responsive regressions.
- Metadata in `src/app/layout.tsx` references `/opengraph-image.png`. Flag
  changes that add, remove, or claim to fix share images without keeping public
  asset references valid.

### Phaser scene and gameplay

- `DungeonScene.ts` is the main gameplay surface. Review changes around scene
  lifecycle methods, input registration, tweens, timers, audio, and arrays of
  active game objects for leaks or stale references.
- Movement uses WASD or arrow keys. Current code binds shooting to `Space` and
  pointer/click firing; the README also mentions `J`, which is an existing
  documentation/code mismatch unless a PR intentionally addresses controls.
- Combat changes should preserve ammo consumption, seeker ammo unlock/drop
  behavior, projectile cleanup, hit feedback, death effects, score updates, and
  game-over handling.
- Power-up changes should preserve the relationship between
  `POWERUP_CONFIG`, `assetManifest.powerUps.types`, sprite rows, text feedback,
  durations, and unlock thresholds. README wording around seeker ammo and blast
  timing may lag code, so review intentional documentation updates carefully.
- Collision/map changes should test narrow corridors, wall edges, bridges,
  stairs, enemy contact damage, and pickup placement so objects do not spawn in
  blocked tiles.
- UI inside Phaser uses canvas text/sprites and interactive zones. Review
  pointer hit areas, keyboard affordances, sound toggle behavior, game-over
  restart, and debug overlay interactions for accessibility and usability within
  canvas constraints.

### Assets and audio

- `src/game/assets/manifest.ts` is the runtime source of truth for loaded
  assets. Any new runtime image, spritesheet, JSON atlas, or audio file should be
  wired there and loaded in `DungeonScene`.
- Keep sprite dimensions, frame rows, animation keys, and metadata JSON aligned
  with the actual files in `public/assets/**`.
- Audio loaded by the game comes from `assetManifest.audio`; keep it consistent
  with `public/assets/audio/**`. `public/assets/audio/audio-manifest.json` is
  auxiliary and should not be treated as the runtime loader.
- Review generated binary asset changes for accidental large, duplicate, or
  unused files. Do not request regeneration unless the source change requires it.

### Asset tooling

Known helper scripts include:

- `npm run process:assets` (`python3 tools/process_assets.py`)
- `npm run process:death-assets`
- `npm run process:combat-juice`
- `npm run generate:powerups`
- `npm run generate:combat-assets`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`
- `node tools/process_actor_death_assets.mjs`
- `node tools/process_combat_juice_assets.mjs`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `node tools/generate_polish_sprites.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `python3 tools/process_spreadsheet_brute_assets.py`

When PRs touch generated assets, check whether the matching generator/processor
or prompts in `ASSET_PROMPTS.md` should also change.

### Documentation

- README controls and gameplay notes should match user-visible behavior when a
  PR intentionally changes controls, power-ups, pickups, audio, or objectives.
- Existing baseline mismatches include README `J` shooting support, seeker ammo
  coverage, and blast timing. Flag only when the PR touches related behavior or
  documentation and misses a chance to keep them aligned.
