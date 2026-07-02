# Cursor Bugbot review guide

Use this file as repository-specific context when reviewing PRs for the Hobgoblin Ruin prototype. It does not enable the hosted Bugbot service by itself. Managed enablement still depends on Cursor dashboard/org settings, GitHub App access to this repository, optional Admin API credentials where used, and a live PR smoke check.

## Manual review triggers

- On GitHub PRs, a top-level comment of `cursor review` or `bugbot run` should request a Bugbot pass when the service is installed and enabled.
- For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`; verbose mode is for request IDs/log detail/troubleshooting, not for stricter code review.
- These rules apply after this file is present on the default branch. A PR adding or changing this file may not be reviewed with the new guidance yet.

## Project map

- Next.js App Router entry points: `src/app/page.tsx`, `src/app/layout.tsx`, and `src/app/globals.css`.
- React client bridge: `src/game/GameCanvas.tsx` dynamically imports Phaser and mounts `DungeonScene`.
- Main game logic: `src/game/scenes/DungeonScene.ts`. It owns preload, animation setup, player/enemy/projectile/pickup state, input, HUD, audio, start/how-to-play/game-over overlays, and debug rendering.
- Map generation/collision helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth is `src/game/assets/manifest.ts`; `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent if touched.
- The app currently uses plain CSS, not Tailwind or shadcn/ui.

## High-priority review checks

- Asset changes must keep files under `public/assets/**`, `assetManifest`, Phaser preload calls, animation frame dimensions, metadata JSON, and README asset references aligned. Missing public files usually become runtime load failures.
- New or renamed audio must update `assetManifest.audio`; `DungeonScene` loads audio from that manifest.
- Large edits in `DungeonScene.ts` are risky. Check scene lifecycle cleanup, input listener removal, timers/tweens, depth ordering, camera bounds, and state reset on restart.
- Phaser is pinned to `4.0.0-rc.4`; avoid assuming Phaser 3-only behavior or unverified stable Phaser 4 API details.
- Controls: runtime keyboard firing is `SPACE`; README also mentions `J`, which is an existing mismatch. Pointer/click firing is implemented. Do not block unrelated PRs solely for the existing `J` mismatch, but flag PRs that touch controls/docs and make it worse.
- Gameplay docs omit seeker ammo even though the scene has seeker projectiles/pickups. README also describes blast as late/rare while runtime power-up gating is code-defined. Treat these as existing documentation drift unless the PR intends to fix gameplay docs.
- Metadata/share-image changes must keep `src/app/layout.tsx` and `public/opengraph-image.png` consistent, including dimensions and alt text. The tracked image is expected at `/opengraph-image.png`.
- Keep npm and pnpm lockfiles consistent when dependency changes are intentional. Do not mix package-manager-only changes into gameplay/asset PRs without a clear reason.

## Generated assets and tooling

- Asset scripts include `python3 tools/process_assets.py`, `node tools/process_actor_death_assets.mjs`, `node tools/process_combat_juice_assets.mjs`, `node tools/process_pickup_intent_effect_assets.mjs`, `node tools/process_gpt_tile_powerup_assets.mjs`, `python3 tools/process_corporate_goblin_assets.py`, and `python3 tools/process_spreadsheet_brute_assets.py`.
- Generation scripts include `node tools/generate_powerup_sprites.mjs`, `node tools/generate_polish_sprites.mjs`, `node tools/generate_brute_ammo_sprites.mjs`, `node tools/generate_audio_sfx.mjs`, and `node scripts/generate-retro-soundtrack.mjs`.
- For generated image/audio PRs, verify both generated output and runtime references. Prefer checking dimensions/metadata rather than trusting filenames.

## Verification guidance

- For source changes, prefer `npm run build` and `npx tsc --noEmit --incremental false`. `next lint` is listed in `package.json` but is not reliable with the current Next version.
- For Markdown-only Bugbot guide changes, scoped verification can be: `git diff --check origin/main...HEAD`, confirm the diff only touches `.cursor/BUGBOT.md`, and check the guide size stays reasonably small.
- For public asset or metadata PRs, also verify referenced files exist in git and inspect binary metadata, for example `git ls-tree -r HEAD -- public/opengraph-image.png` and `file public/opengraph-image.png`.
- If `next dev` or build/typegen rewrites `next-env.d.ts` without an intentional typing change, restore it before finalizing the PR.

## Review tone

Prioritize bugs, regressions, broken assets, missing runtime references, lifecycle leaks, and verification gaps. Mention known existing mismatches as context without making unrelated PRs responsible for fixing them.
