# Cursor Bugbot Review Guidance

Use this file as repository-specific context for Cursor Bugbot reviews after it is merged to the default branch. This file does not enable the hosted Bugbot service by itself; managed enablement must be verified in Cursor organization/repository settings, GitHub App repository access, and a live pull request review smoke check.

## Manual review triggers

When Bugbot is installed and enabled for this repository, a top-level pull request comment can request a review with either:

```text
cursor review
```

or:

```text
bugbot run
```

For troubleshooting, use the verbose variants:

```text
cursor review verbose=true
bugbot run verbose=true
```

Pull requests that add or update `.cursor/BUGBOT.md` may not be reviewed with the new guidance until the file exists on the default branch.

## Project map

- Next.js App Router entry points live in `src/app/`.
- The React client bridge is `src/game/GameCanvas.tsx`; it dynamically imports Phaser and mounts `DungeonScene`.
- The main game loop and most gameplay systems live in `src/game/scenes/DungeonScene.ts`.
- Dungeon layout data lives in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are sourced from `src/game/assets/manifest.ts`. `public/assets/audio/audio-manifest.json` is auxiliary consistency metadata, not the runtime audio source of truth.
- Generated and processed asset tooling lives under both `tools/` and `scripts/`; many files under `public/assets/` are generated artifacts.

## Review priorities

Focus on regressions that affect the playable prototype:

1. Game boot and SSR/client boundaries: Phaser must stay client-only, and `GameCanvas` should not instantiate duplicate games across React effects or route transitions.
2. Phaser lifecycle safety: changed sprites, tweens, timers, sounds, input listeners, and graphics objects should be destroyed or reused safely when scenes restart.
3. Gameplay invariants: movement, collision, enemy spawning, projectile targeting, pickups, scoring, health, game over, and restart behavior should remain coherent.
4. Asset manifest consistency: added runtime assets should exist in `public/assets/`, be referenced through `assetManifest` where appropriate, and have matching frame sizes/metadata.
5. Responsive canvas UI: Phaser overlay controls, pointer zones, HUD placement, and start/game-over panels should work across common viewport sizes.
6. Accessibility where DOM is involved: keep semantic Next/React markup accessible. For Phaser-only UI, call out canvas-specific keyboard/pointer limitations and avoid pretending ARIA can reach in-canvas controls.
7. Audio safety: honor the scene-level mute state, avoid autoplay regressions beyond the current user-started flow, and keep audio file references synchronized with `assetManifest.audio`.

## Gameplay context and known baselines

Do not block unrelated pull requests solely on these existing README/code mismatches, but flag them when a change touches the related behavior or docs:

- README says `Space` or `J` fires; current runtime input binds keyboard firing to `SPACE` plus pointer/click firing.
- README documents quickshot, haste, ward, blast, ammo, and hearts; current code also has seeker ammo/projectiles that unlock after 4 kills or 30 seconds.
- README describes blast as rare late-game; current code unlocks blast after 2 kills or 16 seconds.
- `src/app/layout.tsx` references `/opengraph-image.png`, but `public/opengraph-image.png` is not currently present.
- The repo does not configure Tailwind CSS. Prefer existing `src/app/globals.css` patterns for DOM styling comments and review Phaser canvas UI separately.

Current gameplay anchors worth preserving unless a PR explicitly changes them:

- Standard ammo maximum is 24; seeker ammo maximum is 6.
- Brutes unlock after 3 kills or 22 seconds.
- Heart drops begin at 3 kills and then every 5 additional kills, capped by active pickup limits.
- Quickshot, haste, ward, and blast effects are time- or shot-bound and should update HUD/feedback consistently.

## Suggested verification

For ordinary code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is not a reliable baseline for this repo on the current Next.js version. Existing dependency audit output may report Next/PostCSS advisories; do not make unrelated dependency hardening a blocker for focused gameplay or Bugbot-guidance pull requests unless the PR changes dependencies or security posture.

For small docs-only or guidance-only changes, at minimum use:

```bash
git diff --check origin/main...HEAD
```

If build or typecheck commands rewrite generated local files such as `next-env.d.ts` or create `tsconfig.tsbuildinfo`, restore or remove those artifacts before finalizing unless the PR intentionally changes generated typing behavior.

## Generated asset caution

Asset-generation scripts can produce large binary churn. If a PR changes generated image/audio files, verify:

- The generator or prompt/source change is included or the rationale is documented.
- Sprite sheet JSON frame dimensions match the generated PNG.
- Runtime references in `assetManifest` match actual files.
- The change does not accidentally commit transient source, cache, or build artifacts.
