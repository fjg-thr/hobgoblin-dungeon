# Cursor Bugbot Review Guide

Use this guide when reviewing Hobgoblin Ruin changes. This repo is a Next.js app that hosts a browser-only Phaser dungeon prototype.

## Review priorities

- Treat `src/game/scenes/DungeonScene.ts` as the highest-risk runtime surface. Check gameplay state transitions, input wiring, camera/HUD placement, object cleanup, audio lifecycle, and Phaser object pooling whenever it changes.
- Keep browser-only Phaser code isolated behind the client component in `src/game/GameCanvas.tsx`. Do not introduce server-side imports of Phaser or browser globals into Next server components.
- For dungeon generation changes in `src/game/maps/startingDungeon.ts`, review walkability, collision, prop placement, spawn safety, and determinism assumptions together.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded sprites/audio. If assets are added, moved, or renamed, verify both the manifest entry and the corresponding `public/assets/**` file/metadata.
- `public/assets/audio/audio-manifest.json` is auxiliary; `assetManifest.audio` controls runtime loading.
- `src/app/layout.tsx` references `/opengraph-image.png`. If metadata changes touch this path, confirm the public image exists and remains correctly served.

## Known baseline mismatches

- README says `Space` or `J` fires; current runtime firing is `Space` plus pointer/click. Flag this only when a PR changes controls, input docs, or related UX.
- Seeker ammo exists in code and pickups/projectiles but is not fully documented in README. Treat it as code-defined behavior unless a PR intentionally updates gameplay docs.
- README describes blast as rare late-game; current `POWERUP_CONFIG` can unlock it earlier. Do not block unrelated PRs solely for this existing mismatch.

## UI and accessibility context

- This repo does not currently use Tailwind or shadcn/ui. For DOM UI, follow existing semantic markup and `src/app/globals.css` patterns.
- For Phaser canvas UI, review keyboard/mouse affordances, pointer zones, responsive placement, readable contrast, and whether controls remain discoverable without DOM accessibility hooks.

## Asset and generation tooling

- Generated asset/audio tooling lives under `tools/` and `scripts/`, including `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`, `tools/process_combat_juice_assets.mjs`, `tools/process_corporate_goblin_assets.py`, `tools/process_gpt_tile_powerup_assets.mjs`, `tools/process_pickup_intent_effect_assets.mjs`, `tools/process_spreadsheet_brute_assets.py`, `tools/generate_powerup_sprites.mjs`, `tools/generate_polish_sprites.mjs`, `tools/generate_brute_ammo_sprites.mjs`, `tools/generate_audio_sfx.mjs`, and `scripts/generate-retro-soundtrack.mjs`.
- When generated files change, ask whether the matching source prompt/tool invocation and manifest metadata also changed. Prefer exact commands from `package.json` or direct `python3`/`node` invocations over wildcard script names.

## Verification guidance

- Prefer `npm ci`, `npm audit --omit=dev`, `npx tsc --noEmit --incremental false`, and `npm run build` for npm verification.
- If `pnpm-lock.yaml` changes, also run `pnpm install --frozen-lockfile`, `pnpm audit --prod`, `pnpm exec tsc --noEmit --incremental false`, and `pnpm run build`.
- `next lint` is not reliable for the current Next version in this repo; do not require it as the primary gate.
- Next may rewrite `next-env.d.ts` between dev and production route type paths. Treat unintended generated rewrites as noise unless the PR intentionally changes Next typing behavior.

## Hosted Bugbot deployment boundary

- This file gives Cursor Bugbot repository-specific review context after it is merged to the default branch. It cannot prove the managed service is enabled.
- Confirm service-side deployment separately in Cursor dashboard/org settings, GitHub App repository access, Admin API credentials if used, and a PR review smoke check when available.
- Manual GitHub PR triggers should be top-level comments: `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` to request extra log/request detail.
