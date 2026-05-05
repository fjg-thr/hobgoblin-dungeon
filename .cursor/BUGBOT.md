# Bugbot Review Guidance

Review this repository as a Next.js application that hosts a Phaser-powered, asset-heavy dungeon game prototype.

## Project context

- The app entry point is `src/app/page.tsx`, which renders the client-only Phaser host in `src/game/GameCanvas.tsx`.
- Most gameplay logic lives in `src/game/scenes/DungeonScene.ts`; changes there can affect movement, combat, pickups, audio, camera behavior, and debug overlays at the same time.
- Dungeon generation, tile semantics, and collision helpers live in `src/game/maps/startingDungeon.ts`.
- Asset paths and sprite-sheet frame metadata are centralized in `src/game/assets/manifest.ts`; public assets live under `public/assets`.

## Review priorities

- Flag client/server boundary mistakes in Next.js code. Phaser usage must remain behind client-only boundaries and dynamic imports so server rendering does not load browser-only APIs.
- Verify TypeScript strictness. Avoid `any`, unsafe casts, unhandled nullable values, and widening asset keys that should stay tied to manifest literal types.
- Check gameplay changes for state consistency across scene restarts, game-over transitions, pickup collection, enemy respawns, projectile cleanup, and audio mute state.
- Watch for memory or object leaks in Phaser code: timers, tweens, particles, event listeners, sprites, graphics, and scene-level collections should be destroyed or cleaned up when no longer needed.
- Validate collision and coordinate math carefully. Tile-space and world-space values should not be mixed without explicit conversion, and bounds should stay consistent with isometric rendering.
- For asset additions or manifest edits, ensure every referenced file exists, frame sizes match the sprite sheet metadata, and generated/source asset naming stays consistent with README conventions.
- Preserve pixel-art rendering choices: nearest-neighbor scaling, `pixelArt`, disabled antialiasing, and integer/rounded render behavior should not be regressed.
- Accessibility or DOM UI changes should keep keyboard support and clear labels where the DOM is interactive, while Phaser-only input changes should preserve existing keyboard and pointer controls.

## Verification expectations

- Prefer `npm run build` for broad validation when dependencies are available.
- If dependency installation is needed, use the lockfile already present in the repo and avoid unrelated dependency churn.
- For narrowly scoped gameplay logic, call out any manual playtesting paths that should be exercised, such as starting a run, firing, collecting pickups, taking damage, muting audio, dying, and restarting.
