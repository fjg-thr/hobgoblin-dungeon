# Cursor Bugbot Review Guide

Use this repository guide when reviewing code for the Hobgoblin Ruin prototype.

## Project shape

- App shell: Next.js App Router files in `src/app/`.
- Game mount: `src/game/GameCanvas.tsx` is a client-only React bridge that creates and destroys the Phaser game.
- Gameplay: `src/game/scenes/DungeonScene.ts` owns scene state, input, spawning, combat, HUD, audio, and overlays.
- Maps: `src/game/maps/startingDungeon.ts` generates dungeon rooms, corridors, wall data, and tile helpers.
- Assets: `src/game/assets/manifest.ts` maps runtime assets under `public/assets/`.
- Asset tooling: generation and processing scripts live in both `tools/` and `scripts/`; generated/runtime assets are committed under `public/assets/`.

## Review priorities

1. Preserve client/server boundaries. Phaser, `window`, `document`, pointer input, and audio APIs must stay behind client-only code paths.
2. Check Phaser lifecycle cleanup. New timers, tweens, input handlers, sounds, sprites, groups, and event listeners should be cleaned up on scene shutdown or object destruction.
3. Protect gameplay invariants. Review changes to health, ammo, seeker ammo, blast charge, power-up gating, enemy spawn pressure, score, and game-over/restart state for leaks between runs.
4. Keep coordinates consistent. Dungeon logic mixes tile, world, camera, and screen coordinates; flag conversions that use the wrong space or bypass existing helpers.
5. Verify assets through the manifest. New or renamed assets should update `src/game/assets/manifest.ts`, `README.md` asset lists when user-facing, and the relevant processor/generator script when generated.
6. Keep UI changes aligned with existing patterns. This repo does not use Tailwind; prefer semantic markup in `src/app/` and the established `src/app/globals.css` style structure.

## Known existing mismatches

- `README.md` says `Space` or `J` fires, while current in-game instructions and code bind keyboard firing to `SPACE` plus pointer/click firing. Do not block unrelated PRs solely for this existing mismatch; do flag PRs that change controls or docs without reconciling it.
- `README.md` documents regular ammo and several power-ups but not seeker ammo. Current code unlocks seeker ammo after progression and uses seeker pickups/projectiles.
- `README.md` describes blast as rare late-game, while current `POWERUP_CONFIG.blast` unlocks earlier than that wording implies.

## Suggested checks

Run these for code or asset-manifest changes when practical:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check "$(git merge-base HEAD origin/main)"..HEAD
```

`npm run lint` currently maps to `next lint`, which is unreliable with this locked Next CLI setup. Prefer build plus TypeScript checks unless the lint script is intentionally fixed.

## Generated artifacts

- Next verification can rewrite `next-env.d.ts` and create `tsconfig.tsbuildinfo`; restore or remove generated churn unless the PR intentionally changes generated typing behavior.
- Do not treat committed pixel-art/audio assets as disposable just because they are generated. Asset PRs should include source/generator updates or clear rationale.

## Managed Bugbot activation boundary

This file supplies repository-specific review context for Cursor Bugbot. Actual managed Bugbot enablement is external to the repository and must be verified through Cursor dashboard or organization settings, GitHub App repository access, and a PR review smoke check when those controls are available.
