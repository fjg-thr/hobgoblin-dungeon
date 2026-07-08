# Cursor Bugbot review guidance

Use this file as repository-specific context when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Deployment and trigger checks

- This file only deploys repo-side review guidance. Managed Cursor Bugbot enablement still must be verified in Cursor dashboard/org settings, GitHub App repository access, Admin API credentials if used, and a live PR review smoke check.
- After this file is merged to the default branch, a top-level PR comment of `cursor review` or `bugbot run` should trigger a review. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` and capture request IDs/log details.
- Do not claim Bugbot is fully enabled from this repo change alone. If service access is unavailable, state that only repository guidance was updated.

## Project map

- Next.js app entry points live in `src/app/page.tsx`, `src/app/layout.tsx`, and `src/app/globals.css`.
- Phaser boots from `src/game/GameCanvas.tsx`; most gameplay, UI overlays, controls, audio, and combat behavior live in `src/game/scenes/DungeonScene.ts`.
- Dungeon topology and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Runtime asset/audio loading is driven by `src/game/assets/manifest.ts`; `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- Asset generation and processing scripts live under `tools/` and `scripts/`, including `tools/generate_audio_sfx.mjs`, `scripts/generate-retro-soundtrack.mjs`, `tools/process_corporate_goblin_assets.py`, and `tools/process_spreadsheet_brute_assets.py`.

## High-priority review focus

- Gameplay changes: verify movement, camera follow, collision, projectile hitboxes, enemy spawning, damage, score/ammo state, game over, and restart flows together because most state is scene-local.
- Controls: current runtime shooting is Space plus pointer/click firing; README also mentions J. Flag control-doc mismatches when input behavior or docs change, but do not block unrelated PRs solely for that baseline.
- Start/how-to-play UI: preserve compact and tiny viewport layouts, pointer hit zones, Escape/close behavior, and control-copy consistency.
- Power-ups and drops: `POWERUP_CONFIG` controls unlock gates, spawn weights, and presentation. Durations/effects live in nearby constants and collection logic; blast uses `blastShotReady`.
- Enemy progression: initial goblins come from `dungeon.enemyStarts`; extra goblins ramp with target enemy count; brutes are gated by `BRUTE_UNLOCK_KILLS` / `BRUTE_UNLOCK_MS`.
- Ammo: README documents regular ammo; code also has seeker ammo unlock/drop/pickup behavior. Review seeker behavior against code, not README alone.
- Assets: keep sprite sheet PNG/JSON dimensions, frame rows, manifest keys, and generated asset references in sync. Do not approve orphaned assets or manifest paths.
- Audio: keep `assetManifest.audio`, generated WAV files, and `public/assets/audio/audio-manifest.json` aligned when audio changes.
- Metadata/share images: `src/app/layout.tsx` references `/opengraph-image.png` at 1360 x 752 with alt text; metadata PRs must keep file, dimensions, and copy consistent.
- Styling/accessibility: this repo uses `globals.css`, not Tailwind. DOM changes should use semantic elements and accessible labels; Phaser canvas UI should preserve pointer zones, keyboard/mouse affordances, responsive placement, and readable contrast.

## Verification expectations

- Prefer `npm ci`, `npm run build`, and `npx tsc --noEmit --incremental false` for source changes. `next lint` is not reliable with the current Next version.
- `npm run build` may rewrite `next-env.d.ts`; restore it unless generated typing behavior is intentionally changed. Remove `tsconfig.tsbuildinfo` if created by type-checking.
- For asset or audio PRs, verify the relevant generator/processor command and inspect manifest references; include manual smoke-test notes for game boot, controls, pickups, combat, mute toggle, and responsive overlays.
- Also run `git diff --check` before approval and call out any existing npm audit findings as pre-existing unless dependencies changed.
