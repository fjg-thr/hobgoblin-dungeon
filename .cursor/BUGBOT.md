# Bugbot Review Rules

This repository is a Next.js browser game that embeds a Phaser dungeon scene.
Bugbot should review pull requests for runtime regressions, game-play bugs,
asset-loading problems, and unsafe dependency or build changes.

## Project context

- The app entry points live in `src/app/**` and `src/game/GameCanvas.tsx`.
- Most game behavior is implemented in `src/game/scenes/DungeonScene.ts`.
- Dungeon layout data lives in `src/game/maps/**`.
- Asset registration lives in `src/game/assets/manifest.ts`, and the loaded
  files are under `public/assets/**`.
- Asset-generation utilities live in `tools/**` and `scripts/**`.

## Required review focus

### Game loop and Phaser scene safety

- Flag changes that can leave Phaser timers, tweens, input handlers, audio, or
  scene event listeners running after scene shutdown or restart.
- Flag changes that create unbounded objects every frame, leak sprites/groups,
  or perform avoidable heavy work inside `update`.
- Verify collision, damage, invulnerability, ammo, score, pickups, enemy spawn,
  and game-over logic still preserve the existing run loop and reset behavior.
- Check that user input remains available for keyboard, mouse, and restart flows.

### Next.js and React integration

- Flag direct browser API usage during server render unless it is gated behind a
  client component boundary or runtime check.
- Flag hydration risks, missing cleanup in React effects, and changes that mount
  multiple Phaser game instances for the same canvas.
- For UI changes, check accessibility basics: semantic buttons where possible,
  keyboard support for interactive controls, clear labels, and visible focus
  behavior.

### Assets and manifests

- When files in `public/assets/**` change, verify the corresponding manifest or
  sprite-sheet JSON references still match the PNG/audio paths and frame names.
- When `src/game/assets/manifest.ts` changes, flag missing files, mismatched
  keys, duplicate asset keys, or paths that will not be served from `public`.
- Flag accidental commits of large source/generated artifacts unless they are
  already part of the repository's asset workflow and referenced by the game.

### TypeScript, build, and dependency changes

- Flag TypeScript changes that weaken useful types with `any`, remove null or
  bounds checks from gameplay code, or hide errors with broad casts.
- If `package.json`, `package-lock.json`, or `pnpm-lock.yaml` changes, check for
  unexpected dependency additions, lockfile drift, license/security concerns,
  and consistency with the package manager used in the change.
- Prefer small, focused fixes over broad refactors in the large scene file unless
  the PR clearly needs the refactor to implement the behavior safely.

### Validation expectations

- For gameplay changes, expect at least one relevant validation path in the PR:
  build/type-check output, focused manual test notes, or tests if a suitable
  harness exists.
- Flag PRs that change core game behavior without explaining how movement,
  combat, restart, and asset loading were checked.
