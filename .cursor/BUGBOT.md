# Cursor Bugbot review guide

Use this file as repository-specific context for Cursor Bugbot code reviews on
`fjg-thr/hobgoblin-dungeon`.

## Deployment scope

- This repo file only gives Bugbot review guidance. Enabling the hosted Bugbot
  service still requires Cursor dashboard/org settings, Cursor GitHub App access
  to this repository, and a live PR smoke review after the guide reaches the
  default branch.
- New or changed rules apply after this file is merged to the default branch;
  do not assume the PR that edits `BUGBOT.md` was reviewed with those new rules.
- Manual review triggers supported by Cursor docs include top-level PR comments
  `cursor review` or `bugbot run`. For troubleshooting, use
  `cursor review verbose=true` or `bugbot run verbose=true`.

## Project map

- Next.js app entry points live in `src/app/`. `src/app/page.tsx` imports the
  client component `src/game/GameCanvas.tsx`.
- `GameCanvas` dynamically imports `phaser` and `src/game/scenes/DungeonScene`
  inside `useEffect`, creates one Phaser game, and destroys it during cleanup.
- Core gameplay is in `src/game/scenes/DungeonScene.ts`; map data/helpers are
  in `src/game/maps/startingDungeon.ts`.
- `src/game/assets/manifest.ts` is the runtime asset/audio source of truth that
  `DungeonScene` loads. `public/assets/audio/audio-manifest.json` is auxiliary
  consistency data, not the loader contract.
- Asset generators/processors live under both `tools/` and `scripts/`; generated
  asset churn should be intentional and tied to source prompts or processors.

## Review priorities

1. **Client/server boundary**: Phaser must stay client-only. Flag imports or
   side effects that make server components, route metadata, or build-time code
   import Phaser/browser globals.
2. **Lifecycle cleanup**: Changes adding listeners, timers, tweens, animations,
   sprites, sounds, or scene state should clean them up on scene shutdown,
   restart, game over, and React unmount. Watch for duplicated handlers after
   replaying from the start/game-over screens.
3. **Gameplay invariants**: Preserve finite ammo, seeker ammo, heart pickups,
   ward damage blocking, blast-shot behavior, enemy spawn pressure, collision,
   depth sorting, and game-over/restart state resets unless a PR explicitly
   changes those mechanics.
4. **Assets and manifests**: For Phaser atlases/sprite sheets, JSON metadata,
   frame sizes, animation frame ranges, and PNG files must agree with
   `assetManifest` and loader code. Do not require every standalone PNG to have
   JSON metadata.
5. **UI and accessibility**: The repo uses semantic HTML plus `src/app/globals.css`
   rather than Tailwind. Review start/game-over/mute controls for keyboard and
   pointer usability, labels, contrast, and fullscreen/responsive behavior.
6. **Generated output**: Lockfiles, generated images/audio, and processed assets
   should change only when the PR purpose requires it. Check that generator
   scripts remain reproducible and paths stay relative to the repo/public tree.

## Existing context to avoid false positives

- README currently says `Space` or `J` fires, but runtime keyboard binding uses
  `Space`; click also fires. Treat this as an existing docs/runtime mismatch
  unless a PR touches controls or control docs.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  not seeker ammo. Code unlocks seeker ammo after kill/time thresholds; do not
  call seeker behavior dead code.
- README calls blast a rare late-game power-up. Current code unlocks blast after
  2 kills or 16 seconds; flag only PRs that worsen or intentionally address this
  mismatch.
- `src/app/layout.tsx` references `/opengraph-image.png`; there is no matching
  tracked `public/opengraph-image.*` file. Raise this when metadata or public
  asset inventory changes, not on unrelated gameplay PRs.
- `next lint` is not reliable with the current Next version. Prefer build and
  TypeScript checks listed below.

## Suggested verification

Use the smallest check set that matches the PR risk. For broad changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Also run `git diff --check` against the PR base. After build/type checks, remove
or restore generated local artifacts such as `tsconfig.tsbuildinfo` or
`next-env.d.ts` rewrites unless the PR intentionally changes them. This package
does not define `npm start`, so do not require it for runtime smoke checks.

## Review output expectations

- Lead with concrete findings backed by file and line references.
- Distinguish blocking regressions from pre-existing repository issues.
- Prefer targeted fixes aligned with the current Phaser/Next structure over
  broad rewrites or dependency churn.
