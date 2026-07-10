# Cursor Bugbot review guidance

Repository: `fjg-thr/hobgoblin-dungeon`

Repository-specific context for Cursor Bugbot PR reviews.

## Deployment boundary

This file gives Bugbot review context. It does not enable the managed Cursor
Bugbot service. Validate external deployment pieces separately:

- Cursor dashboard or organization settings have Bugbot enabled for this repo.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- Admin API credentials and repository configuration are correct when an Admin
  API based rollout is used.
- A live PR can receive a Bugbot review, or verbose mode yields a request ID.

Bugbot generally reads guidance from the default branch after merge. A PR that
adds or updates this file may not be reviewed with the new rules until merged.

## Manual review triggers and diagnostics

For a pull request smoke check, add one top-level PR comment with either:

- `cursor review`
- `bugbot run`

For verbose troubleshooting, use:

- `cursor review verbose=true`
- `bugbot run verbose=true`

Verbose mode is for diagnostics, request IDs, and service log detail.

## Project shape

- Next.js App Router entry points live under `src/app/`.
- `src/game/GameCanvas.tsx` mounts Phaser on the client with a dynamic import.
- `src/game/scenes/DungeonScene.ts` owns most runtime gameplay: scene lifecycle,
  generated dungeon setup, player and enemy state, controls, combat, pickups,
  Phaser-rendered UI, title screen, how-to-play modal, audio, and cleanup.
- `src/game/maps/startingDungeon.ts` defines room and corridor generation.
- `src/game/assets/manifest.ts` is the runtime asset source of truth, including
  audio. `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- Asset processing and generation scripts live in `tools/` and `scripts/`.
- This repo uses plain CSS in `src/app/globals.css`; do not assume Tailwind or
  shadcn is configured.
- There is currently no CI workflow, test runner, or ESLint config in the repo.

## High-priority review checks

Focus on behavioral regressions and missing verification before style nits.

1. Phaser lifecycle and cleanup
   - Keep `GameCanvas` client-only. Do not import Phaser from server components.
   - Ensure React Strict Mode double-mounts do not create duplicate Phaser games.
   - Ensure scene restarts, React unmounts, resize handlers, timers, tweens,
     keyboard listeners, pointer handlers, audio instances, and generated
     objects are cleaned up.
   - Watch for stale state surviving a game-over restart or title-screen reset.

2. Controls and input
   - Runtime shooting currently supports Space and pointer/click firing. The
     README also mentions `J`; flag that only when the PR changes controls,
     input docs, or onboarding copy.
   - Review keyboard and pointer affordances together, especially when UI
     overlays or modal hit zones change.

3. Gameplay state, spawning, and balance
   - Initial goblins come from `dungeon.enemyStarts`; additional goblins ramp via
     target enemy count. Brutes unlock through kill/time gates.
   - Seeker ammo exists in code as progression-gated behavior even though the
     README focuses on regular ammo and documented powerups.
   - `POWERUP_CONFIG` controls unlock gates, weights, and labels. Durations live
     in nearby constants, and blast uses `blastShotReady`.
   - `MAX_SIMULATION_DT` affects combat fairness across refresh rates.
   - Check that deaths, score, ammo, hearts, pickups, and active effects reset
     predictably between runs.

4. Collision, camera, and responsive Phaser UI
   - Collision uses simple tile/proximity checks rather than a full physics
     system; review bounds changes against walls, bridges, props, enemies, and
     projectiles.
   - `TileCode`, `tileAssetForCode`, `isTileBlocked`, `PROP_RENDER`, prop
     generation, and visible render branches should stay in sync.
   - Preserve compact and tiny viewport behavior for the title screen,
     how-to-play modal, HUD panels, life meter, sound toggle, and game-over UI.

5. Asset manifest, animation frames, and generated assets
   - Runtime audio additions must be reflected in `assetManifest.audio`.
   - Sprite or tileset changes should keep PNGs, JSON frame data, manifest
     entries, Phaser preload keys, and README asset notes consistent when touched.
   - Actor sheets are assumed to be 4 directions by 10 columns, with idle frames
     before walk/attack frames. Powerups use 8-frame rows. Combat juice, pickup
     intent, actor deaths, HUD panels, and other sheets have hardcoded row/frame
     assumptions in `DungeonScene.ts`; review sheet and tooling changes against
     those assumptions.
   - For procedural sound effects, review `tools/generate_audio_sfx.mjs`.
   - For the retro theme, review `scripts/generate-retro-soundtrack.mjs`.
   - Corporate goblin and brute source sheets have direct processors:
     `python3 tools/process_corporate_goblin_assets.py` and
     `python3 tools/process_spreadsheet_brute_assets.py`.

6. Next.js metadata and share assets
   - `src/app/layout.tsx` references `/opengraph-image.png`. Metadata or share
     image changes should keep `public/opengraph-image.png`, dimensions, and alt
     text in sync.

7. Dependency and tooling drift
   - `package.json` uses `next`, `react`, `react-dom`, `typescript`, and type
     packages as `latest`; flag unrequested broad dependency churn.
   - Phaser is pinned to `4.0.0-rc.4`; treat Phaser upgrades and API changes as
     high-risk.
   - Both `package-lock.json` and `pnpm-lock.yaml` are tracked. Dependency PRs
     should keep the intended package manager and lockfiles clear.
   - Several asset tools rely on external packages such as Sharp or Pillow that
     are not all declared in `package.json`; tool changes should document setup
     and exact regeneration commands.

## Verification expectations

Prefer targeted checks plus the project build:

- `npm ci` when dependency installation or lockfile freshness matters.
- `npm run build` for Next.js and Turbopack validation.
- `npx tsc --noEmit --incremental false` for TypeScript validation.
- Asset-processing commands when the PR touches related sources or outputs.
- Manual browser smoke checks for controls, responsive UI, audio mute, restart,
  and game-over flows when gameplay or UI behavior changes.

`npm run lint` maps to `next lint`, which is not reliable with the current
Next.js version. Do not require it as the primary gate unless tooling changes.

`npm run build` may rewrite `next-env.d.ts`; avoid committing that churn unless
the PR updates Next typing behavior. Also avoid committing `tsconfig.tsbuildinfo`.
