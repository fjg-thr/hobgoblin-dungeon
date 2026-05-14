# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. Focus on user-visible game regressions, deploy blockers, and maintainability risks that are specific to the Hobgoblin Ruin prototype.

## Project context

- This is a private Next.js app that hosts a client-only Phaser game prototype.
- The app entry point is `src/app/page.tsx`; it renders `src/game/GameCanvas.tsx`.
- Phaser is dynamically imported from `GameCanvas` so it only runs in the browser.
- Most game behavior lives in `src/game/scenes/DungeonScene.ts`; map generation and tile helpers live in `src/game/maps/startingDungeon.ts`.
- Static runtime assets are served from `public/assets/**` and are referenced through `src/game/assets/manifest.ts`.
- Social metadata is defined in `src/app/layout.tsx` and references `public/opengraph-image.png`.

## High-priority review areas

### Next.js and React boundaries

- Flag any direct `window`, `document`, Phaser, audio, pointer, or canvas access from server components or module top-level code that can run during SSR.
- `GameCanvas` must remain a client component and should keep Phaser loading inside the browser-only effect.
- Watch for React Strict Mode double-mount issues: repeated effects must not leave multiple Phaser games, duplicated listeners, timers, or stale async initialization.
- Verify cleanup paths call Phaser destruction or remove event listeners when component or scene lifecycles end.

### Phaser lifecycle and resource cleanup

- In `DungeonScene`, review additions for matching teardown of timers, tweens, input handlers, audio loops, masks, particles, and pooled game objects.
- Check that restart/game-over/start-screen flows reset state rather than carrying stale actors, projectiles, pickups, UI objects, or invulnerability windows.
- Be cautious with long-lived arrays and object pools; removed sprites should be destroyed or returned to pools consistently.
- Confirm pointer, keyboard, resize, and sound toggle handlers are not registered more than once per scene instance.

### Gameplay correctness

- Review tile/world coordinate conversions, depth ordering, collision bounds, spawn safety, pathfinding, and projectile math carefully. Small arithmetic changes can produce visible regressions.
- Ensure new pickups, enemies, powerups, and projectiles obey progression gates, active-count limits, cooldowns, safe spawn distances, and health/ammo caps.
- Check that randomness still has safe fallbacks for generated maps, spawn locations, and path targets.
- Confirm combat changes preserve invulnerability, hit stop, knockback, scoring, death effects, and game-over transitions.

### Asset manifest contracts

- Any new or renamed asset referenced in `assetManifest` must have a matching file under `public/assets/**`.
- Sprite sheet metadata JSON, frame dimensions, frame rows, animation key names, and row/type ordering must stay aligned with the code that consumes them.
- Do not accept generated asset paths that point outside `public` or require runtime filesystem access.
- Review asset-processing script changes for deterministic outputs and for preserving transparent backgrounds, nearest-neighbor scaling, and existing prompt/source conventions.

### Metadata and deployment behavior

- If `src/app/layout.tsx` metadata changes, confirm relative image URLs still work with `metadataBase`.
- Keep `public/opengraph-image.png` tracked when metadata references `/opengraph-image.png`.
- Do not introduce runtime requirements for secrets or external services in the client bundle.

### TypeScript and code quality

- Prefer typed helpers and local constants over untyped object literals for gameplay rules.
- Keep large-scene edits localized and readable; avoid unrelated refactors in `DungeonScene.ts`.
- Watch for unused imports, accidental `any`, non-null assertions hiding real lifecycle issues, and duplicated magic numbers that should share existing constants.
- Preserve the existing asset manifest as the source of truth instead of hardcoding duplicate paths in scene code.

## Verification expectations

For code changes, ask authors to run:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

Notes:

- `npm run lint` currently maps to `next lint`, which is not compatible with the locked Next.js 16 CLI in this repo. Prefer build and TypeScript checks until linting is migrated.
- `next build` may update `next-env.d.ts`; `tsc --noEmit` may create `tsconfig.tsbuildinfo`. These should not be committed unless the change intentionally requires them.

## Review output

- Lead with actionable findings ordered by severity.
- Include file and line references.
- Explain the observable user impact for gameplay or deploy issues.
- Distinguish between blocking correctness issues and minor cleanup suggestions.
- If there are no findings, say that clearly and mention any verification gaps or runtime areas that were not exercised.
