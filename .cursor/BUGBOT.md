# Cursor Bugbot review guide

Use this guide when Cursor Bugbot reviews pull requests for this repository.
It provides review context only; enabling the managed Bugbot service still
requires Cursor dashboard or organization settings, GitHub App repository
access, and any Admin API credentials outside this repo.

## Activation and scope

- After this file is merged to the default branch, Bugbot should apply it to
  future PR reviews. A PR that adds or changes this file may not be reviewed
  with the new instructions yet.
- Manual review triggers may be posted as top-level PR comments: `cursor review`
  or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request diagnostics, request IDs, and log detail.
- If service-level access cannot be verified, say that the repository guidance
  is present but managed Bugbot enablement still needs external confirmation.

## Repository profile

- Next.js, React, TypeScript, and Phaser prototype for a dark isometric
  hobgoblin dungeon game.
- Main runtime scene: `src/game/scenes/DungeonScene.ts`.
- React/Next canvas integration: `src/game/GameCanvas.tsx` and
  `src/app/page.tsx`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`; audio loading
  uses `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is
  auxiliary consistency data.
- Generated or processed asset tooling lives in `tools/` and `scripts/`,
  including `tools/generate_audio_sfx.mjs` for procedural SFX and
  `scripts/generate-retro-soundtrack.mjs` for the theme.

## Review priorities

1. Protect gameplay loops in `DungeonScene.ts`: movement, camera follow,
   collision checks, firing, enemy spawning, pickups, power-up timing, scoring,
   damage, game-over, restart, and scene cleanup.
2. Watch Phaser lifecycle boundaries. Ensure event handlers, timers, tweens,
   keyboard keys, pointer zones, sounds, and scene references are cleaned up or
   scoped so React remounts and scene restarts do not duplicate state.
3. Validate asset manifest changes against files under `public/assets/**`.
   Missing keys, frame sizes, frame ranges, or mismatched audio paths are
   high-risk regressions.
4. Check canvas UX and accessibility-adjacent behavior: responsive sizing,
   pointer hit areas, keyboard affordances, mute state, start/how-to-play/game
   over overlays, and readable HUD placement.
5. Review DOM and metadata changes for semantic markup, existing
   `src/app/globals.css` patterns, and Next.js conventions. This project does
   not currently configure Tailwind or shadcn/ui.

## Known baseline context

- README says `Space` or `J` fires, but current runtime binds keyboard shooting
  to `SPACE` plus pointer/click firing. Do not block unrelated PRs solely for
  this existing docs/runtime mismatch; do flag PRs that touch controls or docs
  and leave them inconsistent.
- README documents standard ammo, heart pickups, quickshot, haste, ward, and
  blast. Current code also includes seeker ammo behavior. Treat seeker ammo as
  code-defined behavior unless a PR intentionally updates docs.
- README describes blast as rare late-game, while `POWERUP_CONFIG` currently
  unlocks blast earlier. Treat this as existing drift unless a PR changes
  power-up progression or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; if the asset is still
  absent, treat it as a known baseline issue and only block changes that touch
  metadata/share images or make the situation worse.
- `npm ci` may report existing audit advisories from the current dependency
  baseline. Do not block unrelated scoped changes solely on those advisories,
  but flag dependency PRs that fail to improve or explain them.

## Verification expectations

Prefer focused checks based on touched files, and ask for evidence when a PR
claims behavior changed. Useful baseline commands:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `next lint` is not reliable for this Next version in the current repo; prefer
  build plus TypeScript checks.
- Next type generation may dirty `next-env.d.ts`, and TypeScript may create
  `tsconfig.tsbuildinfo`; those generated changes should not be committed
  unless the PR intentionally changes typing configuration.
- For asset pipeline changes, inspect generated JSON frame data and run the
  exact relevant generator or processor script instead of broad wildcard
  commands.

## Review style

- Lead with actionable correctness, regression, security, accessibility, and
  test gaps. Avoid broad refactor requests that are not required for the PR.
- Distinguish new regressions from known baseline issues.
- Include file and line references where possible, plus a concrete reproduction
  or verification step for gameplay findings.
