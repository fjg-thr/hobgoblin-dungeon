# Cursor Bugbot review guide

Use this file as repository-specific context for Cursor Bugbot reviews. It does
not enable the hosted service by itself; activation still depends on Cursor
dashboard/org settings, Cursor GitHub App repository access, and any team/Admin
API configuration. After this file is merged to the default branch, smoke-check
Bugbot on a live PR when service access is available.

## Manual review triggers

- On a pull request, request a review with a top-level comment: `cursor review`
  or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` and capture the returned request/log details.
- New rules in this file apply after they exist on the default branch. A PR that
  adds or edits this file may not be reviewed with its own updated rules.

## Project context

- Next.js/React/TypeScript app that mounts a Phaser 4 dungeon prototype through
  `src/game/GameCanvas.tsx`.
- Most gameplay logic, input, UI overlays, audio, powerups, enemy behavior, and
  Phaser asset loading live in `src/game/scenes/DungeonScene.ts`.
- Runtime asset paths are sourced from `src/game/assets/manifest.ts`; keep it in
  sync with files under `public/assets`.
- Map generation data lives in `src/game/maps/startingDungeon.ts`.
- DOM styling uses existing `src/app/globals.css`; this repo does not currently
  configure Tailwind or Shadcn.

## Review priorities

1. Block runtime failures in the Phaser scene: missing assets, bad frame ranges,
   uncaught async boot errors, stale event listeners, incorrect destroy/cleanup,
   broken scene restart flow, or state that survives a new run unexpectedly.
2. Treat `DungeonScene.ts` as the highest-risk file. Check movement, collision,
   enemy spawning, ammo, seeker shots, blast charges, health, scoring, pause-like
   overlays, game-over/restart behavior, and audio mute behavior together rather
   than in isolation.
3. For React/Next changes, verify client/server boundaries. `GameCanvas` must
   remain client-only, Phaser imports should stay browser-safe, metadata should
   not depend on browser globals, and generated Next type files should not be
   hand-edited.
4. For asset changes, verify every manifest path, JSON frame dimension, animation
   range, and loader key. `public/assets/audio/audio-manifest.json` is auxiliary;
   runtime audio loading uses `assetManifest.audio`.
5. For UI/UX changes inside Phaser, review pointer hit zones, keyboard and mouse
   affordances, resize behavior, camera/HUD placement, and whether interactive
   regions remain usable on small screens.
6. For DOM UI or metadata changes, prefer semantic markup and the existing CSS
   patterns. Do not require Tailwind/Shadcn unless the repo adds that tooling.
7. For generated media/tooling changes, check the relevant scripts:
   `tools/process_assets.py`, `tools/process_*`, `tools/generate_*`,
   `tools/generate_audio_sfx.mjs`, and
   `scripts/generate-retro-soundtrack.mjs`.

## Known baseline caveats

- README says `Space` or `J` fires, but current runtime input binds shooting to
  `SPACE` plus pointer/click. Only block this on PRs that touch controls or docs
  and make the mismatch worse.
- README documents regular ammo and several powerups, but seeker ammo is
  code-defined progression behavior. Review seeker changes against code, not only
  README prose.
- README describes blast as rare late-game, while current `POWERUP_CONFIG`
  unlocks blast earlier. Treat this as an existing docs/code mismatch unless the
  PR intentionally addresses it.
- `src/app/layout.tsx` references `/opengraph-image.png`; the baseline may not
  include that file. Block only PRs that touch metadata/share-image behavior and
  fail to resolve or preserve the intended behavior.
- `package-lock.json` and `pnpm-lock.yaml` both exist. Do not request lockfile
  churn unrelated to the package manager used by a PR.
- `npm ci` can report existing audit advisories from the baseline. Mention them,
  but do not block unrelated PRs solely for pre-existing advisories.
- `next lint` is unreliable with the current Next baseline. Prefer build and
  TypeScript verification unless a PR explicitly restores lint support.

## Recommended verification

For most code changes, ask authors to run:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For asset or generator changes, also run the touched generator/processor command
and inspect the changed manifest/PNG/WAV/JSON outputs. If verification rewrites
`next-env.d.ts` or creates `tsconfig.tsbuildinfo`, make sure only intentional
generated changes remain in the diff.

## Review style

- Lead with concrete, blocking issues that can break users or CI.
- Cite exact files and lines whenever possible.
- Keep comments scoped to the PR diff and this repo's current architecture.
- Do not block a PR only for known baseline issues unless the PR worsens them.
