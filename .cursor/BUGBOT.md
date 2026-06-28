# Cursor Bugbot Review Guide

Use this guide when reviewing PRs for Hobgoblin Ruin, a Next.js/React app that mounts a Phaser dungeon prototype.

## Deployment boundary

- This file gives Cursor Bugbot repository-specific review context after it is merged to the default branch.
- Source changes alone cannot prove managed Bugbot is enabled. Also verify Cursor dashboard/org settings, GitHub App repo access, Admin API credentials if used, and a post-merge PR review smoke test.
- PRs editing this file may be reviewed with previous default-branch guidance.
- Manual GitHub PR triggers are top-level comments: `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`.

## Project map

- `src/app/page.tsx` and `src/game/GameCanvas.tsx` render the app shell and mount Phaser client-side.
- `src/game/scenes/DungeonScene.ts` owns gameplay state, input, combat, enemies, pickups, audio, HUD, and cleanup.
- `src/game/maps/startingDungeon.ts` generates the room-and-corridor dungeon data used by the scene.
- `src/game/assets/manifest.ts` is the runtime asset source of truth, including `assetManifest.audio`.
- `public/assets/**` stores generated sprites, metadata JSON, tiles, UI, effects, and audio.
- Asset generation and processing scripts live under `tools/` and `scripts/`; review both script changes and generated output when either side changes.

## Review priorities

1. **Gameplay regressions:** Check movement, camera, collisions, enemy spawning/attacks, player damage, scoring, ammo, power-ups, heart pickups, projectile lifecycle, game-over paths, and scene restart cleanup. Be careful with timers/events and arrays or maps mutated during update loops.
2. **Input and canvas UX:** Verify keyboard and pointer paths together. Runtime fires with `Space` plus pointer/click; README still mentions `J`, so do not block unrelated PRs solely for that mismatch.
3. **Asset integrity:** New runtime assets should be declared in `src/game/assets/manifest.ts`, have matching files under `public/assets`, and use dimensions/metadata that match Phaser frame creation. Treat `public/assets/audio/audio-manifest.json` as auxiliary unless runtime loading changes.
4. **Next/React boundaries:** Keep Phaser behind client-only React code. Avoid browser globals during server render, preserve metadata/static assets such as `public/opengraph-image.png`, and follow existing semantic HTML plus `src/app/globals.css`. This repo does not configure Tailwind.
5. **Dependency and lockfile safety:** Keep `package-lock.json` and `pnpm-lock.yaml` consistent with `package.json`. Do not upgrade Phaser casually; it is pinned to `4.0.0-rc.4`.

## Known baseline caveats

- README documents `Space` or `J` for firing, but current runtime binds keyboard firing to `Space` only. Flag this only for input/control documentation PRs or changes that worsen the mismatch.
- README documents regular ammo and several power-ups, but runtime progression also includes seeker ammo. Review seeker changes against code-defined behavior.
- README describes blast as rare late-game, while current power-up configuration may unlock it earlier. Treat this as an existing docs/code mismatch unless a PR intentionally changes progression.
- Collision is intentionally simple tile/proximity logic, not a physics engine.

## Suggested verification

Choose commands by PR scope, but prefer this baseline for broad changes:

```bash
git diff --check "$(git merge-base HEAD origin/main)"..HEAD
test -f public/opengraph-image.png && git ls-files --error-unmatch public/opengraph-image.png
npm ci
npm audit --omit=dev
pnpm audit --prod
npx tsc --noEmit --incremental false
npm run build
```

`next lint` is not reliable here; use type-checking and production build output. If `npm run build` rewrites generated `next-env.d.ts`, restore it unless the PR intentionally changes Next route typing.

For asset PRs, run exact affected generators or processors instead of wildcard commands:

```bash
python3 tools/process_assets.py
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
node tools/process_pickup_intent_effect_assets.mjs
node tools/process_gpt_tile_powerup_assets.mjs
python3 tools/process_corporate_goblin_assets.py
python3 tools/process_spreadsheet_brute_assets.py
node tools/generate_powerup_sprites.mjs
node tools/generate_brute_ammo_sprites.mjs
node tools/generate_polish_sprites.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

## Smoke checks to request or perform

- Start the app, begin a run, move with WASD or arrows, aim with mouse, fire with `Space`, and click-fire once.
- Confirm ammo decreases and pickups reload, enemies take damage/despawn, hearts update, and game-over/restart works.
- Toggle `SOUND` / `MUTED` and confirm audio state changes without console errors.
- For managed Bugbot deployment, open or update a small PR after this file is on the default branch and trigger `cursor review` or `bugbot run`.
