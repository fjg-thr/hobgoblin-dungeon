# Bugbot review guide

Use this repository guide when reviewing pull requests for the Hobgoblin Ruin Prototype. It is a Next.js App Router app that mounts a browser-only Phaser dungeon scene from `src/game/GameCanvas.tsx` and `src/game/scenes/DungeonScene.ts`.

## Deployment boundary

- This file is the repo-side Bugbot deployment artifact. It gives Cursor Bugbot project-specific review context after the Cursor GitHub App/Bugbot integration is enabled for the repository in Cursor dashboard settings.
- Do not expect a GitHub Actions workflow, dependency, or npm script to enable the managed Bugbot service. For a live deployment smoke check, use a PR comment such as `cursor review` or `bugbot run` after this file is on the branch Bugbot reads.
- If Bugbot is not appearing on PRs, verify Cursor dashboard/org settings, GitHub App repository access, and any managed Bugbot run settings outside this repository.

## High-risk areas

- `src/game/GameCanvas.tsx`: keep Phaser dynamically imported in the client component, preserve single-game initialization via `gameRef`, and destroy the game on unmount.
- `src/game/scenes/DungeonScene.ts`: review gameplay changes for start/game-over state, input handling, projectile cooldown/ammo, seeker ammo, power-up timers, enemy spawning, camera/HUD resize behavior, audio mute persistence, and shutdown listener cleanup.
- `src/game/maps/startingDungeon.ts`: preserve generated map invariants: playable start tile, reachable rooms/corridors, blocked props/walls excluded from spawnable spaces, and stable tile-code handling.
- `src/game/assets/manifest.ts` and `public/assets/**`: every manifest path should have a matching tracked asset/metadata file, and every new generated asset should be referenced through the manifest or documented tooling.
- `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css`: review DOM metadata and shell changes for semantic HTML, viewport-safe full-screen layout, and regressions in canvas mounting.

## Known baseline context

- README mentions `Space` or `J` to fire, while the current Phaser input binds firing to `SPACE` and pointer/click. Flag new input/control documentation drift, but do not block unrelated PRs only for the existing `J` mismatch.
- README documents regular ammo and power-ups, but current gameplay also includes seeker ammo after progression thresholds. Treat seeker ammo behavior as code-defined unless a PR intentionally updates docs.
- README describes blast as a rare late-game power-up, while current config unlocks blast earlier. Flag changes that worsen or claim to fix this mismatch without updating both docs and code.
- `layout.tsx` references `/opengraph-image.png`; if a PR touches metadata or public image assets, verify it does not introduce or worsen broken public references.

## Review priorities

- Prefer concrete runtime risks over style-only comments. Look for changes that can break browser-only Phaser boot, asset loading, resize handling, input cleanup, audio unlock/mute behavior, or replay after game over.
- For gameplay tuning, check edge cases around low ammo, simultaneous pickup/enemy/projectile collisions, death while effects are active, and difficulty progression over longer sessions.
- For map/collision changes, check both tile-space and world-space math. Isometric rendering order, wall blocking, bridge/chasm tiles, prop blocking, and spawn placement should remain consistent.
- For UI/HUD changes inside Phaser, review pointer zones, keyboard and mouse affordances, scaled hit areas, responsive placement, and whether interactive state survives resize.
- For DOM UI outside Phaser, follow existing CSS patterns in `src/app/globals.css`. This repo does not currently use Tailwind or ShadCN.

## Asset and audio tooling

- Existing npm scripts include `npm run process:assets`, `npm run process:death-assets`, `npm run process:combat-juice`, `npm run generate:powerups`, and `npm run generate:combat-assets`.
- Additional generator/processor entry points include `tools/process_actor_death_assets.mjs`, `tools/process_combat_juice_assets.mjs`, `tools/process_gpt_tile_powerup_assets.mjs`, `tools/process_pickup_intent_effect_assets.mjs`, `tools/process_assets.py`, `tools/process_corporate_goblin_assets.py`, `tools/process_spreadsheet_brute_assets.py`, `tools/generate_audio_sfx.mjs`, `tools/generate_polish_sprites.mjs`, `tools/generate_powerup_sprites.mjs`, `tools/generate_brute_ammo_sprites.mjs`, and `scripts/generate-retro-soundtrack.mjs`.
- Python processors should be run with `python3`; Node `.mjs` tools should be run with `node`.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded audio, including the retro dungeon theme. `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when audio assets change.

## Suggested verification

- Markdown/config-only changes: run `git diff --check` against the PR base and inspect the changed files.
- TypeScript/runtime changes: run `npm run build` and `npx tsc --noEmit --incremental false`.
- Asset manifest changes: verify referenced files exist under `public/assets/**`; run the relevant explicit generator/processor command when generated outputs change.
- Manual smoke checks for gameplay-affecting changes: start the app, begin a run, move with WASD/arrows, aim with the pointer, fire with Space and click, collect ammo/power-ups/hearts, toggle SOUND/MUTED, resize the viewport, toggle F3 debug overlay, die, and restart.
