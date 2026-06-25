# Cursor Bugbot review guide

Use this repository guide when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin prototype.

## Deployment boundary

- This file supplies repository-specific review context. Managed Bugbot enablement still depends on Cursor dashboard or organization settings, GitHub App access for `fjg-thr/hobgoblin-dungeon`, or Admin API credentials.
- After this file is merged to the default branch, verify the managed service with a live PR smoke review when available.
- A PR that adds or changes this file might not be reviewed with the new instructions until after merge.
- Manual review triggers supported by Cursor are top-level PR comments: `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` to request request IDs and detailed logs.

## Project shape

- Next.js App Router, React, TypeScript, and Phaser 4 power a browser game prototype.
- `src/app/page.tsx`, `src/app/layout.tsx`, and `src/app/globals.css` own the DOM shell, metadata, and global styling. The repo does not currently configure Tailwind; prefer existing semantic HTML and CSS patterns unless a PR intentionally adds a styling system.
- `src/game/GameCanvas.tsx` dynamically boots Phaser on the client. Review lifecycle changes for duplicate game instances, cleanup on unmount, resize behavior, and SSR/client boundaries.
- `src/game/scenes/DungeonScene.ts` owns most gameplay behavior. Treat it as high-risk: check input, spawning, combat, pickups, audio, depth ordering, camera, collision, HUD, and game-over/start-state changes together.
- `src/game/assets/manifest.ts` is the runtime asset source of truth, including `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is auxiliary consistency data.

## Review priorities

1. Block runtime regressions that can crash the game, break `next build`, break TypeScript, or make the Phaser scene fail to boot in the browser.
2. Check user-facing gameplay changes against controls, collisions, pickup behavior, enemy pressure, score/ammo/heart HUD, restart flow, sound toggle, and debug overlay behavior.
3. For generated or processed assets, verify matching manifest entries, metadata dimensions, frame counts, public paths, and generator/processor scripts.
4. For metadata or share-image changes, verify the referenced OpenGraph image exists. The current baseline references `/opengraph-image.png`; do not block unrelated PRs solely for that pre-existing mismatch.
5. For dependencies, generated files, and lockfiles, separate intentional changes from incidental churn. Existing `npm ci` audit output includes baseline advisories; do not block unrelated PRs solely on those known advisories unless the PR worsens them.

## Known baseline context

- README says `Space` or `J` fires; current runtime binding in `DungeonScene.ts` uses `SPACE`, plus pointer/click firing. Treat the mismatch as relevant for input or docs PRs, not as a blocker for unrelated changes.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and blast. Current code also unlocks seeker ammo and seeker projectiles after progression thresholds.
- README describes blast as a rare late-game power-up, while current `POWERUP_CONFIG` unlocks it earlier. Flag only PRs that make this docs/code drift worse or claim to resolve power-up progression.

## Asset and audio tooling

- Procedural SFX are generated with `tools/generate_audio_sfx.mjs`.
- The retro dungeon theme is generated with `scripts/generate-retro-soundtrack.mjs`.
- Asset processors under `tools/` create Phaser-friendly sheets and JSON metadata. Review both generated files and their source scripts when a PR changes assets.

## Suggested verification

Use the narrowest commands that prove the PR:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is not reliable for this Next.js 16 baseline. Build or typecheck may rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo`; do not include those generated side effects unless the PR intentionally changes generated typing behavior.

## Review style

- Lead with concrete bugs and behavioral risks, with file and line references.
- Prefer focused findings over broad refactors. This prototype has intentional rough edges; flag issues that affect changed behavior, shipped assets, reviewability, or documented expectations.
- For UI and accessibility changes outside the Phaser canvas, check semantic elements, keyboard access, labels, focus behavior, and responsive layout. For Phaser UI, check pointer zones, keyboard and mouse affordances, text readability, camera scaling, and canvas-specific limitations.
