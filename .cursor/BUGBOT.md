# Cursor Bugbot Review Guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype. It gives
Bugbot repository context; enabling the managed Bugbot service itself still depends on
Cursor/GitHub configuration outside this repository.

## Managed Bugbot deployment boundary

- Repository review guidance lives in this file: `.cursor/BUGBOT.md`.
- To prove hosted Bugbot is enabled, verify the external pieces that are not stored in
  git: Cursor dashboard or organization settings, GitHub App repository access, Admin
  API credentials if used, and a live PR review smoke check.
- Manual PR triggers, when the service is installed, are top-level PR comments:
  `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true`
  or `bugbot run verbose=true` to surface request IDs and extra log detail.
- This file is read after it lands on the default branch. A PR adding or changing this
  guide may not be reviewed with the updated guidance.

## Project shape

- Stack: Next.js App Router, React, TypeScript, Phaser 4 release candidate.
- Runtime entry points:
  - `src/app/page.tsx` renders the full-screen game shell.
  - `src/game/GameCanvas.tsx` dynamically imports Phaser on the client and creates the
    `DungeonScene`.
  - `src/game/scenes/DungeonScene.ts` owns gameplay, input, HUD, audio, spawning, and
    scene lifecycle behavior.
  - `src/game/assets/manifest.ts` is the runtime source of truth for Phaser asset and
    audio paths.
  - `src/game/maps/startingDungeon.ts` contains dungeon map helpers.
- Styling is plain CSS in `src/app/globals.css`; this repository currently does not
  configure Tailwind or shadcn/ui.

## Review priorities

1. Gameplay/runtime regressions in `DungeonScene.ts`: scene restart/shutdown cleanup,
   input listener leaks, timers, camera resize behavior, collision, enemy spawning,
   projectile lifetimes, pickup logic, and game-over/reset state.
2. Asset path consistency: any added or renamed runtime asset must be reflected in
   `assetManifest` and committed under `public/assets/...`; JSON metadata should match
   frame sizes, row counts, and animation assumptions.
3. Next/React boundaries: keep Phaser imports client-only/dynamic, avoid reading
   `window` outside client effects, and preserve full-screen canvas sizing.
4. TypeScript strictness: prefer explicit domain types for gameplay state, avoid broad
   `any`, and keep reusable constants near related logic.
5. UX/accessibility for DOM and canvas overlays: DOM changes should use semantic HTML
   and existing CSS patterns; Phaser buttons/zones need pointer affordances, keyboard or
   documented alternatives where practical, readable sizing on small screens, and clear
   mute/start/restart behavior.

## Current baseline quirks to avoid misclassifying

- `README.md` says `Space` or `J` fires, but current keyboard shooting is bound to
  `SPACE` only. The in-game how-to text says Space/click. Do not block unrelated PRs
  solely for the existing README mismatch; do flag control/input-documentation changes
  that make it worse or claim to fix it without code/docs alignment.
- Seeker ammo/projectiles exist in code after progression thresholds, but README copy
  does not document them. Review gameplay changes against code-defined seeker behavior.
- README describes blast as rare late-game, while `POWERUP_CONFIG` currently unlocks it
  earlier than that wording implies. Treat this as baseline drift unless a PR touches
  power-up tuning or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; this checkout has no
  matching PNG in `public/`. Flag metadata/share-image changes that remove referenced
  assets, introduce new broken references, or claim to fix social previews without
  adding the asset.
- This checkout may contain JSON metadata without the PNG/WAV binaries referenced by
  manifests and README. If a PR touches assets, check the actual branch diff and avoid
  assuming missing binaries were introduced by the PR.

## Assets and audio

- Runtime audio loading uses `assetManifest.audio` in `src/game/assets/manifest.ts`.
  `public/assets/audio/audio-manifest.json` is auxiliary and should not be treated as
  the runtime source of truth.
- Keep generated asset processors and source manifests aligned:
  - `npm run process:assets`
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
  - `python3 tools/process_assets.py`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
- For sprite-sheet PRs, verify nearest-neighbor/pixel-art assumptions, alpha handling,
  frame dimensions, and Phaser animation row/column expectations.

## Verification guidance

Use the smallest verification set that covers the changed surface:

```bash
npm run build
npx tsc --noEmit --incremental false
```

`next lint` is not reliable for this Next version because the script still calls
`next lint`; prefer the build and TypeScript checks above unless the project lint
script has been updated.

For asset/tooling changes, also run the exact generator or processor touched by the PR
and inspect the resulting diff. For runtime gameplay changes, run the app and smoke
check: start game, move with WASD/arrows, aim with pointer, fire with Space/click,
collect ammo/power-ups/hearts, toggle `SOUND`/`MUTED`, press `F3`, die, and restart.

If `next-env.d.ts` changes during local verification, check whether it was generated by
Next route type output (`.next/dev/types` vs `.next/types`) and restore it unless the PR
intentionally changes generated typing behavior.

## Dependency and security notes

- Both `package-lock.json` and `pnpm-lock.yaml` are tracked. Dependency PRs should keep
  them consistent and verify the package manager actually used by the change.
- npm `overrides` do not affect pnpm; put pnpm overrides in `pnpm-workspace.yaml` when
  needed.
- Phaser is intentionally pinned to `4.0.0-rc.4`; do not ask for a Phaser upgrade unless
  the PR is explicitly about engine/dependency maintenance.
- When audit/security changes are in scope, check production audit output for both npm
  and pnpm if both locks are modified.
