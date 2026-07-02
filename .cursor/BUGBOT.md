# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin Prototype.
Bugbot service enablement is managed outside this repo: confirm Cursor dashboard
or organization settings, GitHub App repository access, optional Admin API
credentials, and a PR smoke check when access is available. This file only gives
repository-specific review context. After this file lands on `main`, manual
top-level PR comments such as `cursor review` or `bugbot run` can request a
review; add `verbose=true` only when diagnostic request IDs/log detail are
needed.

## Project map

- Next.js App Router shell with a React client canvas and Phaser 4.0.0-rc.4.
- `src/game/GameCanvas.tsx` boots Phaser with pixel-art rendering and resize
  scaling.
- `src/game/scenes/DungeonScene.ts` is the main risk surface: preload, combat,
  enemy waves, HUD, audio, start/how-to-play/game-over UI, pickups, powerups,
  debug overlay, collision checks, and most gameplay constants live together.
- `src/game/assets/manifest.ts` is the runtime asset source of truth.
- `src/game/maps/startingDungeon.ts` owns room/corridor generation and tile
  codes.
- `src/app/layout.tsx` owns metadata and references `/opengraph-image.png`,
  which is tracked at 1360x752.
- Styling is plain `src/app/globals.css`; Tailwind is not configured.
- There is no `.github/workflows` CI config and no test script.

## High-priority checks

1. Asset paths must line up. If a PR changes `assetManifest`, `DungeonScene`
   preload calls, or files under `public/assets`, verify each referenced PNG,
   WAV, and JSON exists at the matching path. Runtime uses `manifest.ts`, not
   `public/assets/audio/audio-manifest.json` as the source of truth.
2. New assets need both manifest entries and the matching `this.load.*` call in
   `DungeonScene.preload()`. Check frame sizes, keys, spritesheet dimensions,
   and animation setup for drift.
3. Large `DungeonScene.ts` edits deserve extra scrutiny for side effects across
   input, camera resize, collision, ammo, seeker shots, powerup timers, HUD
   updates, audio mute state, and restart/start-screen state cleanup.
4. Phaser 4 RC APIs may differ from Phaser 3 examples. Flag borrowed code that
   assumes unavailable APIs or unverified lifecycle behavior.
5. Metadata/share PRs must keep `layout.tsx`, `public/opengraph-image.png`,
   dimensions, alt text, and deployed public paths consistent.
6. Dependency PRs must account for both `package-lock.json` and `pnpm-lock.yaml`
   if both remain tracked. Keep Phaser version changes especially deliberate.

## Known repo context

- README says `Space` or `J` fires, but current runtime keyboard fire is `Space`
  plus pointer/click firing. Treat this as an existing docs/runtime mismatch
  unless an input-docs PR touches it.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  omits seeker ammo/projectiles that exist in code. Behavior-changing PRs should
  update docs when they add or change player-facing mechanics.
- README describes blast as late and rare; current unlock/tuning is code-defined
  in `POWERUP_CONFIG`. Do not block unrelated PRs solely for the existing text.
- `public/assets/audio/audio-manifest.json` is auxiliary. `assetManifest.audio`
  is what the scene loads.
- Runtime loads many extracted tile/UI PNGs, not only the composite atlas JSONs.

## Generated assets and audio

- Asset prompts and generation notes live in `ASSET_PROMPTS.md`.
- Useful npm scripts: `npm run process:assets`,
  `npm run process:death-assets`, `npm run process:combat-juice`,
  `npm run generate:powerups`, and `npm run generate:combat-assets`.
- Additional tools not wired as npm scripts include
  `tools/process_pickup_intent_effect_assets.mjs`,
  `tools/process_gpt_tile_powerup_assets.mjs`,
  `tools/process_corporate_goblin_assets.py`,
  `tools/process_spreadsheet_brute_assets.py`,
  `tools/generate_polish_sprites.mjs`,
  `tools/generate_audio_sfx.mjs`, and
  `scripts/generate-retro-soundtrack.mjs`.
- Node image processors may require `sharp`; Python processors require Pillow.
  Flag generated-asset PRs that omit required regenerated outputs or tool
  dependency notes.

## Suggested verification

- Markdown/config-only changes: `git diff --check origin/main...HEAD`.
- Source changes: `npm run build` and
  `npx tsc --noEmit --incremental false`. `next lint` is not reliable on modern
  Next here despite the package script.
- Asset changes: verify `assetManifest` paths against `public/assets`, run the
  relevant generator/processor, and inspect sprite dimensions or audio files.
- Gameplay changes: run `npm run dev`, open `http://localhost:3000`, and smoke
  test start, movement, pointer/click shooting, `Space` firing, ammo pickups,
  powerups, hearts, mute toggle, restart, and responsive resizing.
- Metadata changes: verify `public/opengraph-image.png` still exists and matches
  the `layout.tsx` dimensions/alt text, or update both together.

## Review tone

Prioritize concrete regressions, missing generated outputs, broken public paths,
unhandled state cleanup, and documentation drift for user-facing behavior. Avoid
blocking on broad style preferences or unrelated pre-existing mismatches.
