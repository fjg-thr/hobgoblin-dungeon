# Cursor Bugbot Review Guidance

Use this file as repository-specific context when reviewing pull requests for the Hobgoblin Ruin prototype.

## Project shape

- This is a Next.js app that renders a single Phaser game canvas from `src/app/page.tsx`.
- `src/game/GameCanvas.tsx` is a client component and dynamically imports both `phaser` and `DungeonScene` so browser-only APIs do not run during server rendering.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; map generation and tile semantics live in `src/game/maps/startingDungeon.ts`; asset paths and frame sizes live in `src/game/assets/manifest.ts`.
- Runtime assets are expected under `public/assets/**`. Source and processing scripts in `tools/**` and `scripts/**` can regenerate many assets, but generated file churn should be intentional.

## High-priority review areas

### Next.js and React boundaries

- Flag Phaser imports from server components, metadata/layout modules, or modules statically imported by server-rendered code. Phaser imports are expected inside client-only or dynamically imported game modules.
- Flag `window`, `document`, canvas, audio, or input API access outside a client-only boundary.
- `GameCanvas` must keep one Phaser game instance per host element, guard cancelled async boots, and destroy the game on unmount. Watch for duplicate game instances under React strict mode.
- Keep full-viewport layout behavior in sync between `src/app/page.tsx`, `src/app/globals.css`, and Phaser scale settings.

### Phaser scene lifecycle

- Event listeners, timers, tweens, input handlers, audio objects, containers, and masks created by `DungeonScene` need matching cleanup or restart-safe ownership.
- Be skeptical of changes to start, how-to-play, game-over, restart, mute, and debug flows because they add global input handlers and overlay objects.
- Check that new animations use unique keys or intentionally reuse existing keys; duplicate animation creation can throw or produce cross-run state leaks.
- Preserve explicit pool limits for recurring combat effects, damage numbers, and afterimages; active caps for enemies and pickups; and cleanup, range, cooldown, and ammo constraints for projectiles.

### Gameplay invariants

- Tile collision depends on `isTileBlocked`: empty space, walls, and chasms are blocked; bridge tiles are playable. Map edits must preserve player, enemy, pickup, and projectile collision expectations.
- Coordinate conversion between tile space and isometric world space must stay consistent with `ISO_TILE_WIDTH`, `ISO_TILE_HEIGHT`, `MAP_OFFSET_X`, and `MAP_OFFSET_Y`.
- Enemy spawns should respect safe distance from the player, max enemy/brute caps, unlock thresholds, and respawn timing.
- Combat changes should preserve finite ammo, seeker ammo limits, projectile cooldown/range, blast damage/radius, hit stop, invulnerability windows, and score/health updates.
- Power-up and heart/ammo pickup changes should keep rarity gates, active pickup caps, safe spawn distances, and pickup radii coherent.
- Current implementation binds movement to WASD/arrows, firing to Space and pointer click, Escape for modal dismissal, and F3 for debug. If docs or UI mention an extra key such as `J`, verify the key is actually bound or request a docs/UI correction.

### Asset and manifest consistency

- Every path added to `assetManifest` must exist under `public/`, use the declared frame size, and have animation frame ranges that fit the sheet.
- Keep asset metadata JSON, README asset lists, and generation scripts aligned when adding or replacing spritesheets or audio.
- Do not accept unrelated generated source images, lockfile rewrites, `.next`, or `next-env.d.ts` churn unless the PR explicitly requires them.
- This repo has both `package-lock.json` and `pnpm-lock.yaml`; dependency changes should keep lockfiles intentionally synchronized or explain the package-manager decision.

### Metadata and deploy surface

- `src/app/layout.tsx` references `/opengraph-image.png` for OpenGraph/Twitter cards. If social metadata is changed, verify the referenced file exists in `public/` and has the declared dimensions.
- Environment-derived URLs should continue to prefer `NEXT_PUBLIC_SITE_URL`, then `VERCEL_URL`, then local development defaults.

## Finding standards

- Prioritize concrete bugs, regressions, missing cleanup, asset path mismatches, broken controls, and verification gaps over broad style preferences.
- Include exact file and line references, the user-visible impact, and a minimal reproduction or reasoning path.
- Avoid requesting large refactors unless the current change introduces a real correctness or maintainability risk.

## Suggested local verification

Run these checks for gameplay, asset, or metadata changes when the environment supports Node:

```bash
npm ci
npm run build
git diff --check
```

`npm run build` is the main compile/type/Next.js integration check. Run narrower asset generation commands only when reviewing the corresponding generated assets.
