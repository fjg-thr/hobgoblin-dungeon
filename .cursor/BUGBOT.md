# Bugbot Review Guide

Review this repository as a first-playable Next.js and Phaser dungeon prototype.
Prioritize comments that would prevent runtime crashes, broken gameplay, asset
load failures, or production build failures. Avoid broad style commentary unless
it points to a concrete bug or maintenance risk.

## Repository context

- Next.js App Router with React and TypeScript strict mode.
- Phaser 4 is booted from `src/game/GameCanvas.tsx` and the main scene lives in
  `src/game/scenes/DungeonScene.ts`.
- Static gameplay assets live under `public/assets`; paths and frame metadata are
  centralized in `src/game/assets/manifest.ts`.
- Procedural dungeon generation lives in `src/game/maps/startingDungeon.ts`.
- Asset-processing scripts live under `tools/` and `scripts/`.

## High-priority review checks

1. React and Phaser lifecycle
   - Look for duplicate Phaser game creation, missed cleanup, leaked event
     listeners, timers, tweens, sounds, keyboard handlers, or scene references.
   - Treat React Strict Mode double-mount behavior as an important edge case.
   - Check browser-only code for safe client-side execution in Next.js.

2. Gameplay and scene changes
   - In `DungeonScene.ts`, focus on regressions in movement, aiming, collisions,
     enemy spawning, damage, pickups, ammo, scoring, audio, UI hit zones, and game
     over or restart flows.
   - Flag state that is initialized for one run but not reset before restart.
   - Check that Phaser objects are destroyed or deactivated before reuse.

3. Map generation
   - Validate bounds checks, room and corridor connectivity, wall placement, and
     tile or prop coordinate conversions.
   - Flag randomness changes that make maps impossible to complete or make spawns
     unreachable.

4. Asset loading
   - Verify every new asset path in manifests or scene preload code exists under
     `public/assets`.
   - Check frame dimensions, animation frame names, and atlas JSON references for
     drift from the actual files.
   - Do not request manual review of large binary assets unless code or manifest
     references make them suspect.

5. Tooling and generated assets
   - For `tools/*.py`, `tools/*.mjs`, and `scripts/*.mjs`, review file paths,
     ignored temp directories, deterministic output assumptions, and whether the
     matching generated assets need to be refreshed.
   - Flag scripts that silently overwrite tracked assets without documenting the
     command needed to reproduce the output.

## Verification expectations

- For TypeScript, React, Next.js, or Phaser code changes, expect:
  - `npm run lint`
  - `npm run build`
- For asset pipeline changes, expect the specific generation or processing script
  listed in `package.json` or under `tools/`/`scripts/`, plus `npm run build` if
  asset manifests or imports changed.
- This repository currently has no configured unit or end-to-end test script.

## Review tone

- Lead with bugs that are likely to affect players or break deployments.
- Include the concrete file and line when making a finding.
- Keep suggestions scoped to the changed code; avoid unrelated refactors.
