# Cursor Bugbot review guide

Use this repository-specific context when reviewing pull requests for Hobgoblin Ruin.

## Project context

- This is a Next.js App Router prototype that mounts a Phaser 4 canvas from `src/game/GameCanvas.tsx`.
- Gameplay lives mostly in `src/game/scenes/DungeonScene.ts`; map generation is in `src/game/maps/startingDungeon.ts`.
- The source of truth for runtime assets is `src/game/assets/manifest.ts`. Static files are under `public/assets`.
- UI that is rendered in the DOM uses semantic React/Next.js and `src/app/globals.css`. In-canvas UI is Phaser-based and should be reviewed for pointer zones, keyboard affordances, readable placement, and responsive behavior.

## Review priorities

- Flag code that imports Phaser or touches `window`/browser APIs from a server component. Client-only game code should stay behind the existing `"use client"` boundary.
- Check Phaser lifecycle changes for cleanup of input handlers, timers, tweens, sounds, animations, and scene events on shutdown/restart paths.
- For gameplay changes, look for regressions in movement, camera follow, collision, enemy spawning, projectiles, ammo, pickups, power-ups, scoring, game-over/restart, mute state, and debug overlay behavior.
- For asset changes, verify that every referenced image/audio/JSON file exists and that frame sizes, keys, and metadata match `assetManifest`. If audio changes, keep `assetManifest.audio` as the runtime source of truth; `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- For metadata changes, `src/app/layout.tsx` references `/opengraph-image.png`; require the public image when that metadata is present or modified.
- Do not request Tailwind or shadcn patterns here unless they have been added to the project; this repo currently uses plain CSS and Phaser canvas UI.

## Known baseline mismatches

- README says `Space` or `J` fires, but `DungeonScene` currently binds shooting to `SPACE` while pointer/click firing also works. Block only PRs that touch controls/docs and worsen or rely on this mismatch.
- README describes regular ammo, heart pickups, quickshot, haste, ward, and blast. Code also includes seeker ammo/projectiles after progression thresholds; treat seeker behavior as code-defined unless a PR updates docs.
- README describes blast as late and rare, while current `POWERUP_CONFIG` unlocks blast earlier. Treat this as an existing docs/code mismatch unless the PR is meant to fix power-up progression.

## Asset tooling

When PRs touch generated assets, check whether the relevant generator or processor should be rerun:

- `npm run process:assets` / `python3 tools/process_assets.py`
- `npm run process:death-assets` / `node tools/process_actor_death_assets.mjs`
- `npm run process:combat-juice` / `node tools/process_combat_juice_assets.mjs`
- `npm run generate:powerups` / `node tools/generate_powerup_sprites.mjs`
- `npm run generate:combat-assets` / `node tools/generate_brute_ammo_sprites.mjs`
- `node tools/generate_audio_sfx.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `python3 tools/process_spreadsheet_brute_assets.py`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `node tools/generate_polish_sprites.mjs`
- `node scripts/generate-retro-soundtrack.mjs`

## Verification expectations

- Prefer `npm run build` and `npx tsc --noEmit --incremental false` for TypeScript/Next.js changes.
- `npm run lint` may be unreliable with the current Next.js version; do not treat the script alone as the primary quality gate.
- For Markdown-only guidance changes, whitespace validation such as `git diff --check` is sufficient.
- Cursor Bugbot itself is a managed Cursor/GitHub App integration. This file provides review context after it is merged to the default branch, but it does not prove that the dashboard setting, GitHub App access, or optional Admin API credentials are enabled.
