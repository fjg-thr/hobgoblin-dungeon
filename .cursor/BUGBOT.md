# Bugbot Review Guide

Use this repository-specific guidance when reviewing changes in this Next.js and Phaser game prototype.

## Project context

- The app is a full-screen Next.js page that mounts a Phaser game client-side through `src/game/GameCanvas.tsx`.
- Core gameplay, UI overlays, audio, enemy behavior, pickups, and combat effects are concentrated in `src/game/scenes/DungeonScene.ts`.
- Map generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths and sprite metadata assumptions are centralized in `src/game/assets/manifest.ts`.
- Generated and processed art/audio assets live under `public/assets`; many JSON manifests must stay in sync with their corresponding PNG or WAV files.

## Review priorities

1. Flag regressions that can break client-only Phaser boot in Next.js, including accidental server-side `window`/Phaser access or missing cleanup of the Phaser game instance.
2. Check gameplay changes for deterministic state handling across restart/game-over flows: timers, active arrays, pooled effects, input listeners, tweens, and audio loops should be reset or destroyed.
3. Validate collision, tile, and world-coordinate changes against the isometric grid helpers so actors cannot pass through blocked tiles or spawn in unreachable/unsafe positions.
4. Scrutinize edits to projectile, enemy, pickup, and power-up logic for leaks in arrays, stale references, invalid cooldowns, negative ammo/health, or effects that can stack indefinitely.
5. Ensure asset additions update `assetManifest` and matching metadata dimensions/frame counts; missing public assets should be treated as release-blocking.
6. For UI/HUD or input changes, check keyboard, pointer, resize, and mute behavior on repeat mounts and browser resizes.
7. Prefer small, typed TypeScript changes that match the existing Phaser scene style; avoid broad refactors unless they directly reduce risk.

## Verification expectations

- Run `npm run build` when Node/npm are available.
- If build tooling is unavailable in the agent environment, note that explicitly and still review static TypeScript and asset manifest consistency.
- For gameplay-affecting PRs, include a manual smoke test path: boot the game, start a run, move, fire, collect ammo/powerups, take damage, die, restart, and toggle sound.
