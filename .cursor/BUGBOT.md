# Bugbot review guidance

Use these repository-specific notes when reviewing pull requests.

## Project context

- This is a Next.js App Router project with a client-side Phaser game.
- Game logic lives primarily under `src/game`, with the main scene in
  `src/game/scenes/DungeonScene.ts`.
- Static game assets and Phaser atlas metadata live under `public/assets`.
- Asset-processing utilities live under `tools` and `scripts`.

## Review priorities

- Flag changes that can break the browser runtime, especially direct access to
  Node-only APIs from client components or Phaser scene code.
- Watch for server/client boundary mistakes in `src/app`, including missing
  `"use client"` where React hooks, browser globals, or the game canvas are used.
- Check that asset manifest changes stay consistent with actual files under
  `public/assets` and their JSON frame metadata.
- For Phaser changes, review scene lifecycle cleanup, timers, event listeners,
  input handlers, camera state, and object destruction to avoid leaks across
  restarts.
- Validate gameplay constants and state transitions for regressions in movement,
  collisions, enemy spawning, powerups, ammo, scoring, and game-over/restart
  behavior.
- Prefer strict TypeScript types and clear domain names. Flag unnecessary `any`,
  unsafe casts, and broad nullish fallbacks that hide invalid state.
- Keep UI and interaction changes accessible where React DOM is involved.
  Buttons and controls should expose clear labels and keyboard behavior.
- Flag large generated binary or asset churn unless the PR clearly explains why
  it is needed.

## Verification expectations

- Expect relevant checks to include TypeScript/Next build verification when the
  environment supports Node tooling.
- For game behavior changes, look for focused manual-test notes or automated
  coverage that exercises the changed state transition.
