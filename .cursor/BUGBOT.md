# Cursor Bugbot review guidance

Use this file as repository-specific context when reviewing pull requests for
`fjg-thr/hobgoblin-dungeon`. It improves Bugbot's review focus, but it does
not prove that the managed Cursor Bugbot service is enabled for the repository.

## Deployment and smoke-check boundary

- Repository files can only provide review instructions. Confirm managed
  Bugbot enablement outside this repo through Cursor dashboard or org settings,
  GitHub App repository access, and any Admin API credentials/configuration that
  the deployment uses.
- After this file is merged to the default branch, smoke-check Bugbot on a pull
  request with a top-level comment such as `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` and capture the request ID or diagnostic details.
- A pull request that adds or edits this file may not be reviewed with the new
  rules until the file lands on the default branch.

## Project shape

- This is a Next.js App Router / React / TypeScript prototype for a Phaser game.
- `src/app/page.tsx` renders the client-only `GameCanvas` wrapper.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene`,
  creates one Phaser game instance, and destroys it on unmount.
- Most runtime behavior lives in `src/game/scenes/DungeonScene.ts`: preload,
  input, combat, HUD, start/how-to-play UI, game-over flow, audio, and debug
  overlay.
- Dungeon generation is in `src/game/maps/startingDungeon.ts`; each new run
  creates a fresh room-and-corridor map.
- Runtime asset loading is driven by `src/game/assets/manifest.ts`. Treat
  `assetManifest` as the source of truth for loaded image, spritesheet, audio,
  UI, pickup, projectile, and tile assets.
- `public/assets/audio/audio-manifest.json` is auxiliary. It is not imported by
  the runtime scene, so changes there should usually be mirrored in
  `src/game/assets/manifest.ts`.
- Styling is plain CSS in `src/app/globals.css`; Tailwind is not configured.
- There are no automated tests or CI workflows in the repo at the time of this
  guidance. Prefer build/typecheck evidence for source changes.

## High-priority review areas

### Phaser lifecycle and React integration

- Verify that Phaser game creation/destruction in `GameCanvas` remains
  client-only and does not leak canvases, listeners, timers, or scene state
  across React strict-mode remounts.
- Scene-level additions in `DungeonScene.ts` should clean up Phaser objects,
  tweens, timers, keyboard handlers, pointer handlers, audio objects, and DOM or
  localStorage interactions when restarting or destroying the scene.
- Be careful with edits to the monolithic `DungeonScene.ts`; input, combat,
  HUD, camera, responsive UI, and restart flow often share state.

### Controls, docs, and in-game copy

- Runtime movement uses WASD or arrow keys. Runtime firing uses Space and
  pointer/click firing. The README currently mentions `Space` or `J`, but `J`
  is not bound in runtime input; only block unrelated PRs if they make this
  mismatch worse or touch controls/docs where it should be fixed.
- Keep README controls, start screen text, how-to-play modal copy, and runtime
  input bindings in sync when any of them change.
- `F3` toggles the debug overlay. The lower-right `SOUND` / `MUTED` button
  toggles game audio and persists the mute setting.
- The start screen and how-to-play modal are Phaser-rendered. Review compact and
  tiny viewport branches, close behavior, pointer hit zones, keyboard affordance,
  and text readability after UI changes.

### Gameplay state, progression, and balance

- Initial goblins are seeded from `dungeon.enemyStarts`; additional goblins ramp
  with target enemy count. Brutes are gated by `BRUTE_UNLOCK_KILLS` and
  `BRUTE_UNLOCK_MS`. Do not assume all enemies are progression-gated.
- `POWERUP_CONFIG` controls power-up unlock gates, spawn weights, labels, and
  presentation metadata. Durations and effects live in nearby constants and
  collection/combat logic, such as quickshot, haste, ward, and blast handling.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. The code also contains seeker ammo/projectile behavior. If a PR touches
  ammo, HUD, pickups, or docs, check whether seeker behavior needs copy or
  balance updates.
- Heart pickups restore missing hearts and do not increase max health. Stairs
  exist visually but level transition is still a known future milestone.
- Collision is intentionally simple tile/proximity logic, not a full physics
  system. Review camera, movement, wall, prop, enemy-contact, and projectile
  collision changes together.

### Assets, manifests, and generated content

- Any change to `src/game/assets/manifest.ts` should be checked against
  `DungeonScene.preload()` and actual files under `public/assets`.
- Sprite JSON `metadataPath` entries document sheet layout, but runtime
  animations rely on hardcoded frame sizes, rows, and generated frame numbers.
  Check frame dimensions and row ordering whenever source art or JSON metadata
  changes.
- Keep OpenGraph/social metadata in `src/app/layout.tsx` aligned with
  `public/opengraph-image.png` dimensions and alt text when share assets change.
- Asset generation tools are split across `tools/` and `scripts/`. Relevant
  commands include:
  - `npm run process:assets`
  - `npm run process:death-assets`
  - `npm run process:combat-juice`
  - `npm run generate:powerups`
  - `npm run generate:combat-assets`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
- Generated binary assets may be absent from some sparse/materialized checkouts.
  If review evidence depends on them, state the checkout limitation explicitly.

### Dependencies and tooling

- `package.json` uses `next`, `react`, `react-dom`, TypeScript, and React type
  packages as `latest`; dependency updates can pull breaking changes. Phaser is
  pinned to a release candidate and should be treated carefully.
- Both `package-lock.json` and `pnpm-lock.yaml` are tracked. Dependency PRs
  should keep the relevant lockfiles consistent or clearly explain why one is
  intentionally unchanged.
- `next lint` is not reliable for this Next version/setup. For source changes,
  prefer:
  - `npm ci`
  - `npm run build`
  - `npx tsc --noEmit --incremental false`
- `npm run build` can rewrite `next-env.d.ts`; do not include that generated
  churn unless the PR intentionally changes Next typing behavior.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because incremental
  compilation is enabled; prefer `--incremental false` and remove generated
  artifacts if they appear.

## Review tone and blocking threshold

- Prioritize concrete bugs, regressions, data/asset mismatches, resource leaks,
  accessibility or input breakage, and missing verification for risky changes.
- Do not block unrelated PRs solely because of known existing limitations
  documented above, such as the missing `J` key binding, no level transition, or
  lack of a test runner.
- Ask for manual browser/gameplay evidence when changes affect Phaser rendering,
  input, responsive layout, audio, generated assets, or combat feel and automated
  evidence cannot cover the behavior.
