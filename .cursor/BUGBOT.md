# Cursor Bugbot Review Guidance

Use this guide when reviewing pull requests for this repository. It is the
repository-side Bugbot deployment artifact: once it is merged to the default
branch, hosted Cursor Bugbot can use it as project-specific review context.
Managed service enablement still must be confirmed in Cursor organization
settings and GitHub App repository access.

## Bugbot operation

- Review new and updated pull requests against the current diff, not unrelated
  historical cleanup.
- Manual top-level PR comment triggers supported by Cursor include
  `cursor review` and `bugbot run`; verbose troubleshooting can use
  `cursor review verbose=true` or `bugbot run verbose=true`.
- If this file is added or changed in a PR, the new guidance may not affect that
  same PR until it lands on the default branch.
- This checkout does not expose Cursor dashboard or Bugbot admin credentials.
  Verify real deployment through Cursor's dashboard/org setting, GitHub App
  access to `fjg-thr/hobgoblin-dungeon`, and a live PR smoke review.

## Project map

- `src/app/page.tsx` renders the full-screen game shell.
- `src/game/GameCanvas.tsx` is client-only React code. It dynamically imports
  Phaser and `DungeonScene`, creates one Phaser game, and destroys it on React
  unmount.
- `src/game/scenes/DungeonScene.ts` owns most runtime gameplay: preload/create
  flow, HUD, input, enemies, pickups, projectiles, audio, effects, and game
  state. Changes here have the highest regression risk.
- `src/game/maps/startingDungeon.ts` owns procedural room/corridor generation,
  tile codes, blocking rules, and map metadata.
- `src/game/assets/manifest.ts` is the runtime asset and audio source of truth
  loaded by `DungeonScene`.
- `public/assets/**` contains runtime sprites, JSON frame data, audio, and
  generated/source assets. Keep paths in sync with `assetManifest`.
- `tools/**` and `scripts/**` contain asset/audio generation and processing
  utilities. Review generated asset diffs together with the tool changes that
  produced them.
- This app does not currently configure Tailwind. For UI/DOM changes, follow the
  existing semantic markup and `src/app/globals.css` patterns.

## Review priorities

1. Catch runtime breaks in the playable path: start screen, movement, aiming,
   shooting, enemy spawning, pickups, health/game-over, restart, audio toggle,
   and debug overlay.
2. Check browser-only boundaries. Phaser imports and `window`/DOM access should
   stay inside client-only code paths such as `GameCanvas` effects or scene
   methods.
3. Protect Phaser lifecycle cleanup. Avoid creating duplicate games on React
   rerender and preserve `game.destroy(true)` on unmount.
4. Verify asset manifest consistency. Any changed sprite/audio path, frame size,
   sheet row, animation key, or generated JSON should match what
   `DungeonScene` loads.
5. Inspect gameplay constants and timing changes for unintended difficulty
   spikes, impossible pickups, unreachable enemies, or resource starvation.
6. For map/collision changes, check both tile blocking and prop collision boxes.
   The game uses simple tile/proximity checks rather than a full physics system.
7. Treat large `DungeonScene.ts` edits as high risk. Prefer focused findings
   with exact user-visible consequences and reproduction steps.

## Known baseline mismatches

Do not block unrelated PRs solely for these existing issues, but flag them when
a PR touches the related area:

- `README.md` says `Space` or `J` fires. Runtime input currently binds keyboard
  shooting to `SPACE`; pointer/click firing is also supported.
- `README.md` describes blast as a rare late-game power-up. Runtime config
  currently unlocks blast after early kills or elapsed time.
- Runtime seeker ammo exists and unlocks after progression, but the README does
  not document seeker pickups/projectiles.
- `src/app/layout.tsx` references `/opengraph-image.png`, but no
  `opengraph-image.*` file is currently present in the repo.
- `public/assets/audio/audio-manifest.json` may exist as auxiliary inventory, but
  `src/game/assets/manifest.ts` is what the game loads at runtime.

## Suggested verification

Use the smallest command set that matches the diff. For most code/config PRs:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `next lint` is not reliable in this Next 16 project because the script still
  points at the removed `next lint` command.
- `npm ci` may report existing audit findings; do not treat them as introduced
  unless dependencies changed in the PR.
- Next build/typecheck can rewrite generated files such as `next-env.d.ts` or
  create `tsconfig.tsbuildinfo`. Those artifacts should stay out of unrelated
  diffs unless the PR intentionally changes generated typing behavior.
- For gameplay changes, also run the app locally and smoke-test: start screen,
  movement, aim/fire, ammo pickup, enemy hit/kill, damage/death, restart, sound
  toggle, and `F3` debug overlay.

## Finding style

- Lead with concrete bugs, regressions, security issues, or missing tests.
- Include exact file/line references and explain the player/developer impact.
- Avoid speculative style-only comments unless they affect maintainability of
  the touched code.
- Keep known pre-existing issues separate from regressions introduced by the PR.
- If no blocking issues are found, say that clearly and mention any verification
  that could not be performed.
