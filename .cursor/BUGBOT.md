# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype.

## Deployment and triggers

- This file provides repository-specific guidance for Cursor Bugbot. The managed Bugbot service is enabled outside the repo through Cursor dashboard/org settings and GitHub App repository access.
- After this file is merged to the default branch, manual top-level PR comments can request a review with `cursor review` or `bugbot run`.
- For troubleshooting, manual comments can request verbose output with `cursor review verbose=true` or `bugbot run verbose=true`.
- PRs that add or change `.cursor/BUGBOT.md` might not be reviewed with the new guidance until after those changes reach the default branch.

## Project map

- `src/app/page.tsx` renders the app shell and mounts the client-only game canvas.
- `src/game/GameCanvas.tsx` owns the React/Phaser boundary. It dynamically imports `phaser` and `DungeonScene`, creates one `Phaser.Game`, uses `Phaser.Scale.RESIZE`, and destroys the game on React unmount.
- `src/game/scenes/DungeonScene.ts` is the main Phaser scene. It handles preload/create/update flow, generated map rendering, keyboard and pointer input, player/enemy simulation, projectiles, power-ups, HUD, audio, start/game-over overlays, and debug drawing.
- `src/game/maps/startingDungeon.ts` generates the room/corridor dungeon, tile codes, collision helpers, and prop placement used by the scene.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded sprites, metadata, UI images, effects, and audio. `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when audio assets change.
- Asset generation and processing tools live in both `tools/` and `scripts/`. Generated or processed assets are loaded from `public/assets/**`.

## Review priorities

1. **Game lifecycle and browser boundaries**
   - Check that browser-only code stays behind `"use client"` or dynamic imports.
   - Flag changes that can create multiple Phaser game instances, leak scenes, timers, tweens, input handlers, sounds, or DOM listeners across React remounts or scene restarts.
   - Verify resize/camera changes preserve full-window play, pixel-art rendering, and responsive HUD placement.

2. **Gameplay correctness**
   - Review tile/world coordinate conversions, collision radii, depth sorting, map bounds checks, pathfinding, enemy spawning, pickup spawning, and projectile hit tests together. Small math changes can cause invisible walls, unreachable pickups, or unfair enemy contact.
   - For combat changes, follow the full loop: ammo accounting, standard and seeker projectile behavior, blast-charged shots, enemy damage/knockback/death, score updates, drops, hit-stop, camera shake, and cleanup.
   - For power-up changes, check unlock timing/kills, weighted selection, duration stacking, HUD text, visual indicators, and reset behavior on game restart.

3. **Assets and audio**
   - Any new runtime asset should be present under `public/assets/**`, listed in `assetManifest` with the correct key/path/frame sizes, and loaded before use in `DungeonScene`.
   - Sprite-sheet JSON, frame dimensions, animation frame ranges, and generated PNG dimensions should agree.
   - Audio changes should keep `assetManifest.audio` and `public/assets/audio/audio-manifest.json` consistent when both are relevant.
   - Generated asset changes should include source/tooling context when practical and avoid committing transient build artifacts.

4. **Next.js, TypeScript, and UI**
   - Preserve strict TypeScript behavior; prefer explicit domain types for scene state, asset keys, and gameplay constants.
   - This repo does not currently configure Tailwind or ShadCN. Follow existing semantic HTML and `src/app/globals.css` patterns for DOM UI, and review Phaser canvas UI for pointer hit areas, readable text, keyboard/mouse affordances, and sound toggle clarity.
   - Metadata changes should verify that referenced public files exist and that `NEXT_PUBLIC_SITE_URL`/`VERCEL_URL` handling remains safe for local and deployed builds.

5. **Performance and maintainability**
   - In `DungeonScene.ts`, pay close attention to per-frame allocations, unbounded arrays, expensive pathfinding, and object lifetimes.
   - Prefer focused helpers and existing local patterns over broad rewrites of the large scene file.
   - Keep generated route/type artifacts such as `.next/**`, `next-env.d.ts` churn, and `tsconfig.tsbuildinfo` out of functional PRs unless intentionally changing tooling output.

## Known baseline context

- README currently says `Space` or `J` fires, but `DungeonScene` binds shooting to `SPACE` and pointer/click firing. Flag this only for input/control documentation PRs or changes that worsen the mismatch.
- README documents regular ammo and core power-ups, but the code also has seeker ammo/projectiles that unlock after kills or elapsed time. Treat this as existing context unless a PR claims to update gameplay docs.
- README describes blast as a rare late-game power-up; current code unlocks blast after 2 kills or 16 seconds. Do not block unrelated PRs solely for this existing mismatch.
- `src/app/layout.tsx` references `/opengraph-image.png`; verify public asset inventory when reviewing metadata/OpenGraph changes.

## Suggested verification

- General TypeScript/Next changes: `npm ci`, `npm run build`, and `npx tsc --noEmit`.
- Phaser/gameplay changes: also run the app locally and smoke test movement, pointer aiming, `SPACE` firing, click firing, pickup collection, enemy contact damage, game over/restart, sound toggle, resize, and `F3` debug overlay.
- Asset changes: inspect the changed files under `public/assets/**`, confirm manifest paths and frame sizes, and run the relevant generator/processor only when the PR intentionally updates generated outputs.
- Documentation-only changes can use focused markdown review plus `git diff --check`.

## Review output expectations

- Lead with actionable findings, ordered by severity, with exact file and line references.
- Distinguish new regressions from known baseline limitations.
- Call out missing verification when a PR touches gameplay, asset loading, build configuration, or deployment behavior.
- Avoid blocking on speculative redesigns; focus on correctness, regressions, safety, and user-visible behavior.
