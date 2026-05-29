# Bugbot review instructions

Review this repository as a Next.js and Phaser game prototype. Prioritize comments that identify real bugs, regressions, or missing verification over style-only feedback.

## Focus areas

- Gameplay correctness: movement, aiming, projectile lifecycle, enemy spawning/pathing, collision, pickups, scoring, health, invulnerability, and game-over/restart state.
- Phaser scene lifecycle: asset preloading, animation keys, event listeners, timers, tweens, camera updates, and cleanup when the scene or React component is destroyed.
- Asset consistency: changes to `src/game/assets/manifest.ts` should match files and metadata under `public/assets/**`; sprite frame dimensions and frame counts should stay compatible with their sheets.
- Dungeon generation: generated maps should keep reachable floors, valid spawn points, safe pickup/enemy placement, and consistent tile blocking.
- Next.js client boundaries: Phaser and browser-only APIs should stay behind client components or dynamic imports so server rendering and builds do not fail.
- Type safety: preserve strict TypeScript behavior and avoid weakening types with broad casts or `any`.
- Tests and verification: for behavior changes, expect focused tests when practical and at minimum a successful `npm run build` or project-appropriate verification.

## De-prioritize

- Comments on generated sprites, generated audio, saved source images, lockfiles, or large asset metadata unless the change creates a concrete runtime or build issue.
- Pure formatting or naming feedback that does not affect correctness, maintainability, accessibility, performance, or user-visible behavior.
- Suggestions to add broad new architecture when a narrow fix matches the prototype's current scope.

## Project-specific expectations

- Keep gameplay constants and derived calculations synchronized when changing movement speed, cooldowns, hitboxes, or spawn timers.
- Confirm new assets are loaded before use and that missing assets fail during build or local verification rather than during play.
- Avoid leaking Phaser objects, DOM listeners, intervals, or audio instances across React unmounts, restarts, or scene transitions.
- Preserve keyboard, pointer, and sound toggle behavior described in `README.md` unless the change intentionally updates those controls and documentation.
