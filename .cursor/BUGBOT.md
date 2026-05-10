# Bugbot review guidelines

This repository is a Next.js App Router prototype that embeds a Phaser 4
isometric dungeon game. Please focus reviews on correctness, runtime safety, and
gameplay regressions over stylistic preferences.

## Project context

- The browser entrypoint is `src/app/page.tsx`, which renders the client-only
  `src/game/GameCanvas.tsx` component.
- Phaser is dynamically imported in `GameCanvas` to avoid server-side rendering
  failures. Flag changes that import Phaser or browser globals from server
  components or module top level in a way that can break SSR/builds.
- Most gameplay logic lives in `src/game/scenes/DungeonScene.ts`; map generation
  is in `src/game/maps/startingDungeon.ts`; asset paths and frame metadata are in
  `src/game/assets/manifest.ts`.
- Static assets live under `public/assets`. Generated source sheets and processed
  sprite metadata should stay in sync with the manifest and with any processing
  scripts under `tools/` and `scripts/`.

## Review priorities

1. Correctness bugs that can break the game loop, scene lifecycle, map
   generation, enemy behavior, combat, pickups, collision, audio, or UI overlays.
2. SSR/client-boundary issues in Next.js, especially use of `window`, `document`,
   `Phaser`, timers, or asset loading outside client-safe code paths.
3. TypeScript contract drift between asset manifests, generated JSON metadata,
   Phaser animation frame dimensions, and code that indexes those assets.
4. Resource lifecycle issues: duplicated Phaser game instances, leaked listeners,
   un-cleared timers, orphaned tweens, stale scene references, or objects that are
   not destroyed when restarting/unmounting.
5. Gameplay state regressions: health/ammo bounds, invulnerability windows,
   cooldowns, spawn rates, pathfinding limits, score updates, power-up timers, and
   game-over/restart transitions.
6. Accessibility and input regressions for the start screen, keyboard controls,
   mute control, and restart flow.

## Testing and verification expectations

- This repo defines `npm run build` and `npm run lint`; run them for app-level
  changes unless the pull request intentionally changes those scripts.
- If a verification script is unavailable or incompatible with the installed
  Next.js version, call that out explicitly instead of treating it as a code
  failure.
- For asset or script changes, verify the corresponding processing/generation
  command from `package.json` when practical.
- For gameplay changes, look for deterministic edge cases that can be checked by
  reading code even when no automated gameplay test exists.

## Things to avoid flagging

- Do not request broad refactors of `DungeonScene.ts` unless the changed lines
  introduce a concrete bug or make a nearby bug materially harder to fix.
- Do not flag generated or binary assets for style. Only flag asset changes when
  paths, dimensions, metadata, transparency, or manifest references appear wrong.
- Keep suggestions scoped to the pull request diff. Prefer actionable findings
  with file paths and exact failure modes.
