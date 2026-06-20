# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. The project is a
Next.js/React/TypeScript prototype that hosts a Phaser 4 dungeon game.

## Repository shape

- `src/app/page.tsx` and `src/game/GameCanvas.tsx` mount the client-side Phaser
  game in the Next.js app shell.
- `src/game/scenes/DungeonScene.ts` owns most gameplay behavior: player input,
  enemy spawning, collision checks, combat, pickups, HUD, audio state, and Phaser
  scene lifecycle.
- `src/game/maps/startingDungeon.ts` defines map generation and tile metadata.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets loaded
  by the Phaser scene, including audio. `public/assets/audio/audio-manifest.json`
  is auxiliary and should not be treated as the runtime manifest.
- Generated/processed asset tooling lives in both `tools/` and `scripts/`.
  Review tool changes together with the generated sprite/audio assets they are
  intended to update.

## Review priorities

1. **Runtime stability**
   - Check Phaser lifecycle changes for event/listener/timer cleanup on scene
     shutdown and restart.
   - Watch for browser-only APIs being used during server rendering. Components
     that touch Phaser, `window`, or the DOM should remain client-side.
   - Confirm asset keys and frame names match the JSON manifests before they are
     referenced in scene code.

2. **Gameplay behavior**
   - Verify movement, aiming, firing, damage, pickups, enemy spawning, scoring,
     restart, mute, and debug toggles after changes near `DungeonScene.ts`.
   - Treat the scene as stateful: look for stale timers, unbounded arrays, leaked
     tweens, missing object destruction, or state that is not reset between runs.
   - For collision or map-generation changes, check both tile placement and
     world/pixel coordinate conversions.

3. **Asset and audio consistency**
   - If a sprite sheet, JSON atlas, or audio file changes, confirm corresponding
     manifest entries and runtime loading paths are updated.
   - If generator scripts change, check that generated dimensions, frame sizes,
     and filenames still match the consuming Phaser code.
   - Avoid blocking unrelated PRs on existing first-pass generated-art quality.

4. **Next.js and React integration**
   - Keep the Phaser canvas isolated from server components.
   - Review `src/app/layout.tsx`, metadata, and `src/app/globals.css` changes for
     semantic HTML, responsive layout, and existing CSS patterns. This repo does
     not currently configure Tailwind or ShadCN.
   - If `next-env.d.ts` is rewritten by Next.js verification, treat it as generated
     churn unless the PR intentionally changes Next typing behavior.

5. **Documentation and user-facing accuracy**
   - Flag README/control changes that diverge from the implemented controls.
   - Current baseline mismatch: README says `Space` or `J` fires, but runtime
     keyboard firing is `Space`; pointer/click firing also works. Do not block
     unrelated PRs solely for this pre-existing mismatch.
   - Current baseline mismatch: README describes blast as rare late-game, while
     current code unlocks blast earlier via `POWERUP_CONFIG.blast`. Scope this to
     docs/gameplay PRs.
   - Current baseline mismatch: seeker ammo exists in code but is not described in
     README gameplay docs. Scope this to docs/gameplay PRs.

## Suggested verification

For most code changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `next lint` is not reliable for this repo's current Next.js version; prefer the
  build and TypeScript checks above.
- `npm ci` may report existing audit findings. Do not fail unrelated PRs solely
  for baseline advisories unless dependencies are changed or the PR claims to fix
  them.
- After verification, check for generated file churn, especially `next-env.d.ts`
  and `tsconfig.tsbuildinfo`.

For gameplay changes, ask for or perform a browser smoke test covering:

- Start screen to gameplay transition.
- WASD/arrow movement and mouse aiming.
- `Space` firing and click-to-fire.
- Ammo pickup, heart pickup, and visible power-up behavior.
- Enemy contact damage, ward protection if touched, game over, and restart.
- Sound mute toggle and `F3` debug overlay when relevant.

## Managed Bugbot deployment boundaries

This file provides repository-specific review context for Cursor Bugbot after it
is merged to the default branch. Enabling the hosted Bugbot service itself is done
outside the repository through Cursor dashboard/org settings and GitHub App
repository access.

When validating deployment, confirm:

- Cursor Bugbot is enabled for the organization/repository in Cursor settings.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- A pull request receives a Bugbot review automatically or by a top-level comment:
  `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` when available.

If you only have repository access, do not claim hosted Bugbot is fully enabled.
You can verify only that this guidance file is present and ready to be consumed
once the managed service is enabled.
