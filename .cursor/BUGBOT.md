# Bugbot review guide

Use this repository-specific context when reviewing pull requests.

## Project context

- This is a Next.js and React browser game prototype that embeds a Phaser scene.
- Runtime code lives under `src/`; generated and processed game assets live under `public/assets/`.
- Asset processing and generation utilities live under `tools/` and `scripts/`.
- TypeScript is strict and should remain strict.

## Review priorities

- Flag gameplay regressions in `src/game/scenes/DungeonScene.ts`, especially movement, collision, enemy spawning, pickups, scoring, life, ammo, audio mute state, and start/game-over flows.
- Check that browser-only Phaser code does not run during server rendering.
- Verify asset manifest changes reference files that exist under `public/assets/`.
- Watch for changes that make generated assets or sprite-sheet metadata inconsistent with their dimensions, frame names, or consuming code.
- Prefer small, readable TypeScript changes over broad refactors in the main scene file unless the refactor directly reduces risk.

## Validation commands

Run these checks when relevant:

```bash
npm run build
npx tsc --noEmit
```

`npm run lint` is currently configured as `next lint`; if that command is unavailable in the installed Next.js version, treat it as a repository tooling issue rather than a product-code regression.
