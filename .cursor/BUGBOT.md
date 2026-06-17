# Cursor Bugbot review guidance

Use this file as repository-specific context for Cursor Bugbot reviews. Bugbot itself is a
managed Cursor service: confirm enablement in the Cursor dashboard/org settings, confirm
the GitHub App has access to this repository, and smoke-test on a pull request with a
top-level `cursor review` or `bugbot run` comment when service access is available. For
diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`. These rules
apply after this file is merged to the default branch; the PR that adds or changes this
file may not be reviewed with the new instructions.

## Project map

- Next.js App Router project for a browser game. `src/app/page.tsx` renders the game shell.
- `src/game/GameCanvas.tsx` is the only React client component that boots Phaser. It
  dynamically imports `phaser` and `DungeonScene` inside `useEffect`; do not move Phaser
  imports into server-rendered modules.
- `src/game/scenes/DungeonScene.ts` owns runtime gameplay, input, audio, tweens, timers,
  projectiles, pickups, UI overlays, and Phaser object lifecycle.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets loaded by
  `DungeonScene`. `public/assets/audio/audio-manifest.json` is auxiliary and should stay
  consistent when audio inventory changes.
- Asset generator/processor tooling lives under both `tools/` and `scripts/`.

## Review priorities

1. Protect client/server boundaries. Any code that touches `window`, `localStorage`,
   Phaser, pointer input, or Web Audio must remain browser-only and guarded from SSR.
2. Check Phaser lifecycle cleanup. New event listeners, timers, tweens, audio instances,
   sprites, graphics, containers, and scene callbacks should be removed or destroyed on
   scene shutdown/restart. Avoid duplicate `Phaser.Game` instances in React strict mode.
3. Validate gameplay contracts. Review movement, collision, enemy damage, pickups,
   projectile lifetimes, scoring, game-over/restart, and mute persistence against actual
   `DungeonScene` behavior. Prefer small deterministic helpers for logic that grows hard
   to reason about.
4. Verify asset contracts. If a PR changes an asset path, frame size, frame order, key, or
   metadata JSON, make sure the matching PNG/JSON pair and `assetManifest` entry are
   updated together. Phaser spritesheet dimensions must match the generated sheet.
5. Keep UI changes consistent with this repo. It currently uses semantic markup plus
   `src/app/globals.css`, not Tailwind or ShadCN. Preserve keyboard/pointer accessibility
   for controls and overlays.
6. Treat generated assets carefully. Do not hand-edit generated sprite metadata unless the
   PR intentionally replaces the generator output and explains why.
7. Watch deployment metadata. `src/app/layout.tsx` references `/opengraph-image.png`;
   this branch currently has no matching tracked `public/opengraph-image.*`. Flag PRs that
   touch metadata or public asset inventory without resolving that deploy-facing mismatch.

## Known existing mismatches

- README says `Space` or `J` fires. Current code binds keyboard shooting to `Space` and
  supports pointer/click firing. Do not block unrelated PRs solely on this mismatch.
- README documents regular ammo and several power-ups, but current code also unlocks
  seeker ammo/projectiles after a kill/time threshold.
- README describes blast as rare late-game, while current `POWERUP_CONFIG.blast` unlocks
  earlier. Treat this as existing context unless the PR intends to fix docs/gameplay.

## Verification guidance

- Prefer `npm ci`, `npm run build`, and `npx tsc --noEmit` for code changes.
- `npm run lint` invokes `next lint`, which is not reliable with the current Next version;
  do not require it as the only quality gate.
- For review diffs, run whitespace checks against the PR range, for example:
  `BASE=$(git merge-base HEAD origin/main) && git diff --check "$BASE"..HEAD`.
- Build/typecheck may rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo`; do not
  include those generated artifacts unless the PR intentionally changes generated typing.
- The package has no `npm start` script. Use an explicit Next start/smoke command only when
  runtime smoke infrastructure is part of the change.
- Existing `npm ci` output may report audit findings; distinguish pre-existing dependency
  audit noise from regressions introduced by the PR.

## Review output expectations

- Lead with concrete findings that include file and line references.
- Prioritize correctness, deploy/runtime breakage, leaks, and missing verification over
  stylistic preferences.
- Mention residual risk when managed Bugbot service state cannot be verified from repo
  files alone.
