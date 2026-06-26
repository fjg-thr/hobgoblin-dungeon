# Cursor Bugbot review guide

This file gives Cursor Bugbot repository-specific context for reviewing PRs in
`fjg-thr/hobgoblin-dungeon`. It does not enable the managed Bugbot service by
itself. Verify managed deployment outside the repo by checking Cursor
dashboard/org settings, Cursor GitHub App repository access, optional Admin API
team configuration, and a live PR smoke review after this file is merged to the
default branch.

Manual PR review triggers that maintainers may use from a top-level PR comment:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for diagnostic
  request IDs/log details

Rules in this file apply after they land on the default branch. A PR that adds
or edits this file might be reviewed with the previous default-branch guidance.

## Project shape

- Next.js App Router hosts a client-only Phaser game canvas.
- `src/app/page.tsx` renders `GameCanvas`; `src/app/layout.tsx` owns metadata.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and must stay
  client-only. Watch for SSR/window access regressions and ensure Phaser games
  are destroyed during React cleanup.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, UI overlays, input,
  spawning, audio, combat, powerups, and game-state transitions. It is large, so
  prefer focused findings with exact behavioral paths.
- `src/game/maps/startingDungeon.ts` generates dungeon rooms, corridors,
  collision tiles, props, stairs, and enemy starts.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets loaded
  by `DungeonScene`. `public/assets/audio/audio-manifest.json` is auxiliary.

## Review priorities

1. Build/runtime correctness: flag changes that break `npm run build`, TypeScript
   type safety, dynamic Phaser import, canvas sizing, asset paths, or missing
   public assets referenced by code.
2. Gameplay regressions: check movement, pointer aim, `SPACE` firing, click
   firing, ammo/seeker ammo, enemy damage, powerup durations, pickups, death and
   restart flow, mute state, and debug overlay interactions.
3. Phaser lifecycle and UX: verify interactive zones use correct depth, hit
   areas, pointer cursors, keyboard handling, camera/responsive placement, and
   cleanup of timers, tweens, listeners, sounds, sprites, and pooled objects.
4. Dungeon and collision behavior: review changes to tile codes, blocked tiles,
   prop collision boxes, spawn safety distance, pathing, bridge/chasm handling,
   and depth ordering.
5. Assets and generated files: keep sprite/audio manifests in sync with actual
   public files. Avoid unnecessary binary churn. When generator scripts under
   `tools/` or `scripts/` change, confirm their outputs and documentation still
   match the intended workflow.
6. Web metadata and DOM UI: use semantic HTML and existing `src/app/globals.css`
   patterns for DOM changes. This repo does not currently use Tailwind or shadcn.

## Known baseline caveats

- README says `Space` or `J` fires, but current runtime code binds shooting to
  `SPACE` and pointer/click firing only. Do not block unrelated PRs solely for
  this existing docs drift; do flag PRs that touch controls and leave docs/code
  more inconsistent.
- Seeker ammo/projectiles exist in code and unlock by kill/time thresholds, but
  README does not document them. Treat this as baseline drift unless a PR changes
  ammo, seeker behavior, or gameplay docs.
- README describes blast as rare late-game, while current `POWERUP_CONFIG` can
  unlock it earlier. Scope findings to PRs touching powerups or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; the current baseline
  may not include that file. Block only changes that make metadata/share-image
  behavior worse or claim to fix it without adding the asset.
- `next lint` is not reliable with the current Next version. Prefer build and
  typecheck evidence for review confidence.
- `next build` or `next dev` may rewrite `next-env.d.ts` between `.next/types`
  and `.next/dev/types`. Treat unintentional generated churn as cleanup needed.
- `npm ci` currently reports baseline audit advisories from dependencies. Do not
  fail unrelated PRs solely for unchanged audit output.

## Suggested verification

For code or asset manifest changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For documentation-only changes, at minimum run `git diff --check` on the changed
range and any focused checks that match the touched files. If generated assets,
audio, or metadata paths change, verify referenced files exist under `public/`
and that `assetManifest` paths match runtime loads.

## Review style

- Lead with concrete bugs, regressions, missing verification, or user-visible
  risks. Avoid broad style suggestions unless they hide a real defect.
- Include exact file/line references and a short reproduction or failure path.
- Respect existing architecture unless a change increases risk in the touched
  subsystem. Keep recommendations small enough for the PR under review.
