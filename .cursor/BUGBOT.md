# Cursor Bugbot review guidance

Use this file as repository-specific guidance for Cursor Bugbot reviews of
`fjg-thr/hobgoblin-dungeon`.

## Deployment and activation boundary

Bugbot is a managed Cursor service. This repository file gives Bugbot review
context, but it does not by itself enable hosted PR reviews.

To complete deployment, a Cursor team or repository admin should verify:

1. The Cursor GitHub App is installed for `fjg-thr/hobgoblin-dungeon`.
2. Bugbot is enabled for this repository in the Cursor dashboard.
3. PR review mode is set as intended: automatic on PR updates, manual, or both.
4. A live PR smoke review works by using one of the supported top-level PR
   comments when manual triggering is enabled:
   - `cursor review`
   - `bugbot run`
5. If a review does not appear, retry with verbose diagnostics:
   - `cursor review verbose=true`
   - `bugbot run verbose=true`

Repository changes should not claim the managed service is enabled unless the
dashboard/GitHub App setup and a PR smoke review have also been checked.

## Repository profile

This is a first-playable dark isometric dungeon prototype built with:

- Next.js App Router and React.
- TypeScript.
- Phaser 4 for the game runtime.
- Static/generated pixel-art assets and WAV audio under `public/assets`.

Primary entry points:

- `src/app/page.tsx` renders the game page.
- `src/game/GameCanvas.tsx` is the client-only React/Phaser bridge.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, UI, audio, and
  scene lifecycle logic.
- `src/game/assets/manifest.ts` is the runtime source of truth for asset keys
  and paths loaded by the Phaser scene.
- `src/game/maps/startingDungeon.ts` generates the current dungeon layout.
- `tools/` and `scripts/` contain asset/audio generation and processing tools.

There is no Tailwind or ShadCN setup in this repository. Prefer the existing
semantic markup and `src/app/globals.css` patterns for UI changes.

## Review priorities

### Next.js, React, and client boundaries

- Keep Phaser and browser-only APIs inside client components or dynamic imports.
- Do not import Phaser from server components or code that can execute during
  server rendering.
- Preserve the `GameCanvas` boot/teardown behavior: one Phaser game per host
  element, cancellation during async import, and `game.destroy(true)` cleanup.
- Avoid hydration-sensitive reads of `window`, DOM nodes, or media APIs outside
  effects or browser-only code paths.

### Phaser scene lifecycle

- Check that event listeners, timers, tweens, sounds, input handlers, and
  physics/display objects are removed or destroyed when scenes shut down.
- Watch for duplicate registration when restarting a run or returning from game
  over to the start screen.
- Keep long-lived state reset paths explicit; stale arrays, groups, or cooldowns
  can leak behavior across runs.
- Prefer small helper methods when modifying `DungeonScene.ts`; avoid expanding
  unrelated responsibilities in the already large scene file.

### Gameplay correctness

- Review movement, aiming, projectile, enemy, pickup, health, scoring, and
  power-up changes against both README controls and actual code behavior.
- Confirm input changes handle keyboard and pointer paths consistently. Current
  gameplay supports `Space` and pointer/click firing; README also mentions `J`,
  which is an existing documentation/code mismatch unless the PR changes input.
- Treat seeker ammo and the current blast unlock timing as code-defined behavior.
  README coverage is incomplete/out of date, so do not block unrelated PRs solely
  on those existing mismatches.
- Validate collision/map changes against isometric tile placement, room/corridor
  generation, camera bounds, and simple tile/proximity collision assumptions.

### Assets and audio

- Runtime asset loading should flow through `assetManifest` in
  `src/game/assets/manifest.ts`.
- When adding or renaming assets, verify the referenced files exist under
  `public/assets`, metadata JSON matches frame dimensions, and Phaser keys remain
  stable.
- `public/assets/audio/audio-manifest.json` is auxiliary; `assetManifest.audio`
  is what the scene loads at runtime.
- Review generator or processor changes in both `tools/` and `scripts/`, and
  avoid committing transient local output unless it is an intentional asset
  update.
- Check metadata references such as OpenGraph images before assuming referenced
  public files exist in every checkout.

### TypeScript and performance

- Maintain strict TypeScript compatibility. Avoid broad `any` types and prefer
  explicit unions for gameplay states, asset keys, pickup types, and directions.
- Keep hot paths allocation-conscious: update loops, enemy AI, projectile checks,
  and collision scans run frequently.
- Avoid expensive per-frame DOM work, asset lookups, object creation, logging, or
  large array filtering in gameplay loops unless measured and bounded.
- Preserve pixel-art rendering assumptions: nearest-neighbor assets, no unwanted
  smoothing, and stable frame dimensions.

## Verification expectations

Use the narrowest verification that matches the change. For repository-wide or
runtime-affecting changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For this repository-side Bugbot guidance file, also verify:

```bash
test -s .cursor/BUGBOT.md
git diff --check "$(git merge-base HEAD origin/main)"..HEAD
```

Notes:

- `package.json` currently defines `npm run lint` as `next lint`, which is not a
  reliable Next 16 lint command in this repo. Do not treat that script as the
  primary quality gate unless lint tooling is intentionally updated.
- Build/typecheck can create or rewrite generated artifacts such as
  `tsconfig.tsbuildinfo` and `next-env.d.ts`; keep the working tree clean unless
  generated typing behavior is the intentional change.
- The repo has no committed test runner today. If a PR adds tests or test
  scripts, run them and review that they exercise the changed behavior.

## Review output guidance

- Lead with bugs, regressions, security/privacy risks, missing verification, and
  user-visible gameplay issues.
- Include file and line references whenever possible.
- Distinguish blockers from existing known limitations documented above.
- Do not request broad rewrites or dependency/tooling churn unless needed for the
  PR under review.
- Keep suggestions scoped to the changed code and the playable prototype goals.
