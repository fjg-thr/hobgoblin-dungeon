# Bugbot Review Guide

This repository is a Next.js App Router prototype for a Phaser-based isometric dungeon game. Review pull requests for high-confidence defects that can affect runtime behavior, asset loading, gameplay correctness, or deployment.

## Project context

- The app shell lives in `src/app/`.
- Phaser is booted from the client-only `src/game/GameCanvas.tsx` component.
- Most gameplay logic is in `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths and sprite metadata are centralized in `src/game/assets/manifest.ts` and must match files under `public/assets/`.
- The README documents npm-based setup; `package-lock.json` is the primary lockfile.

## Review priorities

1. **Client/server boundaries**
   - Flag direct `window`, `document`, Phaser, or browser API usage from server components or module scope that can execute during Next.js server rendering.
   - Ensure Phaser imports remain client-safe and game boot code handles async cancellation and React unmounts.

2. **Phaser lifecycle and cleanup**
   - Flag scene, input, timer, tween, audio, event, or DOM listeners that can survive scene restart or component unmount.
   - Watch for object pools, sprites, graphics, particles, sounds, and arrays that grow without cleanup during repeated play sessions.

3. **Gameplay invariants**
   - Check tile/world coordinate conversions, isometric depth ordering, collision bounds, safe spawn distances, pickup caps, health caps, ammo caps, cooldowns, and invulnerability windows for off-by-one or stale-state bugs.
   - Verify destroyed enemies, projectiles, pickups, effects, and UI elements are removed from all owning collections.

4. **Asset and manifest consistency**
   - Manifest entries must point to existing files in `public/assets/`.
   - Frame sizes, row counts, animation keys, audio keys, and metadata paths must agree with the generated sprite-sheet JSON files.
   - Flag case-sensitive path mismatches that may work locally but fail on Linux or Vercel.

5. **Performance in the game loop**
   - Pay close attention to allocations inside `update`, per-frame pathfinding, unbounded random searches, repeated texture creation, excessive text/graphics creation, and high-frequency audio playback.
   - Prefer findings tied to measurable or likely frame-rate impact over general style suggestions.

6. **Package and deployment safety**
   - Dependency changes should update `package-lock.json` consistently with `package.json`.
   - Do not require `pnpm-lock.yaml` changes unless a PR intentionally switches package-manager workflows.
   - For source changes, expect `npm run build` to be run or explain why it was not possible.

## Finding style

- Prioritize concrete bugs and regressions over cosmetic style issues.
- Use file and line references whenever possible.
- Treat missing tests as important when logic is extracted or changed in a testable module; this prototype currently has no established test suite, so suggest focused coverage rather than broad rewrites.
- Avoid blocking comments for speculative architecture concerns unless they are likely to produce a user-visible defect.
