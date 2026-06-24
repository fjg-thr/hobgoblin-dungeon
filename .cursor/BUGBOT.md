# Cursor Bugbot Review Guide

Use this file as repository-specific context when reviewing Hobgoblin Ruin PRs.
It augments the managed Cursor Bugbot service; it does not enable the GitHub App,
dashboard setting, or organization policy by itself. After this lands on the
default branch, confirm managed enablement through Cursor settings/GitHub App
access or by smoke-testing a PR with `cursor review` or `bugbot run`. For
diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`.

## Project shape

- Next.js app with a client-only Phaser game mounted by `src/game/GameCanvas.tsx`.
- Main gameplay lives in `src/game/scenes/DungeonScene.ts`; this file owns input,
  HUD overlays, enemy AI, projectiles, pickups, audio, and scene lifecycle.
- Map and collision helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts`; audio
  loaded by the scene comes from `assetManifest.audio`.
- Generated and processed art/audio tooling lives under `tools/` and `scripts/`.

## Review priorities

1. Protect runtime boot and teardown. `GameCanvas` must keep Phaser dynamically
   imported on the client, avoid duplicate game instances, and destroy the game
   on unmount.
2. For `DungeonScene.ts`, check state resets carefully: scene restart, game over,
   start screen, timers, input handlers, tweens, audio loops, and arrays of
   projectiles/enemies/pickups should not leak across runs.
3. Validate gameplay changes against collision and coordinate transforms. Tile
   coordinates, isometric world positions, depth ordering, and hit ranges are
   easy to regress.
4. Asset changes must update both files and manifest metadata together. Confirm
   frame sizes, frames-per-row assumptions, keys, and runtime paths match actual
   `public/assets/**` files.
5. Audio changes must update `assetManifest.audio` and scene loading/playback.
   Treat `public/assets/audio/audio-manifest.json` as auxiliary consistency data,
   not the runtime source of truth.
6. For DOM/metadata UI, follow existing semantic markup and `src/app/globals.css`
   patterns. This repo does not currently use Tailwind or ShadCN.

## Known baseline caveats

- README says `Space` or `J` fires, but current runtime firing is `Space` plus
  pointer/click. Only block PRs that touch controls or docs and worsen this drift.
- README documents standard ammo and common powerups but not seeker ammo; the
  code unlocks seeker ammo through progression thresholds.
- README describes blast as rare late-game; current `POWERUP_CONFIG` unlocks it
  earlier. Treat this as existing docs/code drift unless the PR changes it.
- `src/app/layout.tsx` references `/opengraph-image.png`; ensure metadata PRs do
  not remove or worsen share-image behavior.
- `npm ci` may report the existing audit baseline. Do not block unrelated PRs
  solely on unchanged dependency advisories.

## Verification to request or run

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- For asset-generation PRs, run the touched generator/processor directly, such
  as `python3 tools/process_assets.py`, `node tools/generate_audio_sfx.mjs`, or
  `node scripts/generate-retro-soundtrack.mjs`.

## Review style

- Prioritize concrete bugs, regressions, missing verification, and user-visible
  gameplay failures over broad refactors.
- Cite exact files and lines. Explain why the issue matters in this Phaser/Next
  runtime.
- Keep guidance actionable and scoped to the PR. Do not request unrelated cleanup.
