# Cursor Bugbot review guidance

Use this file as repository-specific context for Cursor Bugbot code reviews. Hosted Bugbot enablement is not controlled by this file alone; it must also be enabled in the Cursor dashboard or organization settings, the Cursor GitHub App must have access to this repository, and a live pull request smoke review should be used when those settings are available. This guidance applies after it is merged to the default branch; a PR adding or editing this file may not be reviewed with the new rules.

## Manual review triggers

On pull requests, maintainers can request a review with a top-level comment:

- `cursor review`
- `bugbot run`

For troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true` to request extra diagnostics, request IDs, or log detail. Do not treat verbose mode as a deeper review setting.

## Project shape

This is a Next.js App Router, React, TypeScript, and Phaser 4 RC prototype. The DOM surface is small: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, and `src/game/GameCanvas.tsx`. Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`, with map helpers in `src/game/maps/startingDungeon.ts` and runtime asset paths in `src/game/assets/manifest.ts`.

## Review priorities

- For `src/game/scenes/DungeonScene.ts`, prioritize runtime regressions in Phaser scene lifecycle, async asset loading, cleanup on shutdown, player/enemy state, projectile collision, pickup spawning, cooldowns, camera resizing, input handling, audio mute state, and game-over/start-state transitions.
- For controls, current runtime firing is Space and pointer/click. README still mentions `J`; treat that as a known baseline mismatch unless a PR changes controls or docs.
- For gameplay docs, README describes quickshot, haste, ward, blast, ammo, and hearts. The code also has seeker ammo/projectiles that unlock after kills or time survived. Do not block unrelated PRs solely because seeker is not fully documented.
- For powerups, README calls blast late/rare, while current code unlocks blast earlier than the prose implies. Scope that mismatch to PRs touching powerup progression or docs.
- For assets, `src/game/assets/manifest.ts` is the runtime source of truth, including `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is auxiliary consistency data. If a PR adds, removes, renames, or relocates assets, verify the manifest, public files, dimensions, frames, keys, and Phaser loader/anims stay aligned.
- Treat files under `public/assets/**` as shipped runtime assets, not disposable generated output. Generator and processor tooling includes `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`, `tools/process_combat_juice_assets.mjs`, `tools/process_pickup_intent_effect_assets.mjs`, `tools/generate_powerup_sprites.mjs`, `tools/generate_brute_ammo_sprites.mjs`, `tools/generate_audio_sfx.mjs`, and `scripts/generate-retro-soundtrack.mjs`.
- For UI/UX, this repo does not configure Tailwind or shadcn/ui. Review DOM changes against existing semantic elements and `globals.css`; review Phaser canvas UI for pointer zones, keyboard and mouse affordances, responsive placement, readable text, and canvas-specific accessibility limits.
- `src/app/layout.tsx` references `/opengraph-image.png`. If the image is absent on a branch, treat that as a current baseline unless a PR changes metadata, social sharing, or the image asset.

## Verification expectations

Prefer these commands for scoped verification:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm run lint` maps to `next lint`, which is not reliable with the current Next 16 baseline. Do not block unrelated PRs solely on that script. `npm ci` may report existing dependency audit advisories; call them out when relevant, but keep dependency/tooling hardening separate unless the PR changes dependencies or security posture.

Next build/typegen may rewrite `next-env.d.ts` between `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`, and TypeScript may create `tsconfig.tsbuildinfo`. These should normally be restored or left untracked unless the PR intentionally changes generated typing behavior.

## Review style

Lead with actionable bugs and risks, ordered by severity, with file and line references. Keep comments specific to the changed code and likely runtime behavior. Avoid blocking on known baseline mismatches unless the PR touches that area or makes the mismatch worse.
