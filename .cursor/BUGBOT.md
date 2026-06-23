# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for the Hobgoblin Ruin prototype.

## Deployment and trigger expectations

- Repository files only provide review guidance. Managed Bugbot enablement is
  external to this repo through the Cursor dashboard, Cursor GitHub App access,
  and, when available, Cursor Bugbot Admin API configuration. A live PR smoke
  review is the only repository-visible proof that the service is active.
- After this file lands on the default branch, trigger manual reviews from a PR
  top-level comment with `cursor review` or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request IDs and extra logs. Treat verbose output
  as troubleshooting metadata, not as a deeper review mode.
- PRs that add or update this file may be reviewed using the previous default
  branch guidance until the change is merged.

## Project shape

- Next.js/React mounts a Phaser game canvas from `src/game/GameCanvas.tsx`.
- Core gameplay, input, HUD, powerups, enemies, audio, and most runtime state
  live in `src/game/scenes/DungeonScene.ts`.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded
  assets and audio. `public/assets/audio/audio-manifest.json` is auxiliary and
  should not be treated as the loader source.
- Dungeon map data starts in `src/game/maps/startingDungeon.ts`; generated and
  processed asset tooling lives under `tools/` and `scripts/`.

## Review priorities

- Gameplay changes: check state transitions for start, play, death, restart,
  pickup collection, enemy spawning, projectile lifetime, hit-stop, mute state,
  and debug overlay behavior. Prefer findings tied to concrete regressions that
  can be reproduced in the Phaser scene.
- Controls: current code fires with Space and pointer/click. README still says
  `Space` or `J`; do not block unrelated PRs for this existing mismatch, but
  flag changes that make docs, how-to-play UI, or runtime input diverge further.
- Powerups and ammo: README documents standard ammo, hearts, quickshot, haste,
  ward, and blast. Code also includes seeker ammo/projectiles unlocked after
  progress. Treat seeker behavior and blast timing as code-defined behavior
  unless a PR explicitly updates player-facing docs.
- Assets/audio: verify new manifest entries match files under `public/assets`,
  frame dimensions, keys, animation rows, and loader usage. For generated
  assets, check the corresponding processor/generator command when relevant
  (for example `tools/generate_audio_sfx.mjs`,
  `scripts/generate-retro-soundtrack.mjs`, or the specific asset processor).
- UI/metadata: this repo does not use Tailwind. Review DOM UI against existing
  `src/app/globals.css` patterns, semantic HTML, accessibility, and responsive
  behavior. Canvas UI should be reviewed for pointer zones, keyboard/mouse
  affordances, readable placement, and resolution scaling.
- OpenGraph baseline: `src/app/layout.tsx` references `/opengraph-image.png`,
  but no matching asset is present in the current tree. Only block PRs that
  touch metadata/share-image behavior or worsen this baseline.

## Local verification

Prefer these checks for code-review confidence:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

`next lint` is not reliable with the current Next version in this repo. `npm ci`
currently reports baseline audit advisories; mention them only when a PR changes
dependencies or security posture.

If verification generates `tsconfig.tsbuildinfo` or rewrites `next-env.d.ts`
between `.next/types/routes.d.ts` and `.next/dev/types/routes.d.ts`, treat that
as local Next typegen churn and do not include it unless the PR intentionally
changes generated typing behavior.

## Review style

- Lead with actionable bugs, regressions, security risks, or missing tests.
- Avoid blocking on pre-existing README/code mismatches unless the PR changes
  the affected behavior or documentation.
- When a finding involves Phaser coordinates, depths, or animation frames,
  include the relevant object/state path so the author can reproduce it quickly.
