# Cursor Bugbot Review Guide

Use these repository rules when reviewing changes for Hobgoblin Ruin, a Next.js App Router prototype that embeds a Phaser-powered isometric dungeon game.

## Project context

- The app entry points are `src/app/layout.tsx` and `src/app/page.tsx`.
- `src/game/GameCanvas.tsx` is the browser-only bridge between React and Phaser. Keep Phaser runtime imports and scene loading behind client-only boundaries, dynamic imports, effects, or equivalent runtime guards.
- Most gameplay state, rendering, combat, audio, and input logic lives in `src/game/scenes/DungeonScene.ts`.
- Dungeon map generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Public asset paths and sprite sheet metadata are centralized in `src/game/assets/manifest.ts`; referenced files should exist under `public/`.
- Asset generation and processing scripts live under `tools/` and `scripts/`; review them for reproducibility and accidental destructive writes.

## Review priorities

1. Flag changes that can break production builds, server rendering, or client-only Phaser initialization.
2. Flag Phaser lifecycle regressions: duplicate `Phaser.Game` instances, uncleared timers, tweens, input listeners, audio instances, particle emitters, or GameObjects that can leak across scene restart, shutdown, or React unmount.
3. Flag asset manifest additions when the corresponding file is missing from `public/`, frame dimensions do not match the sprite sheet contract, animation keys are duplicated, or JSON metadata paths are added without matching metadata files.
4. Flag gameplay changes that create unbounded object growth, runaway spawn/update loops, invalid health/ammo/score state, broken pickup lifetimes, or missing projectile/enemy cleanup.
5. Flag collision, projectile, pickup, and enemy pathing changes that ignore blocked tiles, bridge/chasm semantics, map bounds, safe spawn distances, or camera/world coordinate conversions.
6. Flag UI changes that hide keyboard controls, remove the sound toggle, reduce text contrast, or make interactive controls inaccessible.
7. Flag metadata changes that reference missing OpenGraph/Twitter images or assume production-only environment variables without a localhost or preview-safe fallback.
8. Flag dependency or lockfile changes that update only one of `package-lock.json` and `pnpm-lock.yaml` unless the package manager policy is intentionally being changed.

## Expected checks

- Prefer `npm ci` over `npm install` for automated verification.
- Run `npm run build` for production safety after TypeScript, Next.js, asset, or game-code changes.
- Run `npm run lint` if supported by the installed Next.js version; if it fails because the Next CLI no longer supports `next lint`, report that tooling gap separately from code findings.
- For gameplay, Phaser lifecycle, asset, or input changes, request or run a browser smoke test that starts a run, moves, fires, collects pickups, toggles sound, restarts after game over, and checks the console for errors.
- For asset-processing changes, run the specific `package.json` script that owns the affected assets when one exists.

## Reporting guidance

- Prioritize concrete defects with file and line references.
- Distinguish required fixes from follow-up polish.
- Avoid blocking on intentional prototype limitations already documented in `README.md`.
- Do not request secrets, tokens, dashboard settings, or GitHub App configuration in code review comments.
- Do not claim this file alone enables the managed Cursor Bugbot service; service enablement depends on Cursor/GitHub app or dashboard configuration outside this repository.
