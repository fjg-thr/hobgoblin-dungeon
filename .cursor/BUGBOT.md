# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype.

## Deployment boundary

- This file gives Cursor Bugbot repository-specific review context. It does not, by itself, prove that the managed Bugbot service is enabled.
- To verify service deployment, check Cursor dashboard or organization settings, GitHub App repository access, any Admin API/service credentials in use, and a live pull-request review smoke check.
- These rules apply after this file is present on the branch Bugbot reads, typically the default branch after merge. A PR that adds or changes this file may not be reviewed with the new rules.
- Manual PR review triggers can be top-level comments: `cursor review` or `bugbot run`. For troubleshooting request IDs and logs, use `cursor review verbose=true` or `bugbot run verbose=true`.

## Repository map

- `src/app/` is the Next.js App Router shell. `src/app/page.tsx` renders the game canvas and `src/app/layout.tsx` owns metadata.
- `src/game/GameCanvas.tsx` is the client-only React boundary that creates and tears down the Phaser game. Watch SSR/client-only imports here.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, input, HUD, audio, enemy, pickup, projectile, and scene logic.
- `src/game/maps/startingDungeon.ts` defines generated dungeon map data and tile/collision assumptions.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded asset and audio paths. `public/assets/audio/audio-manifest.json` is auxiliary and should stay consistent when audio changes are intentional.
- Generated image, sprite-sheet, and audio assets live under `public/assets/`. Avoid approving changes that update generated outputs without updating the manifest, metadata JSON, or source/generator notes that explain them.

## Highest-priority review checks

1. **Next/Phaser boundary**: Phaser and browser APIs must stay inside client-only code. Do not introduce server-side imports of `phaser`, `window`, `document`, audio APIs, or canvas APIs.
2. **Runtime asset integrity**: Any changed path in `assetManifest` must correspond to a tracked public asset and, when metadata is used, a matching JSON file with frame sizes that align with loader calls.
3. **Generated asset consistency**: Sprite-sheet dimensions, `frameWidth`, `frameHeight`, `framesPerRow`, animation frame ranges, and JSON metadata should agree. A mismatch can silently break animations.
4. **Gameplay invariants**: Movement, collision, enemy damage, pickups, ammo limits, projectile cleanup, game-over state, and restart flow should stay deterministic enough to reason about. Watch for timers/tweens/event listeners that survive scene shutdown.
5. **Input and HUD behavior**: Current runtime shooting uses `Space` and pointer/click input; README also mentions `J`, which is an existing docs/runtime drift. Block PRs that worsen or claim to fix controls without verifying actual key bindings.
6. **Audio behavior**: Audio changes should respect browser autoplay restrictions, the scene-level mute state, sound cleanup on shutdown, and the `SOUND`/`MUTED` HUD toggle.
7. **Metadata/share assets**: `src/app/layout.tsx` references `/opengraph-image.png`, which is expected to exist while referenced; ensure metadata PRs do not introduce broken public references or remove assets they still reference. Do not block unrelated PRs solely for pre-existing metadata issues.

## Known baseline context

- README describes `Space` or `J` for firing, but current `DungeonScene` binds the keyboard shot key to `SPACE` and supports pointer/click firing.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and blast. The code also has seeker ammo unlocks, seeker pickups, and seeker projectiles.
- README describes blast as rare late-game; the current `POWERUP_CONFIG` unlock timing may not match that wording exactly.
- This repo is not configured for TailwindCSS or shadcn/ui. For DOM UI, review semantic HTML and existing `src/app/globals.css` patterns. For game UI, review Phaser canvas overlays, pointer zones, keyboard/mouse affordances, responsive placement, and canvas-specific accessibility limits.
- `next dev` and production build/typegen may rewrite `next-env.d.ts` between `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`. Treat accidental generated typing dirtiness as something to restore unless the PR intentionally changes Next typing behavior.

## Verification guidance by change type

- Markdown-only or guide-only changes: run `git diff --check` and inspect the diff. Full app builds are optional when no runtime files changed.
- TypeScript, React, Next, or Phaser source changes: prefer `npm run build` plus `npx tsc --noEmit --incremental false`. `next lint` is not reliable in this Next 16 setup.
- Dependency or lockfile changes: verify the package manager lockfiles intentionally changed together. This repository currently has both `package-lock.json` and `pnpm-lock.yaml`; do not accept one-lockfile drift without a clear reason.
- Public asset or manifest changes: verify all referenced files exist under `public/`, sprite-sheet metadata matches loader dimensions, and relevant generator or processor commands are documented or rerun.
- Gameplay/input changes: smoke-check starting the app, movement with WASD or arrows, aiming with pointer movement, firing with `Space`, click-to-fire, ammo pickup/reload, at least one power-up pickup, damage/game-over, restart, mute toggle, and F3 debug toggle when relevant.

## Asset and audio tooling

Relevant commands and files to check when PRs touch generated assets:

- `npm run process:assets` -> `python3 tools/process_assets.py`
- `npm run process:death-assets` -> `node tools/process_actor_death_assets.mjs`
- `npm run process:combat-juice` -> `node tools/process_combat_juice_assets.mjs`
- `npm run generate:powerups` -> `node tools/generate_powerup_sprites.mjs`
- `npm run generate:combat-assets` -> `node tools/generate_brute_ammo_sprites.mjs`
- `node tools/process_pickup_intent_effect_assets.mjs`
- `node tools/process_gpt_tile_powerup_assets.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `python3 tools/process_spreadsheet_brute_assets.py`
- `node tools/generate_polish_sprites.mjs`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`

Do not require every asset command for unrelated PRs. Require the commands, source assets, or metadata that correspond to the files being changed.

## Review posture

- Prioritize regressions that would break the playable prototype: blank page, server/client import errors, missing assets, broken controls, runaway timers/listeners, broken collision, unbounded spawning, or audio crashes.
- Keep findings scoped to the PR. It is useful to mention baseline mismatches when they affect review context, but do not block unrelated changes because of pre-existing README/runtime drift.
- For external Bugbot enablement, state clearly when the repository diff can only provide review guidance and cannot prove the managed Cursor/GitHub service is active.
