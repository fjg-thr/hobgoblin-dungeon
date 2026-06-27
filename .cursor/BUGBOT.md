# Cursor Bugbot review guide

This file gives Cursor Bugbot repository-specific review context for Hobgoblin Ruin. It does not, by itself, enable the managed Bugbot service. Confirm service deployment outside this repo through Cursor dashboard/org settings, GitHub App repository access, optional Admin API/team configuration, and a live pull-request smoke review after this file lands on the default branch.

## Manual PR triggers

On GitHub pull requests, a top-level comment with `cursor review` or `bugbot run` should request a Bugbot review when the managed service is enabled for the repo. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` to ask for request IDs/log detail; do not treat verbose mode as a deeper code review.

## Project shape

- Next.js App Router hosts a browser-only Phaser game prototype.
- `src/app/page.tsx` renders `src/game/GameCanvas.tsx`; keep Phaser imports out of server components.
- `src/game/scenes/DungeonScene.ts` owns most runtime behavior: preload, scene lifecycle, input, combat, power-ups, audio, camera, HUD, and collision.
- `src/game/maps/startingDungeon.ts` defines regenerated dungeon layout helpers.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. `public/assets/audio/audio-manifest.json`, when touched, is auxiliary consistency data.

## Review priorities

1. Build/runtime safety: watch for server/client boundary regressions, unchecked browser APIs, Phaser lifecycle leaks, stale timers/tweens, and object cleanup on restart.
2. Gameplay behavior: protect movement, camera follow, collision, enemy contact damage, projectile ammo, seeker ammo, heart pickups, power-up timing, scoring, game-over/reset, and debug overlay behavior.
3. Phaser canvas UX: verify pointer zones, keyboard/mouse affordances, sound toggle state, responsive placement, pixel-art scaling, and readable overlay depth.
4. Asset consistency: changes to `assetManifest`, Phaser preload keys, sprite-sheet frame sizes, JSON metadata, and files under `public/assets` should stay synchronized.
5. DOM/metadata UI: this repo does not configure Tailwind; for HTML UI, follow semantic elements and existing `src/app/globals.css` patterns.
6. Dependency/generated-file churn: require a clear reason for lockfile edits, `next-env.d.ts` route-type churn, `.next` artifacts, or generated asset replacements.

## Known baseline caveats

- `npm run lint` maps to `next lint`, which is not reliable with the current Next version. Prefer build plus TypeScript verification.
- `npm ci` may report existing audit advisories from the dependency baseline; do not block unrelated PRs solely on those existing advisories.
- Both `package-lock.json` and `pnpm-lock.yaml` are tracked. If dependencies change, verify intentional updates to every affected lockfile.
- README says `Space` or `J` fires, but current runtime binding is `Space` plus pointer/click firing. Block only changes that worsen or intentionally touch input/docs without resolving the mismatch.
- Seeker ammo is implemented in code after progression thresholds but is not fully documented in README.
- README describes blast as rare late-game, while `POWERUP_CONFIG` may unlock it earlier; treat that as existing docs/code drift unless the PR targets it.
- `next dev` and production typegen can rewrite `next-env.d.ts` between `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`; restore incidental churn.

## Verification guidance

For normal code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For asset or tooling changes, also run the specific generator/processor that matches the touched files, for example:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
python3 tools/process_corporate_goblin_assets.py
python3 tools/process_spreadsheet_brute_assets.py
node tools/process_gpt_tile_powerup_assets.mjs
node tools/process_pickup_intent_effect_assets.mjs
node tools/generate_polish_sprites.mjs
```
