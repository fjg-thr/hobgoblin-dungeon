# Cursor Bugbot review instructions

Review this repository as a browser-based Next.js game prototype that embeds a
Phaser dungeon scene.

## Review priorities

- Prioritize correctness issues that can break gameplay, rendering, input,
  asset loading, audio, scoring, or run state.
- Check React and Next.js boundaries carefully. Phaser code should stay behind
  client-only components, avoid server-only APIs, and clean up game instances,
  listeners, timers, and scene resources when components unmount.
- Treat `src/game/scenes/DungeonScene.ts` as the core gameplay surface. Look for
  regressions in collision, enemy spawning, projectiles, pickups, powerups,
  health, ammo, camera behavior, pause/start/game-over flow, and debug controls.
- Validate asset changes against `src/game/assets/manifest.ts` and the
  corresponding files under `public/assets`. Flag missing files, mismatched
  frame names, wrong dimensions, or stale JSON metadata.
- Flag strict TypeScript problems, unsafe null assumptions, accidental `any`,
  unhandled async errors, and state that can leak between game runs.
- Call out changes that can introduce jank in the main game loop, especially
  per-frame allocations, unnecessary texture generation, or repeated DOM access.

## Comment style

- Leave comments only for high-confidence bugs, risky behavior changes, or
  missing verification that could hide a regression.
- Explain the user-visible impact and include a concrete fix direction.
- Avoid broad style comments unless the style issue creates a maintainability or
  correctness risk.

## Expected verification

For meaningful code changes, expect at least:

```bash
npm run build
```

If gameplay behavior changes, also expect a manual browser smoke test covering
start screen, movement, aiming/firing, enemy contact damage, pickups, mute, game
over, and restart.
