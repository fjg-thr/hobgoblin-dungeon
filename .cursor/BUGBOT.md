# Cursor Bugbot Review Guide

Use this file as repository-specific context when reviewing pull requests for the
Hobgoblin Ruin prototype. The project is a Next.js App Router site with a Phaser
4 canvas game written in strict TypeScript.

## Repository profile

- Runtime app: Next.js, React, TypeScript, Phaser.
- Main game scene: `src/game/scenes/DungeonScene.ts`.
- Phaser boot/client boundary: `src/game/GameCanvas.tsx`.
- App shell and metadata: `src/app/layout.tsx`, `src/app/page.tsx`,
  `src/app/globals.css`.
- Asset source of truth for runtime loading: `src/game/assets/manifest.ts`.
- Static assets: `public/assets/**`.
- Dungeon map generation and tile metadata: `src/game/maps/startingDungeon.ts`.
- Asset tooling: `tools/**` plus `scripts/generate-retro-soundtrack.mjs`.
- Package scripts are npm-based in the README. Both `package-lock.json` and
  `pnpm-lock.yaml` are tracked, so dependency changes should keep lockfiles in
  sync or explicitly justify why only one ecosystem changed.

## Review priorities

1. Catch runtime-breaking TypeScript, Next.js, or Phaser changes.
2. Preserve existing gameplay invariants unless the PR clearly intends to
   change them.
3. Check asset manifest and file path consistency for any asset or audio edits.
4. Flag documentation drift when a PR changes controls, pickups, power-ups,
   metadata, or setup commands.
5. Keep scope tight. Do not request broad refactors unless they directly reduce
   risk in the changed code.

## Baseline verification

Prefer these commands for source changes:

```bash
npm run build
npx tsc --noEmit --incremental false
```

Notes:

- `npm run lint` currently maps to `next lint`; with current Next versions this
  may be unavailable or less useful than `next build` plus `tsc`.
- There is no configured test runner. For gameplay logic, request a focused
  manual smoke check when automated coverage is absent.
- If running Next tooling modifies generated files such as `next-env.d.ts`,
  ensure the generated change is intentional before accepting it in the diff.

## Manual gameplay smoke checks

For PRs that touch `DungeonScene.ts`, `GameCanvas.tsx`, runtime assets, or core
gameplay constants, ask the author to verify:

- The app boots with `npm run dev` and the Phaser canvas fills the viewport.
- Start screen and how-to-play modal work at desktop and narrow viewport sizes.
- Movement works with WASD and arrow keys.
- Aiming follows pointer movement.
- Firing works with Space and pointer/click firing. The README mentions `J`,
  but the current scene binds the keyboard fire action to Space only; treat that
  as existing drift unless the PR changes controls or docs.
- Ammo pickups, seeker ammo, heart pickups, and power-ups can be collected
  without crashes.
- Enemy hit/death effects, score changes, life meter changes, and game-over
  restart behavior still run.
- The lower-right sound toggle updates state and mutes/unmutes scene audio.
- F3 debug overlay still toggles when collision or map rendering changes.

## Gameplay invariants to protect

Review changes to `DungeonScene.ts` carefully because it owns most game state,
input, combat, spawning, UI overlays, and audio.

- Keep Phaser objects created and destroyed with scene lifecycle safety. Event
  listeners added to `this.input`, `this.scale`, timers, tweens, or scene events
  should be removed or naturally scoped on shutdown.
- Avoid stale references to destroyed sprites, containers, zones, tweens, and
  sounds.
- Preserve early returns for game states such as not-started, game-over,
  player-dying, modal-open, muted, and sound-locked conditions.
- When changing movement, collision, or projectiles, verify tile/world
  conversions, depth ordering, camera follow, and simple collision radii.
- When changing enemy pressure or pickups, check spawn timers, max counts,
  progression gates, and pickup need checks so the game does not flood or starve
  the player.
- When changing power-ups, keep `POWERUP_CONFIG`, `assetManifest.powerUps.types`,
  animation rows, pickup visuals, duration timers, and HUD feedback consistent.
- Seeker ammo is a code-defined progression feature. It is not fully described
  in the README, so review code behavior directly and flag docs only when the PR
  touches controls, pickup docs, or seeker-related behavior.
- Blast, quickshot, haste, and ward have progression or duration constraints.
  Treat README/code mismatches as existing drift unless the PR changes those
  systems.

## Asset and audio review

Runtime loading comes from `src/game/assets/manifest.ts`. Any changed file under
`public/assets/**` should be checked against the manifest and the scene code that
uses it.

- Do not accept manifest keys that point to missing files.
- Do not accept deleted or renamed assets that are still referenced by
  `assetManifest`, `DungeonScene.ts`, README asset lists, or tooling.
- Sprite sheet metadata must match frame dimensions, row counts, and animation
  row assumptions in code.
- Audio additions should be listed in `assetManifest.audio` before scene code
  calls `this.load.audio`, `this.sound.add`, or `this.sound.play`.
- `public/assets/audio/audio-manifest.json` is auxiliary; do not treat it as the
  runtime source of truth.
- When asset generation scripts are modified, verify the script command still
  writes outputs to the paths consumed by `assetManifest`.
- Relevant commands include:
  - `python3 tools/process_assets.py`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`

## Next.js, React, and DOM UI review

- `GameCanvas.tsx` is a client component and dynamically imports Phaser. Do not
  move Phaser imports into server components or top-level app code.
- Preserve the single-game-instance guard and cleanup in `GameCanvas.tsx`.
- `src/app/layout.tsx` defines metadata and currently references
  `/opengraph-image.png`; metadata or share-image PRs should verify or add the
  referenced public asset, or avoid worsening existing missing-asset drift.
- This repo does not currently use Tailwind or shadcn/ui. Prefer existing
  semantic markup and `src/app/globals.css` patterns for DOM UI changes unless a
  PR explicitly adds a broader UI system.
- For Phaser-rendered UI, review pointer zones, keyboard behavior, readable text
  contrast, responsive placement, and modal close behavior rather than DOM ARIA
  attributes that do not apply inside the canvas.

## Documentation and dependency hygiene

- README controls, run commands, asset lists, known limitations, and milestone
  notes should stay aligned with changed behavior.
- If dependencies change, inspect `package.json`, `package-lock.json`, and
  `pnpm-lock.yaml` together. Avoid unrelated dependency churn.
- Security fixes should be scoped and verified with the package manager used in
  the PR. Do not recommend broad upgrades unless they are needed for the stated
  fix.

## Bugbot operation notes

- This guide provides repository-specific review context only.
- Managed enablement must be verified outside the repo: Cursor dashboard/org
  settings, GitHub App repository access, any Admin API configuration in use,
  and a live PR review smoke check.
- After this file lands on the default branch, trigger a review from a top-level
  PR comment with `cursor review` or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` and inspect the resulting request details.
- The guide may not affect Bugbot reviews until it is merged to the default
  branch.
