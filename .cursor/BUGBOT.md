# Cursor Bugbot review guide

Use this file as the repository-side context for Cursor Bugbot reviews after it is
merged to the default branch. The managed Bugbot service still has to be enabled
outside this repo: confirm Cursor dashboard/org settings, GitHub App repository
access, any Admin API credentials or service configuration, and a live PR smoke
review. Repo files alone cannot prove that hosted Bugbot is active.

Manual review triggers, when the service is installed, are top-level PR comments:
`cursor review` or `bugbot run`. For diagnostics use `cursor review verbose=true`
or `bugbot run verbose=true` to request extra request IDs/log detail.

## Project shape

- Next.js app with React/TypeScript entry points in `src/app` and `src/game`.
- Phaser gameplay is concentrated in `src/game/scenes/DungeonScene.ts`.
- Runtime asset loading starts from `src/game/assets/manifest.ts`; the
  `assetManifest.audio` entries are the source of truth for scene audio.
- `public/assets/audio/audio-manifest.json` is auxiliary consistency metadata.
- Asset and audio tooling lives under `tools/` and `scripts/`, including
  `tools/generate_audio_sfx.mjs` and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

1. Runtime regressions that break boot, asset preload, player input, combat,
   camera/scale behavior, audio toggling, or game-over/restart flow.
2. TypeScript/React/Next integration issues in `GameCanvas`, `src/app/page.tsx`,
   `src/app/layout.tsx`, and generated Next typing behavior.
3. Phaser lifecycle leaks: duplicated listeners, timers, tweens, scene events,
   or DOM/canvas interaction zones that are not cleaned up.
4. Asset manifest drift: new files must be referenced by the runtime manifest,
   use stable public paths, and keep generated JSON frame names in sync.
5. Documentation drift only when a PR touches the related behavior or docs.

Prefer concrete file/line findings with reproduction notes. Do not block a PR for
existing baseline issues unless the PR makes them worse or claims to fix them.

## Gameplay and UI context

- Movement is WASD or arrow keys; aim follows pointer movement; pointer/click
  firing should keep working.
- Current runtime shooting is Space and pointer/click focused. The README also
  mentions `J`; treat that as an existing controls-doc mismatch unless the PR
  changes input handling or controls documentation.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. Code also contains seeker ammo/progression behavior; do not flag that
  as new drift unless the PR changes ammo/progression/docs.
- README describes blast as late rare behavior, while current code gates powerups
  through `POWERUP_CONFIG`; treat any existing mismatch as baseline.
- This repo does not currently configure Tailwind or shadcn/ui. For DOM UI,
  follow semantic HTML and existing `src/app/globals.css` patterns. For Phaser
  overlays, review pointer zones, keyboard/mouse affordances, responsive
  placement, and canvas-specific accessibility limitations.

## Verification guidance

For most code PRs, ask for or run:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

`next lint` is not a reliable gate for the current Next baseline. If Next build
or typegen rewrites `next-env.d.ts`, that generated churn should usually be
restored unless the PR intentionally changes generated typing behavior. Keep
`tsconfig.tsbuildinfo` untracked.

The current dependency baseline may report npm audit advisories from upstream
packages. Note them, but do not block unrelated PRs solely on pre-existing audit
findings unless the PR changes dependencies or security posture.

## Known baseline caveats

- `src/app/layout.tsx` references `/opengraph-image.png`; if the public/app
  OpenGraph asset is absent on the branch under review, only block PRs that touch
  metadata/share-image behavior or worsen that state.
- Generated visual/audio assets can be large and are usually reviewed by checking
  manifest consistency, stable paths, dimensions/frame metadata, and whether the
  generator/processor command is documented.
- Gameplay balance changes should be reviewed against both code-defined
  thresholds and README/Known Limitations wording, with existing mismatches
  called out as baseline rather than newly introduced bugs.
