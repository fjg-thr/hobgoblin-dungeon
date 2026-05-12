# Bugbot Review Guidelines

This repository is a playable Next.js + Phaser prototype for a dark isometric dungeon game. Review changes for defects that would break gameplay, rendering, asset loading, or deployment.

## Project context

- The app router entry point is `src/app/page.tsx`; the game mounts through `src/game/GameCanvas.tsx`.
- Phaser must remain client-only. Keep browser-only and Phaser imports out of server components unless they are dynamically imported from a `"use client"` boundary.
- Most gameplay lives in `src/game/scenes/DungeonScene.ts`; map generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Asset paths and metadata are centralized in `src/game/assets/manifest.ts` and loaded from `public/assets`.
- The project uses strict TypeScript and should build cleanly with `npm run build`.

## Review priorities

1. Flag runtime crashes caused by SSR/client boundary mistakes, undefined Phaser objects, stale scene state, or missing cleanup in React effects.
2. Check gameplay changes for broken invariants: tile/world coordinate conversion, collision bounds, enemy/player health, projectile lifetime, pickup spawning, score/ammo updates, and pause/start/game-over state transitions.
3. Verify asset changes keep manifest entries, JSON metadata, sprite dimensions, animation frame counts, and `public/assets` paths in sync.
4. Watch for performance regressions in the main Phaser update loop, especially per-frame allocations, unbounded arrays, timers/events that are not cleaned up, and expensive pathfinding or rendering work.
5. Treat generated asset-processing scripts as build tooling. Confirm file paths, output dimensions, alpha/chroma-key handling, and idempotent writes when those scripts change.
6. Prefer small, type-safe changes that follow the existing style: early returns, descriptive constants, and no broad refactors unrelated to the pull request.

## Testing expectations

- For TypeScript or gameplay logic changes, expect `npm run build` at minimum.
- For map generation or helper logic, prefer focused tests or deterministic checks where practical.
- For asset or tool changes, confirm the relevant generator or processing command was run when outputs are committed.
