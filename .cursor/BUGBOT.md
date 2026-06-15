# Cursor Bugbot review guide

Use this file as repository-specific context when reviewing pull requests for the
Hobgoblin Ruin prototype. It deploys review guidance only; enabling the managed
Cursor Bugbot service still requires Cursor dashboard or organization settings,
GitHub App access to this repository, and a smoke review on a pull request.

## How to run Bugbot

- Automatic reviews depend on the managed Cursor Bugbot integration being
  enabled for `fjg-thr/hobgoblin-dungeon`.
- Manual review triggers can be posted as a top-level pull request comment:
  `cursor review` or `bugbot run`.
- For more diagnostic output, use `cursor review verbose=true` or
  `bugbot run verbose=true`.
- If Bugbot does not appear, first confirm the Cursor dashboard setting, the
  GitHub App repository installation, and whether the pull request comes from a
  branch Bugbot is allowed to inspect.

## Project context

- This is a Next.js/React/TypeScript prototype using Phaser for the playable
  dungeon scene.
- The main gameplay surface is `src/game/scenes/DungeonScene.ts`; it controls
  input, combat, enemy spawning, pickups, audio playback, HUD, start screen, and
  game-over flow.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets loaded
  by Phaser, including audio. `public/assets/audio/audio-manifest.json` is
  auxiliary and should not be treated as the loader source of truth.
- `src/game/maps/startingDungeon.ts` contains map generation and tile/layout
  data used by the scene.
- Generated and processed asset tooling lives in both `tools/` and `scripts/`.
  Examples include sprite processing, power-up generation, combat-juice asset
  generation, pickup intent effects, and retro soundtrack generation.
- The app does not currently configure Tailwind or shadcn/ui. Prefer existing
  semantic markup and `src/app/globals.css` patterns when reviewing UI changes.

## Review priorities

1. **Gameplay correctness:** Check movement, aiming, collision, projectile
   lifetime, enemy damage, pickup collection, power-up state, and game reset
   behavior for regressions.
2. **Runtime asset consistency:** When assets are added or renamed, verify the
   files, sprite-sheet JSON, manifest entries, preload calls, and animation frame
   ranges stay aligned.
3. **Type safety:** Keep TypeScript strictness intact. Avoid broad `any` usage,
   non-null assertions, and casts that hide real state or lifecycle issues.
4. **Phaser lifecycle hygiene:** Watch for leaking timers, tweens, event
   listeners, sprites, audio objects, or graphics between scene restarts.
5. **User-facing controls and accessibility:** Keep the start screen,
   how-to-play modal, mute control, and pointer/keyboard flows usable.
6. **Generated output discipline:** Do not commit local generated artifacts such
   as `.next/` outputs or `tsconfig.tsbuildinfo`.

## Known baseline mismatches

Do not block unrelated pull requests only because of these existing mismatches,
but do call them out when a change touches the relevant behavior or docs.

- README says `Space` or `J` fires. Current runtime keyboard firing is bound to
  `Space`; pointer/click firing also works.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast, but does not document seeker ammo. Current code unlocks seeker ammo
  after the configured kill/time thresholds and uses seeker pickups/projectiles.
- README describes blast as a rare late-game power-up. Current
  `POWERUP_CONFIG.blast` unlocks after 2 kills or 16 seconds with weight 42.
- Some assets are generated first passes. Review changes for consistency and
  runtime correctness before judging art polish.

## Local verification guidance

Recommended commands for meaningful review confidence:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

Notes:

- `next lint` is still listed in `package.json`, but modern Next versions may no
  longer provide that command reliably in this repo. Prefer build plus TypeScript
  checks unless a pull request intentionally changes lint tooling.
- Next build or type generation can rewrite `next-env.d.ts` and create
  `tsconfig.tsbuildinfo`; restore or remove generated artifacts unless the pull
  request intentionally changes generated typing behavior.
- The package currently has no `npm start` script. If runtime smoke testing is
  needed, use an explicit Next start command or add reviewed smoke
  infrastructure in the same pull request.
- Existing dependency audit findings may appear during `npm ci`; distinguish
  pre-existing audit output from new dependency risk introduced by a pull
  request.

## When to request changes

Request changes when a pull request:

- Breaks production build or strict TypeScript checks.
- Adds assets without updating the runtime manifest or loader path.
- Changes gameplay constants or state transitions without matching UI/docs/tests
  or clear intent.
- Leaves behind generated files that should remain local.
- Introduces broad rewrites of `DungeonScene.ts` without preserving scene
  lifecycle cleanup, input behavior, or restart/reset semantics.
- Adds new dependencies, scripts, or workflows without a clear reason tied to
  the feature under review.

## Managed-service boundary

This repository file gives Bugbot context for code review. It cannot prove that
Cursor's managed Bugbot service is enabled. Confirm activation outside the repo
by checking Cursor settings, GitHub App installation access, and a pull request
review smoke test.
