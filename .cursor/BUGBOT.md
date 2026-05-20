# Bugbot Review Guide

Review this repository as a Next.js client application that boots a Phaser dungeon game.

## Required checks

Run these commands before reporting that a pull request is ready:

```bash
npm ci
npm run lint
npm run build
npm audit --omit=dev
```

`npm run lint` intentionally runs both TypeScript checking and the asset manifest verifier. The Phaser scene loads images and audio at runtime, so build success alone is not enough to prove the game can load its committed assets.

## Focus areas

- Confirm every path in `src/game/assets/manifest.ts` exists under `public/assets`.
- Check that controls documented in `README.md` and the how-to-play modal match the actual keyboard and pointer handlers in `src/game/scenes/DungeonScene.ts`.
- Treat regressions in input handling, projectile spawning, collision, pickups, health, audio mute state, and game-over/start modal flow as high priority.
- For dependency changes, check both `package-lock.json` and `pnpm-lock.yaml` stay consistent with `package.json`.
- Prefer small, direct fixes that match the current Phaser scene structure; avoid unrelated game-system rewrites in review suggestions.
