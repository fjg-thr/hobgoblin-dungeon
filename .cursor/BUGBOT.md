# Bugbot review rules

Review this repository as a Next.js game prototype that embeds a Phaser scene.

Focus on these risks:

- Next.js client/server boundaries: Phaser and browser globals must stay in client-only code paths. Phaser scene modules may import `phaser` at module scope when they are only reached through the client-only `GameCanvas` dynamic import path.
- Phaser lifecycle correctness: scene setup, asset loading, input listeners, timers, tweens, audio, and game objects should be cleaned up or guarded against duplicate registration.
- Gameplay state regressions: movement, collision, enemy spawning/pathing, ammo, health, power-ups, scoring, debug controls, and restart flows should remain deterministic enough for a single browser session.
- Asset manifest consistency: changes to `public/assets/**` should match `src/game/assets/manifest.ts` keys, frame names, dimensions, and paths.
- TypeScript strictness: preserve explicit domain types for tile/world points, actors, pickups, projectiles, and asset keys instead of widening to `any`.
- Performance: flag avoidable per-frame allocations or expensive searches in the Phaser update loop, especially in `src/game/scenes/DungeonScene.ts`.
- Accessibility and UI shell: changes in `src/app/**` or React components should preserve keyboard controls, focus behavior, visible instructions, and intentional canvas labeling or ARIA decisions.

Useful verification commands:

```bash
npm run build
```

Do not require hand-authored unit tests for generated art/audio assets or one-off asset processing scripts unless the change adds reusable logic.
