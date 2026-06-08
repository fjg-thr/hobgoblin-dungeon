# Bugbot Review Rules

Review this repository as a browser game built with Next.js App Router, React, TypeScript, and Phaser.

## Project-specific priorities

- Treat runtime gameplay regressions as high priority, especially changes that can break scene boot, player input, combat state, collision, pickups, audio mute state, or game-over/restart flow.
- Flag code that imports Phaser or browser-only APIs from server-rendered modules. Phaser should stay behind client-only boundaries such as `src/game/GameCanvas.tsx` dynamic imports or Phaser scene files.
- When asset paths, sprite-sheet frame sizes, animation keys, or audio keys change, verify the matching files and metadata in `public/assets` and `src/game/assets/manifest.ts` stay in sync.
- For `src/game/scenes/DungeonScene.ts`, check that new timers, tweens, input handlers, sounds, and display objects are cleaned up or scoped so restarts do not leak duplicated behavior.
- For dungeon generation and collision edits, look for unreachable rooms, blocked spawn points, wall/floor mismatch, and camera/player bounds inconsistencies.
- For UI or metadata changes under `src/app`, preserve accessibility, correct social metadata, mobile viewport behavior, and the fullscreen game layout.

## Review expectations

- Prioritize concrete bugs, security issues, data loss, broken builds, and user-visible regressions over style-only feedback.
- Include reproduction steps or a specific code path when reporting gameplay issues.
- Keep comments actionable and tied to changed lines whenever possible.
- Do not request broad refactors unless they directly reduce risk in the changed code.

## Verification commands

Ask contributors to run the relevant checks for the files they changed:

```bash
npm run build
```

For gameplay or UI changes, also request a manual browser smoke test:

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Start a run, move with WASD or arrow keys, aim with the cursor, fire with click or Space, collect pickups, toggle sound, and restart after game over.
