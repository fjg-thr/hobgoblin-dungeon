# Cursor Bugbot review guide

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for the Hobgoblin Ruin Prototype.

## Managed service enablement

- Repository files can provide review instructions only. Confirm Bugbot is
  enabled in Cursor dashboard or org settings, that the GitHub App has access
  to `fjg-thr/hobgoblin-dungeon`, and that any Admin API credentials or service
  configuration used by the organization are active outside this repo.
- These rules apply after this file is merged to the default branch. A PR that
  adds or changes `BUGBOT.md` may need a follow-up PR to smoke-test the new
  instructions.
- For a manual PR smoke check, comment `cursor review` or `bugbot run`. Use
  `cursor review verbose=true` or `bugbot run verbose=true` only when request
  IDs, diagnostic logs, or service troubleshooting detail are needed.

## Review priorities

- Treat `src/game/scenes/DungeonScene.ts` as the main gameplay integration
  point. Review movement, aiming, projectile lifetimes, collision, enemy spawn
  pressure, score/ammo/life state, power-up timers, and Phaser cleanup paths
  together because regressions often cross those boundaries.
- `src/game/GameCanvas.tsx` owns the React/Next.js bridge. Check client-only
  Phaser imports, mount/unmount cleanup, responsive sizing, and duplicated
  canvas creation.
- Runtime audio loads from `assetManifest.audio` in
  `src/game/assets/manifest.ts`. `public/assets/audio/audio-manifest.json` is
  auxiliary consistency data, not the runtime source of truth.
- Asset generator and processor scripts live in `tools/` and `scripts/`.
  Review path, frame-size, and manifest changes with the generated public asset
  metadata they affect.
- For DOM or metadata changes, prefer semantic HTML and existing
  `src/app/globals.css` patterns. This repo does not currently configure
  Tailwind or shadcn/ui. Phaser UI should be reviewed for pointer zones,
  keyboard and mouse affordances, text readability, and responsive placement
  inside the canvas.

## Verification guidance

Ask contributors to run the narrowest relevant checks. For general app or game
changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is not reliable for this Next.js baseline. Build or type-check runs
may rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo`; do not include
that generated churn unless the PR intentionally changes Next typing behavior.

For asset/audio pipeline changes, also run the exact touched generator or
processor, for example:

```bash
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
python3 tools/process_assets.py
```

## Known baseline caveats

- README controls mention `Space` or `J`, but current gameplay binds shooting
  to `Space` plus pointer/click firing. Flag this only for input or docs changes
  that touch the mismatch or make it worse.
- README documents standard ammo and power-ups but not seeker ammo. Current
  code unlocks seeker pickups/projectiles through progression in
  `DungeonScene.ts`; review seeker behavior against code-defined rules.
- README calls blast a rare late-game power-up, while `POWERUP_CONFIG` unlocks
  it earlier. Treat that as existing docs drift unless a PR is meant to fix it.
- `src/app/layout.tsx` references `/opengraph-image.png`, but the image file is
  absent on this baseline. Block only metadata/share-image changes that worsen
  this or claim to fix it without adding the asset.
- `npm ci` may report existing moderate or high audit advisories in the current
  dependency baseline. Do not block unrelated PRs solely on those existing
  advisories; do block dependency changes that introduce new avoidable risk.

## Review style

Prioritize concrete correctness, regression, security, accessibility, and
verification findings. Include file and line references, explain impact, and
avoid broad style nits unless they hide a real maintenance or user-facing risk.
