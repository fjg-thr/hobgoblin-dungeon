# Cursor Bugbot review rules

Review pull requests for defects that could affect the playable dungeon prototype. Prioritize actionable bugs over style-only feedback.

## Project context

- This is a Next.js app that mounts a Phaser game client-side.
- Gameplay code is concentrated in `src/game/scenes/DungeonScene.ts`, map data in `src/game/maps`, asset registration in `src/game/assets/manifest.ts`, and the Next.js entry points in `src/app`.
- Files under `public/assets` and most scripts under `tools` are asset-generation outputs or support tooling; only comment on them when a change can break loading, sizing, animation frame metadata, or reproducible generation.

## Review priorities

1. Catch runtime crashes in gameplay loops, Phaser scene lifecycle methods, input handlers, timers, tweens, collision checks, and audio/asset loading.
2. Flag Next.js server/client boundary mistakes, especially browser-only APIs used outside client components or dynamic imports.
3. Verify asset manifest changes line up with actual `public/assets` paths, frame dimensions, animation keys, and JSON metadata.
4. Check TypeScript strictness, nullable state transitions, and object lifetime assumptions for enemies, pickups, projectiles, UI overlays, and player state.
5. Look for gameplay regressions that make controls, firing, pickups, damage, scoring, start/game-over flows, or mute behavior inconsistent.
6. Point out performance problems only when they are likely to affect frame rate, memory growth, scene restarts, or repeated asset generation.

## Commenting guidance

- Include a short reproduction path or affected scenario when possible.
- Prefer concrete fixes tied to the changed lines.
- Avoid nitpicks about generated image assets, formatting churn, or stylistic preferences unless they hide a real defect.
- If a PR is mainly asset data, review path consistency, dimensions, transparency assumptions, and whether the Phaser loader can consume the files.
