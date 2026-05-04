# Bugbot review instructions

Review this repository as a Next.js web game prototype with a Phaser runtime.
Prioritize findings that could cause runtime failures, broken builds, gameplay
regressions, accessibility regressions, or incorrect asset loading.

## High-priority review areas

- Next.js client/server boundaries. Components that touch `window`, canvas,
  Phaser, audio, or pointer/keyboard APIs must remain client-side safe.
- Phaser scene lifecycle. Watch for leaked listeners, timers, tweens, physics
  objects, or scene state that is not reset when the game restarts.
- Asset manifest consistency. Every asset key referenced by game code should
  exist in `src/game/assets/manifest.ts` and match files under `public/assets`.
- Gameplay state invariants. Review health, ammo, score, enemy spawning,
  pickups, power-up timers, and restart logic for off-by-one or stale-state
  errors.
- Input accessibility and safety. UI controls should be keyboard reachable,
  labelled when needed, and should not trap focus or swallow unrelated input.
- Build and type safety. Flag TypeScript errors, invalid imports, missing
  package scripts, and code that depends on unavailable browser or Node APIs.

## Project-specific context

- Generated binary art/audio assets live under `public/assets`; avoid comments
  about artistic style unless a change breaks loading, dimensions, animation
  metadata, or gameplay readability.
- Tooling scripts in `tools/` and `scripts/` may generate or process assets.
  Review them for deterministic paths, safe file writes, and clear failures.
- The prototype intentionally favors simple collision and combat mechanics.
  Do not request large architecture rewrites unless the change introduces a
  concrete correctness or maintainability risk.

## Comment style

- Lead with actionable bugs and regressions. Include the affected file and the
  user-visible impact.
- Avoid purely subjective style comments or broad refactor suggestions when the
  code is correct and follows nearby patterns.
- If a fix is straightforward, suggest the smallest safe change that preserves
  the current gameplay behavior.
