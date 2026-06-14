# Cursor Bugbot Review Guide

Use this repository-local guide when reviewing code for the Hobgoblin Ruin prototype. Managed Bugbot enablement is controlled by Cursor organization settings and GitHub App repository access; this file only supplies review context for the repo.

## Project shape

- Next.js App Router app in `src/app` with React 19 and TypeScript strict mode.
- `src/game/GameCanvas.tsx` is the browser boundary. Phaser is loaded with dynamic `import()` inside `useEffect`; server components should not import Phaser directly.
- Gameplay lives mainly in `src/game/scenes/DungeonScene.ts`; dungeon generation helpers live in `src/game/maps/startingDungeon.ts`; asset paths and frame metadata live in `src/game/assets/manifest.ts`.
- Global styling is plain CSS in `src/app/globals.css`; this repo does not currently use Tailwind or shadcn/ui.

## High-signal review priorities

1. **Client/server boundaries:** Flag changes that make Phaser, `window`, `document`, or pointer/keyboard APIs execute during server rendering.
2. **Gameplay invariants:** Check movement, collision, camera follow, enemy pressure, finite ammo, pickups, score/life state, and game-over/start-screen resets together. Many regressions show up only after restarting a run.
3. **Input behavior:** Code currently supports WASD/arrow movement, `Space` shooting, pointer aim, and click-to-fire. README mentions `J`, but the scene currently binds shooting to `Space`; treat that as an existing docs/code mismatch unless a PR changes controls.
4. **Power-ups and ammo:** Standard ammo is finite. Seeker ammo unlocks after 4 kills or 30s and uses seeker pickups/projectiles. Power-ups are quickshot, haste, ward, and blast; blast currently unlocks after 2 kills or 16s even though README calls it late/rare.
5. **Asset integrity:** When asset manifests, generated sprites, or audio paths change, verify the referenced files exist under `public/assets/**`, dimensions match frame metadata, and related generator/processor tooling under `tools/` or `scripts/` stays in sync.
6. **Metadata and public files:** `src/app/layout.tsx` references `/opengraph-image.png`; changes to metadata or sharing assets should confirm the public asset remains tracked.
7. **Performance risk:** Be cautious with per-frame allocations, unbounded Phaser GameObjects, timers/listeners not cleaned up on scene shutdown, and expensive pathfinding or collision checks inside `update`.

## Suggested local checks

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- `git diff --check "$(git merge-base HEAD origin/main)"..HEAD`

`npm run lint` currently maps to `next lint`; verify the installed Next CLI supports it before treating lint failures as product-code regressions.

## Manual smoke review

If a browser smoke check is available, start the app, open `http://localhost:3000`, and verify:

- Start screen begins a run and restart works after game over.
- WASD/arrow movement collides with walls/props and camera follows the hobgoblin.
- Mouse aim snaps shots visually; `Space` and click fire; ammo decreases and pickups reload.
- Goblins and brutes spawn, take damage, die, award score, and can damage the player.
- Quickshot, haste, ward, blast, hearts, standard ammo, and seeker ammo behave consistently with their current code-defined unlock rules.
- `SOUND` / `MUTED` toggles music, ambience, and effects.
- `F3` debug overlay can toggle without breaking gameplay.

Do not block unrelated PRs solely for the documented README/code mismatches above; do flag changes that widen or rely on those mismatches without updating docs or tests.
