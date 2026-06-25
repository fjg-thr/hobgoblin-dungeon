# Cursor Bugbot review guide

Use this file as repository-specific context when reviewing Hobgoblin Ruin PRs.
The hosted Cursor Bugbot service is enabled outside the repo through Cursor
dashboard/org settings, GitHub App repository access, or Admin API credentials.
This file only provides review guidance after it is merged to the default branch;
PRs that add or edit this file may not be reviewed with the new rules.

## Manual review triggers

- Run a normal review with a top-level PR comment: `cursor review` or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`
  to request extra request IDs/log context. Treat verbose mode as troubleshooting,
  not as a deeper semantic review.
- If service access cannot be inspected, say so. Verify enablement through Cursor
  settings/GitHub App access and, when possible, a live PR smoke review.

## Project shape

- Next.js/React/TypeScript app with a client-only Phaser game mounted by
  `src/game/GameCanvas.tsx`.
- Core gameplay is in `src/game/scenes/DungeonScene.ts`; map generation lives in
  `src/game/maps/startingDungeon.ts`.
- Runtime asset loading uses `src/game/assets/manifest.ts`, especially
  `assetManifest.audio`. Treat `public/assets/audio/audio-manifest.json` as an
  auxiliary consistency artifact if it is touched.
- Styling is mostly `src/app/globals.css`; there is no Tailwind setup in this
  repo. Use existing CSS patterns unless a PR deliberately adds UI tooling.

## Review priorities

- Gameplay changes: check movement, collision, camera follow, enemy spawning,
  damage invulnerability, ammo, seeker projectiles, powerups, scoring, game over,
  restart, and debug toggles. Watch for Phaser object lifecycle leaks.
- Input/UI changes: current code fires with `SPACE` and pointer/click. README also
  mentions `J`; do not block unrelated PRs solely for that existing mismatch, but
  flag regressions or PRs that touch controls/docs without resolving drift.
- Asset/audio changes: verify paths and dimensions in `assetManifest`, Phaser
  spritesheet frame sizes, public asset names, and generated metadata stay in
  sync. Audio source of truth is `assetManifest.audio`.
- Generator/tooling changes: review `tools/generate_audio_sfx.mjs`,
  `scripts/generate-retro-soundtrack.mjs`, and asset processors for deterministic
  outputs, documented prerequisites, and accidental binary churn.
- Metadata/SEO changes: `src/app/layout.tsx` references `/opengraph-image.png`;
  treat the currently missing asset as baseline unless the PR touches metadata or
  share-image behavior.
- Documentation changes: README currently documents regular ammo, hearts,
  quickshot, haste, ward, and blast, but not seeker ammo. Blast timing also has
  known README/code drift. Scope comments to PRs that affect those areas.

## Verification commands

Prefer these checks for code or guidance changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is not reliable for the current Next baseline. `npm ci` may report
existing audit advisories; do not fail unrelated PRs solely on the current
baseline unless the PR changes dependencies or worsens the advisory set.

For generated asset/audio PRs, also run the explicit script that owns the touched
assets, for example:

```bash
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
```

After local verification, ensure generated Next artifacts such as
`next-env.d.ts` route-import churn and `tsconfig.tsbuildinfo` are intentional or
restored before review conclusions.

## Review style

- Lead with concrete bugs, regressions, missing tests, or deploy blockers.
- Include exact file/line references and reproduction or verification steps.
- Avoid blocking on known baseline drift unless the PR touches the affected area
  or makes it worse.
- Keep comments concise and actionable for a small game prototype.
