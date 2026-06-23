# Cursor Bugbot review guidance

This file gives Cursor Bugbot repository-specific context for reviewing code in
Hobgoblin Ruin. It does not install or enable the hosted Bugbot service by
itself. Confirm enablement in Cursor dashboard/org settings, confirm the Cursor
GitHub App has access to this repository, then smoke-test with a real PR comment
such as `cursor review` or `bugbot run`. Use `cursor review verbose=true` or
`bugbot run verbose=true` only when request IDs or extra diagnostic logs are
needed.

These rules apply after this file is merged to the default branch. A PR that
adds or edits this file may not be reviewed with the updated rules yet.

## Project shape

- Next.js/React/TypeScript app that mounts a Phaser 4 dungeon prototype.
- The main DOM entrypoints are `src/app/layout.tsx`, `src/app/page.tsx`, and
  `src/game/GameCanvas.tsx`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Runtime asset and audio loading should flow through the exported
  `assetManifest` in `src/game/assets/manifest.ts`.
  `public/assets/audio/audio-manifest.json` is auxiliary and should not be
  treated as the scene loading source of truth.
- Asset tooling is split across `tools/` and `scripts/`, including
  `tools/generate_audio_sfx.mjs` and
  `scripts/generate-retro-soundtrack.mjs`.

## What to prioritize in reviews

1. Gameplay regressions in `DungeonScene.ts`: movement, collision, aiming,
   projectile lifetime, enemy spawning, damage, pickups, scoring, game-over
   cleanup, and restart/reset paths.
2. Phaser lifecycle safety in `GameCanvas.tsx`: client-only boot, dynamic
   imports, single game instance per host, resize behavior, and destroy cleanup.
3. Asset manifest consistency: new sprites/audio should have matching public
   files, dimensions, metadata, preload calls, animation frames, and runtime
   references.
4. Input and UX behavior: keyboard, pointer zones, click/tap affordances, mute
   controls, focus/accessibility for DOM UI, and responsive canvas placement.
5. Metadata/share changes in `src/app/layout.tsx`, especially URL handling and
   OpenGraph image availability.
6. Generated or processed assets: verify source images, manifests, and
   generator scripts are updated together when a PR changes generated outputs.

## Known baseline mismatches

Do not block unrelated PRs solely for these existing issues, but call them out
when a PR touches the relevant area or makes them worse.

- README says `Space` or `J` fires; current runtime binds keyboard shooting to
  `SPACE` plus pointer/click firing.
- README omits seeker ammo, while current gameplay unlocks seeker pickups and
  seeker projectiles after progression thresholds.
- README describes blast as a rare late-game power-up, while current code
  unlocks blast earlier via `POWERUP_CONFIG`.
- `src/app/layout.tsx` references `/opengraph-image.png`; if the asset is still
  absent, only block PRs that touch metadata/share image behavior or worsen it.
- `next lint` is not a reliable verification command for this Next version in
  this repo.
- `npm ci` may report baseline audit advisories; do not block unrelated PRs
  solely on pre-existing advisories unless dependency changes alter the risk.

## Suggested verification

For code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For asset or audio changes, add targeted checks such as:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

Use only the commands relevant to the files changed. If verification dirties
generated Next files such as `next-env.d.ts` or `tsconfig.tsbuildinfo`, mention
the churn and restore or ignore it unless the PR intentionally changes generated
type behavior.

## Review style

- Lead with concrete bugs, regressions, security/privacy concerns, and missing
  verification. Keep style-only feedback brief.
- Ground findings in exact files and lines, and explain the user-visible impact.
- Prefer small, actionable fixes that match existing patterns.
- Avoid asking for broad refactors unless the changed code creates a real
  maintenance or correctness risk.
