# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for Hobgoblin Ruin. This file does not enable or disable the hosted
Bugbot service by itself; confirm managed-service setup separately in Cursor
dashboard/org settings and GitHub App repository access. A live PR smoke review
is the final proof that hosted Bugbot is active for this repo.

## Manual review triggers

- In a pull request, a top-level comment containing `cursor review` or
  `bugbot run` should request a review when the managed service is enabled.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true`.
- If a review does not start, first check Cursor dashboard settings, GitHub App
  installation access for `fjg-thr/hobgoblin-dungeon`, branch/PR permissions,
  and whether the comment was top-level rather than an inline review comment.

## Project map

- App stack: Next.js App Router, React, TypeScript, and Phaser 4 RC.
- `src/app/page.tsx` renders the game shell.
- `src/app/layout.tsx` defines metadata and references
  `/opengraph-image.png`; review metadata asset changes against actual files.
- `src/game/GameCanvas.tsx` is the client-only React to Phaser bridge. It
  dynamically imports Phaser and `DungeonScene`, uses WEBGL with resize scaling,
  and destroys the Phaser game on unmount. React strict mode is enabled.
- `src/game/scenes/DungeonScene.ts` contains most gameplay: preload, create,
  update loop, combat, pickups, powerups, HUD, audio, menus, restart, and
  resize handling.
- `src/game/maps/startingDungeon.ts` owns procedural map generation, isometric
  tile constants, tile codes, and collision helpers.
- `src/game/assets/manifest.ts` is the runtime asset source of truth for Phaser
  paths, keys, frame sizes, and audio paths.
- `public/assets/audio/audio-manifest.json` is auxiliary and consistency-only;
  runtime loading is driven by `assetManifest.audio`.

## Review priorities

### Client/server and lifecycle safety

- Keep Phaser and browser-only APIs out of server components. `DungeonScene`
  should remain loaded through the client-only `GameCanvas` path.
- Check that changes to `GameCanvas` still avoid double initialization under
  React strict mode and still call `destroy(true)` on unmount.
- For scene changes, verify teardown paths: restart, game over, resize, scene
  destroy, tweens, timers, input handlers, sounds, masks, and pooled sprites.
- Watch for orphaned Phaser objects in arrays such as projectiles, enemies,
  powerups, heart pickups, ammo pickups, combat effects, afterimages, and
  dungeon render objects.

### Gameplay correctness

- `DungeonScene.ts` is monolithic and stateful. Small edits can affect spawn
  pacing, combat balance, HUD state, audio, restart behavior, and input.
- Movement/collision is custom tile/proximity logic, not a Phaser physics
  system. Review `isTileBlocked`, prop blockers, radius constants, and tile to
  world conversions when movement, map, or prop code changes.
- Projectile changes should preserve ammo accounting, seeker ammo behavior,
  snapped aiming, cooldowns, collision checks, target acquisition, and blast
  interactions.
- Powerup changes should review unlock gates, pickup radius, active duration,
  UI text, audio feedback, and reset behavior in `restartGame`.
- Enemy changes should check path recalculation, safe spawn distance, brute
  unlock gates, respawn timing, contact damage, invulnerability, score, and
  kill-driven drops.
- Known current README/code mismatches should not block unrelated PRs: README
  mentions `Space` or `J` firing, while current runtime firing is through
  `Space` and pointer/click; README omits seeker ammo though code supports it;
  README describes blast as rare late-game while current constants unlock it
  after 2 kills or 16 seconds.

### Assets and audio

- Runtime asset paths live in `src/game/assets/manifest.ts` and must match
  actual files under `public/assets/**`.
- If a PR adds or changes sprite sheets, verify matching `frameWidth`,
  `frameHeight`, row/order assumptions, animation creation, and `preload()`
  entries.
- `metadataPath` JSON files are useful for tooling and consistency checks, but
  Phaser runtime sprite loading mostly relies on the path and frame dimensions.
- Asset generators/processors live under both `tools/` and `scripts/`. Review
  output paths and generated filenames against `manifest.ts` and README.
- Do not assume binary assets are present just because JSON metadata exists.
  Check for the PNG/WAV files referenced by changed manifest entries.
- Audio changes should verify `assetManifest.audio`, mute state persistence,
  loop setup, and cleanup. The scene stores mute state in localStorage under
  `hobgoblin-dungeon-muted`.

### TypeScript, dependencies, and project hygiene

- TypeScript is strict, with `@/*` mapped to `./src/*`.
- `package.json` has no automated test script. Prefer focused type/build
  verification plus manual gameplay smoke notes for behavior changes.
- `next lint` is not a reliable signal in this Next 16 setup even though a
  script exists; prefer `npm run build` and `npx tsc --noEmit`.
- The repo currently has both `package-lock.json` and `pnpm-lock.yaml`. Do not
  introduce lockfile churn unless dependency work intentionally requires it.
- `next`, `react`, `react-dom`, `typescript`, and type packages are listed as
  `latest`; dependency PRs need extra scrutiny and a clean build.
- Generated artifacts such as `.next/`, `next-env.d.ts` rewrites, and
  `tsconfig.tsbuildinfo` should not be committed unless the PR explicitly
  changes generated typing behavior.

## Suggested verification by change type

- Repository/config-only Bugbot guidance changes:
  `git diff --check $(git merge-base HEAD origin/main)..HEAD`,
  `test -s .cursor/BUGBOT.md`, `npm run build`, `npx tsc --noEmit`.
- Source or gameplay changes: run `npm run build` and `npx tsc --noEmit`, then
  include a manual smoke summary covering start screen, movement, firing,
  pickups/powerups, damage/game over, restart, sound toggle, and resize.
- Asset manifest or generated asset changes: verify referenced files exist,
  run the relevant `npm run process:*` or `npm run generate:*` command when
  applicable, then run build/typecheck.
- Metadata/share changes: verify referenced public assets exist and that
  `metadataBase` behavior remains correct for localhost, Vercel, and
  `NEXT_PUBLIC_SITE_URL`.

## Review output expectations

- Lead with actionable bugs, regressions, security risks, lifecycle leaks, or
  missing verification. Include file and line references.
- Distinguish existing known limitations from regressions introduced by the PR.
- For gameplay tuning, explain the player-visible impact rather than only
  citing constant changes.
- If hosted Bugbot enablement cannot be verified from repository files, say so
  explicitly and list the external checks needed.
