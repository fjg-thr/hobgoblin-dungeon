# Cursor Bugbot review guidance

## Project context

- This repository is the Hobgoblin Ruin Prototype: a dark, GBA-inspired isometric dungeon game built with Next.js App Router, React, TypeScript, and Phaser 4.
- The React surface is intentionally small. `src/app/page.tsx` renders the page shell, `src/app/layout.tsx` owns metadata, and `src/game/GameCanvas.tsx` dynamically imports Phaser on the client before mounting `DungeonScene`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`. Treat movement, combat, pickups, score, sound, game-over flow, and debug overlays as shared scene state even when a diff appears localized.
- Map generation and tile/collision helpers are in `src/game/maps/startingDungeon.ts`; asset paths and frame dimensions are centralized in `src/game/assets/manifest.ts`.
- Generated or processed assets live under `public/assets`, with source prompts and generation or processing scripts in `ASSET_PROMPTS.md`, `tools/`, and `scripts/`.

## Review priorities

1. Flag runtime-breaking issues first: server/client boundary mistakes, static asset path mismatches, missing files, TypeScript errors, and Phaser lifecycle leaks.
2. Check gameplay invariants when scene state changes:
   - player health, invulnerability, game-over, ammo, seeker ammo, power-ups, score, enemy counts, pickup counts, and timers should remain bounded and reset correctly between runs;
   - update-loop logic should be frame-rate tolerant and use capped deltas where appropriate;
   - pooled effects, tweens, timers, and input handlers should be cleaned up or reused safely.
3. Validate isometric math carefully:
   - tile/world conversions should preserve the `64x32` tile assumptions from `startingDungeon.ts`;
   - depth sorting should keep actors, props, projectiles, shadows, and overlays visually coherent;
   - collision, spawn, pickup, projectile, and blast checks should use consistent tile-space distances and blocked-tile rules.
4. Treat Phaser-on-Next integration as high risk:
   - do not import Phaser into server components;
   - keep browser-only APIs inside client components, effects, or Phaser scene code;
   - preserve `GameCanvas` cancellation and `game.destroy(true)` cleanup behavior under React Strict Mode.
5. For React UI changes, check accessibility and keyboard/pointer behavior. Canvas-only controls need discoverable instructions or equivalent text in the surrounding page where practical.

## Assets and generated content

- When runtime sprite sheets or audio assets are added, verify the referenced files exist under `public/assets` and that `assetManifest` paths, frame sizes, animation frame counts, and metadata paths match the generated files.
- Some runtime sheets use fixed frame dimensions without JSON metadata. Only require JSON when code or the manifest references a `metadataPath`.
- For generated assets, prefer reviewing the processing script, manifest changes, and final public asset references together. Avoid blocking solely because a binary asset diff cannot be line-reviewed.
- If `src/app/layout.tsx` metadata changes, confirm referenced public assets such as `/opengraph-image.png` exist and are tracked.

## Verification commands

Use the smallest relevant subset for the diff, and suggest broader checks for scene, asset, or build changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

Notes:

- `npm run build` is the current integration check for this Next.js project.
- `npm run lint` currently invokes `next lint`; with the lockfile-resolved Next.js version, that subcommand is not available and is interpreted as a project directory. Do not request `npm run lint` until linting is migrated to an explicit supported command.
- If a diff changes metadata or share-image references, verify the referenced public asset exists and is tracked before requesting image checks, for example with `test -f public/opengraph-image.png` and `git ls-files --error-unmatch public/opengraph-image.png`.
- `next build` may update generated `next-env.d.ts` paths between `.next/dev/types` and `.next/types`; treat that as generated churn unless the diff intentionally changes Next or TypeScript configuration.

## Comment style

- Leave concise, actionable comments tied to user-visible bugs, correctness, reliability, accessibility, or verification gaps.
- Avoid nitpicks about asset aesthetics, generated binary content, or subjective gameplay tuning unless the diff introduces a clear regression.
- Prefer concrete reproduction steps or exact files/commands when suggesting a fix.
