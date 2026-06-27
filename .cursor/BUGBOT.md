# Cursor Bugbot review guide

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for Hobgoblin Ruin Prototype.

## Deployment boundary

- This file provides review guidance only. Confirm managed Bugbot enablement in
  Cursor dashboard or organization settings, Cursor GitHub App repository
  access, optional Admin API/team configuration, and a live PR smoke review
  outside this repository.
- Repository guidance is effective after it is merged to the default branch. A
  PR that adds or edits this file may not be reviewed with the new rules.
- Manual top-level PR comment triggers: `cursor review`, `bugbot run`, and the
  verbose diagnostic variants `cursor review verbose=true` or
  `bugbot run verbose=true` when request IDs or service logs are needed.

## Project shape

- Next.js App Router hosts a client-only Phaser game.
- `src/game/GameCanvas.tsx` owns the Phaser game lifecycle and browser-only
  integration.
- `src/game/scenes/DungeonScene.ts` contains the main gameplay loop, input,
  UI overlays, enemy behavior, powerups, scoring, audio, and scene state.
- `src/game/maps/startingDungeon.ts` generates map/tile layout data.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded
  image, atlas, sprite sheet, and audio assets. JSON files in `public/assets`
  should stay consistent with runtime manifest usage when touched.

## Review priorities

1. Build and runtime safety: flag changes that break `next build`,
   client/server boundaries, dynamic Phaser imports, strict TypeScript, or asset
   loading paths.
2. Gameplay regressions: inspect movement, aiming, firing, collision, enemy
   damage, pickups, score/life/ammo state, powerup timers, restart flow, and
   game-over behavior when related files change.
3. Phaser lifecycle and canvas UX: check scene cleanup, duplicate listeners,
   pointer zones, keyboard/mouse affordances, responsive placement, mute state,
   and overlays inside the canvas.
4. Asset and generated-file consistency: image/audio manifest changes should
   match files under `public/assets`; generated source sheets and processor
   scripts should not be mixed with unrelated gameplay edits.
5. DOM metadata and future HTML UI: follow existing semantic markup and
   `src/app/globals.css` patterns. This repo does not currently configure
   Tailwind or shadcn/ui.
6. Dependency and tooling churn: treat dependency, lockfile, and generated
   typing changes as important only when they are intentional and scoped.

## Known baseline caveats

- `npm run lint` maps to `next lint`, which is not reliable for the current
  Next version. Prefer build plus TypeScript verification.
- `npm ci` currently reports baseline audit advisories for existing
  dependencies; do not block unrelated PRs solely on those known advisories.
- Both `package-lock.json` and `pnpm-lock.yaml` are present. Require a clear
  reason before changing lockfiles.
- Next verification may rewrite `next-env.d.ts` between dev and production
  route-type paths. Restore that generated churn unless the PR intentionally
  changes Next typing behavior.
- README mentions `Space` or `J` firing, while current gameplay binds shooting
  to `SPACE` and pointer/click firing. Treat this as an existing docs/code drift
  unless an input or controls PR is changing it.
- README does not document seeker ammo behavior even though the game code has
  seeker pickups/projectiles. Review code-defined seeker behavior when touched.
- README describes blast as rare late-game, but current powerup config may
  unlock it earlier. Treat this as an existing docs/code drift unless changed.

## Verification guidance

For normal code changes, ask for or run:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For asset/tooling changes, also review or run the specific touched generator or
processor, for example:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
python3 tools/process_corporate_goblin_assets.py
node tools/process_gpt_tile_powerup_assets.mjs
node tools/process_pickup_intent_effect_assets.mjs
python3 tools/process_spreadsheet_brute_assets.py
node tools/generate_polish_sprites.mjs
```
