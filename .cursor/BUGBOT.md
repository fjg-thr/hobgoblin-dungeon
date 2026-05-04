# Bugbot review guidance

When reviewing this repository, focus on issues that can affect the playable Next.js and Phaser prototype:

- Correctness regressions in game state, player controls, enemy behavior, collision, scoring, pickups, audio, or scene lifecycle code.
- Runtime errors introduced by asset manifest changes, missing public assets, invalid sprite-sheet metadata, or browser-only APIs used during server rendering.
- TypeScript, React, or Next.js issues that can break builds, hydration, routing, or client component behavior.
- Performance problems that can affect frame rate, especially unbounded allocations or timers in the Phaser update loop.
- Accessibility regressions in the app shell, controls documentation, start screen, game-over flow, and interactive UI overlays.
- Missing tests or validation steps for changed behavior, build configuration, asset processing scripts, or generated metadata.

Avoid commenting on purely stylistic preferences unless they affect correctness, maintainability, accessibility, or player-facing behavior.
