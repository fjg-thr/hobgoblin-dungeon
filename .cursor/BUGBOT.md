# Bugbot Review Guidelines

This repository is a first-playable dark GBA-inspired isometric dungeon prototype built with Next.js, React, TypeScript, and Phaser. Keep review comments focused on likely regressions and production-impacting issues.

## Review priorities

- Gameplay correctness: movement, isometric coordinate conversion, collision checks, projectile behavior, enemy spawning/pathing, power-up effects, ammo, health, scoring, start/game-over states, and debug overlay gating.
- Phaser lifecycle in React/Next.js: client-only boundaries, dynamic imports, cleanup in React effects, duplicate game instance prevention, resize handling, pixel-art rendering settings, and browser API access during SSR.
- Per-frame performance: avoid unnecessary allocations, unbounded timers/listeners/tweens, pathfinding spikes, and object growth in update loops.
- Asset/data consistency: verify manifest keys, sprite-sheet JSON, frame dimensions, audio manifest entries, and generated asset outputs stay aligned with files under `public/assets`.
- Input and audio behavior: check keyboard, pointer, interactive zones, mute state, and browser audio-unlock flows for regressions.
- Type safety and maintainability: preserve strict TypeScript, descriptive names, early returns, and existing module boundaries.

## Project context

- The primary game logic lives in `src/game/scenes/DungeonScene.ts`.
- The React/Next.js integration point is `src/game/GameCanvas.tsx`.
- Dungeon map generation and collision helpers live in `src/game/maps/startingDungeon.ts`.
- Asset keys are centralized in `src/game/assets/manifest.ts`.
- Generated and processed assets live under `public/assets`; asset generation scripts live in `tools/`.

## Avoid low-value findings

- Do not request broad rewrites or architecture migrations unless a concrete defect or regression risk is demonstrated.
- Do not flag README-listed prototype limitations as bugs unless a change makes an existing behavior worse.
- Do not ask for custom UI components when existing framework or project patterns already fit the change.
- Prefer actionable comments with a reproducible scenario, affected file/line, and suggested fix.

## Verification expectations

When reviewing changes, look for evidence from at least one relevant command such as:

```bash
npm run build
```

For gameplay changes, also prefer a manual browser check covering the affected interaction, since many Phaser regressions only appear at runtime.
