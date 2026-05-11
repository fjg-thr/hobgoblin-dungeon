# Cursor Bugbot Review Guidance

## Project context

- This repository is a Next.js/React/TypeScript prototype for a full-screen Phaser dungeon game.
- The browser game starts in `src/game/GameCanvas.tsx`, which is a client component that dynamically imports `phaser` and `src/game/scenes/DungeonScene.ts` inside `useEffect`.
- `DungeonScene.ts` owns most gameplay state: generated dungeon rendering, isometric movement/collision, enemies, projectiles, ammo, seeker ammo, power-ups, hearts, HUD, audio, and the title/game-over overlays.
- Runtime assets live under `public/assets/**` and are referenced through `src/game/assets/manifest.ts`.

## High-priority review checks

1. **Preserve the Next.js client/server boundary.**
   - Keep Phaser and `DungeonScene` imports out of server-rendered app files such as `src/app/layout.tsx` and `src/app/page.tsx`.
   - If game boot changes, verify it remains guarded by the client component lifecycle and cleans up with `game.destroy(true)`.
   - Browser-only APIs such as `window`, `localStorage`, Phaser input, sound, and canvas sizing should stay inside client-only code paths.

2. **Protect scene lifecycle and object cleanup.**
   - New sprites, graphics, zones, tweens, sounds, and input listeners should be destroyed or unsubscribed when no longer used or during scene shutdown/restart.
   - Reuse the existing capped pools and limits where possible (`DAMAGE_NUMBER_POOL_LIMIT`, `COMBAT_EFFECT_POOL_LIMIT`, `HASTE_AFTERIMAGE_POOL_LIMIT`, `MAX_ENEMIES`, `MAX_ACTIVE_*`).
   - Watch for unbounded spawning, looping tweens on collected objects, or arrays that retain destroyed Phaser objects.

3. **Check isometric coordinate, collision, and depth invariants.**
   - Tile/world conversions, collision checks, prop blocking, and pathfinding should continue to use the helpers and tile codes in `src/game/maps/startingDungeon.ts`.
   - Render depth should remain based on tile position via the scene depth helpers so actors, props, walls, pickups, and effects sort correctly.
   - F3 debug rendering should still match collision and tile-coordinate behavior after map or movement changes.

4. **Review gameplay resource rules carefully.**
   - Standard ammo is finite, seeker ammo unlocks later, and pointer/keyboard fire flows should respect cooldown, ammo, game-start, game-over, and player-death state.
   - Current code wires Space and pointer click for firing; do not assume README-mentioned keys are implemented without checking `createInput`.
   - Power-up rarity, enemy/brute unlocks, safe spawn distance, pickup caps, and heart drop limits are balance-sensitive and should not become bypassable through restarts or scene resets.

5. **Validate asset and manifest changes together.**
   - Any asset added to gameplay should have a matching `public/assets/**` file and `assetManifest` entry with correct frame dimensions, key names, and metadata JSON paths.
   - Pixel-art rendering depends on nearest-neighbor-friendly assets and the global canvas/image-rendering settings in `src/app/globals.css`.
   - Generated asset sources and processing scripts should not be required at runtime.

6. **Keep audio and preferences safe in browsers.**
   - Respect `this.sound.locked`, mute state, and the `"hobgoblin-dungeon-muted"` localStorage preference.
   - Mute/HUD controls use Phaser zones with fixed scroll factor and UI scaling; verify they still work after camera or resize changes.

7. **Next.js metadata and public files must agree.**
   - `src/app/layout.tsx` references `/opengraph-image.png`; if metadata changes, confirm the referenced public asset exists.
   - Environment-derived URLs should continue to handle `NEXT_PUBLIC_SITE_URL`, `VERCEL_URL`, and local development.

## Verification guidance

- Prefer `npm ci` before verification when dependencies may not be installed.
- Run `npm run build` for functional verification; the installed Next.js version may reject the legacy `next lint` script unless the script is updated.
- If `next-env.d.ts` changes only because of a local build, revert that generated churn before committing.
- Run `git diff --check` on the Bugbot guidance or implementation commit range to catch whitespace errors.
- There is no dedicated automated gameplay test suite in this repo, so risky scene changes should also include a brief manual browser check of start, movement, firing, pickups, enemy damage, mute, restart, resize, and F3 debug behavior when possible.
