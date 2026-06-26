# Cursor Bugbot review guide

Repository-specific context for Cursor Bugbot reviews of Hobgoblin Ruin
Prototype PRs. Managed Bugbot enablement lives outside this repository:
confirm Cursor dashboard/org settings, GitHub App repository access, optional
Admin API/team credentials, and a live PR smoke review when available. This
file cannot prove service enablement by itself.

After this file reaches the default branch, top-level PR comments
`cursor review` or `bugbot run` request reviews. Verbose variants
`cursor review verbose=true` or `bugbot run verbose=true` surface request IDs
and log detail.

## Project shape

- Next.js App Router hosts a client-only Phaser game.
- `src/app/page.tsx` renders `src/game/GameCanvas.tsx`; keep Phaser imports
  inside client/runtime boundaries so SSR builds remain safe.
- `src/game/scenes/DungeonScene.ts` is the main gameplay surface. Review scene
  lifecycle, input registration, timers/tweens, camera/depth ordering, and
  cleanup carefully.
- Runtime asset loading is driven by `src/game/assets/manifest.ts`.
  `public/assets/audio/audio-manifest.json` is auxiliary consistency data, not
  the runtime source of truth.
- Dungeon layout and collision assumptions are centered in
  `src/game/maps/startingDungeon.ts` plus collision helpers in the scene.

## Review priorities

Block or flag changes that introduce:

- Build, type, or runtime failures in the Next/React/TypeScript/Phaser stack.
- Phaser lifecycle leaks: duplicate games, unremoved listeners, orphaned
  timers/tweens, or scene objects reused after destruction.
- Gameplay regressions in movement, camera follow, aiming, shooting, ammo,
  enemy spawning, damage, score, pickups, power-ups, game-over/restart, debug
  overlays, or mute/audio state.
- Collision/map regressions where walls, chasms, bridges, stairs, props,
  player bounds, projectile paths, or enemy navigation disagree.
- Asset manifest drift: runtime assets added, renamed, or deleted without
  matching manifest entries, metadata JSON, dimensions, animation rows, or
  preload/use sites.
- UI/metadata regressions in App Router files. This repo does not configure
  Tailwind; for DOM UI follow semantic markup and existing
  `src/app/globals.css` patterns. For Phaser UI, review pointer zones,
  keyboard/mouse affordances, responsive placement, and canvas-specific UX.

## Known baselines and review caveats

- `README.md` says `Space` or `J` fires, but current runtime input binds
  shooting to `Space` plus pointer/click firing. Do not block unrelated PRs
  solely for the existing `J` docs mismatch; do flag input/control-doc changes
  that make the drift worse.
- README omits seeker ammo. Current code unlocks it after progression
  thresholds and uses seeker pickups/projectiles; review seeker behavior as
  code-defined unless a docs PR changes it.
- README describes blast as a rare late-game power-up, while
  `POWERUP_CONFIG` currently unlocks it earlier than that wording suggests.
  Treat this as existing docs/code drift unless a PR touches power-up timing or
  documentation.
- `src/app/layout.tsx` references `/opengraph-image.png`; if the asset is
  absent on the baseline, only block PRs that touch metadata/share-image
  behavior or make the missing-image state worse.
- `next lint` is not reliable with the current Next version. Prefer
  `npm run build` and `npx tsc --noEmit --incremental false`.
- Next type generation may rewrite `next-env.d.ts` between dev and production
  route type paths. Treat unintended generated churn as cleanup.
- Existing dependency audit advisories may appear during `npm ci`; do not block
  unrelated PRs solely on unchanged baseline advisories.

## Assets and generated content

- Asset processors/generators live under both `tools/` and `scripts/`.
  Key files include `tools/process_assets.py`, actor death/combat juice/tile
  power-up/pickup intent/brute processors, polish/power-up/brute ammo/audio
  generators, and `scripts/generate-retro-soundtrack.mjs`.
- When generated assets change, verify the source prompt/tooling, emitted PNG
  or WAV files, metadata JSON, manifest references, and consuming animation or
  audio keys together.

## Suggested verification

- Docs-only changes: `git diff --check`.
- Code or asset-manifest changes: `npm ci`, `npm run build`, and
  `npx tsc --noEmit --incremental false`.
- Gameplay-sensitive changes: also smoke-test movement, pointer/click firing,
  `Space` firing, pickups/power-ups, mute, restart, and `F3` debug overlay.

## Review style

Prioritize concrete bugs with file/line evidence. Distinguish new regressions
from known baselines, and prefer focused findings over broad style advice.
