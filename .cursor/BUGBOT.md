# Cursor Bugbot Review Guide

Use this guide when reviewing pull requests for this repository. It gives repo-specific context for Cursor Bugbot and human reviewers; it does not enable the managed Bugbot service by itself.

## Deployment and trigger notes

- Bugbot service enablement is managed outside this repository through Cursor dashboard or organization settings plus Cursor GitHub App repository access.
- This file applies after it is merged to the default branch. PRs adding or editing it may be reviewed with previous guidance.
- Manual PR review triggers supported by Cursor docs include top-level comments with `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true` in a top-level PR comment when the managed service is available.

## Project map

- Next.js App Router entrypoints live in `src/app/`.
- `src/app/page.tsx` renders the game shell and imports the client-only `src/game/GameCanvas.tsx`.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene` during client-side boot, then owns teardown.
- Most gameplay behavior is in `src/game/scenes/DungeonScene.ts`.
- Map generation and tile metadata live in `src/game/maps/startingDungeon.ts`.
- Runtime asset loading is defined in `src/game/assets/manifest.ts`; this is the source of truth for assets Phaser loads.
- Runtime assets are under `public/assets/`.
- Asset and audio generator/processor tooling lives under both `tools/` and `scripts/`.

## Review priorities

1. Client/server boundaries
   - Keep Phaser and browser-only APIs out of server components.
   - Preserve the `GameCanvas` client boundary and its client-side Phaser/scene imports.
   - Watch for `phaser`, `window`, or `document` usage that can execute during server rendering.

2. Phaser lifecycle and cleanup
   - Ensure scene, timer, input, sound, event, and DOM listeners are cleaned up on unmount/restart.
   - Be cautious with long-lived intervals, tweens, delayed calls, and event subscriptions in `DungeonScene`.
   - Prefer changes that keep scene state initialization and restart behavior deterministic.

3. Gameplay invariants
   - Preserve movement, aiming, ammo, damage, ward timing, power-up duration, spawn gating, scoring, and game-over behavior unless a PR intentionally changes them.
   - For collision or map edits, check both tile metadata and runtime collision logic.
   - For weapon or pickup edits, check spawn/unlock timing, HUD display, pickup removal, and projectile cleanup together.

4. Asset consistency
   - When runtime assets change, verify `src/game/assets/manifest.ts` and matching files under `public/assets/`.
   - Sprite sheet JSON should agree with frame dimensions, names, and animation use in `DungeonScene`.
   - Treat `public/assets/audio/audio-manifest.json` as auxiliary unless the PR explicitly wires it into runtime loading.
   - Avoid committing regenerated binary assets unless the PR intentionally updates them and includes the matching manifest/metadata changes.

5. UI and accessibility basics
   - This repo currently uses plain CSS in `src/app/globals.css`, not Tailwind.
   - Review HTML overlays for semantic elements, labels, keyboard support, focus behavior, and readable text.
   - In-canvas Phaser controls should still preserve documented keyboard and pointer behavior.

## Known existing context

Do not block unrelated PRs for these existing mismatches, but flag them when a PR touches the relevant area:

- `README.md` says `Space` or `J` fires. Current gameplay binds keyboard firing to `Space` and supports pointer/click firing.
- `README.md` omits seeker ammo. Current gameplay unlocks seeker ammo after progression/time conditions and uses seeker pickups/projectiles.
- `README.md` describes blast as rare late-game. Current code unlocks blast earlier than that wording suggests.
- `src/app/layout.tsx` references `/opengraph-image.png`, but this asset may be absent. Flag only for metadata/OpenGraph/public asset changes.

## Suggested verification

Prefer checks that match the current toolchain:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` currently maps to `next lint`, which is not reliable with this Next.js setup.
- Build/typecheck can rewrite `next-env.d.ts` route-type imports and create `tsconfig.tsbuildinfo`; do not leave those dirty unless intentional.
- The package has no `npm start` script. If a PR adds runtime smoke tests, use an explicit Next command or a checked-in smoke script.
- Existing dependency audit findings may appear during `npm ci`; do not treat them as introduced by unrelated PRs unless dependency changes are in scope.

## Review output expectations

- Lead with concrete bugs, regressions, or missing tests. Include file and line references.
- Separate existing baseline issues from issues introduced by the PR.
- Avoid speculative findings when the code path is unchanged and the risk is not actionable.
- For generated assets, focus on source-of-truth consistency and runtime load failures rather than style preferences.
