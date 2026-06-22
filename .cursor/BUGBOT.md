# Cursor Bugbot review guide

Use this file as repository-specific context for Cursor Bugbot reviews. The
managed Bugbot service is enabled outside git through Cursor dashboard/org
settings and GitHub App repository access. This file only supplies review
guidance after it is merged to the default branch; PRs adding or changing this
file may not be reviewed with the new rules.

Manual PR triggers supported by Cursor include top-level comments:
- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for diagnostics
  such as request IDs and extra log detail.

## Project map

- Next.js app shell: `src/app/layout.tsx`, `src/app/page.tsx`,
  `src/app/globals.css`.
- Client-only Phaser boot: `src/game/GameCanvas.tsx`.
- Main game scene and most gameplay logic: `src/game/scenes/DungeonScene.ts`.
- Dungeon generation: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Generated or processed art/audio tooling: `tools/*.mjs`, `tools/*.py`, and
  `scripts/generate-retro-soundtrack.mjs`.
- Runtime static assets: `public/assets/**`. `public/assets/audio/audio-manifest.json`
  is auxiliary; runtime audio loading comes from `assetManifest.audio`.

## Review priorities

1. Preserve the client/server boundary. Phaser must stay behind `"use client"`
   and dynamic imports; avoid importing Phaser from Server Components or Next
   metadata/layout code.
2. For `DungeonScene.ts`, check gameplay regressions around movement,
   collision, camera follow, spawning, enemy contact damage, ammo accounting,
   seeker projectiles, power-ups, score, restart flow, pause/start/game-over
   states, and scene cleanup.
3. For assets, ensure each added runtime asset is referenced by
   `assetManifest`, has the expected public path, and matches the frame sizes
   used by Phaser spritesheets/animations.
4. For audio, confirm mute state gates all SFX/music paths and that scene
   teardown stops loops. Do not treat the auxiliary audio manifest as runtime
   source of truth.
5. For DOM or metadata changes, prefer semantic markup and the existing
   `globals.css` patterns. This repo does not currently use Tailwind or
   shadcn/ui. Phaser canvas UI should still be reviewed for pointer zones,
   keyboard/mouse affordances, readable placement, and resize behavior.
6. For dependency or tooling changes, verify they are necessary for the PR
   scope and do not hide existing baseline audit findings.

## Known baseline context

These are existing conditions on the current baseline. Do not block unrelated
PRs solely for them, but do flag PRs that touch the area and make the mismatch
worse or claim to fix it without doing so.

- `src/app/layout.tsx` references `/opengraph-image.png`, but no matching
  `public/opengraph-image.png` or `src/app/opengraph-image.*` file is present.
- README says `Space` or `J` fires. Current runtime firing is `Space` plus
  pointer/click; scope this to input or control-documentation changes.
- README documents quickshot, haste, ward, blast, ammo, and hearts. Seeker ammo
  and seeker projectiles are code-defined behavior that unlock after pressure,
  but are not documented in README.
- README calls blast a late rare power-up, while `POWERUP_CONFIG.blast`
  unlocks after 2 kills or 16 seconds with comparatively high weight.
- `npm ci` may report existing moderate/high audit findings from current
  dependencies. Do not require unrelated PRs to fix them unless they change
  dependencies or security posture.
- `next dev`, `next build`, or typegen can rewrite `next-env.d.ts`, and
  TypeScript may create `tsconfig.tsbuildinfo`; these should not be committed
  unless the PR intentionally changes generated typing behavior.

## Expected verification

For ordinary code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is not reliable for this Next version in the current project.
Asset-generation PRs should also run the exact relevant script, for example
`npm run process:assets`, `npm run process:death-assets`,
`npm run process:combat-juice`, `npm run generate:powerups`,
`npm run generate:combat-assets`, or
`node scripts/generate-retro-soundtrack.mjs`.

If local verification dirties generated files outside the PR scope, restore or
delete those artifacts before finalizing the branch.
