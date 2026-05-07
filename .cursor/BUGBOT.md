# Cursor Bugbot Review Guide

Use this guidance when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Project context

- This is a Next.js app that mounts a Phaser dungeon prototype from React.
- The main gameplay code lives in `src/game/scenes/DungeonScene.ts`.
- Static game assets and sprite metadata live under `public/assets`.
- Asset generation and processing scripts live in `tools` and `scripts`.

## Review priorities

- Verify gameplay changes preserve player controls, camera follow, collision, combat, pickups, score/ammo state, audio mute, and the start/game-over flows.
- Watch for Phaser lifecycle issues, especially event listeners, timers, tweens, physics objects, and audio instances that are not cleaned up when scenes restart or components unmount.
- Check that React and Next.js code remains client/server safe. Phaser code should only run in the browser and should not rely on server-only APIs.
- Keep TypeScript strictness intact. Avoid `any`, unsafe casts, and broad null assertions unless the invariant is clear from nearby code.
- Treat generated binary assets as high risk for repository bloat. Metadata JSON should match committed sprite dimensions, frame names, and asset keys.
- Preserve pixel-art rendering constraints: nearest-neighbor scaling, stable canvas sizing, and no CSS/image smoothing regressions.
- For map, enemy, and power-up tuning, look for accidental difficulty spikes, impossible paths, unreachable pickups, or regressions to deterministic replay assumptions.

## Validation expectations

- Prefer `npm ci` before validation when dependencies are missing or stale.
- Run `npm run build` for TypeScript and Next.js verification.
- If behavior changes affect gameplay, call out where manual playtesting is still needed, including controls, collisions, combat, pickups, and restart behavior.
- If asset scripts change, verify the generated JSON and PNG outputs stay in sync and document any generated files that were intentionally committed.
