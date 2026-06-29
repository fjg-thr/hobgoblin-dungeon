# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. The project is a
Next.js/React shell that boots a Phaser 4 dungeon prototype in the browser.

## High-risk areas

- `src/game/scenes/DungeonScene.ts` owns most runtime behavior: input, combat,
  enemy spawning, pickups, audio, Phaser UI overlays, and scene lifecycle.
  Review for cleanup of timers/listeners/tweens, browser-only assumptions,
  resize-safe placement, and unintended state carried between runs.
- `src/game/maps/startingDungeon.ts` defines generated rooms, corridors,
  collision, spawn areas, and traversal constraints. Map changes should keep
  walkable paths, reachable stairs/pickups, and enemy/player spawn separation.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets loaded
  by Phaser. Keep manifest keys, file paths, frame sizes, and animation metadata
  synchronized with files under `public/assets/**`.
- `src/game/GameCanvas.tsx` must keep Phaser isolated from server rendering.
  Watch dynamic imports, `useEffect` cleanup, canvas resize behavior, and double
  initialization under React strict mode.
- `src/app/layout.tsx` references `/opengraph-image.png`; metadata changes that
  depend on public assets should include the referenced file.

## Known baseline context

- README says `Space` or `J` fires. Current runtime firing is `Space` plus
  pointer/click, so do not block unrelated PRs only for that existing mismatch.
- Seeker ammo exists in code but is not fully documented in README. Treat it as
  code-defined gameplay unless a PR intentionally changes docs or ammo behavior.
- README describes blast as a rare late-game power-up, while `POWERUP_CONFIG`
  currently controls the actual unlock timing.
- This repo does not currently use Tailwind or shadcn/ui. DOM styling should
  follow existing `src/app/globals.css`; Phaser HUD/interactions are canvas
  objects and need separate pointer/keyboard/responsive review.

## Generated assets and audio

- Asset/audio tooling lives in `tools/` and `scripts/`. If a PR changes source
  prompts, sprite-sheet JSON, audio manifests, or generator scripts, check that
  generated PNG/WAV/JSON outputs remain consistent.
- Runtime audio is loaded from `assetManifest.audio` in
  `src/game/assets/manifest.ts`. `public/assets/audio/audio-manifest.json` is
  auxiliary and should not be treated as the scene loader source of truth.
- Exact generator commands used in this repo include:
  - `npm run process:assets`
  - `npm run process:death-assets`
  - `npm run process:combat-juice`
  - `npm run generate:powerups`
  - `npm run generate:combat-assets`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
  - direct `node`/`python3` invocations for other focused helpers in `tools/`

## Verification expectations

- For runtime TypeScript changes, prefer `npx tsc --noEmit --incremental false`
  and `npm run build`. `next lint` is not reliable for the current Next version.
- For asset-only changes, verify manifest references and generated file
  dimensions/metadata rather than requiring a full gameplay rewrite.
- Next may rewrite `next-env.d.ts` between dev and production route type paths;
  do not include that generated churn unless the PR intentionally changes it.
- For controls, UI, or scene-flow changes, request or perform a browser smoke
  check covering start screen, movement, firing, pickups, mute toggle, game over,
  restart, and responsive resize when practical.

## Managed Bugbot deployment boundary

This file gives hosted Cursor Bugbot repository-specific review context. It does
not by itself prove that the managed Bugbot service is enabled. Confirm Cursor
dashboard/org settings, GitHub App repository access, Admin API credentials when
used, and a PR review smoke check when those external controls are available.

On GitHub PRs, top-level comments `cursor review` or `bugbot run` can request a
manual review. Use `cursor review verbose=true` or `bugbot run verbose=true` for
diagnostics that include request/log detail.
