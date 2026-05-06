# Bugbot Review Instructions

Review this repository as a small Next.js game prototype that runs a Phaser scene from React.

Focus on:

- Build and runtime safety for `next build`, especially browser-only Phaser code crossing server/client component boundaries.
- Gameplay regressions in `src/game/scenes/DungeonScene.ts`, including collision, enemy spawning, damage, ammo, pickups, scene restart, and input handling.
- Asset loading consistency between `src/game/assets/manifest.ts`, JSON sprite sheets, audio manifests, and files under `public/assets`.
- TypeScript issues that can hide Phaser API mistakes or undefined scene state.
- Accessibility and keyboard support for React UI and in-canvas overlay controls where the code exposes DOM or interactive controls.
- Performance risks from per-frame allocations, unbounded timers/events, leaked listeners, or scene objects that survive restart.

Treat generated assets and source art as lower-signal unless a change breaks references, dimensions, frame names, or manifest data consumed by the game.

When reviewing pull requests:

1. Prioritize concrete bugs and user-visible regressions over style preferences.
2. Call out missing verification when a change touches gameplay, asset manifests, or build configuration.
3. Include exact file paths and line references where possible.
4. Suggest small, targeted fixes that fit the existing code style.
