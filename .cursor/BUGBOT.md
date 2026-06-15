# Cursor Bugbot review guide

Use this file as repository-specific context for Cursor Bugbot code reviews. It
does not enable the managed Bugbot service by itself; managed review activation
still depends on Cursor dashboard/org settings, GitHub App repository access,
and a PR review smoke check.

## Running Bugbot

- Automatic PR review depends on the managed Cursor Bugbot installation for this
  repository.
- Manual top-level PR comments can request a review with `cursor review` or
  `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true`.
- If a review does not appear, first verify Cursor org/project settings and the
  GitHub App's access to `fjg-thr/hobgoblin-dungeon`.

## Project context

This repo is a first-playable web prototype for a dark GBA-inspired isometric
dungeon game:

- Next.js app shell in `src/app`.
- React client game mount in `src/game/GameCanvas.tsx`.
- Phaser scene and gameplay systems in `src/game/scenes/DungeonScene.ts`.
- Dungeon map generation and tile metadata in `src/game/maps/startingDungeon.ts`.
- Runtime asset manifest in `src/game/assets/manifest.ts`.
- Generated and processed art/audio assets under `public/assets`.
- Asset generator/processor tooling under `tools/` and `scripts/`.

There is no Tailwind or shadcn/ui setup in this repo. UI changes should follow
the existing semantic HTML and `src/app/globals.css` patterns unless a PR
explicitly introduces a styling system.

## Review priorities

Prioritize findings that can break gameplay, builds, or shipped repository
contracts:

1. **Gameplay correctness**
   - Check movement, aiming, firing, enemy spawning, pickups, score/life state,
     invulnerability, and game-over/restart flows.
   - Watch for timing changes that unintentionally alter difficulty ramps,
     power-up unlocks, ammo economy, or enemy pressure.
   - Verify input changes against actual runtime bindings, not README text alone.

2. **Phaser lifecycle and cleanup**
   - Ensure scenes, timers, tweens, input handlers, audio objects, and DOM event
     listeners are cleaned up on scene shutdown and React unmount.
   - Avoid leaking Phaser objects through long-lived closures or global state.
   - Preserve deterministic scene initialization where practical.

3. **Assets and manifests**
   - Runtime loads should use `src/game/assets/manifest.ts` as the source of
     truth. `public/assets/audio/audio-manifest.json` is auxiliary unless a PR
     intentionally changes audio manifest handling.
   - Any new sprite sheet or audio file should be referenced by the right
     manifest entry and include matching JSON metadata when required.
   - Do not commit generated intermediate files unless the PR scope calls for
     them.

4. **TypeScript and Next.js build health**
   - Prefer type-safe data shapes for map, asset, enemy, and pickup changes.
   - Watch for client/server boundary mistakes in `src/app` and React components.
   - `next-env.d.ts` may be rewritten by Next build/typegen commands; do not
     treat that generated churn as an intentional code change unless the PR is
     about Next typing setup.

5. **Accessibility and user-facing controls**
   - HTML controls such as the sound toggle should remain keyboard reachable,
     labeled, and understandable to screen readers.
   - Gameplay canvas interactions should not remove documented keyboard paths.

6. **Repository hygiene**
   - Keep dependency and lockfile changes out of gameplay-only or guidance-only
     PRs.
   - Avoid unrelated formatting, generated artifact churn, or broad refactors.
   - If a PR touches asset tooling, review both generated outputs and the command
     path that creates them.

## Known baseline mismatches

These are existing project facts. Do not block unrelated PRs solely for these
baseline mismatches, but call them out when a PR touches the affected area.

- `README.md` says `Space` or `J` fires. Current runtime shooting is bound to
  `Space` and pointer/click firing.
- Seeker ammo exists in code after kill/time progression, but README gameplay
  docs do not describe it.
- README describes blast as a rare late-game power-up. Current code unlocks
  blast earlier than that description implies.

## Suggested verification

For most code changes, recommend:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

Notes:

- `npm run lint` maps to `next lint`, which is not reliable with the current
  Next.js version in this repo.
- After build/typecheck, clean up generated artifacts such as
  `tsconfig.tsbuildinfo` and restore `next-env.d.ts` if it was rewritten without
  intent.
- The package intentionally has no `npm start` script. Use `npm run dev` for a
  manual browser smoke test when runtime behavior changes.

## Managed-service boundary

Repository files can provide review context only. A successful deployment of the
managed Cursor Bugbot service must be verified outside this file by confirming:

1. Cursor dashboard/org settings have Bugbot enabled for this repo.
2. The Cursor GitHub App can access `fjg-thr/hobgoblin-dungeon`.
3. A PR smoke check receives an automatic review or responds to a manual
   `cursor review` / `bugbot run` comment.
