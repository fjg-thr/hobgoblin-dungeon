# Cursor Bugbot review guide

This repo-side guide gives Cursor Bugbot project context after it is merged to the default branch. It does not enable the hosted service by itself; verify Bugbot availability through Cursor org/repo settings, the Cursor GitHub App repository access, any Admin API/team configuration in use, and a live pull-request smoke review.

Manual PR triggers, when the hosted service is installed, should be top-level comments:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for diagnostic request IDs and logs

## Project context

- Next.js app with React app shell in `src/app`, a client-only Phaser canvas mounted by `src/game/GameCanvas.tsx`, and the main gameplay scene in `src/game/scenes/DungeonScene.ts`.
- Assets are served from `public/assets`; runtime loading is defined by `src/game/assets/manifest.ts`. Treat that manifest as the source of truth for loaded audio, spritesheets, metadata paths, and frame sizes.
- Map generation and tile/collision expectations live in `src/game/maps/startingDungeon.ts`.
- The project currently has both `package-lock.json` and `pnpm-lock.yaml`; do not request lockfile cleanup unless a PR changes dependency/tooling policy.
- Tailwind is not configured. For DOM/app-shell work, prefer semantic HTML and existing `src/app/globals.css` patterns. For gameplay UI, review Phaser canvas affordances, hit zones, HUD placement, and keyboard/mouse behavior.

## Review priorities

1. Protect gameplay invariants in `DungeonScene.ts`: player movement, aim quantization, projectile lifecycle, ammo accounting, enemy damage/death, pickups, power-up timing, camera, hit-stop, audio mute, and game-over/restart state.
2. Check Phaser object cleanup. PRs that add sprites, timers, tweens, input listeners, sounds, or containers should destroy or unregister them on scene restart/shutdown.
3. Validate responsive canvas/UI behavior through `GameCanvas`, start/how-to-play/game-over overlays, mute button hit zones, and HUD scaling. Interactive Phaser zones should remain reachable by pointer and keyboard-equivalent flows where applicable.
4. For assets, ensure every new or renamed runtime file has a manifest entry, the file exists under `public/assets`, JSON frame metadata matches the spritesheet dimensions, and generated/processed assets do not silently drift from their source prompts or tools.
5. For maps/collision, test that walkable tiles, walls, pits/bridges, props, enemy spawn points, and pickups remain reachable and visually aligned in isometric projection.
6. For metadata/app-shell changes, verify `metadataBase`, OpenGraph/Twitter image paths, and environment-derived URLs. The current baseline references `/opengraph-image.png` without a checked-in matching image; only block PRs that touch metadata/share-image behavior or make that baseline worse.

## Known baselines to avoid false positives

- README says `Space` or `J` fires, but current runtime binds shooting to `SPACE` plus pointer/click firing. Flag only PRs that modify controls/docs or deepen this mismatch.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and blast. Runtime also includes seeker ammo/pickups/projectiles unlocked by progression; treat seeker behavior as code-defined unless a PR updates docs.
- README calls blast a rare late-game power-up, while `POWERUP_CONFIG` currently unlocks blast at 2 kills or 16 seconds. Do not block unrelated PRs solely for this existing docs/code drift.
- `npm ci` may report existing Next.js/PostCSS audit advisories. Mention them only when a PR changes dependencies, lockfiles, or build tooling.
- Next generated files can churn `next-env.d.ts` between dev and production route-type paths. Avoid requesting commits of generated churn unless the PR intentionally changes Next typegen behavior.

## Asset and audio tooling

Relevant generators/processors include:

- `tools/process_assets.py`
- `tools/process_actor_death_assets.mjs`
- `tools/process_combat_juice_assets.mjs`
- `tools/process_corporate_goblin_assets.py`
- `tools/process_gpt_tile_powerup_assets.mjs`
- `tools/process_pickup_intent_effect_assets.mjs`
- `tools/process_spreadsheet_brute_assets.py`
- `tools/generate_audio_sfx.mjs`
- `tools/generate_brute_ammo_sprites.mjs`
- `tools/generate_polish_sprites.mjs`
- `tools/generate_powerup_sprites.mjs`
- `scripts/generate-retro-soundtrack.mjs`

If a PR touches generated assets, ask for the specific generator command and review both generated output references and runtime manifest usage.

## Suggested verification

Use scoped checks unless the PR changes tooling:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For gameplay-affecting changes, also smoke-test locally: start screen, how-to-play modal, movement, SPACE and click firing, ammo depletion/reload, seeker ammo when unlocked, each power-up, heart pickup, mute toggle, F3 debug overlay, game over, and restart.

## Review style

Prioritize concrete bugs, regressions, missing verification, and high-risk edge cases. Cite exact files/lines, explain player or maintainer impact, and keep non-blocking polish suggestions separate from correctness findings.
