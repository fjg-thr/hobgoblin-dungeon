# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. Prioritize issues that can break the playable prototype, regress browser/runtime behavior, or make future asset iteration unsafe.

## Project context

- This is a private Next.js app that renders a Phaser-based, GBA-inspired isometric dungeon prototype.
- The main React entry points are `src/app/page.tsx`, `src/app/layout.tsx`, and `src/game/GameCanvas.tsx`.
- Most gameplay, UI overlays, combat, spawning, input, audio, and Phaser object lifecycle code lives in `src/game/scenes/DungeonScene.ts`.
- Map generation and collision helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset metadata lives in `src/game/assets/manifest.ts` and matching JSON/PNG/WAV files under `public/assets`.
- The `tools/` and `scripts/` directories contain local asset-processing and audio-generation utilities. Treat generated assets and manifests as coupled changes.

## High-priority review areas

### Phaser lifecycle and browser safety

- Flag browser-only code that can run during server rendering. Phaser imports should stay behind client-only boundaries or dynamic imports unless the caller is already client-only.
- Check that Phaser game objects, tweens, timers, keyboard listeners, pointer listeners, audio objects, and pooled effects are destroyed or cleaned up when scenes restart or React unmounts.
- Watch for scene state that survives a restart unexpectedly, especially arrays of enemies, projectiles, pickups, transient effects, and input state.
- Verify camera, resize, and pixel-art settings still preserve full-screen play and crisp rendering.

### Gameplay correctness

- Review changes to coordinate conversion, isometric tile math, depth sorting, collision boxes, and pathfinding carefully. Small math changes can make actors appear misaligned, clip through walls, or render in the wrong order.
- Check player/enemy health, invulnerability, knockback, hit stop, projectile lifetime, ammo counts, score, pickups, and power-up timers for off-by-one or stale-state bugs.
- Flag spawn logic that can place enemies, ammo, hearts, power-ups, or props inside blocked tiles, too close to the player, or outside the generated map.
- For enemy AI, verify path recalculation, direct-line checks, respawn timing, and brute/unlock thresholds remain bounded and do not create unbounded work each frame.
- For input changes, ensure keyboard, mouse, and click-to-fire behavior remain consistent with the controls documented in `README.md`.

### Assets and manifests

- Manifest keys, frame dimensions, JSON atlas data, and files in `public/assets` must stay synchronized. Flag missing files, renamed keys without corresponding code updates, or frame counts that no longer match animation setup.
- Generated or processed assets should not introduce unnecessary source churn. Large binary changes should have a clear reason and matching metadata updates.
- Audio additions should respect the scene-level mute toggle and browser autoplay constraints.

### Next.js, React, and TypeScript

- Preserve `GameCanvas` as a client component. Avoid direct Phaser usage in server components.
- Prefer precise TypeScript types for gameplay data structures and asset keys. Do not replace existing typed unions with broad `string` or `any` types unless there is a clear need.
- Watch for async boot races in React effects: dynamic imports should not instantiate a Phaser game after unmount or create duplicate games.
- Keep UI markup accessible where React-rendered controls are involved. Phaser-only UI should still support the documented keyboard controls when practical.

### Performance and stability

- Be skeptical of per-frame allocations, repeated pathfinding over large areas, unbounded arrays, or tweens/timers created every update tick.
- Review object pools and cleanup limits for damage numbers, combat effects, particles, projectiles, enemies, and pickups.
- Flag changes that increase bundle size or load all generated assets eagerly without a gameplay reason.

## Testing expectations

- For code changes, prefer at least a TypeScript/build check when the environment supports Node.js.
- If Node.js is unavailable in the agent environment, note that verification could not be run locally instead of inventing results.
- For gameplay changes, manual browser playtesting is valuable: start screen, movement, firing, enemy damage, pickups, power-ups, death/game-over, restart, mute toggle, and debug overlay are key flows.

## Repository-specific review style

- Lead with concrete bugs or regressions, including file and line references.
- Avoid blocking on stylistic preferences unless they create maintainability risk in the large `DungeonScene.ts` gameplay surface.
- Prefer small, actionable findings over broad refactor requests.
- Call out missing tests only when the touched logic is non-trivial or affects shared gameplay contracts.
