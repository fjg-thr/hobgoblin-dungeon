# Cursor Bugbot Review Guide

Use this file as repository-specific guidance after it is merged to the default
branch. It deploys review context only; managed Bugbot enablement still requires
Cursor dashboard/org settings, Cursor GitHub App repository access, and a live PR
review smoke check.

Manual triggers are top-level PR comments:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true`
- `bugbot run verbose=true`

## Project map

- `src/app/page.tsx` renders the game shell only.
- `src/game/GameCanvas.tsx` is a client component. It dynamically imports
  `phaser` and `src/game/scenes/DungeonScene.ts` inside `useEffect`, creates one
  `Phaser.Game`, and destroys it on unmount.
- `src/game/scenes/DungeonScene.ts` owns gameplay: asset loading, animations,
  controls, collisions, enemies, pickups, audio, HUD, start/game-over states, and
  cleanup.
- `src/game/maps/startingDungeon.ts` owns map generation, tile metadata, and
  blocking rules.
- `src/game/assets/manifest.ts` is the runtime source of truth for game asset
  paths, including `assetManifest.audio`. `public/assets/audio/audio-manifest.json`
  is auxiliary/consistency-only.
- Asset processing and generation tooling lives in both `tools/` and `scripts/`.

## Review priorities

1. **Client/server boundary**
   - Phaser must stay out of server-rendered code paths.
   - New browser-only APIs should be used from client components, effects,
     handlers, or Phaser scene code.
   - Avoid changing `GameCanvas` in ways that can create duplicate games during
     React re-renders or Strict Mode effect cycles.

2. **Phaser lifecycle and cleanup**
   - New inputs, timers, tweens, sounds, generated textures, DOM listeners, and
     pooled objects need clear ownership and cleanup.
   - Restart/game-over paths should reset mutable scene state consistently:
     player health, ammo, seeker ammo, cooldowns, active pickups, enemies,
     projectiles, score, power-up timers, debug state, and audio state.
   - Pointer and keyboard changes should preserve current click-to-fire and
     Space-to-fire behavior unless the PR intentionally changes controls.

3. **Gameplay invariants**
   - Collision and pathing changes should respect `startingDungeon.ts` tile
     blocking rules and map bounds.
   - Projectile, enemy, pickup, and power-up changes should handle lifetime,
     depth ordering, hitboxes, and reset behavior.
   - Review difficulty/progression constants against gameplay docs and HUD text.

4. **Assets and manifests**
   - Runtime-loaded assets need `assetManifest` entries and files under
     `public/assets`.
   - For atlas/spritesheet changes, check that PNGs and JSON metadata stay in
     sync with frame sizes, row order, animation names, and manifest keys.
   - Generated or processed assets should only be committed when they are the
     intentional output of the touched generator/processor.

5. **UI, metadata, and accessibility**
   - This repo does not currently configure Tailwind. Follow semantic markup and
     existing `src/app/globals.css` patterns instead of assuming Tailwind classes.
   - Interactive React UI should use buttons or provide keyboard and screen-reader
     affordances.
   - If metadata/OpenGraph inventory is touched, verify referenced public files
     exist and match metadata dimensions.

## Known baseline mismatches

Do not block unrelated PRs for these existing mismatches, but flag them when a PR
touches the related feature, docs, or assets:

- README says `Space` or `J` fires; runtime currently binds keyboard firing to
  `Space` and supports pointer/click firing.
- README describes blast as rare late-game; runtime unlocks blast after 2 kills
  or 16 seconds.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  runtime also has seeker ammo that unlocks after 4 kills or 30 seconds.
- `src/app/layout.tsx` references `/opengraph-image.png`; verify the public file
  exists when reviewing metadata or public asset inventory changes.

## Suggested verification

Prefer focused checks for the touched files. For broad app/gameplay changes, ask
for:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is not reliable for this Next version unless the project adds a
working lint setup. Next build/typegen may rewrite `next-env.d.ts` and create
`tsconfig.tsbuildinfo`; those generated artifacts should remain clean unless the
PR intentionally changes generated TypeScript metadata.

For asset-heavy PRs, also ask for the relevant generator/processor command from
`package.json`, `tools/`, or `scripts/`, plus a smoke check for missing-asset
errors.

## Review output expectations

- Lead with concrete correctness, regression, security, accessibility, or test
  coverage findings.
- Cite file paths and changed lines when possible.
- Distinguish existing baseline issues from regressions introduced by the PR.
- Avoid broad style-only feedback unless it obscures correctness or maintenance.
- If the change only updates docs/configuration, do not require full gameplay
  smoke testing unless the docs/config affect runtime behavior.
