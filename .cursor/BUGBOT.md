# Bugbot Review Instructions

Review this repository as a strict TypeScript Next.js game prototype that embeds a Phaser runtime.

Prioritize findings that can cause shipped regressions:

- Next.js client boundaries: `src/game/GameCanvas.tsx` and other Phaser-facing React code must stay client-only and must not touch `window`, `document`, audio, canvas, or Phaser APIs during server rendering.
- Phaser lifecycle safety: scene changes in `src/game/scenes/DungeonScene.ts` should avoid leaking timers, tweens, physics objects, keyboard/mouse handlers, audio nodes, or DOM/canvas references after shutdown, restart, or game-over flows.
- Gameplay correctness: review movement, collision, enemy spawning, projectiles, pickups, scoring, health, ammo, power-up durations, and restart behavior for state bugs and frame-rate-dependent logic.
- Asset contracts: changes to `public/assets/**`, `src/game/assets/manifest.ts`, or map data must keep sprite-sheet frame names, dimensions, JSON metadata, and preload keys in sync.
- TypeScript strictness: do not allow `any`, unsafe casts, nullable state misuse, or ignored promises unless the code has a clear, local reason.
- React UI accessibility: any DOM controls added outside the Phaser canvas should have keyboard access, labels, and visible/focusable states.
- Performance risks: flag unbounded per-frame allocation, repeated asset loads, excessive collision scans, and work inside update loops that scales with all entities when a narrower set would do.
- Generated assets and tools: asset-processing scripts in `tools/` should be deterministic, avoid hard-coded absolute paths, and preserve transparent/chroma-key output assumptions documented in `README.md` and `ASSET_PROMPTS.md`.

When reviewing, include concrete reproduction or failure scenarios whenever possible. Prefer high-signal bug findings over style-only comments.
