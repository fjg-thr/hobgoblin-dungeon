# Cursor Bugbot Review Guide

Use this guide when Cursor Bugbot reviews pull requests for
`fjg-thr/hobgoblin-dungeon`, a Next.js/React/TypeScript Phaser game prototype.
Focus on behavior that can regress gameplay, build reliability, generated asset
contracts, or user-facing project documentation.

## Deployment boundary

- This file gives repository-specific review instructions to Cursor Bugbot.
- External managed Cursor Bugbot enablement still depends on Cursor dashboard or
  organization settings, GitHub App repository access, Admin API credentials
  when used, and a live PR trigger check. Do not claim those external settings
  are enabled based only on this file.
- After this file lands on the default branch, smoke-test Bugbot on a PR with a
  top-level `cursor review` or `bugbot run` comment when access is available.
  For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` to surface request IDs and additional logs.
- A PR that adds or edits this file may not be reviewed using the new guidance
  until the change is merged to the default branch.

## Review priorities

1. Block runtime errors, broken builds, TypeScript failures, and asset manifest
   mismatches that would prevent the game from loading.
2. Flag gameplay regressions in movement, aiming, shooting, enemy spawning,
   pickups, scoring, health, audio mute state, start/game-over flow, and
   responsive Phaser overlays.
3. Check that README, asset prompts, manifests, and generated files stay in sync
   when a PR intentionally changes player controls, assets, audio, metadata, or
   game mechanics.
4. Keep findings actionable. Cite the exact file and line, explain user impact,
   and avoid blocking unrelated PRs for known baseline mismatches unless the PR
   touches that area.

## Project-specific hotspots

- `src/game/scenes/DungeonScene.ts` owns most runtime behavior: dungeon
  generation, player/enemy state, collision checks, pickups, power-ups,
  projectiles, HUD, title/game-over screens, how-to-play modal, debug overlay,
  audio, and responsive Phaser UI. Review changes here especially carefully.
- `src/game/GameCanvas.tsx` controls client-only Phaser bootstrapping. Guard
  against SSR/window access regressions, duplicate game instances, and cleanup
  leaks on unmount.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded
  sprites, atlases, images, and audio. If assets under `public/assets/**` move
  or change names, verify the manifest and any Phaser frame keys stay aligned.
- `src/game/maps/startingDungeon.ts` defines dungeon structure inputs. Check
  wall, floor, bridge, enemy, pickup, and staircase coordinates against
  collision and camera assumptions.
- `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css` are the
  Next.js shell. This repo does not currently use Tailwind; prefer existing CSS
  patterns for DOM changes unless a PR deliberately introduces Tailwind.

## Gameplay review checklist

- Controls: runtime shooting currently supports Space and pointer/click flows.
  The README may mention `J`; treat that as a known docs/runtime mismatch unless
  the PR changes controls or control copy.
- Aiming: shots should still snap to the intended angle increments and should
  not fire before the player has a valid aim vector.
- Enemies: initial goblins come from dungeon enemy starts; later goblins ramp
  by target enemy count, while brutes are gated by `BRUTE_UNLOCK_KILLS` and
  `BRUTE_UNLOCK_MS`. Do not describe all enemy spawning as progression-gated.
- Power-ups: `POWERUP_CONFIG` controls unlock gates, weights, labels, and
  descriptions. Effect timing lives in nearby duration constants and collection
  logic; blast uses `blastShotReady`.
- Ammo and pickups: README documents regular ammo, hearts, quickshot, haste,
  ward, and blast. Code may include seeker ammo behavior; if a PR changes it,
  require docs and UI copy to make the intended behavior clear.
- Audio: mute state and runtime loading should stay consistent with
  `assetManifest.audio`; `public/assets/audio/audio-manifest.json` is auxiliary
  and should be kept consistent only when touched.
- Responsive UI: start screen, HUD, game-over panel, and how-to-play modal must
  remain usable on compact and tiny viewport branches, including pointer hit
  zones and close behavior.

## Asset and tooling guidance

- Generated image/audio source prompts live in `ASSET_PROMPTS.md` and saved
  sources under `public/assets/source` when present. If generated art changes,
  review both source provenance and processed outputs.
- Phaser atlas JSON must match the corresponding PNG dimensions and frame names.
  Verify consumers use existing frame keys before accepting atlas rewrites.
- Relevant asset commands include:
  - `npm run process:assets`
  - `npm run process:death-assets`
  - `npm run process:combat-juice`
  - `npm run generate:powerups`
  - `npm run generate:combat-assets`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
- Do not require regenerating large assets for unrelated TypeScript or gameplay
  PRs. Ask for regeneration only when source assets, manifests, atlas metadata,
  or generation scripts changed.

## Verification commands

For code changes, prefer:

```bash
npm run build
npx tsc --noEmit --incremental false
```

`next lint` is not reliable for this Next 16 setup. If verification dirties
`next-env.d.ts` by switching between dev and production generated route types,
restore it unless the PR intentionally changes Next type generation behavior.

For asset-only changes, combine the relevant generation command with manifest or
atlas consistency checks. For documentation-only changes, at minimum run
`git diff --check`.

## Known baseline caveats

- Existing dependency audit advisories may appear from the lockfile baseline.
  Do not block unrelated PRs solely on those audit findings; dependency
  hardening should be handled in dedicated dependency PRs.
- `public/opengraph-image.png` is tracked and referenced from metadata. If
  metadata/share image behavior changes, keep the asset, dimensions, and alt
  text synchronized.
- Known README/code mismatches around `J` firing, seeker ammo, or exact blast
  rarity should be flagged only when the PR changes controls, ammo/power-up
  behavior, or related docs.

## Finding style

- Lead with bugs that affect users, builds, or deployed review quality.
- Include concrete reproduction or verification steps when practical.
- Separate blocking issues from suggestions. Avoid broad refactors unless they
  directly reduce risk introduced by the PR.
- If a PR changes only this Bugbot guide, require "ASCII Markdown with a trailing newline"
  and verify no runtime source, assets, package files, or workflow files changed
  unintentionally.
