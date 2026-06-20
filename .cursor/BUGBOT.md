# Cursor Bugbot review guide

This repository contains a Next.js / React / TypeScript prototype for a dark
GBA-inspired isometric dungeon game implemented primarily in Phaser.

## Deployment boundary

- This file gives Cursor Bugbot repository-specific review context. It does not
  by itself enable the hosted Bugbot service.
- Managed Bugbot activation must be verified outside this repo in Cursor
  dashboard or organization settings, GitHub App repository access, and a live
  pull-request smoke review when those controls are available.
- After this file is merged to the default branch, Bugbot reviews should use
  these instructions. Pull requests that add or change this file may not be
  reviewed with the new guidance yet.
- Manual review triggers supported by Cursor Bugbot include top-level PR
  comments such as `cursor review` or `bugbot run`. For troubleshooting, use
  `cursor review verbose=true` or `bugbot run verbose=true`.

## Project map

- `src/app/layout.tsx` and `src/app/page.tsx` define the Next.js app shell,
  metadata, and page mount.
- `src/game/GameCanvas.tsx` is the React client boundary that owns the Phaser
  game instance lifecycle.
- `src/game/scenes/DungeonScene.ts` contains most runtime gameplay, UI overlays,
  input handling, spawning, combat, powerups, scoring, and audio behavior.
- `src/game/maps/startingDungeon.ts` defines the generated room-and-corridor map
  data and collision-relevant tile layout.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets loaded
  by Phaser, including audio. `public/assets/audio/audio-manifest.json` is
  auxiliary and should stay consistent when audio assets are intentionally
  changed.
- `public/assets/**` contains sprites, UI sheets, effects, tiles, and audio used
  at runtime.
- `tools/**` and `scripts/**` contain local asset and audio generation or
  processing utilities. Review generated asset changes together with the
  generator or processing command that produced them when possible.

## Review priorities

1. **Gameplay correctness**
   - Check player movement, aim, firing, ammo consumption, enemy contact damage,
     powerup collection, heart pickups, scoring, start/game-over flow, and
     restart behavior.
   - Watch for changes that desynchronize README-described behavior from
     runtime behavior. If a PR intentionally changes controls or progression,
     expect docs and in-game instructions to move with it.
   - Validate progression gates for enemies and powerups against code-defined
     constants in `DungeonScene.ts`.

2. **Phaser lifecycle and input cleanup**
   - React and Phaser ownership should remain clear: `GameCanvas.tsx` creates
     one game instance and destroys it on unmount.
   - Scene changes should clean up timers, events, tweens, input zones, audio,
     physics objects, and display objects they create.
   - Pointer and keyboard handlers should not be registered repeatedly across
     restarts or scene transitions.

3. **Assets and manifests**
   - New runtime assets must be referenced from `src/game/assets/manifest.ts`
     and exist under `public/assets/**` with paths that match casing exactly.
   - Sprite-sheet JSON dimensions, frame names, and animation expectations
     should match the corresponding PNG sheets.
   - Avoid committing accidental source-only, temporary, or oversized generated
     files unless the PR explicitly updates the asset pipeline.

4. **TypeScript and Next.js health**
   - Prefer small, typed helpers over widening `any` or adding implicit runtime
     contracts inside the large scene file.
   - Be careful with Next-generated files. `next-env.d.ts` can be rewritten by
     `next dev`, `next build`, or type generation; do not treat that churn as an
     intended source change unless the PR is about Next typing behavior.
   - This repository currently has a `next lint` script, but modern Next
     versions may not support `next lint`. Prefer build and typecheck evidence.

5. **UI, accessibility, and user-facing text**
   - The DOM surface is intentionally small. For React/Next UI changes, prefer
     semantic elements, accurate metadata, keyboard reachability, and existing
     `src/app/globals.css` patterns.
   - This project does not currently configure Tailwind or ShadCN. Do not
     require Tailwind/ShadCN rewrites for unrelated PRs.
   - Phaser canvas overlays are not normal DOM controls, so review pointer
     zones, keyboard affordances, text readability, responsive placement, and
     visible state changes carefully.

6. **Repository hygiene**
   - Keep dependency and lockfile changes intentional. The repo currently has
     both `package-lock.json` and `pnpm-lock.yaml`; if dependencies change, make
     sure the chosen package-manager lockfile story is explicit.
   - Keep generated TypeScript build artifacts such as `tsconfig.tsbuildinfo`
     untracked.
   - Use `git diff --check` to catch whitespace errors in generated or hand
     edited asset metadata.

## Suggested validation commands

Use the narrowest commands that match the PR scope. For general code changes:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

Notes:

- `npm ci` may report existing audit findings from the current dependency
  baseline. Do not block unrelated PRs solely on pre-existing advisories unless
  the PR changes dependencies or security-sensitive behavior.
- If `npm run build` or `npx tsc --noEmit` rewrites `next-env.d.ts` or creates
  `tsconfig.tsbuildinfo`, verify whether those files are intentional before
  accepting them in the diff.
- For asset-only PRs, also inspect the affected sprite-sheet JSON/PNG pairs and
  any generator command output included in the PR description.

## Known baseline mismatches

Treat these as existing context unless a PR intentionally touches the related
behavior or documentation:

- The README says `Space` or `J` fires; current runtime control guidance and
  code should be checked for `Space` plus pointer/click firing behavior.
- Seeker ammo exists in the code path and unlocks during play, but the README
  does not currently document it.
- The README describes blast as a rare late-game powerup, while current code may
  unlock blast earlier according to `POWERUP_CONFIG.blast`.
