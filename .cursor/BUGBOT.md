# Cursor Bugbot review guide

Use these repository-specific rules when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Deployment boundary

- This file supplies project review instructions for Cursor Bugbot.
- Managed Bugbot enablement is configured outside this repository in the Cursor dashboard and GitHub App repository access settings.
- Do not add a GitHub Actions workflow just to run Bugbot unless a PR explicitly introduces a separate Cursor CLI workflow.
- These rules apply after they are merged to the default branch.

## Project context

- This is a private npm-package Next.js App Router app that hosts a Phaser 4 isometric dungeon prototype.
- React owns the page shell and client bootstrapping; Phaser owns the game loop, rendering, input, audio, scene state, and most user interaction.
- Preserve the dark GBA-inspired pixel-art presentation: pixel scaling, nearest-neighbor assumptions, and asset frame dimensions are intentional.
- Global app styling lives in `src/app/globals.css`; avoid broad styling-system churn unless a PR is specifically about that migration.

## Review priorities

1. Flag TypeScript, Next.js build, or browser-runtime regressions as blocking.
2. Check server/client boundaries. Phaser imports, `window`, pointer input, audio, and WebGL assumptions should stay behind client-only paths such as `src/game/GameCanvas.tsx` and dynamic imports.
3. Watch Phaser lifecycle changes. Scene restarts, timers, tweens, input handlers, audio handles, pooled objects, and game objects should be cleaned up or reset without leaking across runs.
4. Inspect gameplay state transitions for race conditions between start, game over, restart, player death, power-up effects, enemy spawning, projectile cleanup, pickups, and audio mute state.
5. Keep update-loop work bounded. Avoid unbounded allocations, listener registration, full-map scans, or expensive searches inside per-frame paths unless the map size or pool is explicitly capped.
6. Verify generated asset manifests and sprite-sheet metadata stay consistent with files under `public/assets`, including texture keys, frame dimensions, metadata JSON, animation rows, and audio paths.
7. Prefer small, localized changes over broad rewrites of `src/game/scenes/DungeonScene.ts` unless the PR is explicitly a scene refactor.

## Game implementation expectations

- Preserve coordinate conversions, collision checks, depth sorting, and spawn rules unless the PR intentionally changes gameplay.
- Check dungeon-generation invariants: map rows should remain `MAP_WIDTH` by `MAP_HEIGHT`, starts should land on playable tiles, and new tile codes must be handled by collision and asset lookup helpers.
- Review controls against the existing keyboard, pointer, debug, restart, and mute flows so new listeners do not interfere with movement, aiming, firing, or overlays.
- Treat unreachable game states, stale scene fields after restart, uncaught exceptions, and ammo/pickup starvation as high-priority findings.

## UI and accessibility

- Keep React UI semantic and accessible when it changes, including labels, keyboard behavior, visible focus, and sensible document metadata.
- Coordinate React-level interactions with Phaser input handling; avoid overlapping listeners that can double-fire clicks or consume keyboard events unexpectedly.
- Preserve full-window canvas behavior unless a PR intentionally changes the layout.

## Asset and audio pipeline

- Treat `public/assets` files as runtime inputs. If JSON metadata changes, verify the referenced image or audio files exist and still match dimensions or frame assumptions.
- Asset processing and generation tooling lives under `tools/` and `scripts/`; ask for the relevant generator or processor evidence when those pipelines change.
- Avoid committing temporary generation outputs, source secrets, local-only paths, or one-off prompt artifacts that are not part of the runtime asset set.

## Baseline context to avoid false positives

- The README says `J` fires the staff bolt; current code primarily binds firing to pointer/click and `Space`. Treat this as pre-existing unless the PR changes controls or docs.
- Some generated visual assets are first-pass prototype art. Focus review comments on runtime breakage, manifest mismatches, or clear user-visible regressions instead of subjective art polish.
- The repository currently has `npm run build` and `npm run lint` scripts, but no dedicated test script.

## Verification expectations

- For TypeScript, Next.js, React, Phaser, or asset import changes, expect `npm run build` evidence before merge.
- For lint-sensitive code changes, expect `npm run lint` evidence when the script is functional in the current Next.js version.
- For npm dependency or lockfile changes, expect `npm ci` and a successful build.
- For asset pipeline changes, expect the relevant `npm run process:*`, `npm run generate:*`, or direct `node`/`python3` tool command to be run when practical.
- For gameplay behavior changes, prefer a short browser smoke-test note covering movement, aiming/firing, pickups, enemy contact, restart, and audio mute.
- If a recommended check cannot run, call out the exact command, failure reason, and residual risk.
