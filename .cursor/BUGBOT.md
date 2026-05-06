# Bugbot Review Guide

Use this guidance when reviewing changes in this repository.

## Project context

- This is a Next.js app that boots a Phaser 4 game prototype from `src/game/GameCanvas.tsx`.
- Most gameplay behavior is concentrated in `src/game/scenes/DungeonScene.ts`.
- Static gameplay assets and JSON sprite metadata live under `public/assets`.
- Asset generation and processing scripts live under `tools` and `scripts`.

## Review priorities

1. Flag changes that can break the browser-only Phaser boot path. `GameCanvas` must stay a client component, and Phaser should continue to be loaded dynamically so Next.js server rendering does not import browser-only APIs.
2. Check gameplay math carefully in `DungeonScene.ts`, especially tile/world coordinate conversion, collision boxes, projectile ranges, spawn safety checks, health/ammo updates, timers, and depth ordering.
3. Verify asset manifest changes match files that actually exist in `public/assets`, including sprite sheet frame dimensions, row/column counts, and animation key usage.
4. Watch for Phaser object lifecycle leaks. Created sprites, images, text, tweens, timers, keyboard handlers, and input zones should be destroyed, removed, or reused when scenes restart or objects despawn.
5. Keep generated asset artifacts consistent. If a script changes generated output, the corresponding committed JSON/PNG/audio assets should be updated intentionally.
6. Prefer focused TypeScript fixes over broad rewrites. This prototype has large game-scene code, so review for localized changes that preserve existing behavior unless a larger refactor is explicitly part of the change.
7. Flag package-manager drift. The repository currently contains both `package-lock.json` and `pnpm-lock.yaml`; dependency changes should update the lockfile the change intentionally uses and avoid accidental churn in the other.

## Verification expectations

- For TypeScript or gameplay code changes, expect `npm run build` when Node/npm are available.
- For asset-processing script changes, expect the relevant `npm run process:*` or `npm run generate:*` command and a review of generated diffs.
- For large gameplay edits, ask for manual browser verification of startup, movement, firing, enemy spawning, pickup collection, game over/restart, mute toggle, and debug overlay.
