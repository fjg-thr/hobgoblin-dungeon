# Cursor Bugbot Review Guide

Use this repository guide when Cursor Bugbot reviews pull requests for
`fjg-thr/hobgoblin-dungeon`.

## Deployment and trigger checks

- This file gives Bugbot repository-specific context only. Managed Bugbot
  enablement still depends on Cursor dashboard settings, GitHub App repository
  access, and any Admin API credentials or service configuration used by the
  workspace.
- After this file is merged to the default branch, smoke-test review delivery on
  a pull request. Top-level PR comments `cursor review` or `bugbot run` should
  request a review; `cursor review verbose=true` or `bugbot run verbose=true`
  should return diagnostic details such as request IDs or logs.
- If Bugbot does not respond, check the Cursor integration for the GitHub
  account or organization, confirm this repository is enabled in the Bugbot tab,
  and verify GitHub App access covers `fjg-thr/hobgoblin-dungeon`.
- New or changed guidance in this file may not affect the PR that introduces it
  until the change has landed on the default branch.

## Project map

- Next.js App Router app: `src/app/layout.tsx`, `src/app/page.tsx`,
  `src/app/globals.css`.
- Phaser canvas bootstrapping: `src/game/GameCanvas.tsx`.
- Main runtime/gameplay logic: `src/game/scenes/DungeonScene.ts`.
- Dungeon map generation/static data: `src/game/maps/startingDungeon.ts`.
- Runtime asset manifest: `src/game/assets/manifest.ts`.
- Generated visual/audio assets: `public/assets/**`.
- Asset tooling: `tools/*.mjs`, `tools/*.py`, and
  `scripts/generate-retro-soundtrack.mjs`.

## High-priority review focus

- Flag Phaser lifecycle regressions: scenes, timers, tweens, input listeners,
  audio objects, and event handlers should be cleaned up when React tears down or
  recreates the game canvas.
- Guard isometric coordinate math carefully. Movement, collision, wall depth,
  projectile paths, camera bounds, pointer targeting, and debug overlays should
  stay consistent between tile coordinates and screen coordinates.
- Treat `DungeonScene.ts` as high-risk because it owns most game state. Prefer
  small, named helpers for new gameplay concepts and flag large unrelated edits
  that mix rendering, spawning, collision, UI, and progression changes.
- Preserve pixel-art rendering expectations: Phaser config should keep nearest
  neighbor-friendly scaling such as `pixelArt` and `roundPixels`, and UI/canvas
  sizing should remain responsive on compact screens.
- Review keyboard and pointer controls together. Runtime keyboard firing is
  currently `SPACE`; click/pointer firing is also supported. The README still
  mentions `J`, so do not block unrelated PRs only for that existing mismatch,
  but flag control changes that make docs, title-screen copy, and runtime diverge
  further.
- Sound and mute changes should respect the scene-level mute toggle, avoid
  overlapping orphaned sounds after restart, and keep first-pass procedural audio
  modest in volume.

## Gameplay and content expectations

- Current README-documented powerups include quickshot, haste, ward, blast,
  ammo pickups, and heart pickups. Runtime also contains seeker ammo progression;
  flag PRs that modify ammo/progression without considering that code-defined
  behavior.
- README describes blast as late and rare, while runtime unlock timing may be
  controlled by `POWERUP_CONFIG`. Treat this as an existing doc/runtime mismatch
  unless a PR explicitly changes blast progression.
- Changes to scoring, enemy spawning, heart restoration, invulnerability, ward,
  haste, quickshot, blast, seeker ammo, or ammo consumption should include a
  manual smoke path in the PR description or clearly isolated logic that can be
  reviewed from code.
- Known prototype limitations in README are intentional: simple collision, no
  level transition, first-pass assets/audio, and modest combat. Do not request
  broad systems or polish outside the PR scope.

## Assets and generated files

- `src/game/assets/manifest.ts` is the runtime source of truth for loaded
  assets. `public/assets/audio/audio-manifest.json` is auxiliary consistency
  data; if touched, verify it agrees with runtime usage.
- Sprite-sheet JSON and image changes should keep frame sizes, frame names,
  animation row/column assumptions, and transparent chroma-key processing
  compatible with Phaser loading code.
- Generated image sources and prompts live in `ASSET_PROMPTS.md` and
  `public/assets/source/**`. Preserve flat chroma-key backgrounds (`#00ff00` or
  `#ff00ff`), 64x64 or documented frame sizes, and the dark GBA pixel-art style.
- Relevant local asset commands include:
  - `python3 tools/process_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `node tools/generate_powerup_sprites.mjs`
  - `node tools/generate_brute_ammo_sprites.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
- Do not require generated assets to be regenerated for documentation-only or
  code-only PRs unless the changed files depend on regenerated output.

## Web app, metadata, and accessibility

- `src/app/layout.tsx` references `public/opengraph-image.png` for share
  metadata. If metadata or public image paths change, verify the referenced file
  remains tracked, dimensions and alt text stay consistent, and no broken public
  URL is introduced.
- This repo does not currently configure Tailwind. For DOM UI, follow existing
  `src/app/globals.css` patterns and semantic HTML. For Phaser UI, review
  pointer zones, keyboard affordances, readable text contrast, and responsive
  placement within the canvas.
- Client-only Phaser code should remain isolated from server rendering. Dynamic
  imports and browser globals should not run during Next server evaluation.

## Verification guidance

- For source changes, prefer:
  - `npm run build`
  - `npx tsc --noEmit --incremental false`
- `next lint` is not reliable in this Next 16 setup because the script still
  invokes `next lint`. Do not treat that script as the only quality signal.
- This repo tracks both `package-lock.json` and `pnpm-lock.yaml`. Dependency
  changes should keep both ecosystems intentional and should not update
  unrelated packages as part of a gameplay or documentation PR.
- Next may rewrite `next-env.d.ts` between development and production route
  type paths. If verification dirties that generated file, restore it unless the
  PR intentionally changes Next typing behavior.
- For this Bugbot deployment guide itself, the expected repository diff is only
  `.cursor/BUGBOT.md`; runtime source, generated assets, dependencies, lockfiles,
  and workflows should remain untouched.
