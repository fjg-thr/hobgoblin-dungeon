# Cursor Bugbot review guidance

Use this repository-specific context when reviewing pull requests for the
Hobgoblin Ruin prototype. The managed Cursor Bugbot service must still be
enabled outside git through Cursor dashboard/org settings and GitHub App
repository access. This file only supplies review instructions after it is
merged to the default branch; a PR that adds or edits this file might not be
reviewed with these updated rules.

Manual top-level PR triggers that maintainers can use are `cursor review` or
`bugbot run`. For diagnostics, use `cursor review verbose=true` or
`bugbot run verbose=true` to include request IDs and additional log detail.

## Project map

- App shell: `src/app/layout.tsx`, `src/app/page.tsx`, and
  `src/game/GameCanvas.tsx`.
- Main gameplay scene: `src/game/scenes/DungeonScene.ts`.
- Map generation/collision source: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`; this is what
  `DungeonScene` loads. `public/assets/audio/audio-manifest.json` is auxiliary.
- Generated/processed asset tooling: `tools/process_assets.py`,
  `tools/process_actor_death_assets.mjs`, `tools/process_combat_juice_assets.mjs`,
  `tools/process_pickup_intent_effect_assets.mjs`,
  `tools/process_gpt_tile_powerup_assets.mjs`,
  `tools/process_corporate_goblin_assets.py`,
  `tools/process_spreadsheet_brute_assets.py`,
  `tools/generate_powerup_sprites.mjs`, `tools/generate_polish_sprites.mjs`,
  `tools/generate_brute_ammo_sprites.mjs`, `tools/generate_audio_sfx.mjs`,
  and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

1. Preserve deterministic-feeling Phaser gameplay. Check movement, collision,
   camera follow, hit stop, invulnerability windows, projectile cleanup,
   enemy respawns, pickup despawns, audio mute state, and scene shutdown
   handler cleanup.
2. Treat `DungeonScene.ts` as high-risk because it owns most runtime state.
   Favor small, typed helpers and verify new state is reset during run restart
   and scene shutdown paths.
3. For asset/audio changes, require manifest paths, frame sizes, animation row
   math, generated metadata, and public file names to stay in sync. Avoid
   committing accidental source-machine absolute paths in generated JSON or docs.
4. For Next/React changes, preserve the client-only Phaser boundary in
   `GameCanvas.tsx`, keep SSR-safe browser access, and keep metadata/share-image
   paths valid.
5. This repo currently does not configure Tailwind or shadcn. For DOM UI, follow
   existing semantic HTML and `src/app/globals.css` patterns. For Phaser UI,
   review pointer zones, keyboard/mouse affordances, responsive placement, and
   canvas accessibility limitations.
6. Keep dependency and tooling hardening scoped. Existing lockfile advisories may
   appear during `npm ci`; do not block unrelated PRs solely on the current audit
   baseline unless the PR changes dependencies or security posture.

## Known baseline context

- `src/app/layout.tsx` references `/opengraph-image.png`; if the file is absent
  on a branch, treat it as existing metadata baseline unless the PR touches
  metadata/share-image behavior or worsens it.
- README says `Space` or `J` fires, but current runtime input binds shooting to
  `Space` plus pointer/click only. Block PRs that expand or document controls
  incorrectly; do not block unrelated PRs solely for this mismatch.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  seeker ammo/projectiles unlock in code after 4 kills or 30 seconds. Use code
  behavior as source of truth unless a PR intentionally changes docs/gameplay.
- README describes blast as rare late-game, while `POWERUP_CONFIG.blast` unlocks
  after 2 kills or 16 seconds. Treat this as existing docs/code drift unless a PR
  modifies power-up progression.
- `next build` or `next dev` can rewrite `next-env.d.ts`, and type checking can
  create `tsconfig.tsbuildinfo`. These generated artifacts should be restored or
  deleted unless the PR intentionally changes Next generated typing behavior.

## Suggested verification

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- For asset generator changes, run the touched explicit script(s), such as
  `npm run process:assets`, `npm run process:death-assets`,
  `npm run process:combat-juice`, `npm run generate:powerups`,
  `npm run generate:combat-assets`, or
  `node tools/generate_audio_sfx.mjs`, or
  `node scripts/generate-retro-soundtrack.mjs`.
- When practical, smoke-test locally: start the game, begin a run, move with
  WASD/arrows, aim with mouse, fire with Space/click, collect ammo/powerups,
  toggle sound, trigger game over/restart, and verify F3 debug overlay.
