# Cursor Bugbot review guide

This repository is a Next.js App Router prototype that renders a Phaser game from
`src/game/GameCanvas.tsx` and `src/game/scenes/DungeonScene.ts`. Use this guide
when reviewing pull requests after hosted Cursor Bugbot is enabled for the
repository in the Cursor Dashboard and the Cursor GitHub App has access to this
repo.

## Review priorities

- Treat gameplay regressions, broken builds, asset load failures, runtime crashes,
  and persistent input/audio state bugs as blocking.
- Keep review feedback focused on changed files and the behavior affected by the
  pull request. Do not block unrelated PRs only because of existing prototype
  limitations.
- Prefer small, actionable findings with file and line references. Explain the
  user-visible impact for gameplay, rendering, input, audio, or share metadata.
- Review TypeScript changes against the current strict settings in `tsconfig.json`.
  Avoid suggestions that add `any`, weaken strictness, or hide invalid nullable
  states.

## Verification commands

Use these commands for repo-side validation when dependencies are available:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` maps to `next lint`, which is not reliable with the current Next
  version in this repo. Prefer the build and TypeScript checks above.
- `package-lock.json` is the canonical install lockfile for the verification
  commands above. If a PR changes dependencies, also check the tracked
  `pnpm-lock.yaml` for intentional sync or removal so lockfiles do not drift.
- `npm ci` may report pre-existing dependency audit findings. Do not block an
  unrelated PR solely on those baseline advisories unless the PR changes
  dependencies, lockfiles, or security-sensitive behavior.
- Next build or dev commands may rewrite `next-env.d.ts` or create
  `tsconfig.tsbuildinfo`; these should stay out of unrelated diffs unless the PR
  intentionally changes generated type behavior.

## Managed Bugbot deployment boundary

This file only provides repository-specific review instructions. Actual Bugbot
deployment is managed outside the repo:

- Enable GitHub in the Cursor Dashboard.
- Install or update the Cursor GitHub App so it can access
  `fjg-thr/hobgoblin-dungeon`.
- Enable Bugbot for this repository in Cursor settings.
- Confirm with a real pull request review smoke test. Manual triggers should work
  from a top-level PR comment using `cursor review` or `bugbot run`; verbose
  troubleshooting can use `cursor review verbose=true` or
  `bugbot run verbose=true`.

Hosted Bugbot applies repository guidance after this file is merged to the
default branch. A PR that adds or edits this guide may not be reviewed with the
new guidance yet.

## Codebase map

- `src/app/layout.tsx`: Next metadata and root document shell.
- `src/app/page.tsx`: app route that mounts the game canvas.
- `src/app/globals.css`: global DOM styling for the full-window game shell.
- `src/game/GameCanvas.tsx`: client-only dynamic Phaser bootstrapping and
  teardown.
- `src/game/scenes/DungeonScene.ts`: primary gameplay, input, HUD, audio,
  spawning, combat, and progression logic.
- `src/game/maps/startingDungeon.ts`: dungeon generation, tile codes, and
  collision helpers.
- `src/game/assets/manifest.ts`: runtime source of truth for loaded sprites,
  audio, UI assets, and metadata paths.
- `public/assets/**`: static runtime assets consumed by Phaser.
- `tools/**` and `scripts/**`: local asset generation and processing utilities.

## Gameplay and Phaser review checks

- Verify that Phaser objects, timers, tweens, input handlers, and sound instances
  are cleaned up when scenes shut down or when `GameCanvas` unmounts.
- Watch for changes that desynchronize tile coordinates, world coordinates,
  depth ordering, collision boxes, or camera/HUD scroll factors.
- Check progression gates for enemies, hearts, ammo pickups, seeker ammo, and
  power-ups against both constants and user-facing documentation when the PR
  touches gameplay balance or README copy.
- For combat changes, verify projectile lifetime, ammo consumption, hitbox math,
  enemy health, death effects, scoring, and blast/seeker interactions.
- For input changes, test keyboard, pointer move, pointer down, restart, debug
  overlay, and sound toggle behavior. Current code binds shooting to `Space` and
  pointer/click firing; README also mentions `J`, which is an existing docs/code
  mismatch unless the PR is meant to fix controls.
- For audio changes, confirm keys in `assetManifest.audio` are loaded in
  `DungeonScene`, mute state still persists through local storage, and locked or
  muted sound does not throw.

## Assets and generated files

- Runtime audio and sprite loading should be reviewed from
  `src/game/assets/manifest.ts`; `public/assets/audio/audio-manifest.json` is
  auxiliary and should not be treated as the runtime source of truth.
- If a PR changes packed sprite sheets, confirm frame dimensions, row offsets,
  frame counts, and metadata paths still match the manifest and animation setup.
- Avoid requesting hand edits to generated or processed binary assets. Review the
  generator or processing script when the PR changes asset-generation behavior.
- Large binary asset diffs should have a clear gameplay, UI, audio, or metadata
  reason.

## UI, metadata, and accessibility checks

- This repo does not use Tailwind or ShadCN today. For DOM changes, follow the
  existing semantic markup and `src/app/globals.css` patterns rather than
  introducing a new UI framework without a clear need.
- For Phaser canvas UI, review pointer hit zones, keyboard/mouse affordances,
  responsive placement, contrast, readable text, and whether the interaction has
  an equivalent keyboard path where practical.
- `src/app/layout.tsx` references the tracked `public/opengraph-image.png`
  social image. If a PR touches metadata, social previews, or public root assets,
  verify that referenced public assets still exist and match the dimensions and
  alt text declared in metadata.

## Known baseline mismatches and limitations

Do not block unrelated PRs solely on these existing issues, but call them out when
a PR touches the same behavior:

- README documents `Space` or `J` for firing, while current gameplay binds only
  `Space` plus pointer/click firing.
- README documents quickshot, haste, ward, blast, hearts, and regular ammo, but
  current code also has seeker ammo behavior gated after kills or survival time.
- README describes blast as late and rare, while current code unlocks blast after
  early progression constants.
- The prototype intentionally lacks a formal test suite and uses simple collision
  rather than a full physics system.
