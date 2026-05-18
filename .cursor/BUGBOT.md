# Cursor Bugbot review rules

Use these repository-specific checks when reviewing pull requests.

## Project context

- This is a Next.js web prototype that boots a Phaser dungeon scene from `src/game/GameCanvas.tsx`.
- Phaser code must remain client-only. Avoid importing Phaser from server components or code that runs during SSR.
- `src/game/scenes/DungeonScene.ts` owns most gameplay behavior: movement, map rendering, combat, enemies, pickups, HUD, audio, and debug overlays.
- Runtime assets are listed in `src/game/assets/manifest.ts` and served from `public/assets`.

## Review focus

- Flag changes that can create duplicate Phaser game instances, leak scenes, or leave event listeners/timers active after `GameCanvas` unmounts.
- Check that new assets update both the manifest and committed `public/assets` files, including matching sprite dimensions and metadata paths.
- Question generated asset churn unless it is directly required by the PR; large binary or generated changes should be intentional and documented.
- Verify map, collision, spawn, pickup, and projectile changes preserve tile-coordinate invariants and keep blocked tiles unwalkable.
- Watch for gameplay constants or progression gates that make ammo, health, powerups, enemies, or difficulty impossible to recover from.
- Prefer explicit TypeScript types for gameplay data structures and avoid broad `any` casts around Phaser objects.
- Keep React entry components small and accessible; preserve the fullscreen game shell behavior.
- Treat audio changes carefully: preserve the scene-level mute toggle and avoid autoplay behavior that bypasses user interaction requirements.

## Verification expectations

- Run `npm run build` for production validation.
- If linting is available in the current Next.js setup, run `npm run lint` and report any toolchain limitations separately from code issues.
