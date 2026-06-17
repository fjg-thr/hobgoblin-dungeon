# Hobgoblin Ruin Bugbot review guide

Use this guide when reviewing pull requests for this repository.

## Project shape

- Next.js App Router shell with a client-only Phaser game mount in `src/game/GameCanvas.tsx`.
- Phaser gameplay is concentrated in `src/game/scenes/DungeonScene.ts`.
- Procedural dungeon generation and collision tile rules live in `src/game/maps/startingDungeon.ts`.
- Runtime asset keys and paths are centralized in `src/game/assets/manifest.ts`.

## Validation commands

Run these before approving gameplay, UI, asset-manifest, or dependency changes:

```bash
npm install
npm run lint
npm run build
npx tsc --noEmit
```

There is no automated test script in `package.json`, so use the manual smoke checklist for gameplay changes.

Asset generation commands are only relevant when asset tooling or source assets change:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
```

## High-risk review areas

- `src/game/scenes/DungeonScene.ts`: movement, combat, spawning, HUD, menus, audio, restart paths, and performance effects all interact here.
- `src/game/maps/startingDungeon.ts`: map generation and `isTileBlocked()` affect movement, enemy pathing, projectile collision, and spawn safety.
- `src/game/GameCanvas.tsx`: dynamic Phaser import and lifecycle cleanup must stay safe under React Strict Mode remounts.
- `src/game/assets/manifest.ts`: asset key, path, frame size, or sheet layout drift can break preloading and animations.
- Restart/state reset paths: new run state must be reset consistently when starting, dying, and restarting.
- Animation frame math: hardcoded frame offsets must match the sprite sheet JSON and PNG layout.

## Generated assets and low-signal files

Do not treat generated media as hand-written source:

- `public/assets/**/*.png`
- `public/assets/**/*.wav`
- `public/assets/**/*-sprite-sheet.json`
- `public/assets/source/**`

Review the code and manifest changes that consume these assets instead of reviewing pixel/audio contents directly. Lockfile-only churn is low signal unless dependencies intentionally changed.

## Gameplay invariants to protect

- Hearts cap at 3; heart pickups restore missing hearts but do not increase max health.
- Standard ammo starts at 14 and caps at 24; firing consumes ammo; empty fire should show the "NO AMMO" feedback.
- Seeker ammo unlocks after the intended kill/time gate and stays separate from standard ammo.
- Ward blocks contact damage for its active window and gives player feedback when it absorbs a hit.
- Blast power-up charges the next shot and detonates on impact without also applying unintended direct-hit damage.
- Power-up spawn weighting and gates should preserve progression from quickshot to haste, ward, and blast.
- Enemy pressure should respect caps for total enemies and brutes.
- Contact damage should remain close-range only and respect the player invulnerability window.
- Collision rules should keep walls, empty space, chasms, and prop blockers solid while floors and bridges remain walkable.
- Mouse aim should keep 15-degree snapping and fall back to facing direction when the pointer is too close.
- Hit-stop should not permanently pause timers, enemy behavior, projectiles, tweens, or restart flows.
- The staircase is currently visual only; lack of level transition is a known limitation, not a regression.
- Mute state persists through `localStorage` key `hobgoblin-dungeon-muted`.

## Accessibility and UX review notes

- The game UI is canvas-only; watch for PRs that further reduce keyboard access or focus visibility.
- Start, restart, mute, and how-to-play interactions are pointer-driven; flag claims of keyboard accessibility unless the code implements it.
- Damage, power-up, and status feedback relies heavily on tint, flash, shake, and motion. Prefer changes that preserve readable text feedback and avoid excessive motion.
- Verify resize behavior for HUD placement, modal panels, the custom cursor, and the mute button.
- README currently mentions `J` as a fire key, while the gameplay code binds Space; flag documentation/control drift when related files change.

## Performance review notes

- `DungeonScene.update()` is frame-critical; avoid adding allocations, broad searches, or unbounded loops there.
- Keep `MAX_SIMULATION_DT`-style delta clamping and hit-stop timing safeguards intact.
- Enemy path recalculation, vignette/focus mask redraws, damage numbers, combat particles, and infinite tweens all need caps or cleanup on restart.
- Keep pixel-art rendering crisp; do not enable texture smoothing in the gameplay path without a deliberate visual change.
- Watch for Phaser objects, timers, tweens, keyboard handlers, or DOM listeners that are created repeatedly without cleanup.

## Manual smoke checklist

For gameplay changes, manually verify:

1. Start a run, move, fire, take damage, die, and restart into a fresh dungeon.
2. Movement collision around walls, props, bridges, and chasm edges.
3. Ammo depletion, "NO AMMO" feedback, ammo pickup, and seeker unlock behavior.
4. Each power-up effect, especially ward blocking damage and blast clearing nearby enemies.
5. Enemy spawning, death, score updates, and pressure ramp.
6. Window resize on start, playing, how-to-play, mute, and game-over screens.
7. Mute toggle persists after reload.
8. F3 debug overlay toggles without crashing.
