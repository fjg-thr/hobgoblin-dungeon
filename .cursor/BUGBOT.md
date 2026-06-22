# Cursor Bugbot review guide

Use this guide when reviewing changes in the Hobgoblin Ruin prototype. It gives
Bugbot repository context; managed Bugbot enablement still depends on Cursor
dashboard/org settings, GitHub App repository access, and a live PR review smoke
check. These rules apply after this file is merged to the default branch.

## Project context

- Next.js/React/TypeScript app with a Phaser dungeon scene in
  `src/game/scenes/DungeonScene.ts`.
- Runtime asset loading is driven by `src/game/assets/manifest.ts`; keep it in
  sync with files under `public/assets`.
- Styling is plain CSS in `src/app/globals.css`; Tailwind is not configured.
- Procedural/generator tooling lives in `tools/` and `scripts/`, including
  `tools/generate_audio_sfx.mjs` and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

1. **Block runtime regressions.** Flag Phaser lifecycle leaks, duplicate scene
   creation, unguarded browser-only APIs during SSR, broken asset paths, missing
   animation frames, and changes that can make `next build` fail.
2. **Protect gameplay invariants.** Movement should remain isometric with camera
   follow, dungeon collision must keep walls/props solid, combat should preserve
   finite ammo, enemy pressure, health/ward damage rules, pickups, scoring, and
   game-over restart behavior.
3. **Review input and accessibility carefully.** Current runtime firing is
   `Space` plus pointer/click; README also mentions `J`, which is an existing
   docs/runtime mismatch. For DOM UI changes, require semantic controls and
   keyboard affordances. For Phaser canvas UI, check pointer zones, readable HUD
   placement, responsive scaling, and obvious keyboard/mouse interactions.
4. **Keep assets deterministic.** New PNG/JSON/WAV assets should be referenced
   by the manifest or README when runtime-visible. Generated source assets should
   not replace processed Phaser-ready sheets unless the loader paths also change.
5. **Separate baseline issues from new regressions.** Do not block unrelated PRs
   solely because `layout.tsx` references `/opengraph-image.png`, README omits
   seeker ammo, README calls blast late-game while code unlocks it earlier, or
   dependency audit warnings already exist.

## Verification to request or run

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- `git diff --check`

`next lint` is not reliable for this Next.js baseline, even though the package
script exists. Prefer build and TypeScript checks. If verification rewrites
`next-env.d.ts` or creates `tsconfig.tsbuildinfo`, treat that as generated local
churn unless the PR intentionally changes Next type generation.

## Manual Bugbot smoke checks

On a PR, a top-level comment can request review with:

- `cursor review`
- `bugbot run`

For diagnostics, use `cursor review verbose=true` or
`bugbot run verbose=true`; expect extra request IDs/log detail, not a deeper
code review. If those comments do not trigger a review, verify Cursor Bugbot
product settings and GitHub App repository access outside this repository.

## Review style

- Lead with actionable findings tied to file/line references.
- Prefer narrow fixes that follow existing React, TypeScript, Phaser, and asset
  manifest patterns.
- Avoid asking for broad rewrites unless a change crosses ownership boundaries
  or creates a clear runtime risk.
