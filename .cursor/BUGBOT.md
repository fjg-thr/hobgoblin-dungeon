# Bugbot review rules for Hobgoblin Ruin

## Project context

- This is a Next.js App Router project that hosts a client-only Phaser game.
- `src/game/GameCanvas.tsx` owns Phaser bootstrapping and teardown.
- `src/game/scenes/DungeonScene.ts` contains most runtime gameplay state: input, combat,
  spawning, HUD, audio, tweens, timers, and object cleanup.
- `src/game/maps/startingDungeon.ts` owns dungeon generation, tile codes, walkability,
  and prop placement.
- `src/game/assets/manifest.ts` is the source of truth for runtime asset keys, URLs,
  and sprite sheet frame dimensions.

## Review priorities

When reviewing pull requests, prioritize logic bugs, lifecycle leaks, asset drift, and
state inconsistencies over style-only feedback.

### React and Phaser lifecycle

- Treat React Strict Mode double-mount behavior as expected in development.
- Preserve the `GameCanvas.tsx` pattern that guards async Phaser imports and destroys the
  active game instance on unmount.
- Flag any new global, Phaser scene, scale, input, keyboard, timer, or event listener that
  does not have symmetric teardown.
- In `DungeonScene.ts`, listeners registered with `this.scale.on`, `this.input.on`, or
  `this.events.on` should be removed during scene shutdown or by an existing cleanup
  helper.

### Gameplay state and cleanup

- Check `DungeonScene.ts` changes for references left in arrays or sets after sprites,
  text objects, particles, timers, or tweens are destroyed.
- Flag `destroy()` calls that do not also remove related tweens, timers, pooled state, or
  scene references when those references can be reused later.
- Keep restart and new-run flows consistent: `restartGame`, dungeon regeneration, HUD
  reset, enemies, pickups, projectiles, effects, and audio state should not leak across
  runs.
- Gameplay movement, cooldowns, spawning, animation timing, and combat logic should use
  the capped delta time path in `update()` rather than becoming frame-rate dependent.

### Dungeon grid invariants

- Changes to `TileCode`, `PropKind`, blocked tile rules, or generator occupancy rules must
  keep `tileAssetForCode`, `isTileBlocked`, playable tile sets, corridor placement, stairs
  placement, prop filters, and collision behavior aligned.
- Avoid unchecked tile/grid index casts. The project uses `strict` TypeScript settings;
  keep bounds checks explicit around map access.
- Preserve deterministic dungeon generation hooks such as passing a random source into
  `createDungeon`; avoid introducing unthreaded `Math.random()` into code that should be
  reproducible.

### Asset and rendering invariants

- Runtime asset URLs should flow through `src/game/assets/manifest.ts` and should resolve
  from `/assets/...` to files under `public/assets/...`.
- If a sprite sheet layout changes, verify both the manifest frame dimensions and the
  animation frame assumptions in `DungeonScene.ts`.
- Keep pixel-art rendering intact: preserve Phaser pixel-art configuration, nearest-neighbor
  texture handling, and CSS image-rendering behavior when touching rendering setup.
- If generated PNG or JSON assets are committed, ensure the relevant `tools/` or `scripts/`
  pipeline output is consistent with the committed manifest and documentation.

### Next.js and TypeScript

- Keep game-only code behind client boundaries. Phaser should not be imported in server
  components.
- Prefer the existing `@/*` path alias for app imports.
- Do not weaken `strict` TypeScript guarantees with broad `any`, non-null assertions, or
  unchecked casts unless the surrounding invariant is explicit and locally justified.

### Documentation parity

- User-visible gameplay changes should keep `README.md` controls, power-up behavior,
  limitations, and asset notes accurate.
- If a pull request changes how assets are generated or processed, update the documented
  command or workflow that future contributors should run.

## Low-value feedback to avoid

- Do not ask for broad refactors of `DungeonScene.ts` unless the changed code introduces
  a concrete bug or the refactor is necessary to make the change safe.
- Do not flag stylistic alternatives when the existing pattern is consistent and correct.
- Do not suggest adding generic tests where a focused build, type-check, or small targeted
  assertion would better cover the risk in the change.
