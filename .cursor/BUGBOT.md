# Cursor Bugbot review guide

Use this guide as repository-specific context when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin prototype. This file gives review guidance only; managed Bugbot enablement still depends on Cursor org/project settings, GitHub App repository access, and any Admin API or service credentials configured outside this repository.

## Triggering and deployment checks

- After this file is merged to the default branch, confirm Bugbot is enabled in Cursor settings and that the GitHub App can read this repository.
- For a live smoke check, open or update a PR and add a top-level comment with `cursor review` or `bugbot run`.
- Use `cursor review verbose=true` or `bugbot run verbose=true` when diagnostics, request IDs, or service logs are needed.
- A PR that adds or changes this file may be reviewed with the previous default-branch guidance until the change is merged.

## Repository map

- Next.js App Router entry points live in `src/app`. `src/app/page.tsx` hosts the game canvas, `src/app/layout.tsx` defines metadata, and `src/app/globals.css` holds the current DOM styling baseline.
- `src/game/GameCanvas.tsx` is the client-only React/Phaser bridge. Guard against server-side imports or browser API access outside the client boundary.
- `src/game/scenes/DungeonScene.ts` owns most runtime gameplay: input, camera, map presentation, spawning, combat, powerups, HUD, audio, and debug overlay.
- `src/game/maps/startingDungeon.ts` owns generated dungeon topology and collision-relevant map data.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when audio assets change.

## Review priorities

1. Protect the Next.js client/server boundary. Flag Phaser, `window`, `document`, canvas, or audio usage that can run during server render.
2. Validate asset references. New or renamed assets must be tracked under `public/assets`, referenced through `assetManifest` when runtime code loads them, and kept consistent with metadata JSON frame sizes.
3. Preserve map and collision invariants. Changes to tile size, walkability, blockers, bridges, doors, stairs, depth sorting, or room/corridor generation should include a focused smoke check for movement, camera follow, enemy navigation, and projectile collision.
4. Preserve gameplay invariants. Review ammo accounting, seeker ammo unlocks, projectile cooldowns, blast/ward/haste/quickshot timing, enemy health/damage, pickup spawn rules, scoring, game start/game over transitions, and cleanup of sprites/timers/listeners.
5. Check controls against code and docs. Runtime firing is currently `Space` plus pointer/click; README also mentions `J`. Treat that mismatch as existing baseline unless an input/docs PR claims to fix it.
6. Review audio carefully. Audio is loaded from `assetManifest.audio`, starts only after user interaction, and has a scene-level mute toggle. Flag autoplay regressions, missing files, volume spikes, duplicate loops, and mute state inconsistencies.
7. For DOM/UI work, use existing semantic markup and `src/app/globals.css` conventions. This repo does not currently configure Tailwind or shadcn/ui.
8. For Phaser UI overlays, check pointer hit zones, keyboard/mouse affordances, responsive placement, scroll factors, depth ordering, and readable text over the canvas.
9. Coordinate dependency and lockfile edits. Both `package-lock.json` and `pnpm-lock.yaml` are tracked; package changes should explain and verify the affected manager state.
10. Treat generated artifacts as intentional only when the PR explains the generator or source asset update.

## Known baseline context

- `src/app/layout.tsx` references `/opengraph-image.png`, but no tracked `public/opengraph-image.png` exists at this baseline. Flag changes that introduce or worsen broken public metadata references, but do not block unrelated PRs solely for the existing missing asset.
- README describes `Space` or `J` for firing, while `DungeonScene` binds the keyboard shot key to `Space`. Scope this to control/docs changes.
- README documents standard ammo, heart pickups, quickshot, haste, ward, and blast. Runtime code also unlocks seeker ammo after kill/time thresholds; review seeker changes against code rather than README alone.
- README describes blast as rare late-game, while runtime unlock timing and weights are defined by `POWERUP_CONFIG`. Treat that as existing docs/runtime drift unless the PR intentionally changes blast behavior or docs.
- `next-env.d.ts` may be rewritten by Next tooling between `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`. Restore accidental churn unless the PR intentionally changes generated typing behavior.

## Asset and audio tooling

- Asset processors and generators include:
  - `python3 tools/process_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/generate_polish_sprites.mjs`
  - `node tools/generate_powerup_sprites.mjs`
  - `node tools/generate_brute_ammo_sprites.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
- Prefer exact commands over broad wildcard script names when asking authors to regenerate assets.

## Suggested verification by PR type

- Markdown-only guidance/docs: `git diff --check` and a focused review of changed text.
- TypeScript/gameplay/runtime changes: `npx tsc --noEmit --incremental false` and `npm run build`.
- Asset manifest or public asset changes: verify referenced files exist, metadata frame dimensions match runtime loader settings, and changed generators were run if applicable.
- Dependency changes: run the appropriate install/audit/build checks for the package managers touched. `next lint` is not reliable in this Next 16 project.
- Manual smoke checks for gameplay changes should cover: load `http://localhost:3000`, start the game, move with WASD/arrows, aim with mouse, fire with `Space` and click, pick up ammo/powerups/hearts when available, toggle SOUND/MUTED, toggle `F3`, take damage, kill enemies, and reach game over/restart.
