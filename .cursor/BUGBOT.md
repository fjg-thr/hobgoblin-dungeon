# Cursor Bugbot review guide

Use this file as repository-local guidance for Cursor Bugbot reviews after it is merged to the default branch. It helps Bugbot review this Next.js/React/TypeScript/Phaser game, but it does not by itself enable the hosted service.

## Service setup and triggers

- Managed Bugbot enablement is external to this repo. Confirm Cursor dashboard or org settings, GitHub App repository access, and a real PR smoke review/status when validating deployment.
- Top-level PR comments can request a review with `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or `bugbot run verbose=true` and look for request IDs, logs, and configuration details. Treat verbose mode as diagnostic output, not as a deeper review setting.
- PRs that add or change this file may not be reviewed with the new rules until the change lands on the default branch.

## Project shape

- App shell: `src/app/layout.tsx`, `src/app/page.tsx`, and `src/game/GameCanvas.tsx`.
- Main gameplay: `src/game/scenes/DungeonScene.ts`.
- Dungeon map data: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`, especially `assetManifest.audio` for audio loaded by the Phaser scene.
- Asset tooling lives in `tools/`; audio generation also includes `tools/generate_audio_sfx.mjs` and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

1. Guard SSR/client boundaries. Phaser must stay behind client-only React code and browser globals must not execute during server rendering.
2. Check Phaser lifecycle cleanup in `GameCanvas` and `DungeonScene`: destroy game instances, input handlers, timers, tweens, sounds, and event listeners when scenes or React components unmount.
3. Review gameplay changes for deterministic state updates, bounded spawning, collision behavior, player invulnerability, ammo accounting, power-up expiry, and game-over reset paths.
4. Keep generated/runtime assets aligned: spritesheet JSON dimensions and frame counts, manifest paths, committed public assets, and tooling output should match.
5. Review audio changes against `assetManifest.audio` and Phaser preload/create usage. `public/assets/audio/audio-manifest.json` is auxiliary and should not be treated as the runtime loader source.
6. For DOM or metadata work, keep semantic markup and existing `src/app/globals.css` patterns. This repo does not currently use Tailwind or shadcn/ui.
7. For Phaser canvas UI work, check pointer hit zones, keyboard/mouse affordances, responsive placement, depth ordering, readable contrast, and canvas-specific accessibility limits.

## Known baselines, do not block unrelated PRs

- README says `Space` or `J` fires, but current runtime binds shooting to `SPACE` plus pointer/click. Flag only input/control-doc changes that worsen or intentionally touch this mismatch.
- README describes blast as rare late-game, while `POWERUP_CONFIG` currently unlocks blast earlier. Treat as existing docs/code drift unless a PR edits related behavior or docs.
- Code includes seeker ammo/projectiles after progression thresholds, but README does not document seeker ammo. Flag only related changes.
- `src/app/layout.tsx` references `/opengraph-image.png`; the asset is absent on the current baseline. Block only PRs that touch metadata/share-image behavior and leave it broken or worse.
- `npm ci` may report existing audit advisories in the Next.js/PostCSS dependency baseline. Mention them, but do not fail unrelated PRs solely for that inherited baseline.

## Verification suggestions

- Prefer `npm run build` and `npx tsc --noEmit` for this Next 16 project. `next lint` is not reliable here.
- For asset/audio changes, also run the touched generator or processor explicitly, such as `node tools/generate_audio_sfx.mjs`, `node scripts/generate-retro-soundtrack.mjs`, or the specific `tools/process_*.mjs` / `tools/process_assets.py` command involved.
- If verification rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo`, confirm whether that is expected generated churn before requesting it in the final diff.

## Review style

- Lead with concrete bugs, regressions, security issues, missing tests, or verification gaps. Include file and line references where possible.
- Keep comments scoped to changed behavior. Avoid asking for unrelated cleanup, dependency upgrades, or broad refactors.
- When behavior and docs disagree, identify whether the PR caused the disagreement or merely touched nearby code.
