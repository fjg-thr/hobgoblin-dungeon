# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. Keep comments focused on
issues that can affect shipped behavior, maintainability, or review confidence.

## Project shape

- Next.js App Router app with a single page at `src/app/page.tsx`.
- `src/game/GameCanvas.tsx` is a client component that dynamically imports Phaser
  and owns the lifecycle of one `Phaser.Game` instance.
- Most gameplay lives in `src/game/scenes/DungeonScene.ts`; map generation lives
  in `src/game/maps/startingDungeon.ts`.
- Asset paths and metadata are centralized in `src/game/assets/manifest.ts` and
  served from `public/assets`.
- Asset generator/processor tooling lives under both `tools/` and `scripts/`.

## High-priority review areas

1. **Client/server boundaries**
   - Phaser and `window` access must stay behind client-only boundaries.
   - Avoid importing `phaser` directly from server-rendered App Router files.

2. **Phaser lifecycle and cleanup**
   - New timers, input listeners, tweens, sounds, physics objects, and scene
     resources should be cleaned up or tied to scene shutdown.
   - `GameCanvas` should continue to create only one game instance and destroy it
     on React unmount.

3. **Gameplay invariants**
   - Check player health, invulnerability/ward behavior, ammo consumption,
     projectile despawn, pickup collection, enemy spawn pacing, score updates,
     and game-over/restart flows for regressions.
   - Treat movement/collision changes as high risk because the scene uses custom
     tile and proximity checks rather than a full physics collision system.

4. **Assets and manifests**
   - Any new runtime asset should be present under `public/assets`, referenced by
     `assetManifest` when appropriate, and have matching sprite dimensions and
     metadata.
   - Do not accept references to generated source images as runtime assets unless
     the code intentionally loads those files.

5. **UI and accessibility**
   - This repo does not use Tailwind. Prefer existing semantic markup and
     `src/app/globals.css` patterns.
   - For App Router UI changes, check keyboard access, visible focus, labels, and
     reduced surprise for full-screen canvas interactions.

## Known existing mismatches

- README says `Space` or `J` fires. Current gameplay binds keyboard firing to
  `Space`; pointer/click firing is also supported. Do not block unrelated PRs on
  this existing docs/code mismatch, but do flag PRs that touch controls without
  resolving or preserving the intended behavior.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  does not document seeker ammo. The current code unlocks seeker ammo by kills or
  survival time; review code-defined seeker behavior separately from README text.
- README describes blast as a rare late-game power-up. Current code unlocks blast
  after early progression. Treat this as an existing mismatch unless a PR is meant
  to adjust power-up progression or documentation.

## Suggested checks

Prefer these checks for code changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` currently maps to `next lint`, which is not reliable with the
  locked Next.js CLI used in this repository. Do not require it as the primary
  signal unless the project tooling is updated.
- Next/TypeScript verification may rewrite `next-env.d.ts` or create
  `tsconfig.tsbuildinfo`; those generated artifacts should stay out of unrelated
  review diffs.
- For documentation-only Bugbot guide changes, markdown inspection and
  whitespace checks are usually sufficient.

## Managed Bugbot activation boundary

This file gives Cursor Bugbot repository-specific review context. It does not, by
itself, prove that the managed Cursor Bugbot service is enabled. Confirm service
activation through Cursor dashboard or organization settings, GitHub App
repository access, and a pull request review smoke check when those controls are
available.
