# Bugbot Review Rules

Review this repository as a Next.js TypeScript game prototype that embeds a Phaser runtime in a React app.

## Focus areas

- Flag bugs that can break the playable loop: scene lifecycle issues, incorrect Phaser asset keys, stale timers, collision regressions, enemy spawning mistakes, and input handling edge cases.
- Check React/Next.js boundaries carefully. Phaser code should stay client-side, browser-only APIs must not run during server rendering, and app-level changes should remain compatible with Next.js builds.
- Review asset manifest and sprite-sheet JSON changes together with their consumers. Missing frame names, dimensions, paths, or audio manifest entries are high-risk.
- Prioritize deterministic gameplay behavior where possible. Random generation, power-up drops, scoring, and combat state should preserve clear invariants and avoid accidental runaway loops.
- Treat accessibility and readability as review concerns for React UI and controls, especially start/restart/mute interactions and keyboard alternatives.

## Local verification expectations

- For code changes, expect `npm run build` to pass.
- If linting is available in the checked-out Next.js version, expect `npm run lint` to pass; otherwise call out missing or incompatible lint setup.
- For asset-pipeline changes, expect the relevant script in `package.json` to run or the PR to explain why generated assets were not regenerated.

## Repository conventions

- Prefer TypeScript types and explicit game-state names over loosely typed shared objects.
- Keep Phaser scene logic cohesive and avoid unrelated refactors when changing gameplay behavior.
- Keep generated assets under `public/assets` and source/generation helpers under `tools` or `scripts`.
