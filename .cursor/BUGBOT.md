# Cursor Bugbot review guide

This file gives Cursor Bugbot repo-specific context. It does not enable the
hosted service by itself; confirm Bugbot through Cursor org/repo settings,
GitHub App repository access, and a live PR smoke review when available. These
instructions apply after this file is merged to the default branch, so a PR that
adds or edits this file may not be reviewed with the new rules.

## Manual triggers

On a pull request, a top-level comment can request a hosted review with either:

```text
cursor review
bugbot run
```

For diagnostics, use `cursor review verbose=true` or
`bugbot run verbose=true` to surface request IDs and extra log detail.

## Project shape

- Next.js app router with React and TypeScript under `src/app`.
- Phaser 4 gameplay lives mainly in `src/game/scenes/DungeonScene.ts`.
- The dungeon map helpers are under `src/game/maps`.
- Runtime assets are loaded from `src/game/assets/manifest.ts`
  (`assetManifest`), then served from `public/assets`.
- `public/assets/audio/audio-manifest.json` is auxiliary; runtime audio loading
  uses `assetManifest.audio`.
- Asset tooling is split between `tools/*.mjs`, Python processors, and
  `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

1. Gameplay regressions: movement in isometric space, collision/proximity
   checks, enemy spawning, projectile lifetime/hit detection, pickup gating,
   score/ammo/heart state, scene restart, mute state, and camera/debug overlay.
2. React/Next integration: client-only Phaser imports, metadata correctness,
   environment URL handling, generated Next type files, and avoiding server-side
   access to browser globals.
3. Asset integrity: when paths, sprite dimensions, frame counts, or animation
   row indexes change, verify the matching public files and manifest metadata.
   Do not accept source-only asset additions that the runtime never loads.
4. Audio integrity: keep new sound files wired through `assetManifest.audio` and
   ensure mute/scene lifecycle cleanup still stops loops and one-shot effects.
5. UI/UX: DOM UI should use semantic elements and existing
   `src/app/globals.css` patterns. Phaser canvas UI should preserve keyboard
   and pointer affordances, responsive placement, readable overlays, and visible
   feedback because DOM accessibility APIs do not cover most in-canvas controls.
6. Dependency/tooling changes: keep them scoped. Do not require unrelated PRs to
   solve existing audit warnings unless they modify dependencies or build tools.

## Expected verification

Prefer these checks for code changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is not reliable for this Next 16 baseline because the script still
uses the removed `next lint` command. Build/typecheck may rewrite
`next-env.d.ts` between `.next/dev/types/routes.d.ts` and
`.next/types/routes.d.ts`, and may create `tsconfig.tsbuildinfo`; do not include
those generated changes unless the PR intentionally changes Next type behavior.

For asset pipeline changes, run the specific touched processor/generator, such
as `python3 tools/process_assets.py`,
`node tools/process_actor_death_assets.mjs`,
`node tools/process_combat_juice_assets.mjs`,
`node tools/generate_audio_sfx.mjs`, or
`node scripts/generate-retro-soundtrack.mjs`.

## Known baseline caveats

- README says `Space` or `J` fires, but runtime keyboard shooting currently uses
  `SPACE`; click/pointer firing also works. Only block this on input/doc PRs or
  changes that worsen the mismatch.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast, but seeker ammo exists in code and unlocks after 4 kills or 30 seconds.
- README describes blast as rare late-game; current code unlocks blast after 2
  kills or 16 seconds.
- `src/app/layout.tsx` references `/opengraph-image.png`; if the file is absent
  on the reviewed baseline, treat it as existing debt unless the PR touches
  metadata/share-image behavior.
- `npm ci` may report existing moderate/high audit advisories from current
  dependencies. Flag PRs that introduce or worsen dependency risk, not unrelated
  feature PRs.

## Review style

Prioritize concrete bugs, regressions, missing verification, and user-visible
breakage. Cite file and line references. Keep findings scoped to the PR diff and
call out baseline issues separately when they are useful context.
