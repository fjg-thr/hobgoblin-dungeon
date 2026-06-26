# Cursor Bugbot Review Guide

Use this file as repository-specific guidance for Cursor Bugbot reviews. It does
not enable the hosted service by itself. Managed Bugbot deployment still needs
Cursor dashboard/org settings, Cursor GitHub App access to this repo, optional
Admin API/team configuration, and a live PR smoke review after this file lands on
the default branch.

## Manual review triggers

On a pull request, maintainers can request a review with a top-level comment:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for diagnostics,
  request IDs, and extra log context.

## Project context

- Next.js App Router app with React and TypeScript.
- Phaser 4 game runtime mounted from `src/game/GameCanvas.tsx`.
- Main gameplay logic is in `src/game/scenes/DungeonScene.ts`.
- Map generation/static map data is in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts`.
- Global DOM styling uses `src/app/globals.css`; Tailwind and shadcn/ui are not
  configured in this repo.

## High-priority review focus

1. Keep Phaser client-only. Server components and metadata code must not import
   Phaser or browser-only game modules.
2. For gameplay changes, inspect `DungeonScene.ts` for lifecycle cleanup,
   input handlers, timers, collisions, camera/resize behavior, and object
   destruction to avoid duplicate listeners or leaked sprites.
3. For title screen, how-to-play, HUD, and other UI changes, verify keyboard
   affordances, pointer zones, readable contrast, resize behavior, and that DOM
   accessibility expectations are not confused with Phaser canvas limitations.
4. For asset changes, require `assetManifest` updates when runtime-loaded files
   move or change. `public/assets/audio/audio-manifest.json` is auxiliary; the
   runtime audio source of truth is `assetManifest.audio`.
5. For map/tile changes, check walkability, render depth, collision assumptions,
   and that new tile codes have assets and handling in the scene.
6. For app metadata/share changes, verify `metadataBase`, OpenGraph/Twitter
   images, and referenced public assets together.

## Known baseline mismatches

Do not block unrelated PRs solely for these existing mismatches. Do flag PRs
that touch the related behavior or documentation and fail to reconcile them.

- `src/app/layout.tsx` references `/opengraph-image.png`, but no matching
  public or app-generated image exists in the current baseline.
- README says `Space` or `J` fires; current code binds firing to `SPACE` plus
  pointer/click firing.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  seeker ammo/projectiles are code-defined in `DungeonScene.ts` and not fully
  documented.
- README describes blast as rare late-game; current `POWERUP_CONFIG` unlocks it
  earlier than that wording implies.
- `npm ci` may report existing audit advisories from the current dependency
  baseline; do not fail unrelated PRs only because the baseline exists.
- This repo has both `package-lock.json` and `pnpm-lock.yaml`. If dependencies
  change, require intentional lockfile handling instead of incidental churn.

## Asset and audio tooling

When generated assets change, look for the matching generator/processor update
or clear evidence that the generated output is intentional.

- `tools/process_assets.py`
- `tools/process_actor_death_assets.mjs`
- `tools/process_combat_juice_assets.mjs`
- `tools/process_pickup_intent_effect_assets.mjs`
- `tools/generate_powerup_sprites.mjs`
- `tools/generate_brute_ammo_sprites.mjs`
- `tools/generate_audio_sfx.mjs`
- `scripts/generate-retro-soundtrack.mjs`

## Verification commands

Prefer these checks for substantive changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check
```

`next lint` is not reliable with the current Next.js baseline, despite the
package script. Next build/typegen may rewrite `next-env.d.ts` between
`.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`; treat that as
generated churn unless the PR intentionally changes typing behavior.

## Review style

Prioritize correctness, regressions, missing tests, and user-visible behavior.
Be concrete: cite files and lines, explain the failing scenario, and separate
existing baseline issues from regressions introduced by the PR.
