# Cursor Bugbot review guide

Use this file as repository-specific context when reviewing pull requests for the Hobgoblin Ruin prototype. This file guides Cursor Bugbot reviews; it does not by itself prove that the hosted Bugbot service is enabled. Hosted enablement still requires Cursor dashboard or team settings, GitHub App access to `fjg-thr/hobgoblin-dungeon`, and a live pull request smoke review. These rules apply after this file is merged to the default branch; a PR that adds or changes this file may not be reviewed with the updated guidance.

Manual review triggers supported by Cursor Bugbot:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true`
- `bugbot run verbose=true`

## Project map

- Next.js app shell: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
- React/Phaser bridge: `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene`, creates a single game instance, and destroys it on unmount.
- Main gameplay scene: `src/game/scenes/DungeonScene.ts` owns preload, animations, world generation, player input, combat, powerups, pickups, UI overlays, audio, game-over flow, and debug rendering.
- Dungeon generation and tile semantics: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`, including `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is auxiliary and should not be treated as the runtime loader source.
- Asset/audio generation or processing tools: `tools/` and `scripts/`.
- Generated/runtime assets: `public/assets/**`.

## Review priorities

### Next.js and React integration

- `GameCanvas` is a client component. Watch for server-side imports of Phaser or direct `window` access outside client-only paths.
- Preserve the single-boot guard in `GameCanvas`: avoid creating duplicate Phaser games during React remounts or strict-mode development behavior.
- Check cleanup for scene/game event listeners, timers, sounds, and mutable refs when lifecycle code changes.
- This repo does not use Tailwind or ShadCN. DOM styling currently lives in `src/app/globals.css`; Phaser UI is canvas-rendered.

### Gameplay and scene state

- `DungeonScene.ts` is large and stateful. Look for regressions in reset paths, game-over cleanup, input lockouts, projectile lifecycles, pooled effects, and HUD text refreshes.
- Movement is tile/world hybrid. Validate changes to tile coordinates, collision bounds, depth sorting, camera follow, and spawn safe-distance checks together.
- Combat balance changes should consider goblin/brute spawn caps, difficulty timers, invulnerability, hit stop, projectile cooldowns, and pickup availability as one system.
- Pointer aiming and click-to-fire share input state with keyboard movement and shooting. Confirm changes do not desynchronize aim, snapped projectile direction, cooldowns, or no-ammo feedback.
- Audio changes should respect mute persistence, browser audio lock behavior, loop cleanup, and the low-volume ambience/music balance.

### Assets and manifests

- Any asset referenced by `assetManifest` should exist in `public/assets` with dimensions and metadata that match the manifest and animation row assumptions.
- When generated sprite sheets or JSON metadata change, verify frame sizes, frames-per-row, row ordering, animation key names, and Phaser preload calls stay aligned.
- If tooling under `tools/` or `scripts/` changes generated assets, review both the generator behavior and the committed generated output.
- Avoid introducing large binary churn unless it is intentional and connected to the PR.

### Documentation and metadata

- README control/gameplay claims should match shipped behavior when a PR edits controls, powerups, pickups, or onboarding text.
- Existing baseline mismatch: README says `Space` or `J` fires, while current runtime keyboard shooting is bound to `Space`; click/pointer firing also works. Do not block unrelated PRs solely for this existing mismatch.
- Existing baseline mismatch: README documents regular ammo, hearts, quickshot, haste, ward, and blast, but not seeker ammo. Current code unlocks seeker ammo after 4 kills or 30 seconds.
- Existing baseline mismatch: README describes blast as rare late-game, while current `POWERUP_CONFIG.blast` unlocks after 2 kills or 16 seconds. Treat this as existing context unless the PR intentionally changes blast progression or docs.
- Existing baseline context: `src/app/layout.tsx` references `/opengraph-image.png`. If metadata or public asset inventory changes, verify that the referenced image exists and remains appropriate.

### Accessibility and UX

- Phaser canvas UI cannot rely on normal DOM accessibility. For changes to menus, buttons, mute controls, start/game-over panels, or onboarding, check keyboard and pointer affordances, visible focus/selection equivalents, and clear instructions.
- Fullscreen canvas layout should continue to resize cleanly and preserve readable HUD placement across small and large viewports.
- DOM-level changes should keep semantic structure in `src/app/page.tsx` and avoid trapping scroll/focus unless the game shell intentionally owns the viewport.

### TypeScript and build safety

- Keep `strict` TypeScript assumptions intact. Avoid `any`, broad casts, or unchecked indexed access in gameplay code unless there is a clear invariant nearby.
- Prefer changing typed manifest/data structures over duplicating string literals across scene code.
- `next lint` is not a reliable verification command for the current Next version in this repo. Prefer build and typecheck commands below.

## Suggested verification

For most PRs, request or run:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For asset/tooling PRs, also run the relevant `npm run process:*`, `npm run generate:*`, or `node`/`python3` script touched by the change when inputs are available.

If verification rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo`, treat those as generated artifacts and do not include them unless the PR intentionally changes generated typing behavior.

## Review output expectations

- Prioritize actionable bugs, regressions, security issues, broken build/typecheck paths, and user-visible gameplay defects.
- Include exact file and line references when possible.
- Separate existing baseline issues from regressions introduced by the PR.
- Avoid style-only comments unless the style issue can lead to a concrete maintainability or correctness problem.
