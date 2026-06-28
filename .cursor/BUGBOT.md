# Cursor Bugbot review guidance

Use this file as repository-specific context when reviewing pull requests for
`fjg-thr/hobgoblin-dungeon`, a Next.js React app that mounts a Phaser dungeon
prototype.

## Managed service boundary

- This file only gives Bugbot repository review guidance. It does not prove that
  the managed Cursor Bugbot service is enabled.
- To verify deployment outside Git, confirm Cursor dashboard or organization
  settings, GitHub App repository access, any Admin API credentials used by the
  deployment, and a pull request smoke check.
- After this file reaches the default branch, a top-level PR comment of
  `cursor review` or `bugbot run` should request a review. Use
  `cursor review verbose=true` or `bugbot run verbose=true` only when diagnostic
  request IDs or extra troubleshooting details are needed.

## Project map

- `src/app/layout.tsx` defines metadata and the Open Graph image reference.
- `src/app/page.tsx` renders the game shell.
- `src/game/GameCanvas.tsx` lazily imports Phaser on the client and owns the
  Phaser game lifecycle.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, input, HUD, audio,
  power-up, enemy, projectile, and debug-overlay behavior.
- `src/game/maps/startingDungeon.ts` builds the room and corridor map.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets that
  Phaser loads, including audio.
- `public/assets/audio/audio-manifest.json` is auxiliary; do not treat it as the
  runtime loader source if it disagrees with `assetManifest.audio`.

## Review priorities

1. Runtime regressions in `DungeonScene.ts`, especially input, camera resize,
   projectile lifecycles, enemy spawning, pickups, power-ups, collision, HUD
   depth/scroll factors, mute persistence, and scene cleanup.
2. Client/server boundaries in the Next app. Phaser must stay client-only; avoid
   importing `phaser` from server components or metadata code.
3. Asset manifest consistency. New runtime assets should be present under
   `public/assets`, referenced from `assetManifest`, and loaded with matching
   frame sizes and animation row assumptions.
4. Generated asset workflows. If a PR changes generated sprites or audio, check
   the corresponding tool or script and the committed output together.
5. User-facing docs and metadata. Verify README control/power-up text,
   `src/app/layout.tsx` metadata, and `public/opengraph-image.png` when touched.
6. Browser UX for the Phaser canvas: responsive placement, pointer zones,
   keyboard/mouse affordances, and visible state for overlays and interactive
   controls. This repo does not currently use Tailwind.

## Known baseline mismatches

- README says `Space` or `J` fires, but the current scene binds keyboard firing
  to `Space` and supports pointer/click firing. Flag this only for PRs changing
  input handling or control docs, not unrelated PRs.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. Current code also has seeker ammo unlocked by progression thresholds.
  Review seeker behavior against code unless a PR updates docs intentionally.
- README describes blast as rare late-game, while `POWERUP_CONFIG` currently
  unlocks blast earlier. Treat that as existing drift unless the PR touches
  power-up tuning or documentation.

## Asset tooling to consider

- `tools/process_assets.py`
- `tools/process_actor_death_assets.mjs`
- `tools/process_combat_juice_assets.mjs`
- `tools/process_corporate_goblin_assets.py`
- `tools/process_gpt_tile_powerup_assets.mjs`
- `tools/process_pickup_intent_effect_assets.mjs`
- `tools/process_spreadsheet_brute_assets.py`
- `tools/generate_audio_sfx.mjs`
- `tools/generate_polish_sprites.mjs`
- `tools/generate_powerup_sprites.mjs`
- `tools/generate_brute_ammo_sprites.mjs`
- `scripts/generate-retro-soundtrack.mjs`

## Suggested verification

Prefer focused verification based on the changed files. For broad app or asset
changes, ask for or run:

```bash
npm ci
npm audit --omit=dev
npx tsc --noEmit --incremental false
npm run build
pnpm install --frozen-lockfile
pnpm audit --prod
pnpm exec tsc --noEmit --incremental false
pnpm run build
git diff --check
test -f public/opengraph-image.png
```

If verification rewrites generated Next typing files such as `next-env.d.ts`,
make sure the diff is intentional before accepting it.
