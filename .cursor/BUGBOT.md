# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for Hobgoblin Ruin. The hosted Bugbot service itself is managed outside
this repository through Cursor organization settings and GitHub App repository
access; this file only supplies review instructions after it is merged to the
default branch.

## Activation and rollout

- Confirm hosted enablement outside git: Cursor dashboard/org settings, GitHub
  App access for this repository, and a live pull request smoke review when the
  automation environment has permission to see those settings.
- Manual review triggers supported by Cursor public docs include top-level PR
  comments `cursor review` and `bugbot run`.
- For troubleshooting, request verbose output with `cursor review verbose=true`
  or `bugbot run verbose=true`.
- If a pull request changes this file, do not assume the changed instructions
  were used for that same review. Treat the merged default-branch version as the
  active guidance.

## Project map

- App stack: Next.js App Router, React, TypeScript, and Phaser 4 RC.
- Main React entry: `src/game/GameCanvas.tsx` dynamically imports Phaser and
  owns game lifecycle mounting/cleanup.
- Main game logic: `src/game/scenes/DungeonScene.ts`.
- Map data: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- App shell and metadata: `src/app/page.tsx`, `src/app/layout.tsx`, and
  `src/app/globals.css`.
- Asset and audio tooling lives under both `tools/` and `scripts/`.
- `public/assets/audio/audio-manifest.json` is useful for consistency checks,
  but runtime audio loading follows `assetManifest.audio`.

## Review priorities

1. Flag correctness regressions in player controls, combat, enemy behavior,
   pickups, power-ups, scoring, Phaser lifecycle cleanup, and collision/camera
   behavior.
2. Flag React/Next regressions such as server/client boundary mistakes,
   hydration risks, unstable dynamic imports, metadata asset mismatches, or
   unhandled browser-only APIs outside client code.
3. Flag asset manifest drift: runtime code, generated JSON metadata, PNG/WAV
   assets, README asset lists, and generation scripts should stay consistent
   when a PR intentionally changes assets.
4. Flag TypeScript strictness issues, unchecked `any`, nullability mistakes,
   stale generated files, and changes that rely on local `.next` artifacts.
5. Keep findings actionable and scoped to the changed behavior. Do not block
   unrelated PRs solely for existing README/code mismatches listed below.

## Gameplay and documentation context

- Current runtime firing controls are `SPACE` and pointer/click firing.
  `README.md` also mentions `J`; treat that as an existing mismatch unless the
  PR intentionally changes input/control docs or key bindings.
- The README lists quickshot, haste, ward, blast, regular ammo, and heart
  pickups. Runtime code also has seeker ammo/projectiles that unlock after the
  configured kill/time thresholds. Review seeker behavior from the code, not
  from README omission alone.
- The README describes blast as rare late-game, while current code unlocks blast
  earlier through `POWERUP_CONFIG.blast`. Treat this as an existing mismatch
  unless a PR changes blast tuning or documentation.
- The how-to-play modal currently says click or press SPACE to fire. That
  matches runtime behavior more closely than the README controls line.
- `src/app/layout.tsx` references `/opengraph-image.png`, which is currently
  absent from the repository. Treat that as existing context unless a PR changes
  metadata, OpenGraph assets, or public asset inventory.

## Phaser and React lifecycle checks

- `GameCanvas` should create one Phaser game instance on the client and destroy
  it during cleanup. Watch for duplicate canvas creation, leaked event handlers,
  or code that runs Phaser during SSR.
- `DungeonScene` registers keyboard, pointer, timer, animation, and physics
  resources. New listeners should be paired with cleanup when scenes shutdown or
  restart.
- Pointer coordinates, camera scroll, world/tile conversions, and depth sorting
  are easy regression points in isometric scenes. Verify any changed math against
  collision and targeting behavior.
- Avoid broad rewrites of the scene unless the PR has tests or manual evidence
  covering movement, shooting, enemy collisions, pickups, game over, restart,
  mute, and debug overlay flows.

## Asset and audio checks

- When sprite sheets or metadata change, verify frame dimensions, frame counts,
  animation row assumptions, and manifest keys match the loader and animation
  creation code.
- Runtime audio additions should update `assetManifest.audio`; optionally keep
  `public/assets/audio/audio-manifest.json` consistent if the PR touches audio
  inventory docs or generated audio outputs.
- Generation/processing scripts are not generated artifacts. Treat changes under
  `tools/` and `scripts/` as source changes that need review.
- Do not require Tailwind conventions here. This repository uses global CSS and
  Phaser-rendered UI rather than a Tailwind/shadcn UI setup.

## Verification guidance

Prefer these checks for repository-side changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Also run a whitespace check against the PR base when possible:

```bash
BASE=$(git merge-base HEAD origin/main)
git diff --check "$BASE"..HEAD
```

Notes:

- `npm run lint` currently maps to `next lint`, which is not reliable for this
  Next version. Prefer build plus `npx tsc --noEmit` unless the project updates
  lint tooling.
- `npm ci` may report existing audit findings. Report them as pre-existing
  unless the PR changes dependencies or lockfiles in a way that worsens them.
- Build/typecheck commands can rewrite `next-env.d.ts` and create
  `tsconfig.tsbuildinfo`. These generated artifacts should not be committed
  unless the PR explicitly changes generated typing behavior.
- This package has no `npm start` script. Do not request `npm start` as a smoke
  command unless a PR adds an appropriate runtime script.

## Expected Bugbot output

- Lead with concrete findings ordered by severity.
- Include file paths and line references for each finding.
- Distinguish current-regression risks from known existing mismatches.
- If no blocking issues are found, state that clearly and mention any verification
  that was unavailable, especially hosted Bugbot enablement checks that require
  Cursor dashboard or GitHub App access.
