# Cursor Bugbot review guide

Use this file as repository-specific context when reviewing pull requests for Hobgoblin Ruin Prototype. Keep findings focused on real regressions introduced by the PR. Do not block unrelated changes on known existing mismatches unless the PR touches that behavior or claims to fix it.

## Deployment and trigger checks

- This file gives Bugbot review guidance only. Enabling the managed Bugbot service requires Cursor dashboard/org settings, GitHub App repository access, or Admin API credentials outside this repository.
- After this file is merged to the default branch, smoke-check a PR review with a top-level GitHub comment: `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true` and capture the request ID/log details. Verbose mode is for diagnostics, not a promise of deeper review.
- PRs that add or change `.cursor/BUGBOT.md` may not be reviewed with the new rules until the change lands on the default branch.

## Project map

- App shell and metadata: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.
- React/Phaser bridge: `src/game/GameCanvas.tsx`.
- Main runtime scene: `src/game/scenes/DungeonScene.ts`.
- Dungeon layout data: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Public assets and sprite metadata: `public/assets/**`.
- Auxiliary audio consistency manifest: `public/assets/audio/audio-manifest.json`.
- Asset tooling: `tools/*.py`, `tools/*.mjs`, and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

1. Runtime correctness in `DungeonScene.ts`: Phaser lifecycle, event listener cleanup, timers/tweens, scene restart state, projectile/enemy/pickup arrays, camera/HUD scroll factors, and audio cleanup.
2. Asset integrity: every runtime path added to `assetManifest` must exist under `public/assets`, match frame sizes/rows used by Phaser, and be loaded before animation or sprite use.
3. Gameplay regressions: movement, aiming, firing cadence, finite ammo, seeker ammo, power-up gating, enemy damage/death, heart pickup rules, scoring, game over/restart, mute state, and debug overlay.
4. Next/React integration: keep Phaser client-only boundaries intact, avoid server-only APIs in client components, and avoid DOM assumptions during SSR.
5. Metadata/share assets: if `src/app/layout.tsx` changes OpenGraph/Twitter image data, verify `public/opengraph-image.png` (or replacement) exists, dimensions match metadata, and alt text stays accurate.

## Known baseline mismatches

- README says `Space` or `J` fires; current keyboard runtime binds shooting to `Space` only. Pointer/click firing is implemented. Only flag the `J` mismatch for PRs that touch controls/input docs or intentionally change firing controls.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but omits seeker ammo. Current code unlocks seeker pickups/projectiles through runtime progression thresholds.
- README describes blast as a rare late-game power-up, while current `POWERUP_CONFIG` unlocks blast earlier. Treat this as existing unless the PR changes power-up documentation or gating.
- The repo does not configure Tailwind. For DOM UI changes, review semantic markup and existing `src/app/globals.css` patterns. For Phaser UI, review pointer zones, keyboard/mouse affordances, responsive placement, scroll factors, and canvas-specific accessibility limits.

## Asset and audio guidance

- For runtime audio, `assetManifest.audio` is authoritative because `DungeonScene` loads from it. Keep `public/assets/audio/audio-manifest.json` consistent when a PR intentionally changes the audio inventory, but do not treat it as the loader source.
- Use `node tools/generate_audio_sfx.mjs` for procedural sound effects and `node scripts/generate-retro-soundtrack.mjs` for `public/assets/audio/retro_dungeon_theme.wav`.
- Use `python3 tools/process_assets.py`, `python3 tools/process_corporate_goblin_assets.py`, and `python3 tools/process_spreadsheet_brute_assets.py` for Python asset processors.
- Use the focused Node processors under `tools/` for generated power-up, brute ammo, combat juice, pickup intent, actor death, and polish sprites.
- If generated PNG/JSON assets change, verify the paired metadata, frame dimensions, manifest references, and Phaser animation ranges together.

## Dependency and verification guidance

- This project tracks both `package-lock.json` and `pnpm-lock.yaml`. Dependency PRs should keep both ecosystems coherent or clearly justify a lockfile strategy change.
- `next lint` is not reliable for this Next 16 setup. Prefer:
  - `npm run build`
  - `npx tsc --noEmit --incremental false`
- `next dev` can rewrite `next-env.d.ts` to `.next/dev/types/routes.d.ts`; production build/typegen can rewrite it to `.next/types/routes.d.ts`. Do not leave generated `next-env.d.ts` churn unless the PR intentionally changes generated route typing behavior.
- For markdown-only Bugbot guidance changes, a scoped verification is enough:
  - `git diff --check origin/main...HEAD`
  - `git diff --name-only origin/main...HEAD`
  - confirm only `.cursor/BUGBOT.md` changed.

## Finding style

- Lead with concrete bugs, security issues, build failures, broken assets, or user-visible regressions. Include exact file/line references and a short reproduction or reasoning path.
- Avoid speculative style preferences and broad refactors. Suggest small fixes that fit the existing Next/React/TypeScript/Phaser patterns.
- If a PR changes generated assets or audio without enough local verification, request the exact missing verification rather than reviewing the binary content by appearance alone.
