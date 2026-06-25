# Cursor Bugbot review guidance

Review this repository as a small, browser-based Next.js and Phaser game prototype.

## Priorities

- Flag TypeScript errors, unsafe assumptions around nullable Phaser objects, and code paths that can break during scene preload/create/update lifecycles.
- Check gameplay changes for regressions in movement, collision, enemy spawning, projectile behavior, power-ups, score/ammo/life state, audio mute state, and start/game-over flows.
- Verify asset changes against `src/game/assets/manifest.ts` and the files under `public/assets`; missing or mismatched sprite-sheet JSON keys are high-impact.
- For Next.js changes, watch for server/client boundary problems. Phaser and browser-only APIs should remain behind client-only components.
- Treat accessibility issues as meaningful when UI is DOM-based. For canvas-only interactions, focus on preserving documented keyboard controls and visible in-game instructions.

## Noise to avoid

- Do not review generated binary assets or processed sprite/audio output unless the diff changes how code references them.
- Avoid broad refactor suggestions for `src/game/scenes/DungeonScene.ts` unless they address a concrete bug or make a touched code path safer.
- Do not require a full physics engine, authored art replacement, or multi-level progression unless the diff explicitly claims to implement those milestones.

## Useful verification

- Run `npm run build` for production compile checks.
- If asset manifests change, compare the referenced texture keys, frame names, dimensions, and file paths against the generated JSON next to each asset.
