# Cursor Bugbot Review Rules

## Review priorities

- Prioritize correctness, regressions, security, data loss, broken builds, and missing test coverage for changed behavior.
- Flag issues that could break the Next.js app lifecycle, Phaser scene lifecycle, asset loading, or browser input handling.
- Treat runtime errors during start screen, gameplay, game over, or audio mute flows as high priority.
- Verify asset manifest updates stay consistent with files under `public/assets`.
- Check that generated asset or audio changes keep source scripts and committed outputs in sync.
- Do not leave style-only comments unless the style issue hides a correctness, maintainability, accessibility, or performance problem.

## Project-specific expectations

- For React and Next.js changes, verify client-only Phaser code remains behind client component boundaries and does not access browser globals during server rendering.
- For Phaser changes, look for leaked timers, event listeners, tweens, sounds, or scene objects across restarts and scene transitions.
- For gameplay changes, review collision, spawn, scoring, health, ammo, power-up, and difficulty-ramp interactions together rather than in isolation.
- For input changes, verify keyboard, mouse, click-to-fire, mute, restart, and modal controls remain usable and do not conflict.
- For asset pipeline changes, confirm scripts in `tools/` or `scripts/` still produce metadata that matches the consuming TypeScript code.

## Comment style

- Prefer concise, actionable comments with a concrete failure scenario or reproduction path.
- Include file and symbol context when possible.
- Avoid speculative rewrites when a smaller targeted fix would address the issue.
