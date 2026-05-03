# Bugbot review guide

Review this repository as a Next.js App Router game prototype that runs Phaser in the
browser. Prioritize concrete bugs, regressions, and missing verification over broad
style advice.

## Project context

- The game shell is a React/Next.js app under `src/app` and `src/game`.
- Phaser must stay behind client-only boundaries. Do not allow server components,
  layouts, or build-time code to import Phaser directly.
- Gameplay is concentrated in `src/game/scenes/DungeonScene.ts`; changes there can
  affect movement, collision, rendering order, scoring, pickups, audio, and input.
- Asset metadata is stored in JSON files under `public/assets/**` and is referenced
  from `src/game/assets/manifest.ts`.
- Asset generation and processing scripts live under `tools/` and `scripts/`.

## What to flag

- Changes that can break `npm run build` or TypeScript type checking.
- Direct Phaser imports from server-rendered Next.js files. Phaser should be loaded
  from client components or scene modules that are dynamically imported by client code.
- Asset manifest or sprite-sheet JSON changes that do not match the expected texture
  keys, frame names, dimensions, row/column counts, or file paths used by the scene.
- Gameplay changes that mutate actor arrays while iterating without accounting for
  skipped items, stale references, or destroyed Phaser game objects.
- Timing logic that mixes wall-clock time, Phaser scene time, and frame deltas in a
  way that makes movement, cooldowns, spawns, or animation rates frame-rate dependent.
- Collision, pathfinding, or map-generation changes that let actors spawn or move
  into blocked tiles, outside the map, or into unreachable states.
- Input changes that drop keyboard controls, pointer aiming, click-to-fire behavior,
  mute toggling, restart controls, or debug-overlay access without an intentional
  replacement.
- Audio changes that can start duplicate loops, ignore the mute state, or fail to
  clean up scene-owned sound objects when restarting.
- UI or HUD changes that make text unreadable over the game scene, hide critical
  ammo/life/score state, or fail at common viewport sizes.
- Generated or binary asset updates that are not accompanied by the manifest or
  processing-script changes needed to reproduce and load them.

## Verification expectations

- For TypeScript or gameplay code changes, expect the PR to run `npm run build`.
- For asset or manifest changes, expect a smoke check that the game boots and loads
  the changed assets without missing-texture placeholders or console errors.
- For tool/script changes, expect the relevant `node` or `python3` command to be run
  and documented in the PR.
- If local verification is unavailable, ask for the exact blocker and the smallest
  follow-up verification that would cover the changed behavior.

## Review style

- Lead with actionable findings ordered by severity.
- Include file and line references whenever possible.
- Avoid requesting unrelated refactors of `DungeonScene.ts` unless the changed lines
  introduce a correctness or maintainability risk that blocks safe review.
- Prefer specific failing scenarios and reproduction steps over generic advice.
