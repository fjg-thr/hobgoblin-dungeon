# Cursor Bugbot review guidance

Use this context when reviewing pull requests for this repository. Prioritize correctness, runtime regressions, asset consistency, and review signal over style-only comments.

## Project context

- This is a Next.js App Router prototype for a browser-only Phaser 4 dungeon game.
- `src/app/page.tsx` renders the client game entrypoint; `src/game/GameCanvas.tsx` dynamically boots Phaser on the client.
- The main gameplay surface is `src/game/scenes/DungeonScene.ts`.
- Map and runtime asset sources of truth are `src/game/maps/startingDungeon.ts` and `src/game/assets/manifest.ts`.
- Static sprites, tilemaps, UI panels, and audio live under `public/assets/`.

## High-signal review priorities

1. **Client-only Phaser lifecycle**
   - Verify changes keep Phaser out of server rendering paths.
   - Check `GameCanvas` effect cleanup, scene destruction, event listeners, timers, keyboard handlers, pointer handlers, and audio resources for leaks across hot reloads or route changes.
   - Flag React changes that instantiate game objects during render instead of inside client-only effects.

2. **Gameplay correctness**
   - Review changes to movement, aiming, projectile spawning, ammo, hearts, powerups, enemy AI, collision, scoring, and game-over state for regressions in existing controls.
   - Current player controls are `WASD`/arrows for movement, mouse/pointer aiming, `Space` shooting, and click-to-fire. The README also mentions `J`; treat that as existing documentation drift unless the PR is about controls or docs.
   - Seeker ammo exists in code but is not fully documented in README; do not block unrelated PRs solely for that baseline mismatch.
   - README describes blast as late and rare, while current code gates powerups through `POWERUP_CONFIG`; flag only changes that worsen or intentionally touch that behavior.

3. **Map, camera, and collision changes**
   - Confirm tile coordinate, isometric projection, depth sorting, wall collision, bridge/stair behavior, camera bounds, and debug overlay updates stay consistent.
   - For map edits, verify spawned entities and pickups do not appear inside blocking tiles or unreachable areas.

4. **Assets and manifests**
   - If a PR adds, removes, renames, or regenerates assets, check `public/assets/**`, `src/game/assets/manifest.ts`, and README asset references together.
   - Runtime audio loading uses `assetManifest.audio`; `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
   - Do not request manual edits to generated sprite sheets when the generator/processor source should change instead.
   - Relevant tooling includes:
     - `npm run process:assets`
     - `npm run process:death-assets`
     - `npm run process:combat-juice`
     - `npm run generate:powerups`
     - `npm run generate:combat-assets`
     - `node tools/generate_audio_sfx.mjs`
     - `node scripts/generate-retro-soundtrack.mjs`
     - `python3 tools/process_corporate_goblin_assets.py`

5. **UI, metadata, and accessibility**
   - This repo does not currently configure Tailwind or shadcn/ui. Review DOM UI against existing semantic HTML and `src/app/globals.css` patterns.
   - For Phaser canvas UI, focus on pointer zones, keyboard/mouse affordances, readable placement at different viewport sizes, and whether canvas-only interactions need mirrored DOM affordances.
   - `src/app/layout.tsx` references `/opengraph-image.png`; the tracked repo may not include that asset. Flag metadata or share-image changes that add broken references or worsen dimensions/alt text, but do not block unrelated PRs solely for the existing baseline.

6. **Dependencies and verification**
   - Be cautious with changes to `next`, `react`, `typescript`, `phaser`, lockfiles, and generated Next type files.
   - `next lint` is not reliable for this project baseline. Prefer `npm run build` and `npx tsc --noEmit --incremental false` for TypeScript/build verification when runtime code changes.
   - For Markdown-only changes, build verification is usually unnecessary; still check formatting and scope.

## Managed Bugbot deployment boundary

This file gives Bugbot repository-specific review context only. Actual Bugbot enablement must be verified outside this repo through Cursor dashboard or organization settings, Cursor GitHub App repository access, Bugbot Admin API configuration when used, or a smoke-check PR review.

After the service is enabled, maintainers can trigger a review from a top-level PR comment with:

```text
cursor review
```

or:

```text
bugbot run
```

For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` to request more detailed trigger information.
