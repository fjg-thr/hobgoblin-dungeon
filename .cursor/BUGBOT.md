# Cursor Bugbot review guide

This file gives Cursor Bugbot repository-specific context for reviewing this
project. It does not enable the hosted Bugbot service by itself. Service
activation is managed outside git through Cursor dashboard or org settings,
Cursor GitHub App repository access, and any team/Admin API configuration. After
this file is merged to the default branch, confirm deployment with a live PR
smoke review when credentials and repository access are available.

Manual PR triggers:

- `cursor review`
- `bugbot run`
- For diagnostics only: `cursor review verbose=true` or
  `bugbot run verbose=true` to request extra IDs/log detail.

## Project shape

- Next.js App Router app with a client Phaser game mounted by
  `src/game/GameCanvas.tsx` from `src/app/page.tsx`.
- Main gameplay logic, input, HUD, combat, pickups, audio, and scene lifecycle
  live in `src/game/scenes/DungeonScene.ts`.
- Generated dungeon layout, tile codes, collision helpers, and prop placement
  live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts`.
- App metadata and share-image wiring live in `src/app/layout.tsx`; global DOM
  styles live in `src/app/globals.css`.

## Review priorities

- Treat `DungeonScene.ts` changes as high risk. Check lifecycle cleanup,
  Phaser object pools, input handlers, timers, depth ordering, camera behavior,
  hitboxes, collision consistency, health/ammo/power-up state, and audio mute
  behavior.
- For React/Next integration, make sure Phaser is only imported client-side,
  the game instance is destroyed on unmount, SSR safety is preserved, and
  metadata changes are valid for the App Router.
- For maps and movement, verify tile codes stay aligned across generation,
  rendering, collision, pathing, props, chasms, bridges, stairs, and debug
  overlays.
- For assets, every runtime path added to `assetManifest` should have the
  matching file under `public/assets`, correct frame dimensions, and metadata
  when code consumes metadata. `public/assets/audio/audio-manifest.json` is
  auxiliary; `assetManifest.audio` is the runtime source of truth.
- For Phaser UI and canvas UX, inspect pointer zones, keyboard/mouse affordances,
  viewport resizing, HUD placement, contrast, and game-state feedback. This repo
  does not use Tailwind; use existing semantic DOM and `globals.css` patterns for
  non-canvas UI.
- For generated or processed assets, review both source/tooling intent and final
  manifest/runtime references. Useful tools include
  `tools/generate_audio_sfx.mjs`, `scripts/generate-retro-soundtrack.mjs`,
  `tools/process_corporate_goblin_assets.py`,
  `tools/process_spreadsheet_brute_assets.py`,
  `tools/process_gpt_tile_powerup_assets.mjs`,
  `tools/process_pickup_intent_effect_assets.mjs`, and
  `tools/generate_polish_sprites.mjs`.

## Known baseline caveats

- README currently says `Space` or `J` fires, while the game code binds keyboard
  fire to `Space`; pointer/click firing exists. Only block PRs that touch input
  docs or controls and worsen or miss this mismatch.
- Seeker ammo exists in code and unlocks by progression thresholds, but README
  focuses on regular ammo. Treat this as existing docs drift unless the PR
  changes seeker behavior or docs.
- README describes blast as a rare late-game power-up, while current code gates
  blast through `POWERUP_CONFIG`. Treat existing timing differences as baseline
  unless a PR changes power-up balance or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`, but no matching
  baseline file is present. Flag changes that make share metadata worse or touch
  this area without resolving it; do not block unrelated PRs only for this.
- `npm ci` may report existing audit advisories from the current dependency
  baseline. Do not fail unrelated PR reviews solely for unchanged advisories.
- Next can rewrite `next-env.d.ts` and create `tsconfig.tsbuildinfo` during
  local verification. Treat that generated churn as noise unless the PR changes
  Next/TypeScript configuration intentionally.

## Suggested verification

Ask authors to run focused checks based on changed files. Good defaults:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For asset/tooling changes, also run the exact generator or processor touched by
the PR and confirm the generated files still load in a browser smoke test. For
gameplay changes, smoke test start screen, movement, aiming, `Space` fire,
pointer/click fire, pickups, mute toggle, game over/restart, and `F3` debug
overlay at more than one viewport size.

## Review style

Prefer concrete findings tied to file and line references. Focus on shipped
behavior, regressions, missing verification, and asset/runtime mismatches. Keep
known baseline issues separate from newly introduced problems.
