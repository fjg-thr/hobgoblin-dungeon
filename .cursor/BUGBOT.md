# Cursor Bugbot Review Guide

Review pull requests as a high-signal correctness reviewer for this Next.js and Phaser dungeon prototype. Focus on issues that can break gameplay, builds, assets, or player-facing behavior.

## Project context

- The app is a Next.js project that renders a Phaser game from `src/game/GameCanvas.tsx`.
- `src/game/scenes/DungeonScene.ts` owns most runtime gameplay state, scene lifecycle, input, generated dungeon rooms, combat, UI overlays, audio, and debug drawing.
- Asset manifests live under `src/game/assets/manifest.ts` and `public/assets/**`. Sprite sheets usually have paired JSON metadata.
- Build and test commands:
  - `npm run build`
  - `npm run test`

## What to prioritize

- Runtime crashes caused by missing asset keys, malformed sprite metadata, undefined Phaser objects, or stale scene references.
- Next.js client/server boundary mistakes, especially importing Phaser or browser-only APIs outside client-only code paths.
- Scene lifecycle leaks: duplicated event handlers, timers, tweens, sounds, DOM listeners, or Phaser objects that survive scene restart/destroy.
- Gameplay regressions in collision, movement, aiming, firing, enemy spawning, pickups, health, scoring, mute state, or game-over/restart flows.
- Performance problems in per-frame code, especially allocations or asset work inside `update`.
- Changes that modify map generation, coordinates, or camera math without preserving isometric projection assumptions.
- Missing tests or verification for scripts and deployment helpers.

## What to avoid

- Do not block PRs for stylistic preferences, naming nits, or subjective pixel-art direction unless they create a concrete defect.
- Do not request broad refactors of `DungeonScene.ts` unless the changed lines introduce a specific bug or make an existing bug likely.
- Do not duplicate findings already discussed in the PR comments.

## Review tone

- Leave concise inline comments only where there is a clear, actionable issue.
- Include the failure mode and a suggested fix when practical.
- If a finding depends on a command, mention the exact command and relevant output.
