# Bugbot review instructions

This repository is a Next.js prototype that renders a Phaser-powered isometric dungeon game. Review pull requests for defects that could break runtime gameplay, asset loading, or production builds.

## Project context

- The app shell lives in `src/app` and mounts the game through `src/game/GameCanvas.tsx`.
- The main game logic is in `src/game/scenes/DungeonScene.ts`.
- Asset paths and sprite metadata are coordinated through `src/game/assets/manifest.ts` and JSON files in `public/assets`.
- Dungeon layout and tile collision helpers live in `src/game/maps/startingDungeon.ts`.

## Review priorities

1. Flag client/server boundary bugs. Phaser and browser globals must remain inside client-only code paths and effects.
2. Check Phaser lifecycle safety. Game instances, event listeners, timers, tweens, sounds, and pooled objects should be cleaned up or reused without leaks across React remounts.
3. Verify gameplay state invariants. Watch for regressions in health, ammo, pickups, enemy spawning, collision, invulnerability, cooldowns, score, and game-over/start-state transitions.
4. Validate coordinate math. Changes to isometric tile/world conversion, bounds, pathing, hitboxes, depth sorting, or camera behavior should preserve consistent gameplay and rendering.
5. Confirm asset manifest consistency. New or changed sprites/audio should have matching manifest keys, file paths, frame sizes, metadata JSON, and preload/animation usage.
6. Watch performance-sensitive loops. Per-frame code should avoid unnecessary allocations, unbounded collections, runaway tweens/timers, and expensive pathfinding or rendering work.
7. Check responsive behavior. Canvas sizing, resize handling, pointer aim, HUD layout, modals, and overlays should work at different viewport sizes.

## Verification guidance

- Prefer `npm run build` as the primary automated check.
- If a change touches asset-processing scripts, also review the relevant command in `package.json` and generated manifest output.
- Treat missing runtime verification for gameplay-heavy changes as a review risk, especially when behavior depends on real Phaser scene execution.
