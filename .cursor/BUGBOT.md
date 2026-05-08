# Bugbot review rules

Review this repository as a Next.js App Router project that hosts a client-only Phaser game prototype.

## Primary review priorities

- Prioritize correctness, runtime regressions, race conditions, resource leaks, security issues, and changes that can break production builds.
- Treat missing validation, stale state, accidental browser/server boundary changes, asset mismatches, and input/lifecycle bugs as higher priority than style preferences.
- Avoid flagging documented prototype limitations from `README.md` unless a change makes them worse or contradicts existing behavior.

## Next.js and React boundaries

- `src/app/page.tsx` should stay a thin route that renders the game client.
- Browser-only APIs, Phaser imports, DOM access, timers, audio, and pointer/keyboard input should remain behind `"use client"` boundaries or dynamic client-side imports.
- Changes to `src/game/GameCanvas.tsx` need extra scrutiny for React Strict Mode double-invocation, duplicate `Phaser.Game` instances, cancelled async imports, and `destroy(true)` cleanup.

## Phaser scene review focus

- Review changes to `src/game/scenes/DungeonScene.ts` carefully because it owns combat, input, UI, audio, spawning, progression, and frame updates.
- Check frame-time handling, cooldowns, object pools, collision checks, spawn timers, power-up state, health/ammo state, and scene shutdown hooks for subtle regressions.
- Flag code that leaves active tweens, timers, sounds, keyboard handlers, pointer handlers, or pooled game objects alive after scene shutdown.

## Assets and manifest consistency

- Cross-check edits to `src/game/assets/manifest.ts` against files and JSON metadata under `public/assets/`.
- New or renamed sprite sheets must keep path names, frame sizes, animation keys, and typed manifest unions consistent with their runtime usage.
- Asset-processing scripts in `tools/` should keep repo-root path assumptions explicit and should not silently overwrite unrelated assets.

## Map, tiles, and collision

- For changes under `src/game/maps/`, verify that rendered tile assets, `TileCode` values, `tileAssetForCode`, `getTileCode`, and `isTileBlocked` stay mutually consistent.
- Review map layout or collision edits for places where props, walls, corridors, enemy movement, and player movement can desync.

## Dependencies and verification

- Be cautious with dependency changes because `package.json` uses `latest` for Next, React, and TypeScript, and Phaser is on a release candidate.
- Flag drift between `package-lock.json` and `pnpm-lock.yaml` when package metadata changes.
- For non-trivial TypeScript, React, Phaser, or asset-manifest changes, expect at least `npm run build` evidence unless the PR explains why it cannot run.
