# Cursor Bugbot Review Guide

Use this file as repository-specific context for Cursor Bugbot and human code
review. The managed Bugbot service itself is enabled outside this repository
through Cursor dashboard settings and the Cursor GitHub App installation.

## Project context

- This is a Next.js App Router prototype for a Phaser-based isometric dungeon
  game.
- App shell: `src/app/`.
- Client Phaser boot: `src/game/GameCanvas.tsx`.
- Main runtime scene: `src/game/scenes/DungeonScene.ts`.
- Dungeon generation: `src/game/maps/startingDungeon.ts`.
- Asset paths and sprite metadata: `src/game/assets/manifest.ts` and
  `public/assets/`.
- The README documents npm-based setup; `package-lock.json` is the primary
  lockfile.

## Review priorities

1. **Client/server boundaries**
   - Flag direct `window`, `document`, Phaser, or browser API usage from server
     components or module scope that can execute during Next.js server rendering.
   - Ensure Phaser imports remain client-safe and game boot code handles async
     cancellation and React unmounts.

2. **Phaser lifecycle**
   - Flag scene, input, timer, tween, audio, event, or DOM listeners that can
     survive scene restart or component unmount.
   - Watch for pools, sprites, graphics, particles, sounds, and arrays that grow
     during repeated play sessions.

3. **Gameplay invariants**
   - Check tile/world coordinate conversions, isometric depth ordering, collision
     bounds, safe spawn distances, pickup caps, health caps, ammo caps,
     cooldowns, and invulnerability windows.
   - Verify destroyed enemies, projectiles, pickups, effects, and UI elements
     leave all owning collections.
   - Check gameplay changes against `README.md`, especially controls, power-up
     behavior, ammo behavior, hearts, scoring, and known limitations. Do not
     block unrelated PRs solely because an existing README/code mismatch remains.

4. **Asset and manifest consistency**
   - Manifest entries must point to existing files in `public/assets/`.
   - Frame sizes, row counts, animation keys, audio keys, and metadata paths must
     agree with the generated sprite-sheet JSON files.
   - Flag case-sensitive path mismatches that may work locally but fail on Linux
     or Vercel.
   - Verify sprite and audio asset changes stay consistent with generator or
     processor tooling in `tools/` and `scripts/`.

5. **Performance in the game loop**
   - Check allocations inside `update`, per-frame pathfinding, unbounded random
     searches, repeated texture creation, excessive text/graphics creation, and
     high-frequency audio playback.

6. **Package and deployment safety**
   - Dependency changes should update `package-lock.json` consistently with
     `package.json`.
   - Do not require `pnpm-lock.yaml` changes unless a PR intentionally switches
     package-manager workflows.
   - For source changes, expect `npm run build` to be run or explain why it was
     not possible.

## Current project facts

- The README documents `Space` or `J` for firing, but the current scene binds
  keyboard shooting to `Space`; pointer/click firing is implemented. Treat this
  as existing context unless a PR intentionally changes controls or docs.
- Seeker ammo is currently code-defined behavior: it unlocks after the configured
  kill/time gate and uses seeker pickups/projectiles, even though README coverage
  may lag behind.
- Blast is implemented as a progression-gated power-up in
  `POWERUP_CONFIG.blast`; review balance changes against both code and docs.

## Expected local checks

Run the narrowest relevant checks for the PR, and prefer these baseline checks
when the change affects app code, assets, or configuration:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check <base>...HEAD
```

`npm run lint` currently maps to `next lint`; if the installed Next.js version no
longer supports that command, report the tooling issue instead of treating it as
an application regression.

## Managed Bugbot enablement checklist

Repository files can provide review guidance, but they cannot prove that Bugbot
is enabled. To complete deployment, confirm outside this PR that:

1. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
2. Bugbot is enabled for this repository in the Cursor dashboard.
3. A pull request review smoke check runs automatically or by an accepted
   trigger comment such as `cursor review` or the currently supported Bugbot
   trigger.
