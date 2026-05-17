# Cursor Bugbot Review Guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype.

## Project context

- This is a public Next.js App Router, React, TypeScript, and Phaser 4 browser game prototype.
- The game runs as a client-side Phaser scene mounted from React. Be strict about client/server boundaries and browser-only APIs.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; asset metadata lives in `src/game/assets/manifest.ts` and `public/assets/**/*.json`.

## Review priorities

1. **Runtime correctness**
   - Flag changes that can break Next.js builds, App Router metadata, or `"use client"` boundaries.
   - Watch for direct `window`, `document`, Web Audio, canvas, or Phaser access outside browser-only paths.
   - Check for stale closures, leaked timers/listeners, unremoved Phaser objects, and scene restart/game-over cleanup issues.

2. **Gameplay and input behavior**
   - Review movement, aiming, firing, enemy spawning, collision, power-up, score, ammo, health, and progression changes for regressions.
   - Confirm keyboard, mouse, click/tap, mute, restart, start-menu, and instruction-overlay paths remain usable.
   - Prefer reporting concrete player-facing failures over subjective balance or polish feedback unless the diff clearly introduces a bug.

3. **Asset and manifest consistency**
   - When asset paths, frame dimensions, frame counts, animation keys, or atlas JSON files change, verify the corresponding loader and manifest entries still match.
   - Flag references to assets that are missing from `public/assets` or manifest entries that no longer match the checked-in files.
   - If OpenGraph/Twitter metadata or share-image URLs change, verify the referenced public files exist.

4. **React, TypeScript, and maintainability**
   - Favor clear typed interfaces, descriptive names, early returns, and small helpers when gameplay logic grows.
   - Flag duplicated logic only when it is likely to cause divergent behavior or hides a bug.
   - Avoid requesting broad refactors, style-only changes, or production hardening unrelated to the changed code.

5. **Verification**
   - Useful local checks are `npm run build` and `npx tsc --noEmit --incremental false`.
   - `npm run lint` currently maps to `next lint`, which may not be valid for the installed Next.js version; do not require it unless the lint script is migrated.
   - Treat generated changes to `next-env.d.ts`, `.next/`, and other ignored build output as cleanup issues unless intentionally modified.

## Reporting guidance

- Report issues that are introduced by the pull request or made materially worse by it.
- Include the exact failure mode, affected player/developer workflow, and a minimal fix direction.
- Do not block on pre-existing prototype limitations already documented in `README.md`.
