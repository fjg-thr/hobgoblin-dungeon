# Cursor Bugbot Review Guide

Use this file as repository-specific guidance when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin prototype.

## Deployment boundary

- This file gives Bugbot review context after it is merged into the default branch.
- Enabling the managed Bugbot service is not controlled by repository files. Verify that separately in Cursor organization settings, GitHub App repository access, and any Bugbot Admin API/service configuration used by the team.
- If you cannot access those settings, say that repo guidance was deployed but managed service activation could not be proven from the codebase alone.
- Manual PR review triggers supported by Cursor docs include top-level PR comments `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` and inspect the returned request/log details.

## Project snapshot

- Next.js app with React and TypeScript. The game runs in a Phaser scene mounted by the app.
- Main gameplay file: `src/game/scenes/DungeonScene.ts`.
- Runtime asset registry: `src/game/assets/manifest.ts`. Treat `assetManifest` as the source of truth for images, sprite sheets, and audio loaded by Phaser.
- Global page metadata lives in `src/app/layout.tsx`; DOM/global styles live in `src/app/globals.css`.
- Asset processing and generation scripts live under `tools/` and `scripts/`.
- Both `package-lock.json` and `pnpm-lock.yaml` are tracked. Dependency changes should keep both ecosystems in sync.

## Review priorities

### 1. Build and type safety

- Prefer `npm run build` and `npx tsc --noEmit --incremental false` for source changes.
- `next lint` is listed in `package.json`, but this Next version may not provide a reliable lint command. Do not require it as the only verification.
- Watch for generated route type churn in `next-env.d.ts`. `next dev` can rewrite it to `.next/dev/types/routes.d.ts`, while production type generation can rewrite it to `.next/types/routes.d.ts`. Do not accept incidental changes unless the PR intentionally changes Next typing behavior.
- For dependency PRs, check installed versions, lockfiles, and vulnerable transitive packages across both npm and pnpm lockfiles.

### 2. Phaser gameplay behavior

- `DungeonScene.ts` owns input, update loops, camera, HUD, combat, pickups, audio, start screen, game-over screen, and debug overlays. Changes here have broad blast radius.
- Movement is `WASD` or arrow keys. Runtime shooting currently uses `SPACE` and pointer/click firing. README mentions `Space` or `J`, but `J` is not currently bound; treat that as an existing docs/runtime mismatch unless a PR touches controls or control documentation.
- Pointer/click firing must keep aim updates and shot queuing aligned. Avoid regressions where clicking UI controls also fires a projectile.
- Debug overlay is toggled with `F3` and includes collision/player bounds/tile coordinates.
- Keep camera zoom, depth ordering, and responsive HUD placement stable across desktop and compact viewports.

### 3. Combat, progression, and pickups

- Initial goblins are seeded from `dungeon.enemyStarts` via `createEnemies()`.
- Additional enemy pressure ramps with `targetEnemyCount()`, elapsed time, and kill pressure. Brutes unlock through `BRUTE_UNLOCK_KILLS` or `BRUTE_UNLOCK_MS`, then remain capped by `MAX_BRUTES`.
- `POWERUP_CONFIG` controls power-up rows, spawn weights, unlock gates, colors, labels, and debug metadata.
- Effect durations and behavior are controlled by nearby constants and logic, for example `QUICKSHOT_DURATION_MS`, `HASTE_DURATION_MS`, `WARD_DURATION_MS`, and `blastShotReady`.
- README documents quickshot, haste, ward, blast, hearts, and regular ammo. The code also supports seeker ammo/projectiles after progression gates. Do not require README to mention seeker ammo unless the PR intentionally changes ammo docs or seeker behavior.
- README calls blast a rare late-game power-up, but current code unlocks blast through `POWERUP_CONFIG`. Treat any mismatch as existing unless the PR changes power-up progression or docs.

### 4. Assets and audio

- Phaser loads runtime assets from `assetManifest` in `src/game/assets/manifest.ts`. Any new runtime asset must be present under `public/` and registered in the manifest before scene code uses it.
- `public/assets/audio/audio-manifest.json` is auxiliary. If audio changes touch it, compare it with `assetManifest.audio` for consistency, but do not treat it as the runtime loader.
- Relevant asset tooling includes:
  - `python3 tools/process_assets.py`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
- Generated image/audio PRs should preserve pixel-art constraints: nearest-neighbor scaling, transparent backgrounds where expected, stable frame dimensions, and matching metadata JSON.
- Reject code paths that load assets from developer-local absolute paths or remote URLs for runtime gameplay assets.

### 5. UI, metadata, and accessibility

- This repo does not currently configure Tailwind or ShadCN. For DOM UI changes, use existing semantic HTML and `src/app/globals.css` patterns unless the PR intentionally introduces a styling system.
- Most UI is Phaser canvas UI, not DOM. Review pointer hit zones, keyboard/mouse affordances, modal close behavior, text readability, and compact/tiny viewport layouts.
- The start screen and how-to-play modal include responsive layout branches and close behavior. Changes should not break compact viewport placement or allow clicks behind the modal.
- `src/app/layout.tsx` references `/opengraph-image.png`, and `public/opengraph-image.png` is tracked at `1360x752`. If a PR touches metadata/share images, require the asset, dimensions, and alt text to stay in sync.

### 6. Audio

- Audio is loaded through `assetManifest.audio` and controlled by the scene-level mute toggle.
- The lower-right button displays `SOUND` or `MUTED`. Changes should preserve clear state feedback and avoid autoplay/promise errors.
- Keep volume/rate tweaks scoped. Avoid adding large binary audio files unless the PR explains why generated or compressed assets are insufficient.

### 7. Dependency and framework changes

- `next`, `react`, `react-dom`, TypeScript, and React types use `latest`; Phaser is pinned to `4.0.0-rc.4`.
- Be cautious with Phaser upgrades because game APIs, input events, blend modes, animation APIs, and texture filtering can change.
- If a PR changes dependencies, verify `package.json`, `package-lock.json`, and `pnpm-lock.yaml` agree and that both npm and pnpm installs remain viable.

## Suggested verification by change type

- General source changes:
  - `npm run build`
  - `npx tsc --noEmit --incremental false`
- Asset manifest or generated asset changes:
  - Run the relevant generator/processor listed above.
  - Confirm manifest paths exist under `public/`.
  - Run `npm run build`.
- Gameplay/input/HUD changes:
  - Run `npm run dev`.
  - Smoke-test start screen, how-to-play modal open/close, movement, `SPACE` firing, click firing, mute toggle, damage, pickups, and game over.
  - Test at least one compact viewport size.
- Metadata changes:
  - Confirm `metadataBase`, OpenGraph/Twitter image paths, dimensions, and files in `public/` match.

## Bugbot finding style

- Lead with correctness, user-facing regressions, security/privacy issues, broken builds, missing assets, and missing verification for high-risk changes.
- Do not block PRs solely for pre-existing mismatches noted in this file unless the PR touches that area or makes the mismatch worse.
- Prefer precise file/line findings with a concrete failure mode and a minimal fix.
- Keep suggestions scoped to the PR. Avoid broad rewrites of `DungeonScene.ts` unless the changed code makes a focused extraction necessary.
