# Cursor Bugbot Review Guide

Use this file as repository-specific context when reviewing pull requests for the
Hobgoblin Ruin prototype. It does not enable the managed Bugbot service by
itself; Cursor dashboard/org settings, GitHub App repository access, and a live
pull request review smoke check are still required to verify deployment.

## Project shape

- Next.js App Router project with a single public page in `src/app/page.tsx`.
- Phaser is loaded only from the client component in `src/game/GameCanvas.tsx`;
  avoid server-rendering Phaser or importing it from server components.
- Core gameplay lives in `src/game/scenes/DungeonScene.ts`.
- Dungeon topology helpers live in `src/game/maps/startingDungeon.ts`.
- Asset paths and sprite metadata live in `src/game/assets/manifest.ts` and
  files under `public/assets`.
- Local asset/audio generator and processor tooling lives under both `tools/`
  and `scripts/`; generated public assets are intentionally committed.

## Review priorities

1. **Runtime safety for client-only Phaser code**
   - Flag imports or browser globals that can execute during server rendering.
   - Preserve the `useEffect` dynamic import pattern for Phaser bootstrapping.
   - Check cleanup paths when scenes, timers, tweens, sounds, or input handlers
     are added so hot reloads and route transitions do not leak game instances.

2. **Gameplay invariants**
   - Movement, collision, camera follow, depth sorting, and HUD updates should
     remain deterministic enough for a short arcade loop.
   - Enemy, projectile, pickup, and power-up changes should preserve tile-space
     calculations and not mix tile coordinates with screen/world pixels.
   - Ammo is finite. Standard ammo pickups restore staff bolts; seeker ammo is
     unlocked by code after 4 kills or 30 seconds and has separate pickup logic.
   - Current code binds shooting to `Space` and pointer/click firing. The README
     also mentions `J`; treat that as an existing docs/code mismatch unless a PR
     is specifically changing controls or documentation.
   - README describes blast as rare late-game, but current code unlocks blast
     after 2 kills or 16 seconds. Treat that as an existing mismatch unless a PR
     intentionally changes blast progression.

3. **Assets and metadata**
   - When public asset files change, confirm the corresponding manifest entries,
     JSON frame metadata, animation frame ranges, and README asset list remain in
     sync.
   - `src/app/layout.tsx` references `public/opengraph-image.png`; flag changes
     that remove or rename that share-card asset without updating metadata.
   - Keep committed generated assets intentional. Do not request removing public
     PNG/WAV/JSON assets only because they were generated.

4. **User-facing UI and accessibility**
   - React UI is minimal and should stay accessible if new menus, buttons, or
     forms are added.
   - Prefer existing project CSS/Tailwind conventions over introducing a second
     styling system. This repo does not currently use ShadCN components.

5. **Build and dependency hygiene**
   - Prefer `npm ci`, `npm run build`, and `npx tsc --noEmit --incremental false`
     for verification.
   - `npm run lint` currently invokes `next lint`, which is not an integrated
     subcommand under the lockfile-resolved Next version; do not block unrelated
     PRs solely on that known tooling issue.
   - Avoid adding dependencies for small utilities that can be handled with the
     existing Next.js, React, TypeScript, and Phaser stack.

## Suggested review checklist

- Does the PR preserve client/server boundaries and avoid SSR crashes?
- Are Phaser event listeners, timers, tweens, and game objects cleaned up or
  scoped to scene lifecycle methods?
- Do gameplay changes use tile, world, and screen coordinates consistently?
- Are asset manifest entries, public files, and JSON metadata aligned?
- Do README/docs updates reflect actual code behavior, or intentionally document
  an existing mismatch?
- Did verification include build/type checks relevant to the changed files?

## Managed Bugbot deployment boundary

Repository files can provide review context, but they cannot prove that the
managed Cursor Bugbot service is enabled. To verify actual deployment, check:

1. Cursor dashboard or organization settings for Bugbot/code-review enablement.
2. GitHub App installation and repository access for this repository.
3. A live pull request smoke check showing Bugbot posts or prepares a review.
