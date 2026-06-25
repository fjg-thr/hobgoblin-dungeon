# Bugbot Review Guide

Repository-specific review context for `fjg-thr/hobgoblin-dungeon`. This file
does not enable Bugbot by itself; confirm Cursor dashboard settings, Cursor
GitHub App repository access, and any team/admin API configuration outside git.

Bugbot always includes this root guide. Add nested `.cursor/BUGBOT.md` files
only when a subtree needs different review rules.

## Activation and smoke checks

- In Cursor dashboard, confirm the GitHub integration is connected through the
  Cursor GitHub App and that this repository is selected.
- In Bugbot settings, confirm this repo is enabled and note whether reviews run
  automatically, only on mention, only once per PR, or on draft PRs.
- After this guide is merged to the default branch, smoke-test a pull request
  with a top-level comment: `cursor review` or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` and inspect request ID/log details.
- PRs that add or change this file may not be reviewed with the new rules until
  after merge.

## Project shape

- Next.js App Router with React/TypeScript entry points in `src/app`.
- Phaser 4 game runtime mounts from `src/game/GameCanvas.tsx`.
- Main gameplay, UI overlays, input, enemies, pickups, audio, and effects live in
  `src/game/scenes/DungeonScene.ts`; many systems share mutable scene state.
- Dungeon generation and tile codes live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts`.
- Generated/process tooling lives under `tools/` and `scripts/`; generated
  runtime assets live under `public/assets`.

## Review priorities

### Gameplay and Phaser runtime

- Check frame-rate independence for movement, projectiles, tweens, timers, and
  enemy pressure. Avoid coupling gameplay speed to render FPS.
- Verify collision, depth sorting, camera bounds, pointer zones, and resize
  behavior in map, actor, projectile, or overlay changes.
- Preserve input behavior: WASD/arrows move, mouse aims, click fires, `SPACE`
  fires, `F3` toggles debug, and Escape/overlay controls continue to work.
  README still mentions `J` firing, but current runtime binds `SPACE` only; do
  not block unrelated PRs solely for that existing docs/runtime drift.
- Review cleanup for intervals, tweens, sounds, sprites, keyboard keys, and
  Phaser object arrays. Restart/game-over paths should not leak runtime objects.

### Assets and audio

- Treat `src/game/assets/manifest.ts` as the runtime source of truth for assets.
- `public/assets/audio/audio-manifest.json` is auxiliary/consistency context,
  not the scene loader source of truth.
- If sprite dimensions, frame rows, or animation metadata change, verify the
  corresponding manifest entry and Phaser animation frame indexes.
- Asset/audio helpers include `tools/generate_audio_sfx.mjs`,
  `scripts/generate-retro-soundtrack.mjs`, and processors under `tools/`.
  Do not require regenerating unrelated assets for code-only PRs.

### Next.js, React, and DOM shell

- Keep browser-only Phaser imports behind the `src/game/GameCanvas.tsx` client
  component/dynamic import pattern; avoid importing Phaser from server code.
- Preserve full-viewport canvas layout and existing `src/app/globals.css`
  patterns. This repo does not currently use Tailwind or ShadCN.
- Metadata references `/opengraph-image.png`, but no matching
  `public/opengraph-image.png` or app `opengraph-image.*` exists in baseline.
  Only block PRs that touch share-image behavior and make this worse.

### Gameplay docs drift

- README documents regular ammo, hearts, quickshot, haste, ward, and blast.
  Current code also includes seeker ammo/projectiles unlocked by kills or time;
  review seeker behavior from code unless a PR is specifically updating docs.
- README describes blast as rare late-game, while current `POWERUP_CONFIG`
  unlocks it by code-defined thresholds. Treat this as an existing baseline
  mismatch unless a PR intentionally changes progression docs or config.

### Dependencies and tooling

- The repo has both `package-lock.json` and `pnpm-lock.yaml`. For npm-based
  verification, prefer `npm ci` and avoid lockfile churn unless dependencies
  intentionally change.
- `next lint` is not reliable with the current Next version. Prefer:
  - `npm run build`
  - `npx tsc --noEmit --incremental false`
- If Next rewrites `next-env.d.ts` during local verification, restore it unless
  the PR intentionally changes generated type behavior.
- Existing npm audit advisories may be present; do not block unrelated PRs on
  unchanged advisory output.

## Review style

- Prioritize correctness, regressions, missing tests, accessibility/user input
  issues, runtime leaks, asset manifest mismatches, and build/type errors.
- Keep findings actionable with exact file/line references and severity.
- Do not ask for broad refactors when a targeted fix addresses the risk.
