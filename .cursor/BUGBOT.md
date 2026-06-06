# Bugbot Review Instructions

Review this repository as a Next.js app that hosts a Phaser-based browser game prototype.

Prioritize findings that would cause:

- Next.js build, lint, or deployment failures.
- Client-only Phaser code to run during server rendering.
- Runtime errors while loading sprite sheets, audio files, or generated asset manifests.
- Broken player controls, collision, combat, pickups, scoring, health, or game-over flow.
- Regressions in accessibility or keyboard/mouse input for the start screen, HUD controls, and modal UI.
- Incorrect public asset paths or metadata that would produce 404s in production.

Be conservative with style feedback. Prefer high-confidence behavioral bugs, missing validation, and gaps in automated or manual verification. When a change touches `src/game/scenes/DungeonScene.ts`, call out whether the reviewer should also run a browser playtest because many game-loop regressions are only visible at runtime.
