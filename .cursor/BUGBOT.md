# Cursor Bugbot review guidance

Use this file as repository-specific context for Cursor Bugbot reviews. Hosted
Bugbot enablement is managed outside this repository through Cursor dashboard
settings and the Cursor GitHub App. This file supplies review rules after it is
merged to the default branch; it does not prove the hosted service is enabled.

## Review priorities

- Treat this as a Next.js App Router, React, TypeScript, and Phaser game
  prototype. Runtime gameplay lives mostly in `src/game/**`; the page shell and
  metadata live in `src/app/**`.
- Prioritize correctness bugs: null or undefined access, Phaser object lifecycle
  mistakes, leaked timers/listeners, duplicate game bootstraps, stale scene
  state after restart, and combat/collision edge cases.
- For `src/game/GameCanvas.tsx`, check client-only boundaries, async Phaser
  boot cleanup, resize behavior, and idempotent teardown during React strict
  mode remounts.
- For `src/game/scenes/DungeonScene.ts`, focus on player damage rules, enemy
  spawning, pickups, projectile cleanup, power-up timing, audio toggle behavior,
  and game-over/restart transitions.
- For assets loaded at runtime, prefer `src/game/assets/manifest.ts` as the
  source of truth. `public/assets/audio/audio-manifest.json` is auxiliary unless
  a PR intentionally changes audio manifest consistency.
- For DOM UI, metadata, or future React UI, follow existing semantic markup and
  `src/app/globals.css` patterns. This repo does not currently configure
  Tailwind CSS or ShadCN UI.

## Project-specific known baselines

- README says fire with `Space` or `J`; current runtime firing is `Space` and
  pointer/click. Only block PRs that touch input docs or controls and worsen the
  mismatch.
- README does not describe seeker ammo, but runtime code unlocks seeker ammo
  after progression. Review seeker changes against code-defined behavior unless
  the PR intentionally updates docs.
- README describes blast as a rare late-game power-up, while current code
  unlocks it earlier. Treat this as an existing docs/code mismatch unless the
  PR changes blast progression or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; the baseline may not
  include a matching public image. Do not block unrelated PRs solely for that
  pre-existing metadata gap.
- The package includes `npm run lint`, but Next.js 16 no longer reliably
  supports `next lint` in this baseline. Prefer build and type-check evidence.

## Generated and offline assets

- Do not require hand review of generated PNG, WAV, or sprite JSON diffs under
  `public/assets/**` unless runtime references, metadata dimensions, or loading
  behavior change.
- When asset generation is touched, verify the relevant script and generated
  output together. Important tooling includes:
  - `tools/process_assets.py`
  - `tools/process_actor_death_assets.mjs`
  - `tools/process_combat_juice_assets.mjs`
  - `tools/generate_powerup_sprites.mjs`
  - `tools/generate_brute_ammo_sprites.mjs`
  - `scripts/generate-retro-soundtrack.mjs`
- Keep dependency or lockfile hardening separate from gameplay/asset review
  unless the PR intentionally changes dependencies.

## Verification expectations

- For TypeScript, React, Phaser, metadata, or package changes, expect:
  - `npm run build`
  - `npx tsc --noEmit`
- For asset pipeline changes, expect the specific `npm run process:*` or
  `npm run generate:*` script that owns the changed files.
- Existing dependency audit advisories should be reported as baseline context,
  not as blockers for unrelated PRs.
- If verification changes `next-env.d.ts` or creates `tsconfig.tsbuildinfo`,
  restore/remove those generated artifacts unless the PR intentionally changes
  TypeScript or Next.js generated typing behavior.

## Review style

- Lead with concrete bugs and user-visible regressions. Include file and line
  references where possible.
- Separate critical issues from baseline limitations and optional cleanup.
- Avoid blocking on missing tests for generated assets or prototype-only art
  updates unless runtime behavior changes.
- If the hosted Bugbot service does not appear on a PR, state that enabling it
  requires Cursor dashboard/GitHub App access. Manual review can be requested
  with a top-level PR comment: `cursor review` or `bugbot run`; use
  `cursor review verbose=true` or `bugbot run verbose=true` for diagnostics.
