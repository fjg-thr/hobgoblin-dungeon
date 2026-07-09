# Cursor Bugbot review guidance

Repository: `fjg-thr/hobgoblin-dungeon`

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for the Hobgoblin Ruin prototype.

## Deployment boundary

This file gives Bugbot review context. It does not, by itself, enable the
managed Cursor Bugbot service for the repository. When validating deployment,
confirm the external pieces that are outside this repo:

- Cursor dashboard or organization settings have Bugbot enabled for this repo.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- Admin API credentials and repository configuration are correct when an Admin
  API based rollout is used.
- A live pull request can receive a Bugbot review, or a diagnostic request ID is
  available from a verbose manual trigger.

Bugbot generally reads repository guidance from the default branch after this
file is merged. A pull request that adds or edits this file may not be reviewed
with the updated guidance until after merge.

## Manual review triggers and diagnostics

For a pull request smoke check, add one top-level PR comment with either:

- `cursor review`
- `bugbot run`

For verbose troubleshooting, use:

- `cursor review verbose=true`
- `bugbot run verbose=true`

Treat verbose mode as a way to collect diagnostics, request IDs, and service log
detail. It should not change the code-review bar.

## Project shape

- Next.js App Router entry points live under `src/app/`.
- `src/game/GameCanvas.tsx` mounts Phaser on the client.
- `src/game/scenes/DungeonScene.ts` owns most runtime gameplay: scene lifecycle,
  generated dungeon setup, player and enemy state, controls, combat, pickups,
  Phaser-rendered UI, title screen, how-to-play modal, audio, and cleanup.
- `src/game/maps/startingDungeon.ts` defines room and corridor generation.
- `src/game/assets/manifest.ts` is the runtime asset source of truth, including
  audio. `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- Asset processing and generation scripts live in `tools/` and `scripts/`.
- This repo currently uses plain CSS in `src/app/globals.css`; do not assume
  Tailwind or shadcn is configured.

## High-priority review checks

Focus on behavioral regressions and missing verification before style nits.

1. Phaser lifecycle and cleanup
   - Ensure scene restarts, React unmounts, timers, tweens, keyboard listeners,
     pointer handlers, audio instances, and generated objects are cleaned up.
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
   - Check that deaths, score, ammo, hearts, pickups, and active effects reset
     predictably between runs.

4. Collision, camera, and responsive Phaser UI
   - Collision uses simple tile/proximity checks rather than a full physics
     system; review bounds changes against walls, bridges, props, enemies, and
     projectiles.
   - Preserve compact and tiny viewport behavior for the title screen,
     how-to-play modal, HUD panels, life meter, sound toggle, and game-over UI.

5. Audio and generated assets
   - Runtime audio additions must be reflected in `assetManifest.audio`.
   - For procedural sound effects, review `tools/generate_audio_sfx.mjs`.
   - For the retro theme, review `scripts/generate-retro-soundtrack.mjs`.
   - Sprite or tileset changes should keep PNGs, JSON frame data, manifest
     entries, Phaser preload keys, and README asset notes consistent when touched.
   - Corporate goblin and brute source sheets have direct processors:
     `python3 tools/process_corporate_goblin_assets.py` and
     `python3 tools/process_spreadsheet_brute_assets.py`.

6. Next.js metadata and share assets
   - `src/app/layout.tsx` references `/opengraph-image.png`. Metadata or share
     image changes should keep `public/opengraph-image.png`, dimensions, and alt
     text in sync.

## Verification expectations

Prefer targeted checks plus the project build:

- `npm ci` when dependency installation or lockfile freshness matters.
- `npm run build` for Next.js and Turbopack validation.
- `npx tsc --noEmit --incremental false` for TypeScript validation.
- Asset-processing commands only when the PR touches the corresponding source
  prompts, processors, manifests, or generated assets.

`npm run lint` currently maps to `next lint`, which is not reliable with the
current Next.js version. Do not require it as the primary gate unless the project
tooling changes.

`npm run build` may rewrite `next-env.d.ts`; do not treat that generated churn as
an intentional source change unless the PR is specifically updating Next typing
behavior. Also avoid committing `tsconfig.tsbuildinfo`.
