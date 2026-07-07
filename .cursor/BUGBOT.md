# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull requests for Hobgoblin Ruin. Keep findings focused on bugs, regressions, security issues, broken gameplay, build failures, or missing verification evidence.

## Deployment boundary

- This file gives hosted Cursor Bugbot review context after it is merged to the default branch.
- Enabling or disabling the managed Bugbot service is outside this repository. Validate Cursor dashboard or organization settings, GitHub App repository access, Admin API credentials when used, and at least one PR-review smoke check in the live service.
- If those external controls are unavailable, state that repository files can only provide review guidance and cannot prove managed Bugbot enablement.
- Manual top-level PR triggers supported by Cursor docs include `cursor review` and `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` to surface request IDs and log details.

## Project map

- Next.js App Router entry points live in `src/app/page.tsx`, `src/app/layout.tsx`, and `src/app/globals.css`.
- `src/game/GameCanvas.tsx` is a client component that dynamically imports Phaser and `DungeonScene`, creates one `Phaser.Game`, and destroys it in `useEffect` cleanup.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, input, UI overlays, audio, enemy AI, projectiles, pickups, power-ups, scoring, game-over flow, and Phaser object lifecycle code.
- `src/game/maps/startingDungeon.ts` generates the room-and-corridor map, collision tile codes, player start, enemy starts, props, chasms, bridge tiles, and stairs.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded image, sprite-sheet, UI, effect, projectile, pickup, power-up, and audio asset paths.
- `public/assets/audio/audio-manifest.json` is auxiliary consistency data; changing audio usually also needs `assetManifest.audio` updates.
- Generated asset and audio tooling lives under `tools/` and `scripts/`, including `tools/generate_audio_sfx.mjs`, `scripts/generate-retro-soundtrack.mjs`, `tools/process_corporate_goblin_assets.py`, and `tools/process_spreadsheet_brute_assets.py`.

## Review priorities

- Prioritize runtime crashes, stuck start/game-over states, lost input, missing cleanup of Phaser listeners/timers/tweens/game objects, asset path mismatches, and regressions that make the dungeon impossible to play.
- Watch client/server boundaries: Phaser must stay out of server-rendered code, browser globals must remain inside client-only effects or Phaser scene methods, and dynamic imports should not create duplicate games on React remounts.
- Phaser is pinned to `4.0.0-rc.4`; review Phaser API usage against that RC and be cautious with examples from Phaser 3 or later releases.
- For scene lifecycle changes, check `Phaser.Scenes.Events.SHUTDOWN` cleanup, input listener removal, tween/timer cancellation, audio stop/mute behavior, and restart paths.
- For shared constants and config, prefer one source of truth over duplicated magic numbers.

## Gameplay and input facts

- Movement uses WASD or arrow keys in isometric directions.
- Runtime shooting is currently bound to Space and pointer/click firing. The README also mentions `J`; flag that mismatch for input/control documentation PRs, but do not block unrelated PRs solely because the mismatch already exists.
- Pointer aim snaps shots to 15-degree angles and click queues one shot toward the pointer.
- The start screen and how-to-play modal are rendered inside Phaser, with compact and tiny viewport layout branches, pointer hit zones, close behavior, and Space-to-start behavior. Review viewport/layout changes for mobile-sized screens as well as desktop.
- Initial goblins come from `dungeon.enemyStarts`; additional goblins ramp with target enemy count. Brutes unlock after `BRUTE_UNLOCK_KILLS` or `BRUTE_UNLOCK_MS`, not from the start.
- Seeker ammo is code-defined gameplay unlocked after `SEEKER_UNLOCK_KILLS` or `SEEKER_UNLOCK_MS`; it is not currently documented in the README controls section.
- `POWERUP_CONFIG` controls unlock gates, weights, sprite rows, colors, and labels for quickshot, haste, ward, and blast. Durations and effect timing live in nearby constants such as `QUICKSHOT_DURATION_MS`, `HASTE_DURATION_MS`, and `WARD_DURATION_MS`; blast uses `blastShotReady`.
- Hearts restore missing health after kill milestones and should not increase max health.
- The lower-right `SOUND` / `MUTED` Phaser button toggles scene audio; review audio changes for both muted and unmuted states.

## Asset, UI, and metadata checks

- Asset PRs should keep PNG/WAV files, JSON frame metadata, `assetManifest`, README asset lists, and generation scripts consistent.
- Sprite-sheet frame dimensions, frame rows, animation keys, and texture keys must match the constants used in `DungeonScene.ts`.
- OpenGraph metadata in `src/app/layout.tsx` references `/opengraph-image.png` at 1360 x 752 with descriptive alt text. Metadata/share-image changes should keep the public asset, dimensions, and alt text aligned.
- This repo does not configure Tailwind. DOM styling should follow existing semantic markup and `src/app/globals.css`; Phaser canvas UI should be reviewed separately for pointer zones, keyboard affordances, responsive placement, contrast, and inaccessible canvas-only controls.

## Verification expectations

- For source changes, prefer `npm run build` and `npx tsc --noEmit --incremental false`. `next lint` is not reliable in this Next 16 setup.
- `npm run build` can rewrite `next-env.d.ts`; restore it unless the PR intentionally changes generated Next typing behavior.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because incremental compilation is enabled; avoid or remove that artifact.
- For guidance-only changes to this file, verify the diff is limited to `.cursor/BUGBOT.md`, run Markdown/content checks, and confirm a clean git status after commit and push.
- For gameplay changes, smoke check loading the app, starting a run, moving, aiming, Space shooting, pointer/click shooting, collecting ammo and at least one power-up, toggling sound, taking damage, game over, restart, and the how-to-play modal.
- For asset-heavy PRs, ask for generation commands, before/after screenshots or recordings, and evidence that sprite metadata matches runtime frame sizes.
