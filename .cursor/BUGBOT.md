# Bugbot review rules

Review this repository as a browser game built with Next.js, React, TypeScript, and Phaser.

## Focus areas

- Treat gameplay regressions as high priority: movement, aiming, firing, collision, enemy AI, power-up behavior, scoring, life/ammo state, spawn timing, and game-over/restart flow.
- Check Phaser lifecycle changes for leaks or duplicated runtime state. `GameCanvas` must create one game instance per mounted host and destroy it on unmount.
- Guard client-only code carefully. Phaser, `window`, DOM APIs, pointer input, and audio playback must remain behind client components or runtime-only imports so Next.js server rendering and builds stay safe.
- Verify asset changes against `src/game/assets/manifest.ts` and the files under `public/assets`. Texture keys, frame names, JSON metadata, and audio manifest entries must stay in sync with code references.
- Preserve deterministic map and collision assumptions in `src/game/maps/startingDungeon.ts`; changes to tile codes, blocked tiles, props, or coordinate conversion should be reviewed with pathing and player bounds in mind.
- Flag changes that introduce per-frame allocations, unbounded timers, accumulating event listeners, orphaned Phaser objects, or expensive pathfinding in hot update loops.
- Pay close attention to browser input and audio constraints: keyboard, pointer, focus, mute state, and user-gesture requirements should continue to work after UI or scene changes.
- For generated asset scripts in `tools/` and `scripts/`, check that outputs remain reproducible, paths are explicit, and existing checked-in assets are not overwritten unintentionally.

## Review style

- Prioritize concrete bugs, behavioral regressions, broken builds, and missing verification over stylistic preferences.
- Include file and line references whenever possible.
- Do not request broad rewrites unless the current change creates a clear correctness, maintainability, or performance risk.
- Prefer small, targeted fixes that fit the existing TypeScript and Phaser style in this repository.

## Expected verification

- For application code changes, expect `npm run build` or an equivalent TypeScript/Next.js build check.
- For gameplay logic changes, expect a manual smoke test covering boot, movement, firing, pickups, enemy contact, mute toggle, and restart when feasible.
- For asset or manifest changes, expect verification that referenced files exist and load under the app's public asset paths.
