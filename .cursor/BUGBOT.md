# Bugbot Review Instructions

This repository is a first-playable dark, GBA-inspired isometric dungeon prototype built with Next.js, React, TypeScript, and Phaser. Review pull requests for concrete correctness risks first, then maintainability issues that could hide gameplay regressions.

## Project context

- The app entry points live in `src/app`, with `src/game/GameCanvas.tsx` dynamically booting Phaser on the client.
- The main gameplay loop, input handling, combat, pickups, UI overlays, and scene cleanup live in `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths and typed asset keys live in `src/game/assets/manifest.ts`.
- Static art, audio, and sprite metadata live under `public/assets`.
- Asset generation and processing scripts live under `tools` and `scripts`.

## Review priorities

1. Flag logic bugs that can break gameplay, player progression, collision, combat, spawning, pickups, scoring, audio, or scene lifecycle behavior.
2. Flag changes that weaken TypeScript strictness, bypass existing types, or introduce `any`/unsafe casts without a clear need.
3. Flag Next.js client/server boundary mistakes, especially code that touches `window`, Phaser, canvas, or browser-only APIs outside client-only paths or guarded effects.
4. Flag Phaser lifecycle leaks: missing cleanup for timers, tweens, input handlers, sounds, textures, display objects, pools, or scene shutdown/destroy hooks.
5. Flag asset drift: manifest entries that do not match files in `public/assets`, sprite dimensions that do not match metadata, or code that assumes generated assets exist without adding them.
6. Flag accessibility regressions in DOM UI such as controls without labels, keyboard access, or appropriate button semantics.
7. Flag dependency and lockfile inconsistencies when a PR changes dependencies. Do not comment on the existing dual lockfiles unless the PR changes package management or dependencies.

## Gameplay-specific checks

- Movement, collision, projectile, and enemy calculations are tile-based with isometric rendering. Check coordinate conversions and distance comparisons carefully.
- Spawn logic should keep enemies, pickups, and player starts on playable tiles and avoid unfair spawn positions near the player.
- Power-ups, ammo, seeker shots, hearts, and blast effects should respect unlock thresholds, caps, cooldowns, and cleanup behavior.
- Game-over, restart, mute, title screen, and debug-overlay paths should leave the next run in a clean state.
- Randomized dungeon generation should preserve connectivity, a valid player start, enemy starts, and reachable stairs.

## Generated assets and scripts

- Treat files under `public/assets/source` and generated sprite/audio outputs as artifacts. Flag stale or missing generated outputs only when source, manifest, or script changes imply they should be updated.
- For processing scripts, flag destructive file writes, hard-coded absolute paths, non-idempotent behavior, or assumptions that make local regeneration unreliable.
- Do not request hand edits to generated JSON or image/audio artifacts unless the PR is explicitly updating generated output.

## Comment style

- Only leave review comments for issues that are actionable and tied to the changed diff.
- Include the user-visible impact or failure mode when flagging gameplay bugs.
- Prefer concise comments with exact file, symbol, or asset references.
- Avoid purely stylistic comments when the existing pattern is consistent and the code is correct.
