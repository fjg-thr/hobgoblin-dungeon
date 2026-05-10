# Bugbot review instructions

Review this repository as a browser game built with Next.js, React, TypeScript, and Phaser 4.

Focus reviews on defects that could affect gameplay correctness, build stability, or browser runtime behavior:

- Treat `src/game/scenes/DungeonScene.ts` as the main gameplay surface. Check state transitions, timers, cleanup paths, collision checks, projectile/enemy interactions, pickup rules, and game-over/restart behavior for regressions.
- Verify browser-only code stays behind client boundaries. Phaser imports should remain dynamically loaded from client components, and code that touches `window`, input devices, audio, or canvas APIs must not run during server rendering.
- When asset paths, frame dimensions, animation rows, or keys change, cross-check `src/game/assets/manifest.ts`, `public/assets/**`, and the preload/animation setup in the scene so missing assets or mismatched frame sizes do not break boot.
- For dungeon generation changes, review tile-code handling, blocked-tile rules, spawn placement, pathing assumptions, and world/tile coordinate conversions together.
- For UI/HUD or input changes, check keyboard, mouse, mute, restart, and resize flows. Preserve accessibility in the surrounding Next/React shell where applicable.
- Prefer small, type-safe fixes that align with the existing strict TypeScript setup. Avoid broad rewrites of the large scene file unless the change directly reduces review risk.
- Use `npm run build` as the primary validation command. `npm run lint` is currently defined, but this project does not include an explicit ESLint setup in `package.json`; do not treat that script as authoritative unless the repository adds lint dependencies/configuration.

Known project constraints:

- The prototype intentionally uses simple tile/proximity collision rather than a full physics system.
- Assets are generated and processed locally; review generated asset metadata for consistency, but do not request hand-polished art as a code-review blocker.
- The staircase is intentionally a visible placeholder and does not yet transition to another level.
