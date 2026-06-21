# Bugbot review instructions

Review pull requests for correctness, regressions, and maintainability issues that could affect the Hobgoblin Ruin prototype.

Prioritize findings in these areas:

- Next.js and React changes that can break server/client boundaries, metadata, routing, or production builds.
- Phaser scene updates that can cause runtime crashes, listener/timer leaks, broken input handling, or inconsistent game state transitions.
- Dungeon generation, collision, combat, scoring, power-up, ammo, and health logic regressions.
- Asset manifest, sprite sheet, audio manifest, and public asset path mismatches that would fail loading at runtime.
- TypeScript errors, unsafe assumptions around optional data, and changes that bypass existing strictness.
- Security, data-loss, or dependency risks.

Avoid flagging purely stylistic preferences unless they create a concrete maintainability or user-facing risk.

