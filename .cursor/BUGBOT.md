# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype. This file gives Bugbot repository-specific context; enabling the managed Bugbot service still happens outside the repo through the Cursor dashboard/GitHub App or the Bugbot Admin API.

## Project context

- This is a Next.js App Router, React, TypeScript, and Phaser game prototype.
- Runtime app code lives in `src/app` and `src/game`.
- The main gameplay surface is `src/game/scenes/DungeonScene.ts`; review changes there for lifecycle cleanup, input handling, camera/depth ordering, collisions, enemy spawning, pickups, audio, and HUD state.
- `src/game/GameCanvas.tsx` owns the React-to-Phaser boundary. Avoid patterns that create multiple Phaser game instances, leak listeners, or access browser-only APIs during server rendering.
- Styling is in `src/app/globals.css`. This repo does not currently use Tailwind, ShadCN, or Radix.

## How Bugbot is deployed

- Cursor Bugbot is not enabled by a GitHub Actions workflow in this repository.
- To enable managed reviews, a Cursor or GitHub organization admin must connect the Cursor GitHub App, grant access to `fjg-thr/hobgoblin-dungeon`, and enable Bugbot for the repo in the Cursor Bugbot dashboard.
- Team admins can also enable the repo with the Bugbot Admin API by posting the repo URL and `enabled: true`.
- Manual PR review triggers supported by Cursor docs include top-level comments containing `cursor review` or `bugbot run`. For setup troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true`.
- A successful repository-side setup can only provide this review context. Confirm actual managed-service enablement by opening or updating a PR and checking that Bugbot posts a review comment.

## Review priorities

1. Block runtime regressions in movement, combat, spawning, pickups, audio, start/game-over flow, and rendering.
2. Block React/Next regressions that break client-only Phaser initialization or the production build.
3. Block asset manifest mismatches that cause Phaser preload failures.
4. Call out missing verification for risky gameplay changes, especially changes to `DungeonScene.ts`.
5. Keep feedback focused on changed behavior. Do not require broad refactors of the large scene unless the PR touches the risky area.

## Source-of-truth files

- Asset preload paths: `src/game/assets/manifest.ts`.
- Main gameplay behavior: `src/game/scenes/DungeonScene.ts`.
- Phaser host component: `src/game/GameCanvas.tsx`.
- Map helpers and generation: `src/game/maps`.
- User-facing docs: `README.md`.
- Asset processing and generation tooling: `tools` and `scripts`.
- Static game assets: `public/assets`.
- `public/assets/audio/audio-manifest.json` is auxiliary. Runtime audio loading should be checked against `assetManifest.audio` in `src/game/assets/manifest.ts`.

## Asset and generated-file rules

- Do not request direct hand edits to generated sprite sheets, processed PNGs, WAV files, or JSON metadata under `public/assets` unless the PR is explicitly about replacing assets.
- Prefer changes to the source manifest, generator, or processor when an asset pipeline bug is involved.
- If a PR changes `src/game/assets/manifest.ts`, verify that the referenced files exist under `public/assets` and that frame dimensions match the corresponding sheet metadata.
- If a PR changes audio loading, verify both the manifest key and the mute/SFX behavior in `DungeonScene.ts`.
- If generated assets are committed, check for matching generator or prompt context when appropriate, but do not block small asset-only PRs only because source prompts are not updated.

## Gameplay review notes

- Keyboard movement uses WASD and arrow keys.
- Current runtime shooting uses `Space` and pointer/click firing. The README also mentions `J`; treat that as an existing docs/runtime mismatch unless the PR intentionally changes controls or documentation.
- The code includes seeker ammo and seeker projectiles even though README coverage may lag behind runtime behavior. Review seeker changes against `DungeonScene.ts`, not README alone.
- README describes blast as late and rare, while current code unlocks blast based on `POWERUP_CONFIG.blast`. Treat that as an existing mismatch unless the PR is about progression tuning or documentation.
- Preserve Phaser cleanup patterns. Event listeners, timers, tweens, and game objects added during scene setup should be removed or allowed to die on scene shutdown.
- Review depth calculations carefully. Isometric layering bugs often appear as sprites drawing above walls, HUD, or effects incorrectly.
- Review input changes for game-start and game-over gates so queued shots, pointer events, debug toggles, and mute controls do not affect inactive states unexpectedly.

## Validation guidance

Prefer these checks for code changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- There is no committed automated test suite at the time of this guide.
- `npm run lint` currently maps to `next lint`, which is not reliable with newer Next versions unless ESLint support is added. Do not require lint to pass unless the PR introduces or repairs lint tooling.
- This package has no `npm start` script. Do not request one unless the PR is adding runtime smoke-test infrastructure.
- If verification creates `tsconfig.tsbuildinfo` or rewrites generated Next typing files such as `next-env.d.ts`, restore or ignore that churn unless the PR intentionally changes TypeScript/Next generated types.

## Feedback style

- Lead with concrete defects that can be reproduced from the diff.
- Include file paths and specific changed behavior in each finding.
- Separate shipped behavior regressions from known baseline gaps in README or tooling.
- Avoid speculative performance advice for the prototype unless it affects frame rate, memory leaks, or production build stability.
- Keep suggestions small and aligned with existing project patterns.
