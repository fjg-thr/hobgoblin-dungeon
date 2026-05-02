# Bugbot review instructions

Review this repository as a first-playable Next.js and Phaser game prototype. Prioritize bugs that can break gameplay, rendering, asset loading, controls, audio, or the production build.

## High-priority areas

- Phaser scene lifecycle issues in `src/game/**`, especially leaked event listeners, timers, tweens, sounds, textures, or stale scene state across restart and game-over flows.
- Input handling regressions for keyboard, pointer, aiming, firing, mute toggles, and debug controls. Flag browser-default interactions only when they can affect gameplay.
- Collision, spawning, pickup, health, ammo, scoring, enemy AI, and map-generation bugs that can soft-lock a run, make objectives unreachable, or create unfair unavoidable damage.
- Next.js client/server boundary mistakes. Game code that touches `window`, `document`, canvas, audio, or Phaser must stay behind client-only boundaries.
- Asset manifest mismatches: missing files, wrong frame names, invalid sprite-sheet dimensions, broken audio paths, or JSON metadata that does not match referenced assets.
- Production build and TypeScript issues, including imports that only work in dev, accidental server imports of client code, or reliance on generated files that are not committed.

## Lower-priority / usually ignore

- Pixel-art polish, balance tuning, generated asset aesthetics, naming preferences, and subjective game-feel suggestions unless they hide a concrete bug.
- Broad refactors that do not reduce a specific correctness risk in the changed diff.
- Missing tests for generated asset-processing scripts unless the script change affects runtime assets or committed manifests.

## Review style

- Leave comments only for actionable correctness, reliability, accessibility, security, or build issues.
- Include the user-visible symptom or failure mode when reporting gameplay bugs.
- If a finding depends on a runtime path, name the scene, state transition, or input sequence that triggers it.
- Prefer focused comments on the changed lines over broad summaries.
