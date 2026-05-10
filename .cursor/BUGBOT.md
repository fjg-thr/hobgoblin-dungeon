# Bugbot Review Instructions

Use these project-specific rules when reviewing pull requests for this repository.

## Review priorities

- Flag user-visible regressions in game feel, controls, rendering, audio playback, HUD behavior, and restart/game-over flows.
- Treat TypeScript errors, uncaught browser/runtime exceptions, unreachable game states, and broken production builds as blocking issues.
- Verify Phaser scene changes clean up timers, event listeners, tweens, keyboard input, and game objects they create.
- Check that asset manifest entries stay in sync with files under `public/assets` and with any generated JSON frame metadata.
- Prefer focused fixes over broad refactors unless the refactor directly reduces risk in the changed code.

## Next.js and React expectations

- Keep Phaser/browser-only code out of server rendering paths. `src/game/GameCanvas.tsx` should remain a client component and dynamically import Phaser plus `DungeonScene`.
- Preserve the single full-screen game shell unless a change explicitly updates the product surface.
- Review metadata changes against real static assets. The app currently references `/opengraph-image.png`, so related changes should add or update the matching public file or adjust the metadata.
- Use the existing minimal app/global CSS structure; do not introduce unrelated UI frameworks or component libraries for in-game UI.

## Game implementation expectations

- Keep coordinate conversions, collision checks, depth sorting, spawn logic, and pathfinding deterministic and easy to reason about.
- Watch for stale state in long-lived `DungeonScene` fields, especially across restart, game-over, mute, and modal flows.
- Current code binds movement to `WASD` and arrows, firing to `Space` and pointer click, debug overlay to `F3`, and modal close to `Escape`. If docs mention other keys, verify the code before assuming they work.
- Keep performance-sensitive update-loop work bounded; avoid per-frame allocations, unbounded object creation, or full-map scans unless the map size remains explicitly constrained.
- When adding projectiles, pickups, power-ups, enemies, or effects, check object caps/pools, cleanup paths, HUD text, audio cues, and pickup/drop balance.

## Asset and tooling expectations

- If generated art/audio assets change, verify the corresponding manifest paths, frame dimensions, animation rows, and README asset list stay aligned.
- Asset-processing script changes should include the relevant script run or a clear note explaining why generated files were not updated.
- `npm run build` is the primary local verification command for code changes. `npm run lint` currently maps to `next lint`, which is not compatible with the installed latest Next.js CLI, so treat lint-script failures as tooling debt unless the PR touches lint setup.
- If dependency versions change, check browser bundle impact, Phaser compatibility, and whether `package-lock.json` was intentionally updated.

## Manual review prompts

- For gameplay behavior changes, look for a manual test note covering movement, firing, pickups, enemies, restart, and audio mute.
- For UI/start-screen changes, check responsive behavior on narrow and short viewports.
- For audio changes, verify mute persistence through `localStorage` and that sound playback remains guarded for locked or muted audio contexts.
