# Cursor Bugbot review guide

This repository uses Cursor Bugbot for PR review. Managed Bugbot enablement
is configured outside this repo through Cursor/GitHub settings; this file gives
Bugbot project-specific review context after it is merged to the default branch.

## Triggering and deployment checks

- On a PR, run a manual review with a top-level `cursor review` or `bugbot run`
  comment when an automatic review did not appear.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request extra log detail and request IDs.
- Repository changes cannot prove the managed service is enabled. Confirm the
  Cursor dashboard/org setting, GitHub App access to this repo, and a live PR
  smoke review when access is available.

## Review priorities

- Treat this as a Next.js/React/TypeScript app that hosts a Phaser canvas game.
  Favor `npm run build` and `npx tsc --noEmit`; `next lint` is not reliable on
  the current Next version.
- For gameplay changes, review `src/game/scenes/DungeonScene.ts` together with
  assets declared in `src/game/assets/manifest.ts`. Check collisions, depths,
  camera/HUD placement, pause/game-over state, input handling, audio mute state,
  and cleanup of tweens, timers, sprites, and input zones.
- For assets/audio, keep `src/game/assets/manifest.ts` as the runtime source of
  truth. `public/assets/audio/audio-manifest.json` is auxiliary consistency
  data. Generated or processed assets should stay consistent with the relevant
  scripts in `tools/` and `scripts/`.
- For DOM/metadata changes, preserve existing semantic HTML and
  `src/app/globals.css` patterns. This repo does not currently use Tailwind or
  ShadCN.
- Do not block unrelated PRs only for existing dependency audit advisories from
  the current lockfile unless the PR changes dependency or build policy.

## Expected verification

Use the narrowest useful checks for the PR, commonly:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Asset-touching PRs may also need explicit generator/processor scripts, for
example `node tools/generate_audio_sfx.mjs`,
`node scripts/generate-retro-soundtrack.mjs`, `npm run process:assets`,
`npm run process:death-assets`, `npm run process:combat-juice`,
`npm run generate:powerups`, or `npm run generate:combat-assets`.

If verification rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo`,
treat that as generated churn unless the PR intentionally changes Next typing.

## Known baseline mismatches

- README says `Space` or `J` fires; current runtime input binds shooting to
  `SPACE` and pointer/click firing. Only block PRs that touch controls or make
  this mismatch worse.
- README documents quickshot, haste, ward, and blast, but not seeker ammo.
  Current code has seeker ammo and seeker projectiles; review seeker behavior as
  code-defined unless a docs PR is fixing that gap.
- README describes blast as late-game and rare, while code unlocks it earlier.
  Treat this as an existing docs/gameplay mismatch for unrelated PRs.
- Metadata references `/opengraph-image.png`; verify the asset only for PRs
  touching metadata/share-image behavior or introducing related regressions.

## Review style

Lead with concrete bugs, regressions, missing verification, and user-visible
risks. Include file/line references and the smallest reproduction or failing
scenario you can infer. Avoid broad refactor requests unless they directly
reduce risk in the changed code.
