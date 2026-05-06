# Bugbot review rules

Review this repository as a first-playable Next.js + Phaser dungeon prototype. Prioritize findings that can break gameplay, asset loading, builds, or browser runtime behavior.

## Project context

- The app is a Next.js project that mounts a Phaser game canvas from React.
- Core gameplay lives in `src/game/scenes/DungeonScene.ts`; dungeon generation and tile collision helpers live in `src/game/maps/startingDungeon.ts`.
- Asset paths and typed asset keys are centralized in `src/game/assets/manifest.ts`, with matching files under `public/assets`.
- Generated art/audio processing scripts live in `tools/` and `scripts/`.

## Review priorities

1. Flag changes that can run Phaser or browser-only APIs during server rendering. Game code should stay behind client-only boundaries.
2. Check Phaser lifecycle changes for leaked timers, tweens, event listeners, input handlers, audio instances, or scene objects after restart/game-over transitions.
3. Verify that asset manifest additions match real `public/assets` files, sprite frame sizes, metadata JSON, and animation frame assumptions.
4. Scrutinize movement, collision, depth sorting, spawn placement, and pathfinding changes for off-by-one tile errors or blocked/invalid coordinates.
5. Check combat and pickup changes for invariant breaks: finite ammo, cooldowns, invulnerability windows, enemy health/respawn, score updates, and progression-gated power-up rarity.
6. Prefer deterministic, bounded logic in the main scene update loop; flag unbounded allocations, expensive searches, or per-frame work that scales with spawned objects unnecessarily.
7. For React/Next changes, verify accessibility, client/server component boundaries, hydration safety, and cleanup around mounting/unmounting the game canvas.
8. For generated asset tooling, flag destructive overwrites, missing source/derived-file consistency, and scripts that require unavailable secrets or network access during normal builds.
9. Treat TypeScript errors, Next build failures, and missing imports as blocking issues.

## Non-goals

- Do not block on placeholder-quality generated pixel art unless the change breaks loading, sizing, metadata, or gameplay readability.
- Do not request broad refactors of the large Phaser scene unless the touched code introduces a concrete bug or makes an existing invariant unsafe.
