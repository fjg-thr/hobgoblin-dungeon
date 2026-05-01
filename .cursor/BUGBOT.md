# Bugbot review guidance

Review this repository as a Next.js app that hosts a Phaser-based isometric dungeon prototype. Prioritize findings that can cause runtime failures, broken gameplay loops, incorrect asset loading, or regressions in player controls.

## Project context

- The app uses Next.js with React client components for browser-only game bootstrapping.
- Phaser is loaded dynamically from `src/game/GameCanvas.tsx`; avoid introducing server-side imports or code paths that touch `window`, `document`, canvas, WebGL, or Phaser during server rendering.
- Core gameplay lives in `src/game/scenes/DungeonScene.ts`, with dungeon generation in `src/game/maps/startingDungeon.ts` and asset metadata in `src/game/assets/manifest.ts`.
- Static assets are served from `public/assets/**`; manifest paths should stay aligned with files on disk and JSON sprite metadata.

## Review priorities

- Flag any change that can instantiate more than one Phaser game for a single canvas host, leak a game instance after unmount, or skip cleanup in React effects.
- Check that new browser-only logic remains behind `"use client"` components, dynamic imports, effects, or other client-only boundaries.
- Verify gameplay constants and collision changes preserve basic invariants: walkable tiles stay traversable, blocked tiles and blocking props remain impassable, projectiles expire, enemies can path toward the player, and pickups cannot spawn in unreachable or blocked positions.
- When dungeon generation changes, look for disconnected rooms, missing player starts, missing enemy starts, invalid tile codes, out-of-bounds grid access, and inconsistent row lengths.
- When asset manifests or sprite sheets change, verify frame dimensions, keys, animation row/column assumptions, audio keys, and public paths match the expected files.
- For UI and controls, check keyboard, pointer, mute, restart, and debug-overlay interactions for regressions. Make sure browser event listeners are removed when no longer needed.
- Treat TypeScript strictness, Next.js build failures, and Phaser API mismatches as blocking issues.
- For dependency or tooling changes, flag unnecessary package additions, lockfile/package manager drift, and scripts that do not match the repository's npm-based setup.

## Verification expectations

- For TypeScript or application-code changes, expect `npm run build` to pass.
- For dungeon-generation or gameplay-logic changes, expect focused tests if a test harness exists; otherwise ask for a small deterministic validation path using seeded/random-source inputs when practical.
- For asset pipeline changes, expect the relevant generation or processing script to be documented or run, and ensure generated metadata remains internally consistent.
