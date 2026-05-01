# Bugbot review guidance

Review this Next.js and Phaser dungeon prototype for regressions that affect gameplay, rendering, or deployability.

Prioritize findings in these areas:

- Phaser lifecycle safety in client components: avoid duplicate game instances, leaked scenes, listeners, timers, tweens, sounds, or WebGL resources across React mounts and route changes.
- Gameplay correctness in `src/game/scenes/DungeonScene.ts`: movement, collision, enemy pathing, projectile behavior, power-up timing, health/ammo state, scoring, and game-over/reset flows.
- Map and asset contract changes: keep tile codes, manifest keys, sprite-sheet metadata, generated asset dimensions, and public asset paths in sync.
- Next.js compatibility: keep browser-only Phaser code out of server components and preserve dynamic/client-only loading patterns.
- TypeScript safety: prefer explicit types for game state and avoid weakening strictness with broad casts or `any`.
- Performance risks in the main update loop: flag per-frame allocations, unbounded object creation, or missing cleanup for pooled game objects.
- Accessibility and page shell changes: preserve semantic structure and keyboard/mouse controls documented in the README.

Treat generated binary assets and sprite-sheet JSON carefully. If a change updates generated assets, verify the matching source script or manifest change is included.

Recommended verification for non-asset code changes:

```bash
npm run build
```

Use the README controls and known limitations as product context; do not report existing documented limitations unless the diff makes them worse.
