# Cursor Bugbot review guidelines

## Project context

- This is a private Next.js App Router prototype written in TypeScript and React.
- The playable game is client-side Phaser 4 code mounted from `src/game/GameCanvas.tsx`.
- Most gameplay state, collision, combat, spawning, UI overlays, and scene lifecycle behavior live in `src/game/scenes/DungeonScene.ts`.
- Static art and audio assets live under `public/assets`; their load paths are centralized in `src/game/assets/manifest.ts`.
- Asset generation and processing scripts live in `tools/` and `scripts/`.

## Review priorities

- Flag bugs that can break the Phaser scene lifecycle, especially duplicate game instances, missed cleanup on React unmount, stale event listeners, timers, tweens, sounds, or cameras that survive scene shutdown.
- Treat gameplay regressions as high signal: movement, aiming, firing, ammo consumption, pickups, health, enemy spawning, collisions, scoring, game over, restart, mute, and debug overlay behavior.
- Check that asset path, frame size, frame key, and metadata changes stay consistent between `src/game/assets/manifest.ts`, `public/assets/**`, and any processing scripts.
- For Next.js changes, verify client-only Phaser code remains behind client boundaries or dynamic imports so server rendering does not import browser-only APIs.
- For TypeScript changes, prefer explicit, narrow types for game state and avoid broad casts that can hide scene or asset contract mistakes.
- When dependency files change, verify the package manifest and lockfiles remain consistent and that new runtime dependencies are justified for a small prototype.

## Known project limitations

- Do not flag the lack of a staircase level transition; it is documented as a known limitation.
- Do not flag generated or first-pass pixel art quality unless a code change breaks asset loading, sizing, animation, or transparency.
- Do not require a full physics system; the current simple collision/proximity model is intentional.
- Do not require unit tests for every gameplay tweak while the repo has no test runner, but do call out missing verification for risky shared logic or lifecycle changes.

## Review style

- Prefer actionable inline comments tied to the changed lines.
- Prioritize concrete correctness, regression, lifecycle, accessibility, and maintainability issues over broad style preferences.
- Mention manual verification steps when automated coverage is absent.
