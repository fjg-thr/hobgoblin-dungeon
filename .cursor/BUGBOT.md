# Cursor Bugbot review guide

Use this repository guide when reviewing PRs for the Hobgoblin Ruin prototype.
It gives Bugbot project-specific context; it does not by itself enable the
managed Cursor Bugbot service. Managed enablement still needs Cursor
dashboard/org settings, GitHub App repository access, and a live PR smoke review
when available. Manual top-level PR triggers include `cursor review`,
`bugbot run`, `cursor review verbose=true`, and `bugbot run verbose=true`.

## Project map

- App shell: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
- React/Phaser bridge: `src/game/GameCanvas.tsx`.
- Main gameplay scene: `src/game/scenes/DungeonScene.ts`.
- Static map data: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Phaser assets live under `public/assets/**`; generated/processor tooling lives
  under `tools/` and `scripts/`.

## Review priorities

- For React/Next changes, check client-only Phaser startup and teardown. The
  canvas should mount once, destroy cleanly on unmount, and avoid touching
  browser globals outside client-safe code.
- For `DungeonScene.ts`, focus on lifecycle ordering, timers/tweens/events,
  collision bounds, camera/canvas resizing, pointer zones, keyboard state, and
  cleanup when returning to the title screen or restarting.
- For gameplay changes, verify ammo, health, power-up timers, enemy spawning,
  scoring, invulnerability, and game-over/restart interactions together rather
  than as isolated counters.
- For map and collision edits, check that tile coordinates, world coordinates,
  wall/prop blocking, bridge/stair placement, and debug overlays stay aligned.
- For assets, ensure files referenced by `src/game/assets/manifest.ts` exist,
  JSON frame names match the scene code, and generated source/output artifacts
  are intentionally committed or intentionally omitted.
- For audio, `src/game/assets/manifest.ts` is the runtime source of truth.
  `public/assets/audio/audio-manifest.json` is auxiliary and should only block a
  PR when the PR intentionally changes that contract.
- For DOM/UI work, this repo currently uses plain CSS in `src/app/globals.css`
  rather than Tailwind. Review semantic HTML, keyboard access, metadata, and
  responsive behavior; review Phaser UI separately for pointer zones, keyboard
  affordances, readable canvas placement, and mobile limitations.

## Known baseline mismatches

Do not block unrelated PRs only for these existing mismatches, but call them out
when a PR touches the affected feature or docs:

- README says staff bolts fire with `Space` or `J`; current runtime firing is
  `Space` plus pointer/click firing.
- README omits seeker ammo, while current gameplay unlocks seeker ammo after a
  kill/time gate and uses seeker pickups/projectiles.
- README describes blast as rare late-game, while current code unlocks blast
  earlier than that wording implies.
- Dependency audit output currently reports existing Next/PostCSS advisories.
  Do not require unrelated PRs to fix baseline dependency findings unless they
  change dependencies or security posture.

## Suggested verification

Prefer scoped verification based on the files changed. Useful commands:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

`next lint` is not reliable with the current Next version and package script.
Build/typecheck may rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo`;
those generated changes should be restored/removed unless the PR intentionally
changes Next-generated typing behavior.

## Review output expectations

Lead with actionable findings ordered by severity. Include file and line
references, explain the user-visible or maintenance impact, and distinguish
confirmed regressions from residual risk. If no issues are found, say so and
note any verification that could not be run.
