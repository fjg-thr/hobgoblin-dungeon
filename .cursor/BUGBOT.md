# Cursor Bugbot review guide

This repository is the Hobgoblin Ruin prototype: a Next.js app that boots a
Phaser 4 isometric dungeon scene from a client React component. Use this file as
repo-specific review context after it is merged to the default branch. A PR that
adds or changes this file may not be reviewed with the new rules until a later
Bugbot run.

## Deployment boundaries

- Managed Bugbot enablement is outside this repository. Confirm Cursor
  dashboard/org settings, GitHub App repository access, or Admin API credentials
  in the live environment when available.
- Repository files can only provide review guidance; they cannot prove the
  managed service is enabled. After merging this guide, smoke-test a small PR
  review if service access is available.
- Manual top-level PR triggers may use `cursor review` or `bugbot run`.
  Diagnostic reruns may use `cursor review verbose=true` or
  `bugbot run verbose=true` to surface request IDs and extra logs.

## Review priorities

- Treat `src/game/scenes/DungeonScene.ts` as the primary gameplay surface.
  Review movement, collision, spawning, ammo, powerups, score, health, audio,
  hit-stop, camera shake, pooled effects, and game-over state together because
  many constants and timers interact.
- Treat `src/game/GameCanvas.tsx` as the Phaser lifecycle boundary. Client-only
  imports, duplicate boot protection, cleanup, resize behavior, and WebGL/canvas
  config are important regressions to catch.
- Treat `src/game/assets/manifest.ts` as the runtime asset source of truth,
  especially `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is
  auxiliary and should not be assumed to drive runtime loading.
- For map or collision changes, inspect `src/game/maps/startingDungeon.ts` along
  with scene collision helpers and depth sorting.
- For asset/audio generator changes, check the relevant tools explicitly:
  `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`,
  `tools/process_combat_juice_assets.mjs`,
  `tools/process_pickup_intent_effect_assets.mjs`,
  `tools/process_gpt_tile_powerup_assets.mjs`,
  `tools/process_corporate_goblin_assets.py`,
  `tools/generate_audio_sfx.mjs`, and
  `scripts/generate-retro-soundtrack.mjs`.

## Existing baseline context

- Keyboard movement uses WASD/arrows. Shooting currently uses Space and pointer
  or click firing; README text also mentions J, but the scene binds Space only.
  Do not block unrelated PRs solely for that existing docs drift, but flag PRs
  that touch controls or README text and make the mismatch worse.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast. The
  scene also has seeker ammo and seeker projectiles unlocked by progression.
  Review code-defined seeker behavior when gameplay changes touch ammo.
- README describes blast as rare late-game, while current powerup constants can
  unlock it earlier. Treat this as baseline drift unless a PR intentionally fixes
  progression docs or balance.
- `src/app/layout.tsx` references `/opengraph-image.png`, but the baseline does
  not include a matching public or app OpenGraph image file. Flag PRs that touch
  metadata/share-image behavior without addressing this, not unrelated PRs.
- `npm ci` may report existing audit advisories from the current dependency
  baseline. Do not block unrelated scoped PRs solely on unchanged advisory output,
  but flag dependency changes that worsen the baseline.
- This repo does not configure Tailwind. For DOM UI, prefer semantic elements and
  existing `src/app/globals.css` patterns. For Phaser UI, review pointer zones,
  keyboard affordances, responsive placement, and canvas-specific accessibility
  limitations.

## Verification expectations

- Prefer `npm ci`, `npm run build`, and `npx tsc --noEmit` for broad checks.
  `next lint` is not reliable with the current Next version and package scripts.
- If verification rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo`,
  restore/remove those generated artifacts unless the PR intentionally changes
  Next type-generation behavior.
- For docs/config-only PRs, still run `git diff --check` and a focused sanity
  check that this file remains concise, ASCII-only, and rooted at
  `.cursor/BUGBOT.md`.

## Review style

Prioritize concrete defects with file and line references. Explain why the bug
matters in gameplay, build, or deployment terms, and avoid blocking on known
baseline limitations unless the PR changes the affected surface.
