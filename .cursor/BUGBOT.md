# Cursor Bugbot Review Guide

Use these repository rules when reviewing changes for Hobgoblin Ruin, a Next.js App Router prototype that embeds a Phaser-powered isometric dungeon game.

## Project context

- The app entry points are `src/app/layout.tsx` and `src/app/page.tsx`.
- The browser-only Phaser bootstrapping lives in `src/game/GameCanvas.tsx`; keep Phaser imports dynamically loaded from client components so server rendering does not import browser-only APIs.
- Most gameplay state, rendering, combat, audio, and input logic is in `src/game/scenes/DungeonScene.ts`.
- Dungeon map generation and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Public asset paths and sprite sheet metadata are centralized in `src/game/assets/manifest.ts`; referenced files should exist under `public/`.
- Asset generation and processing scripts live under `tools/` and are exposed through `package.json` scripts.

## Review priorities

1. Flag changes that can break production builds, server rendering, or client-only Phaser initialization.
2. Flag asset manifest additions when the corresponding file is missing from `public/`, when frame dimensions do not match the sprite sheet contract, or when JSON metadata paths are added without the matching metadata file.
3. Flag gameplay changes that create unbounded object growth, uncleared timers/listeners, leaked Phaser game objects, or runaway spawn/update loops.
4. Flag collision, projectile, pickup, and enemy pathing changes that ignore blocked tiles, bridge/chasm semantics, spawn safety distances, or camera/world coordinate conversions.
5. Flag UI changes that hide keyboard controls, remove the sound toggle, reduce text contrast, or make interactive controls inaccessible.
6. Flag metadata changes that reference missing OpenGraph/Twitter images or assume production-only environment variables without a localhost fallback.
7. Flag dependency or lockfile changes that update only one of `package-lock.json` and `pnpm-lock.yaml` unless the package manager policy is intentionally being changed.

## Expected checks

- Prefer `npm ci` over `npm install` in automated verification.
- Run `npm run build` for production safety.
- Run `npm run lint` if the script is available in the installed Next.js version; if it fails because the Next CLI no longer supports `next lint`, report that tooling gap separately from code-quality findings.
- For asset-processing changes, also run the specific `package.json` script that owns the affected assets.

## Reporting guidance

- Prioritize concrete defects with file and line references.
- Distinguish required fixes from follow-up polish.
- Avoid blocking on intentional prototype limitations already documented in `README.md`.
- Do not request secrets, tokens, dashboard settings, or GitHub App configuration in code review comments.
