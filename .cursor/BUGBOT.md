# Bugbot review guide

Review this repository as a strict TypeScript Next.js game prototype built with
React and Phaser. Prioritize findings that could cause runtime failures,
regressions in gameplay behavior, or broken asset loading.

## Project context

- The browser entry point is `src/game/GameCanvas.tsx`; Phaser must stay
  client-only and should not be imported from server-rendered code paths.
- Most gameplay logic lives in `src/game/scenes/DungeonScene.ts`. Changes there
  can affect combat, pickups, collision, spawning, camera behavior, UI overlays,
  and audio state.
- Asset paths and frame names are coordinated between `src/game/assets/manifest.ts`
  and files under `public/assets`. Flag missing files, mismatched keys, or frame
  names that would fail at preload or animation creation time.
- Dungeon generation and collision helpers live in `src/game/maps/startingDungeon.ts`.
  Treat coordinate conversion, blocked-tile checks, and prop collision changes as
  high risk.

## Review priorities

1. Identify defects that would break `npm run build` or strict TypeScript
   compilation.
2. Catch client/server boundary mistakes in Next.js, especially direct browser or
   Phaser access outside client components or dynamic imports.
3. Check that gameplay state changes preserve invariants such as finite health,
   finite ammo, projectile cleanup, enemy respawn timing, and power-up expiry.
4. Verify asset changes include all referenced JSON/PNG/audio files and keep
   manifest keys consistent with preload and animation usage.
5. Surface accessibility regressions in React UI controls, including keyboard
   support and descriptive labels for interactive elements.

Keep comments focused on concrete bugs with a reproducible failure path. Avoid
style-only suggestions unless they hide a correctness, maintainability, or
reviewability issue.
