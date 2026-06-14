# Cursor Bugbot Review Guide

This repository is a Next.js App Router game prototype built with React, TypeScript,
and Phaser. Use this guide when reviewing pull requests for `fjg-thr/hobgoblin-dungeon`.

## Review priorities

- Treat `npm run build` and `npx tsc --noEmit` as the primary automated checks for
  TypeScript and Next.js changes. The current `npm run lint` script uses removed
  Next.js lint behavior and is not a reliable gate until lint tooling is updated.
- Flag changes that move Phaser-only code into server-rendered modules. Game runtime
  code should stay behind the existing client boundary in `src/game/GameCanvas.tsx`.
- Watch Phaser lifecycle changes closely: event listeners, timers, tweens, sprites,
  sounds, and scene shutdown/restart paths should clean up without duplicate handlers
  or stale objects after game over, restart, or route navigation.
- Review large edits to `src/game/scenes/DungeonScene.ts` for gameplay regressions in
  movement, aiming, collision, spawn pacing, powerups, health/ammo accounting, score,
  mute state, and debug overlay behavior.
- For asset or audio tooling changes under `tools/` or `scripts/`, verify generated
  JSON manifests, sprite dimensions, frame counts, and asset paths remain consistent
  with `src/game/assets/manifest.ts` and files under `public/assets/`.
- Flag unsafe dynamic code, remote script execution, unreviewed network calls, secret
  handling mistakes, and browser APIs that would break server builds.

## Existing context to avoid false positives

- Controls in the scene currently bind staff firing to `Space` and pointer/click.
  The README also mentions `J`; do not block unrelated PRs solely on that existing
  documentation mismatch.
- Seeker ammo exists in code and unlocks after a kill/time threshold, but the README
  does not document it yet. Treat that as existing behavior unless a PR edits controls,
  combat, ammo, or docs in a way that should reconcile it.
- The README describes blast as late and rare, while the current config unlocks blast
  after 2 kills or 16 seconds. Treat this as an existing mismatch unless the PR is
  intentionally changing powerup progression or documentation.
- The project does not currently configure Tailwind or shadcn/ui. UI reviews should
  follow the existing semantic markup and `src/app/globals.css` patterns.

## Managed Bugbot deployment check

Repository files only provide review context. To confirm Bugbot is actually deployed,
verify outside the repo that the Cursor GitHub App has access to this repository,
Bugbot is enabled in the Cursor dashboard for `fjg-thr/hobgoblin-dungeon`, and a test
pull request receives a Bugbot review or responds to the configured review command.
