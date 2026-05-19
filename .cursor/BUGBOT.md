# Cursor Bugbot review guidance

Use this guide when reviewing changes in the Hobgoblin Ruin Prototype repository. Be specific about the file and behavior being reviewed, and prioritize defects that can affect runtime playability, build output, asset loading, or documented player controls.

## Repository context

- This is a Next.js App Router project with a client-only Phaser game mounted from `src/game/GameCanvas.tsx` and rendered by `src/app/page.tsx`.
- Phaser is dynamically imported inside a `"use client"` component. Changes must preserve SSR safety, single game-instance creation, resize behavior, and cleanup via `game.destroy(true)` on unmount.
- Most gameplay state, spawning, combat, HUD, audio, and scene teardown live in `src/game/scenes/DungeonScene.ts`. Review lifecycle changes for lingering timers, tweens, keyboard listeners, pointer handlers, audio nodes, or game objects that survive scene restart/destroy.
- Assets are declared in `src/game/assets/manifest.ts`, stored under `public/assets/**`, and often paired with JSON sprite-sheet metadata. Manifest path, key, frame size, row count, and animation frame changes must stay in sync with files on disk.
- Dungeon generation and tile semantics live in `src/game/maps/startingDungeon.ts`; collision, depth sorting, props, stairs, bridges, and playable tile codes are tightly coupled to scene rendering.

## Review priorities

1. Block changes that break `npm run build`, TypeScript compilation, static asset paths, or production loading under Next.js.
2. Flag React/Next changes that import Phaser or browser globals on the server path, create multiple Phaser instances, or skip unmount cleanup.
3. Check Phaser scene edits for restart-safe state reset, object destruction, input/audio teardown, and HUD/state consistency after game over or replay.
4. Verify gameplay invariants: player health and invulnerability windows, finite standard/seeker ammo, projectile cooldowns, enemy collision/contact damage, power-up durations, score/kill progression, and no-ammo behavior.
5. Inspect generated or processed assets for committed source/output consistency. If a script changes generated files, check the relevant tool in `tools/` or `scripts/` and the affected manifest entries together.
6. For map changes, validate tile codes, collision checks, depth ordering, camera bounds, spawn placement, prop blocking, and paths from player start to reachable rooms/stairs.
7. For UI/audio changes, verify the start screen, game-over flow, mute toggle, HUD panels, life meter, score/ammo displays, and all referenced WAV/PNG/JSON files.

## Known repo-specific edge cases

- `README.md` says `Space` or `J` fires, but the current keyboard binding is `SPACE` only. Treat this as an existing docs/code mismatch unless a change intentionally fixes it; flag edits that widen or rely on the mismatch.
- Seeker ammo currently unlocks from code-defined progression and is not described in the README controls section. Review seeker changes against `DungeonScene.ts`, not only the README.
- The README describes blast as a rare late-game power-up, while current code unlocks blast after early kill/time thresholds. Treat that as an existing mismatch unless the change explicitly resolves it.
- `src/app/layout.tsx` references `/opengraph-image.png`; flag metadata/share-image edits that add, remove, or continue references without matching files under `public/`.
- `npm run lint` currently invokes `next lint`, which is not a valid integrated subcommand with the lockfile-resolved Next.js version. Prefer `npm run build` and `npx tsc --noEmit --incremental false` for automated verification until linting is migrated to an explicit linter setup.
- `next-env.d.ts` can be regenerated during builds. Do not treat build-generated churn as a meaningful source change unless Next/TypeScript config was intentionally changed.

## Suggested verification

For changes touching code, assets, or configuration, request or run the smallest relevant set from:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check
```

For asset-heavy changes, also verify that every path in `src/game/assets/manifest.ts` exists under `public/`, JSON metadata dimensions match the referenced sprite sheets, and affected generator/processor commands in `package.json`, `tools/`, or `scripts/` still match their outputs.

## Review output expectations

- Lead with actionable bugs and regressions, ordered by severity.
- Include file and line references whenever possible.
- Distinguish new defects from known pre-existing mismatches listed above.
- Mention missing verification when risk remains, especially for build, TypeScript, asset loading, or gameplay smoke checks.
