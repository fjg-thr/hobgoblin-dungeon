# Cursor Bugbot Review Guide

This file gives Cursor Bugbot repository-specific context for reviewing pull
requests in `fjg-thr/hobgoblin-dungeon`. It does not enable the hosted Bugbot
service by itself. Confirm service rollout in Cursor dashboard settings,
GitHub App repository access, and a live pull request smoke review.

## Deployment and trigger checks

- Bugbot should review PRs after this file is merged to the default branch.
  PRs that add or edit this file might not be reviewed with the new guidance.
- Manual review triggers can be posted as a top-level PR comment:
  `cursor review` or `bugbot run`.
- For troubleshooting, use verbose triggers:
  `cursor review verbose=true` or `bugbot run verbose=true`.
- Do not suggest a custom GitHub Actions workflow for Bugbot unless a PR is
  intentionally adding Cursor CLI-based automation and the required secrets.

## Project map

- `src/app/` contains the Next.js App Router shell and global styling.
- `src/game/` contains the Phaser game, including scenes, assets, map logic,
  and React-to-Phaser integration.
- `public/assets/` contains runtime sprite, tile, UI, and audio assets.
- `tools/` and `scripts/` contain local asset and audio generation or
  processing scripts.
- Runtime audio loading is driven by `src/game/assets/manifest.ts`
  (`assetManifest.audio`). `public/assets/audio/audio-manifest.json` is
  auxiliary and should stay consistent when touched.

## Review priorities

1. Catch runtime regressions in `src/game/scenes/DungeonScene.ts`, especially
   player input, projectile behavior, enemy spawning, power-up state, collision
   checks, camera behavior, and scene cleanup.
2. Check React and Phaser lifecycle boundaries. Client-only Phaser code should
   stay out of server-rendered paths, and event listeners/timers should be
   cleaned up when scenes or React components unmount.
3. Verify asset references against committed files. Flag missing sprite sheets,
   JSON metadata, audio files, metadata images, and manifest drift.
4. Keep TypeScript changes type-safe without adding broad `any` casts or
   suppressions. Prefer clear types at Phaser/React boundaries.
5. Preserve the current semantic HTML and `src/app/globals.css` styling
   patterns; this repo does not configure Tailwind.
6. Treat generated build artifacts as untracked output. Do not ask to commit
   `.next/`, `tsconfig.tsbuildinfo`, or generated Next route type output.

## Known repository mismatches

- README controls mention `Space` or `J` for firing, but current runtime input
  binds keyboard firing to `Space` and supports pointer/click firing. Flag this
  only for PRs that intentionally touch controls or docs.
- README documents quickshot, haste, ward, and blast power-ups. The code also
  defines seeker ammo/projectile behavior. Review code-defined seeker behavior
  when related gameplay changes are proposed.
- README describes blast as rare late-game, while current code unlocks blast
  earlier via `POWERUP_CONFIG.blast`. Treat that as existing behavior unless a
  PR explicitly changes progression or documentation.

## Verification guidance

Ask authors to run the smallest relevant checks for their change. For shared
gameplay or app changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm run lint` currently maps to `next lint`, which is not reliable in modern
Next versions unless the project adds supported lint tooling. If verification
rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo`, restore or remove
those generated artifacts before merging unless the PR intentionally changes
Next typing output.

## Review output expectations

- Prioritize concrete bugs, regressions, missing tests/checks, and risky
  behavior changes.
- Include file and line references when possible.
- Do not block unrelated PRs solely for the known README/code mismatches above.
- If managed Bugbot enablement cannot be observed from repository files, state
  that dashboard/GitHub App/PR-smoke verification is still required.
