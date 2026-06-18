# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull requests for
`fjg-thr/hobgoblin-dungeon`.

## Deployment boundary

- Cursor Bugbot is a managed Cursor/GitHub App service. Enabling it for this repository
  requires the Cursor dashboard or organization settings plus GitHub App repository access;
  this file only supplies repo-side review instructions.
- These instructions apply after this file is merged to the default branch. A PR that adds
  or changes `BUGBOT.md` may not be reviewed with the new guidance yet.
- Manual review triggers may be posted as a top-level PR comment with `cursor review` or
  `bugbot run`. For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true`.
- If asked to prove managed deployment, verify the external Cursor/GitHub App settings and
  run a live PR smoke review. Repository files alone cannot confirm that hosted Bugbot is
  enabled.

## Project map

- This is a Next.js/React/TypeScript prototype using Phaser 4 for the runtime game.
- `src/app/page.tsx` renders the client-only `GameCanvas`.
- `src/game/GameCanvas.tsx` dynamically imports `phaser` and `DungeonScene` in `useEffect`
  so Phaser only boots in the browser.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`, including input,
  power-ups, projectiles, enemies, pickups, HUD, start/game-over screens, audio, and debug
  overlay behavior.
- Map data and generation helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset and audio loading is driven by `src/game/assets/manifest.ts`. The
  `public/assets/audio/audio-manifest.json` file is auxiliary; do not treat it as the
  runtime source of truth unless the PR intentionally changes audio manifest tooling.
- Asset generation and processing scripts live under both `tools/` and `scripts/`.
- Styling uses `src/app/globals.css`; this repo currently has no Tailwind configuration.

## Review priorities

Prioritize findings that affect shipped behavior or the ability to build/run the prototype:

1. Browser-only safety for Phaser and DOM APIs in the Next app.
2. TypeScript strictness, import correctness, and generated Next route type churn.
3. Gameplay state invariants in `DungeonScene.ts`, especially ammo, projectiles, pickups,
   timers, power-up durations, enemy cleanup, scene reset, and game-over state.
4. Asset path consistency between `assetManifest`, files under `public/assets`, and any
   JSON sprite-sheet metadata used at runtime.
5. Input and accessibility regressions for the surrounding React page where applicable.
6. Audio behavior, especially scene-level mute state and missing asset preload references.
7. Build and dependency changes that add unnecessary churn or weaken reproducibility.

When reviewing large `DungeonScene.ts` changes, look for lifecycle bugs: event listeners
registered more than once, tweens/timers/sprites left alive after reset or scene shutdown,
arrays retaining destroyed objects, and UI layers with stale depth or camera scroll behavior.

## Known baseline context

Do not block unrelated PRs solely for these existing mismatches, but mention them when a PR
touches the related area:

- `README.md` says `Space` or `J` fires; runtime keyboard shooting currently binds `SPACE`
  only, while pointer/click firing is also supported.
- README power-up prose describes blast as rare late-game, but runtime configuration unlocks
  blast after 2 kills or 16 seconds survived.
- README omits seeker ammo, while current code unlocks seeker pickups/projectiles after a
  4-kill or 30-second threshold.
- `src/app/layout.tsx` references `/opengraph-image.png`, but this branch has no matching
  `opengraph-image.*` file under `public` or `src/app`.
- `next lint` is not a reliable verification command for current Next versions in this repo.

## Verification guidance

For most code PRs, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For review-only or documentation/configuration PRs, at minimum run:

```bash
git diff --check origin/main...HEAD
```

If verification rewrites generated files such as `next-env.d.ts` or creates
`tsconfig.tsbuildinfo`, make sure those changes are intentional before approving them. This
project does not define an `npm start` script; use Next's appropriate start command only when
intentionally doing runtime smoke testing.

## Review output expectations

- Lead with concrete bugs, regressions, or missing tests, ordered by severity.
- Include file and line references when possible.
- Distinguish pre-existing baseline issues from regressions introduced by the PR.
- Keep summaries brief and avoid blocking on style-only feedback unless it hides a real risk.
