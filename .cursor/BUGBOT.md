# Cursor Bugbot Review Guide

This repository is a first-playable Next.js, React, TypeScript, and Phaser prototype for
Hobgoblin Ruin. Use this file as repository-specific context when reviewing pull
requests. The managed Cursor Bugbot service must still be enabled outside the repo through
Cursor dashboard/org settings and GitHub App repository access.

## Review priorities

- Prioritize runtime regressions in `src/game/scenes/DungeonScene.ts`, map generation in
  `src/game/maps/startingDungeon.ts`, asset registration in `src/game/assets/manifest.ts`,
  and the app shell in `src/app`.
- Treat player-facing gameplay, input, scoring, health, power-ups, audio, and generated
  asset loading as high-risk areas because most behavior lives in one Phaser scene.
- Flag changes that break deterministic initialization, Phaser lifecycle ordering, or asset
  keys/paths between the manifest and `public/assets`.
- For UI/app changes, follow the existing semantic HTML and `src/app/globals.css` patterns.
  This repo does not currently configure Tailwind or Shadcn.
- Keep reviews scoped to changed behavior. Do not block unrelated pull requests solely for
  existing README/code mismatches documented below.

## Project shape

- App entry points: `src/app/page.tsx`, `src/app/layout.tsx`, and `src/game/GameCanvas.tsx`.
- Main game logic: `src/game/scenes/DungeonScene.ts`.
- Dungeon generation and tile collision helpers: `src/game/maps/startingDungeon.ts`.
- Runtime asset manifest: `src/game/assets/manifest.ts`.
- Static game assets: `public/assets/**`.
- Asset generator/processor tooling: `tools/**` and `scripts/**`.

## Verification guidance

Prefer these checks for ordinary code-review validation:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` maps to `next lint`, which is not reliable with the current Next version.
  Do not require it unless the project adds a working lint script.
- Next route type generation can rewrite `next-env.d.ts` and create `tsconfig.tsbuildinfo`
  during local verification. Treat that as generated churn unless a PR intentionally changes
  TypeScript or Next generated typing behavior.
- There is no `npm start` script. Runtime smoke checks should use an appropriate Next command
  only when the PR adds or changes smoke-test infrastructure.
- Dependency or lockfile changes should be reviewed carefully because this prototype uses
  `latest` for Next, React, and TypeScript and `phaser@4.0.0-rc.4`.

## Gameplay facts to preserve

- Movement uses `WASD` or arrow keys.
- Keyboard shooting is currently bound to `Space`; pointer click also aims and fires once.
- Shots snap to 15-degree angles and consume finite ammo.
- Standard ammo, seeker ammo, heart pickups, quickshot, haste, ward, blast, enemy respawn,
  score, HUD, audio mute, start screen, how-to-play modal, game-over flow, and `F3` debug
  overlay all run through `DungeonScene`.
- Seeker ammo is code-defined behavior: it unlocks after 4 kills or 30 seconds and uses
  seeker pickups/projectiles. README may not mention it.
- Blast currently unlocks after 2 kills or 16 seconds via `POWERUP_CONFIG.blast`, despite
  README wording that describes it as rare late-game.
- README says `Space` or `J` fires; the code currently binds `Space` only. Treat this as an
  existing docs/code mismatch unless a PR intentionally changes controls or documentation.

## Asset-review guidance

- Check that new or changed assets are referenced through `src/game/assets/manifest.ts` and
  that paths match files under `public/assets`.
- JSON sprite-sheet metadata should remain consistent with the PNG dimensions and frame
  assumptions used by Phaser.
- Generated source imagery and processor outputs should not be churned in unrelated PRs.
- Audio files are declared through `public/assets/audio/audio-manifest.json` and loaded from
  the Phaser scene; verify key/path consistency for audio changes.
- If a PR changes asset-generation tooling, include both `tools/**` and `scripts/**` in the
  review scope.

## Managed Bugbot deployment boundary

This file supplies repository review instructions only. It cannot prove that managed Cursor
Bugbot is active for the GitHub repository. A complete deployment check also requires:

1. Cursor dashboard or organization settings show Bugbot enabled.
2. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
3. A pull request smoke check confirms Bugbot review/status activity.

If those external checks are unavailable to the reviewing agent, state that repository-side
guidance is present but managed-service activation was not independently verified.
