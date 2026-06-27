# Cursor Bugbot review guide

Use this file as repository-specific context when reviewing pull requests for
`fjg-thr/hobgoblin-dungeon`. The managed Bugbot service must still be enabled
outside this repo through Cursor/GitHub settings. This file only gives the
reviewer project context after it lands on the default branch.

## Managed-service checks

- Confirm Bugbot is enabled in the Cursor dashboard or organization settings.
- Confirm the Cursor GitHub App has access to this repository.
- If an Admin API or team-level configuration is used, confirm those credentials
  and repository mappings outside this checkout.
- A live smoke check can be requested on a GitHub PR with a top-level comment:
  `cursor review` or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` and inspect the returned request details.

If those external checks are unavailable, state that repository files can only
provide review guidance and cannot prove managed Bugbot enablement.

## Project shape

- Next.js app shell: `src/app/page.tsx`, `src/app/layout.tsx`, and
  `src/app/globals.css`.
- React/Phaser bridge: `src/game/GameCanvas.tsx`.
- Main runtime scene: `src/game/scenes/DungeonScene.ts`.
- Dungeon layout helper: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Static assets live under `public/assets/**`.
- Asset/audio generators and processors live in `tools/**` and
  `scripts/generate-retro-soundtrack.mjs`.

There is no Tailwind or shadcn setup in this repo. For DOM UI, follow existing
semantic markup and `globals.css` patterns. For Phaser UI, review canvas
placement, pointer zones, keyboard/mouse affordances, and responsive behavior.

## Review priorities

1. Runtime correctness in `DungeonScene.ts`: scene lifecycle, timers, keyboard
   listeners, pointer input, projectile/enemy cleanup, health/ammo state, and
   game-over/reset behavior.
2. Asset consistency: additions in `public/assets/**` should be reflected in
   `src/game/assets/manifest.ts` when they are loaded at runtime. Auxiliary
   manifests are not the runtime source of truth.
3. Generated assets: if a PR changes generated PNG/JSON/WAV assets, check that
   the relevant generator or processor is updated or documented. Useful commands
   include `python3 tools/process_assets.py`,
   `node tools/process_actor_death_assets.mjs`,
   `node tools/process_combat_juice_assets.mjs`,
   `python3 tools/process_corporate_goblin_assets.py`,
   `node tools/process_gpt_tile_powerup_assets.mjs`,
   `node tools/process_pickup_intent_effect_assets.mjs`,
   `python3 tools/process_spreadsheet_brute_assets.py`,
   `node tools/generate_audio_sfx.mjs`,
   `node tools/generate_brute_ammo_sprites.mjs`,
   `node tools/generate_polish_sprites.mjs`,
   `node tools/generate_powerup_sprites.mjs`, and
   `node scripts/generate-retro-soundtrack.mjs`.
4. Next.js metadata: keep `src/app/layout.tsx` metadata consistent with tracked
   share assets such as `public/opengraph-image.png`.
5. UX/accessibility: DOM controls need normal accessibility review. Phaser
   interactions should still be checked for discoverability, input parity, and
   behavior on small screens even when the canvas cannot expose every semantic
   affordance.

## Current baseline caveats

Do not block unrelated PRs solely for these existing mismatches. Do flag them
when a PR touches the relevant area or claims to fix docs/gameplay parity.

- README says `Space` or `J` fires. Current runtime keyboard firing is `Space`;
  pointer/click firing also works.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  not seeker ammo. Current code includes seeker ammo progression.
- README describes blast as rare late-game, while current `POWERUP_CONFIG`
  unlocks it earlier than that phrasing implies.
- Dependency audit warnings may exist in the current lockfile baseline. Do not
  fail unrelated PRs solely for pre-existing advisories; do flag new or worsened
  dependency risk.
- `next lint` is not reliable with the current Next version in this project.

## Suggested verification

Use checks appropriate to the PR scope. For most code changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For asset-processing changes, also run the exact generator or processor touched
by the PR and verify generated files are intentionally updated.

Next.js may rewrite generated typing files such as `next-env.d.ts` while running
dev/build/typegen commands. Treat generated churn as suspicious unless the PR is
explicitly changing Next typing behavior.
