# Cursor Bugbot review guidance

This repository is a first-playable Hobgoblin Ruin prototype built with Next.js,
React, TypeScript, and Phaser. Review pull requests as a browser game, not as a
static content site: small code changes can affect client-only boot, Phaser scene
lifecycle, asset loading, and frame-by-frame gameplay invariants.

## Project shape

- `src/app/layout.tsx` owns metadata and global document shell.
- `src/app/page.tsx` renders the client game container.
- `src/game/GameCanvas.tsx` is the React/Next.js boundary that dynamically loads
  Phaser and creates exactly one `Phaser.Game` instance per mounted host.
- `src/game/scenes/DungeonScene.ts` contains most runtime gameplay state,
  rendering, input handling, combat, pickups, audio, debug overlays, and cleanup.
- `src/game/maps/startingDungeon.ts` generates the room/corridor dungeon and
  defines tile blocking semantics.
- `src/game/assets/manifest.ts` is the source of truth for public asset paths,
  sprite dimensions, audio keys, and animation metadata.
- `public/assets/**` contains runtime assets. Many files are generated from
  `tools/**` or `scripts/**`; generated churn should be intentional.

## High-priority review checks

### Next.js and React boundaries

- Flag any static import of `phaser` or `DungeonScene` from a server component.
  Phaser should stay behind the `"use client"` boundary and dynamic imports in
  `GameCanvas.tsx` so SSR/builds do not touch browser-only APIs.
- Check that `GameCanvas` keeps the single-game invariant: do not create multiple
  `Phaser.Game` instances for one host, and always destroy the game on unmount.
- Verify browser globals (`window`, pointer APIs, Web Audio, canvas state) are
  only used in client-only code paths.
- Metadata image paths in `layout.tsx` must correspond to committed files under
  `public/`; currently `/opengraph-image.png` is referenced, so changes near
  metadata should confirm that asset exists or update the reference.

### Phaser scene lifecycle

- New listeners, timers, tweens, graphics, containers, audio objects, or pooled
  game objects in `DungeonScene` must be cleaned up when the scene shuts down or
  restarts.
- Check for duplicate input handlers when starting, restarting, muting, opening
  instructions, or returning from game over.
- Scene state that is reset for a new run must include related UI, audio, enemy,
  projectile, pickup, power-up, and debug overlay state.
- Avoid unbounded object creation in `update`; use existing pools or clear old
  objects when adding recurring effects.

### Gameplay invariants

- Player movement, projectile travel, enemy movement, knockback, and pickup
  collection use tile/world coordinate conversions. Changes should preserve
  isometric coordinates, depth ordering, camera follow, and collision radius math.
- `isTileBlocked`, prop blocking, chasm/bridge handling, and enemy pathing must
  agree. Flag changes where a tile is visually walkable but logically blocked,
  or vice versa.
- Enemy spawning should respect safe distance from the player and current caps
  such as `MAX_ENEMIES`, `MAX_BRUTES`, and active pickup limits.
- Ammo, seeker ammo, quickshot, haste, ward, blast, and heart pickups should
  preserve their max counts, unlock timing, rarity, and UI feedback.
- Combat changes should account for invulnerability windows, hit stop, damage
  numbers, death effects, score increments, drops, and game-over timing.
- Pointer aiming is snapped to 15-degree increments and keyboard firing is
  supported. Flag changes that make mouse, click, or Space behavior diverge
  unintentionally.

### Assets and generated files

- Every new `assetManifest` path must exist under `public/`, use the expected
  leading slash path, and match the frame dimensions used by Phaser.
- When a sprite sheet JSON is changed, verify the matching PNG layout and
  `framesPerRow`/frame dimensions are still consistent.
- Asset-generation tools should be deterministic where practical and should not
  overwrite unrelated assets.
- Review binary asset additions for necessity; prefer source/generator updates
  only when they are part of the requested game-art change.
- This repo currently has both `package-lock.json` and `pnpm-lock.yaml`. Flag
  dependency changes that update only one lockfile unless the package-manager
  decision is explicit.

### Review finding standards

- Prioritize concrete runtime bugs, SSR/build regressions, asset 404s,
  lifecycle leaks, broken input, gameplay invariant violations, and missing
  verification for risky behavior.
- Do not request broad architecture rewrites of `DungeonScene.ts` unless the PR
  already touches the relevant area and the issue creates a real bug or review
  blocker.
- For visual/gameplay changes, ask for a short manual smoke test description if
  automated coverage is absent.
- Treat generated `next-env.d.ts` edits from local builds as noise unless the
  TypeScript/Next.js configuration intentionally changed.

## Suggested verification

Run the narrowest useful checks for the files changed, and prefer these baseline
commands when dependencies are available:

```bash
npm ci
npm run build
git diff --check
```

If a PR changes generated assets or scripts, also run the relevant generator or
processor command documented in `package.json`, `README.md`, or the changed tool.
