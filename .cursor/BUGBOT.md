# Bugbot review guidelines

Review this repository as a first-playable Next.js and Phaser web game prototype. Focus on defects that would break the shipped game, regress gameplay, or make future asset and scene changes unsafe.

## Project context

- The app is a Next.js frontend that renders a Phaser game in `src/game`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Runtime assets are loaded from `public/assets` and described by JSON manifests and sprite-sheet metadata.
- Asset-processing tools live under `tools` and may generate files in `public/assets`.

## High-priority review areas

- Next.js compatibility: server/client boundaries, browser-only APIs, build-time failures, and React component lifecycle cleanup.
- Phaser lifecycle safety: duplicate scene event handlers, timers, tweens, input listeners, or audio instances that survive restart or scene teardown.
- Game-loop performance: expensive work or avoidable object churn inside per-frame update paths.
- Gameplay invariants: health, ammo, score, power-up timers, spawn rates, collision checks, invulnerability windows, and restart/game-over state.
- Asset integrity: sprite frame keys, manifest paths, atlas dimensions, animation frame counts, and references between TypeScript loaders and files in `public/assets`.
- Input handling: keyboard, mouse, click-to-fire, mute toggles, debug controls, and interactions while paused, dead, or on the start/game-over screens.

## Expected checks

- `npm run build` is the primary verification command for PRs.
- There is currently no dedicated automated test suite; prefer actionable findings grounded in code paths and reproducible scenarios.

## Review style

- Prioritize concrete bugs, data mismatches, security issues, and performance regressions.
- Avoid broad refactor suggestions unless they directly reduce risk in changed code.
- For generated assets or scripts, verify the consumer-facing output and path contracts rather than style-only concerns.
