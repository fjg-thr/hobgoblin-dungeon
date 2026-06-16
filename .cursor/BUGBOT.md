# Cursor Bugbot Review Guide

This repository-specific guide gives Cursor Bugbot context for reviewing
pull requests in `fjg-thr/hobgoblin-dungeon`. The managed Bugbot service is
enabled outside the repo through the Cursor dashboard and GitHub App access;
this file only supplies project review guidance once Bugbot runs.

Manual review triggers on pull requests:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for troubleshooting

## Project context

- Next.js App Router project using React and TypeScript.
- The playable game is a Phaser 4 RC scene mounted from React.
- Core game logic lives in `src/game/scenes/DungeonScene.ts`.
- React integration lives in `src/game/GameCanvas.tsx`.
- App routes and page shell live in `src/app/`.
- Dungeon layout data lives in `src/game/maps/`.
- Runtime asset source of truth is `src/game/assets/manifest.ts`.
- Static assets live under `public/assets/`.
- Asset and audio generation/processing scripts live under `tools/` and
  `scripts/`.

The repository currently uses plain CSS in `src/app/globals.css`, not Tailwind.
Review UI changes against existing CSS patterns and semantic/accessibility
expectations rather than Tailwind conventions.

## Review priorities

1. Gameplay correctness
   - Check movement, aiming, firing, ammo, pickups, power-ups, enemy behavior,
     scoring, game-over flow, and restart flow for regressions.
   - Confirm changes preserve isometric tile/world coordinate conversions.
   - Watch for timing bugs caused by Phaser clock values, cooldowns, spawn
     timers, or run-start state resets.

2. Phaser lifecycle and cleanup
   - Ensure scene event handlers, input listeners, timers, tweens, animations,
     sounds, and game objects are cleaned up or owned by the scene lifecycle.
   - Be suspicious of duplicate listeners after restart, scene shutdown, or
     React remount.
   - Prefer deterministic state reset in restart paths over partial mutation.

3. Asset integrity
   - New runtime assets should be listed in `src/game/assets/manifest.ts` and
     exist under `public/assets/` with the expected path, frame size, and
     metadata.
   - Sprite-sheet JSON changes should match the referenced image layout.
   - Generated assets should be committed only when intentionally changed.
   - Do not treat `public/assets/audio/audio-manifest.json` as the runtime
     source of truth; runtime audio loading comes from `assetManifest.audio`.

4. TypeScript and Next.js health
   - Keep `strict` TypeScript compatibility.
   - Avoid browser-only globals during server rendering unless guarded by client
     component boundaries.
   - Keep `GameCanvas` and Phaser initialization client-only.
   - Avoid dependency or lockfile churn unless the PR intentionally changes
     tooling or packages.

5. User-facing behavior
   - Controls, HUD text, audio mute state, start/game-over UI, and debug overlay
     should stay clear and keyboard/pointer accessible where applicable.
   - If README behavior is intentionally changed, the README should be updated
     in the same PR.

## Known baseline notes

Use these notes to avoid blocking unrelated PRs on existing mismatches:

- README says `Space` or `J` fires, while current runtime keyboard binding uses
  `Space`; pointer/click firing also exists. Flag this only when a PR changes
  controls or user-facing control documentation.
- README documents standard ammo, hearts, quickshot, haste, ward, and blast.
  Current runtime also includes seeker ammo/projectiles that unlock after early
  progression. Flag docs drift only when a PR touches ammo, projectiles, or
  gameplay documentation.
- README describes blast as rare late-game, while current config unlocks blast
  after 2 kills or 16 seconds. Treat this as baseline drift unless a PR changes
  power-up progression or the README.
- `DungeonScene.ts` is large and central. Prefer focused comments on changed
  behavior rather than broad refactor requests unless the change makes an
  existing risk worse.

## Suggested validation

For most code changes, expect at least:

```bash
npm run build
npx tsc --noEmit
```

`npm run lint` currently maps to `next lint`, which is not reliable in recent
Next.js versions. Do not require it unless the project lint setup changes.

When running build or typecheck locally, Next/TypeScript may rewrite
`next-env.d.ts` or create `tsconfig.tsbuildinfo`. These generated changes should
not be included unless the PR intentionally changes generated typing behavior.

For asset-only changes, also verify that every manifest path exists and that
sprite metadata lines up with referenced frame dimensions.

For gameplay changes, manual smoke coverage should include:

- Start a run.
- Move with WASD or arrow keys.
- Aim with pointer movement.
- Fire with `Space` and pointer click.
- Collect ammo and at least one power-up.
- Take damage, pick up a heart when eligible, and reach game over/restart.
- Toggle sound and, if relevant, toggle the F3 debug overlay.

## Managed Bugbot deployment checks

Repository changes cannot prove the managed Bugbot service is enabled. A human
or automation with Cursor admin access should confirm:

- Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- Bugbot is enabled for this repository in the Cursor dashboard.
- The desired trigger mode is selected: automatic PR updates or mention-only.
- Draft PR behavior and run-once-per-PR behavior match team policy.
- A smoke PR can receive a Bugbot review via `cursor review` or `bugbot run`.
