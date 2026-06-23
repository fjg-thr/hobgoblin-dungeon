# Bugbot Review Instructions

Use these project-specific notes when reviewing pull requests in this repository.

## Project context

- This is a Next.js web prototype for a Phaser-powered, GBA-inspired isometric dungeon game.
- Most gameplay logic lives in `src/game/scenes/DungeonScene.ts`.
- Asset manifests and generated sprite metadata live under `src/game/assets` and `public/assets`.
- Tooling scripts under `tools/` and `scripts/` generate or process game assets.

## Review priorities

1. Flag runtime bugs in Phaser scene lifecycle code, including leaked event listeners, timers, tweens, input handlers, or scene objects that survive restarts.
2. Check gameplay-sensitive changes for regressions in movement, collision, camera follow, enemy spawning, pickups, scoring, HUD state, mute state, and game-over/restart flows.
3. Verify Next.js client/server boundaries. Phaser, browser globals, and canvas setup should remain isolated from server-rendered code.
4. Validate asset references. Manifest keys, JSON frame names, image paths, frame dimensions, and public asset paths should stay in sync.
5. Watch for per-frame performance problems such as avoidable allocations, repeated asset lookups, excessive logging, unbounded loops, or uncapped spawning.
6. Prefer TypeScript-safe changes with clear types and no broad `any` escapes unless there is a localized reason.

## Validation commands

When practical, run or recommend:

```bash
npm run lint
npm run build
```

For asset pipeline changes, also inspect the affected generated files and run the matching `process:*` or `generate:*` script from `package.json` when the change depends on regenerated assets.

## Review style

- Prioritize actionable correctness, runtime, and maintainability issues over cosmetic preferences.
- Include file and line references for findings.
- Call out missing verification when a change touches gameplay, asset manifests, or build configuration.
