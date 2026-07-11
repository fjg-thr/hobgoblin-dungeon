# Cursor Bugbot review guidance

Use this repository-specific context when reviewing pull requests for
`fjg-thr/hobgoblin-dungeon`. It improves Bugbot's focus, but it does not prove
the managed Cursor Bugbot service is enabled.

## Deployment boundary

- Repository files provide review instructions only. Confirm managed Bugbot
  enablement in Cursor dashboard/org settings, GitHub App repository access, and
  any Admin API credentials/configuration used by deployment.
- After this lands on the default branch, smoke-check hosted Bugbot on a PR with
  a top-level `cursor review` or `bugbot run` comment.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` and capture the request ID or diagnostic details.
- PRs editing this file may not use the new rules until it is merged.

## Project map

- Next.js App Router / React / TypeScript wraps a Phaser game.
- `src/app/page.tsx` renders the client-only `src/game/GameCanvas.tsx`.
- `GameCanvas` dynamically imports Phaser and `DungeonScene`, creates one game
  instance, and destroys it on unmount. Watch for canvas/listener leaks under
  React strict-mode remounts.
- `src/game/scenes/DungeonScene.ts` owns preload, input, combat, HUD,
  start/how-to-play UI, game-over flow, audio, and debug overlay. Shared state
  spans input, combat, HUD, camera, responsive UI, and restart.
- `src/game/maps/startingDungeon.ts` generates a fresh room-and-corridor map.
- `src/game/assets/manifest.ts` is the runtime asset source of truth. The audio
  manifest JSON is auxiliary and not imported by the scene.
- Styling is plain CSS in `src/app/globals.css`; Tailwind is not configured.
- No tests or CI workflows are present. Prefer build/typecheck evidence for
  source changes.

## Review priorities

### Runtime lifecycle and cleanup

- Scene additions should clean up Phaser objects, tweens, timers, input
  handlers, audio, DOM access, and localStorage across restart/destroy paths.
- Client-only behavior must remain safe for Next.js rendering and dynamic import
  bounds.

### Controls, copy, and accessibility

- Runtime movement uses WASD or arrows. Firing uses Space and pointer/click.
  README mentions `Space` or `J`, but `J` is not bound; do not block unrelated
  PRs for this mismatch.
- When controls change, keep README, start screen, how-to-play copy, and runtime
  bindings in sync.
- `F3` toggles debug overlay. The lower-right `SOUND` / `MUTED` control toggles
  and persists audio mute state.
- Start screen and how-to-play modal are Phaser-rendered. Review compact/tiny
  layouts, close behavior, hit zones, keyboard affordance, and readability.

### Gameplay, progression, and collision

- Initial goblins come from `dungeon.enemyStarts`; more goblins ramp with target
  enemy count. Brutes are gated by `BRUTE_UNLOCK_KILLS` and `BRUTE_UNLOCK_MS`.
- `POWERUP_CONFIG` controls unlock gates, spawn weights, labels, and
  presentation metadata. Durations/effects live in nearby constants and
  collection/combat logic.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast. The
  code also has seeker ammo/projectiles; check docs, HUD, pickup, and balance
  updates when ammo behavior changes.
- Heart pickups restore missing hearts only. Stairs are visual; level transition
  remains a future milestone.
- Collision is simple tile/proximity logic, not full physics. Review camera,
  movement, walls, props, enemy contact, and projectile collision together.

### Assets, metadata, and generation

- Changes to `assetManifest` should match `DungeonScene.preload()` and
  `public/assets`.
- Sprite JSON `metadataPath` entries document layout, but animations rely on
  frame sizes, rows, and generated frame numbers in code. Check dimensions and
  row ordering when art or JSON changes.
- Keep OpenGraph metadata aligned with `public/opengraph-image.png` dimensions
  and alt text.
- Asset tooling spans package scripts plus direct tools for audio SFX,
  pickup-intent effects, soundtrack, goblin, and brute processors. Generated
  binary assets may be absent from sparse checkouts; state that limitation when
  evidence depends on them.

### Dependencies and verification

- `package.json` uses `latest` for Next/React/TypeScript packages; updates can
  pull breaking changes. Phaser is pinned to `4.0.0-rc.4`.
- Both `package-lock.json` and `pnpm-lock.yaml` are tracked; dependency PRs
  should keep relevant lockfiles consistent or explain intentional differences.
- `next lint` is unreliable for this setup. Prefer `npm ci`, `npm run build`,
  and `npx tsc --noEmit --incremental false` for source changes.
- `npm run build` may rewrite `next-env.d.ts`; plain `tsc --noEmit` may create
  `tsconfig.tsbuildinfo`. Do not include generated churn unless intentional.

## Review tone

Prioritize concrete bugs, regressions, data/asset mismatches, leaks,
accessibility or input breakage, and missing verification for risky changes.
Request manual browser/gameplay evidence for Phaser rendering, input,
responsive layout, audio, generated assets, or combat feel when automation
cannot cover the behavior.
