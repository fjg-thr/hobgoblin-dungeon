# Cursor Bugbot review guide

Repository-specific context for Cursor Bugbot PR reviews.

## Deployment boundary

- Treat this file as the repository-side Bugbot review configuration.
- Managed Bugbot enablement is external to this repo. Confirm it in Cursor
  dashboard/org settings, GitHub App repository access, Admin API credentials
  when used, and live service configuration.
- After this guide lands on the default branch, smoke-test a real pull request
  review. A PR that adds or changes this file may not be reviewed with the new
  rules until after merge.
- Manual triggers are top-level PR comments: `cursor review` or `bugbot run`.
  For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true`.

## Project shape

- Next.js app shell: `src/app/page.tsx`, `src/app/layout.tsx`, and
  `src/app/globals.css`.
- React/Phaser bridge: `src/game/GameCanvas.tsx` dynamically imports Phaser and
  mounts the game once into `.game-shell`.
- Main gameplay implementation: `src/game/scenes/DungeonScene.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`, especially
  `assetManifest.audio`.
- Public assets live under `public/assets/**`. Sprite sidecars must stay in
  sync with generated PNGs.
- Asset tooling includes `tools/process_assets.py`,
  `tools/process_actor_death_assets.mjs`,
  `tools/process_combat_juice_assets.mjs`,
  `tools/process_pickup_intent_effect_assets.mjs`,
  `tools/process_gpt_tile_powerup_assets.mjs`,
  `tools/generate_audio_sfx.mjs`, and
  `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

- Guard the Phaser lifecycle. `GameCanvas` should keep a single game instance,
  destroy it on unmount, and avoid importing Phaser on the server.
- Inspect `DungeonScene.ts` changes for state reset paths, input handling,
  collision, projectile lifetime, pickup collection, enemy cleanup, depth
  ordering, audio teardown, and game-over/start-over transitions.
- Check TypeScript strictness. Prefer existing constants, helpers, and manifest
  entries over duplicate literals.
- For asset changes, verify files exist under `public/assets`, manifest paths
  match, frame dimensions match sidecars, and runtime generated files are
  committed.
- For audio changes, verify `DungeonScene.ts` loads through
  `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is auxiliary
  consistency data, not the runtime source of truth.
- For DOM/metadata/UI changes, follow semantic markup and `src/app/globals.css`
  patterns. Tailwind is not configured. For canvas UI, review pointer zones,
  keyboard/mouse affordances, responsive placement, and accessibility limits of
  Phaser-rendered text.
- Keep generated Next files out of PRs unless intentionally changing framework
  behavior. `next-env.d.ts` can flip between `.next/dev/types/routes.d.ts` and
  `.next/types/routes.d.ts`; `tsconfig.tsbuildinfo` should remain untracked.

## Known baseline caveats

- `README.md` documents firing with `Space` or `J`, but current
  `DungeonScene.ts` binds keyboard firing to `Space` only. Do not block
  unrelated PRs for this existing mismatch; flag PRs that touch controls or
  input docs without resolving or preserving it intentionally.
- The code includes seeker ammo pickups/projectiles after progression
  thresholds, but README gameplay text does not fully document seeker ammo.
  Flag related gameplay-doc drift only when a PR touches seeker behavior, ammo
  systems, HUD text, or controls.
- README describes blast as a rare late-game power-up, while current
  `POWERUP_CONFIG` controls the actual unlock and spawn weighting. Treat this as
  existing drift unless a PR changes power-up progression or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`; the current baseline
  may not include a matching tracked OpenGraph asset. Block only metadata,
  sharing, or public asset PRs that worsen this or claim to fix it without a
  real asset.
- `npm ci` currently reports baseline audit advisories. Do not block unrelated
  PRs solely on the existing audit output, but do flag changes that add new
  vulnerable dependencies or make the baseline worse.

## Verification to request

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- Relevant asset generation or processing command when a PR changes generated
  assets, sidecar metadata, or manifest references.
- Gameplay smoke test: load the app, start a run, move with WASD/arrows, aim
  with pointer, fire with Space and click, collect ammo/power-ups, toggle sound,
  and restart after game over.

## Review style

- Prioritize correctness, shipped behavior, missing assets, lifecycle leaks,
  state-reset bugs, and regressions in controls or combat feel.
- Cite exact files and lines. Separate existing baseline issues from regressions
  introduced by the PR under review.
- Prefer small, actionable findings over broad refactor suggestions.
