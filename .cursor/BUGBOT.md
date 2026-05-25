# Cursor Bugbot Review Guide

Use this repository-specific context when reviewing pull requests for the Hobgoblin Ruin prototype. The project is a Next.js app that mounts a Phaser scene for a dark GBA-inspired isometric dungeon game.

## Review boundaries

- Treat this file as review guidance for Cursor Bugbot. Managed Bugbot enablement still depends on Cursor dashboard/org settings, GitHub App repository access, and a PR review smoke check.
- Prioritize behavioral regressions, build/type failures, asset manifest mismatches, accessibility issues in React UI, and gameplay/documentation drift introduced by the change under review.
- Do not block unrelated PRs solely for existing README/code mismatches called out below, but do block changes that make those mismatches worse or claim to fix them without doing so.
- Prefer small, actionable findings with file/line references and a clear user-visible impact.

## Project shape

- `src/app/page.tsx` renders the app shell and loads `src/game/GameCanvas.tsx`.
- `src/game/scenes/DungeonScene.ts` owns most gameplay state: player movement, aiming/firing, enemies, pickups, power-ups, UI overlays, audio, and debug rendering.
- `src/game/maps/startingDungeon.ts` generates the room-and-corridor dungeon map and collision data.
- `src/game/assets/manifest.ts` maps Phaser texture/audio keys to files under `public/assets`.
- Asset generator and processor tooling lives in both `tools/` and `scripts/`; `scripts/generate-retro-soundtrack.mjs` writes `public/assets/audio/retro_dungeon_theme.wav`.
- `src/app/layout.tsx` references `public/opengraph-image.png` for social metadata; keep that file and metadata aligned.

## Commands Bugbot should expect reviewers/CI to run

- `npm ci`
- `npm audit --omit=dev`
- `npm run typecheck`
- `npm run build`
- `corepack pnpm install --frozen-lockfile`
- `pnpm audit --prod`

`next lint` is not a reliable check for this Next 16 project. The `typecheck` script should run `next typegen && tsc --noEmit` so clean CI has generated route type definitions before TypeScript runs.

## Dependency and package-manager invariants

- Keep `next`, `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@types/node`, and `typescript` exact-pinned rather than using `latest` ranges.
- Keep `overrides.postcss` pinned to `8.5.15` for npm installs.
- Keep pnpm overrides in `pnpm-workspace.yaml`, not `package.json#pnpm.overrides`.
- pnpm 10/11 installs require `allowBuilds.sharp: true` so Next's `sharp` dependency can complete under frozen-lockfile installs.
- CI targets Node 22, so `@types/node` should stay on the Node 22 type line.

## Gameplay invariants worth checking

- Movement remains `WASD` or arrow keys in isometric directions.
- Current code fires with `Space` and pointer/click firing. The README still mentions `J`; treat that as existing control-doc drift unless a PR touches controls or docs.
- Standard ammo is finite and reloads through red staff-shard pickups.
- Seeker ammo is code-defined behavior: it unlocks after 4 kills or 30 seconds and uses seeker pickups/projectiles. The README does not currently document it.
- Power-ups include quickshot, haste, ward, and blast. The README describes blast as rare late-game, while current code unlocks blast after 2 kills or 16 seconds; treat that as existing documentation drift unless a PR touches power-up balance or docs.
- Heart pickups restore missing hearts after kill milestones and do not increase max health.
- Brutes unlock later than basic goblins and should not spawn directly on top of the player.
- The debug overlay is toggled with `F3` and should not be visible by default.

## Asset review checklist

- Every asset referenced in `assetManifest` must exist under `public/assets`.
- JSON atlas frame names and dimensions should match how `DungeonScene` creates animations.
- Generated PNG/WAV assets should be deterministic enough for review: if tooling changes, check the corresponding generated assets and README asset list.
- Keep source images under `public/assets/source` when prompts or local processing depend on them.
- Avoid introducing large binary assets unless they are required by the gameplay or UI change.

## React/Next review checklist

- Client-only Phaser code must stay behind client component boundaries and avoid server-side access to `window`, `document`, or Phaser globals.
- Metadata changes in `src/app/layout.tsx` should preserve valid absolute `metadataBase` behavior for local and Vercel deployments.
- UI changes should keep keyboard and screen-reader accessibility in mind, especially for modals, controls, and clickable elements.
- Prefer Tailwind utilities and existing local patterns over new global CSS.

## CI expectations

- Pull request and deployment branches should run install, audit, typecheck, and build checks for npm and pnpm lockfiles.
- Branch pushes should run `git diff --check` against the merge base with `main` so whitespace errors introduced earlier on the branch are still caught.
- Default-branch pushes may use the incremental before/after SHA range.
