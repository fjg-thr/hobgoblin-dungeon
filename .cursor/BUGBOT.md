# Bugbot review guide

This repository is a Next.js App Router prototype for a Phaser-based
isometric dungeon game. When reviewing changes, prioritize issues that can
break the playable loop, asset loading, or production builds.

## Review priorities

- Validate React/Next.js client boundaries. Phaser code must only run in the
  browser and should remain isolated from server-rendered components.
- Check that asset manifest updates match files under `public/assets/**`.
  Missing, renamed, or mismatched sprite-sheet JSON/PNG/audio paths are high
  risk because Phaser loads them at runtime.
- Look for gameplay state regressions in `src/game/scenes/DungeonScene.ts`,
  especially input handling, collision, enemy spawning, pickups, scoring,
  health, ammo, mute state, and restart flow.
- Treat map-generation and coordinate-transform changes carefully. Off-by-one
  tile math, invalid bounds checks, and object placement changes can create
  unreachable rooms or invisible collision.
- Flag changes that introduce nondeterministic crashes, unbounded timers,
  leaking Phaser event listeners, or scene objects that are not cleaned up on
  restart/shutdown.
- For generated asset/tooling changes, verify scripts remain runnable from the
  repo root and do not overwrite unrelated assets.

## Validation expectations

- Prefer `npm run build` as the baseline verification for code changes.
- If linting is touched or configured, run `npm run lint` when available.
- For asset pipeline changes, run the relevant script from the repo root
  (whether listed in `package.json` or changed directly under `tools/`) and
  inspect that generated manifest paths still line up with `public/assets`.

## Style expectations

- Keep TypeScript explicit for shared structures such as game state, map data,
  asset manifests, and Phaser object collections.
- Prefer small, descriptive helper functions when logic is reused, but avoid
  broad refactors that do not directly reduce risk in the changed area.
- Preserve the existing App Router and plain CSS conventions in `src/app`.
