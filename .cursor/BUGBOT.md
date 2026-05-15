# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. The project is a
Next.js app that hosts a client-only Phaser 4 dungeon prototype with generated
pixel-art and audio assets.

## Review priorities

1. **Client/server boundaries**
   - Keep Phaser usage inside client components or dynamically imported modules
     that only execute in the browser.
   - Check that browser globals such as `window`, `document`, `Image`, audio
     APIs, and Phaser constructors are not accessed during server rendering.
   - Preserve metadata behavior in `src/app/layout.tsx`; OpenGraph and Twitter
     images should continue to resolve from `/opengraph-image.png`.

2. **Phaser lifecycle and resource cleanup**
   - Verify that `GameCanvas` still creates a single Phaser game instance and
     destroys it on React unmount.
   - Look for leaked timers, event listeners, input handlers, tweens, particle
     emitters, sounds, or scene references when scenes restart or components
     unmount.
   - Prefer scene-owned cleanup over module-level mutable state unless the state
     is intentionally persistent.

3. **Gameplay correctness**
   - Review collision, spawning, enemy pathing, projectile, pickup, power-up,
     health, score, and game-over changes for edge cases at map boundaries.
   - Confirm difficulty scaling, unlock thresholds, and pickup caps cannot create
     impossible states such as negative ammo, hidden required pickups, or enemies
     spawning on blocked tiles.
   - For input changes, verify keyboard, pointer, focus, and mute controls remain
     usable and do not conflict with browser defaults.
   - For HTML UI, overlays, or control changes, check labels, focus behavior,
     keyboard access, pointer access, and clear instructions for canvas controls.

4. **Asset contracts**
   - Asset keys, frame sizes, frame counts, row layouts, metadata paths, and file
     names must stay aligned across `src/game/assets/manifest.ts`, Phaser preload
     code, JSON metadata, README asset lists, and files under `public/assets`.
   - Generated asset-processing scripts should be deterministic and should not
     silently overwrite unrelated source assets.
   - Treat large binary additions as intentional only when the matching manifest
     or documentation changes explain how they are used.

5. **TypeScript and React quality**
   - Keep exported interfaces and manifest-derived union types precise.
   - Avoid weakening types with `any`, non-null assertions, or broad casts unless
     the surrounding Phaser API requires it and the invariant is obvious.
   - Preserve early returns and clear handler names for React code.

6. **Performance-sensitive paths**
   - `DungeonScene` update-loop work should avoid per-frame allocations,
     repeated pathfinding that is not rate-limited, and unbounded GameObject
     creation.
   - Check that pools and caps remain enforced for projectiles, enemies, combat
     effects, damage numbers, particles, pickups, and audio playback.

## Verification expectations

For substantive code or asset-manifest changes, prefer these checks:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
git diff --check
```

The README and existing npm lockfile make npm the default package manager for
these checks. If a change intentionally makes pnpm canonical, use
`pnpm install --frozen-lockfile` instead and make sure the package-manager
decision is documented.

`npm run lint` currently invokes `next lint`, which fails with the current
Next.js CLI behavior in this repository by treating `lint` as a project
directory. Do not report that known tooling limitation as a new regression unless
the change under review modifies lint tooling.

After `npm run build` or `npx tsc --noEmit`, check for generated-file churn such
as `next-env.d.ts` or `tsconfig.tsbuildinfo` and ensure only intentional changes
remain.

For metadata or social-preview changes, also confirm that
`public/opengraph-image.png` is still present and tracked, because static asset
deletions may not be caught by build or type-check output.

## Review output

- Lead with correctness, runtime, deployment, accessibility, and data-loss risks.
- Include file and line references for each finding.
- If no issues are found, say so and mention any checks that were not run.
- Do not request broad refactors unless they directly reduce risk in the change
  being reviewed.
