# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin prototype.

## Deployment and trigger notes

- This repository file supplies Bugbot review guidance only. It does not prove that the hosted Cursor Bugbot service is enabled.
- To fully verify managed deployment, confirm Cursor dashboard or organization settings, GitHub App access for `fjg-thr/hobgoblin-dungeon`, and a live pull request review smoke check.
- Manual PR review triggers can be posted as top-level comments: `cursor review` or `bugbot run`.
- For troubleshooting, use verbose manual triggers: `cursor review verbose=true` or `bugbot run verbose=true`.
- Changes to this file apply reliably after they are merged to the default branch. A PR that adds or edits `BUGBOT.md` might not be reviewed with the new rules.

## Project map

- App framework: Next.js App Router with React and TypeScript.
- Runtime game layer: Phaser scene code in `src/game/scenes/DungeonScene.ts`, mounted through `src/game/GameCanvas.tsx` and rendered from `src/app/page.tsx`.
- Global metadata and layout: `src/app/layout.tsx`.
- Global styling: `src/app/globals.css`. This repo does not currently configure Tailwind, so prefer existing CSS patterns.
- Dungeon map data: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Static assets: `public/assets/**`.
- Asset/audio generator and processor tooling: `tools/**` and `scripts/**`.

## Review priorities

### Client and Next.js boundaries

- Ensure browser-only APIs such as `window`, `document`, Web Audio, local storage, and Phaser setup stay inside client-side code or are guarded for server rendering.
- Watch for metadata asset references, especially `/opengraph-image.png`; verify the referenced public asset exists when related metadata changes are made.
- Avoid blocking unrelated PRs on existing generated route type churn. Next 16 may rewrite `next-env.d.ts` between dev and production type generation.

### Phaser lifecycle and input handling

- Check that Phaser listeners, timers, tweens, sounds, DOM/pointer handlers, and GameObjects are cleaned up on scene shutdown or restart paths.
- Verify scene restart, game-over, mute toggle, start screen, and how-to-play overlays do not leave duplicate listeners or orphaned objects.
- Confirm keyboard and pointer controls remain accessible in-game: movement uses WASD or arrow keys, and shooting is bound to Space plus pointer/click firing in code.
- The README currently mentions `J` firing, but `DungeonScene` binds Space only. Treat this as an existing docs/code mismatch unless the PR changes controls or control documentation.

### Gameplay correctness

- Review movement, aiming, projectile, collision, damage, pickup, power-up, score, and spawn changes against the intended arcade loop.
- Check that difficulty and spawn changes preserve playable pacing and do not create unavoidable damage, stuck enemies, empty pickup loops, or unbounded object growth.
- README-documented power-ups are quickshot, haste, ward, and blast. Code also includes seeker ammo/projectiles that unlock during a run; review seeker changes against the code-defined behavior.
- The README describes blast as a rare late-game power-up, while code unlocks it early via `POWERUP_CONFIG.blast`. Treat that as an existing mismatch unless a PR intentionally updates blast progression.

### Assets, audio, and generated files

- When asset manifests or sprite metadata change, verify paths, frame sizes, frame rows, animation frame ranges, and runtime load keys stay consistent.
- `src/game/assets/manifest.ts` is the runtime audio and asset source of truth. `public/assets/audio/audio-manifest.json`, when present or touched, is auxiliary consistency data.
- Generated assets should be reviewed for manifest consistency and file-size impact. Do not require regeneration for unrelated PRs.
- Avoid committing transient build outputs such as `.next/` or `tsconfig.tsbuildinfo`.

### TypeScript, dependencies, and verification

- Prefer focused TypeScript fixes over broad refactors in the large Phaser scene.
- Do not rely on `npm run lint` as a blocking check here because `next lint` is not reliable with the current Next version.
- Recommended verification for code-affecting PRs:
  - `npm ci`
  - `npm run build`
  - `npx tsc --noEmit`
- `npm ci` may report existing audit findings. Call out new or worsened dependency risk separately from the current baseline.

## Review output expectations

- Lead with concrete defects that can cause user-facing regressions, crashes, broken builds, asset load failures, or unbounded runtime behavior.
- Include exact file and line references when possible.
- Distinguish existing repository mismatches from regressions introduced by the PR.
- Keep suggestions scoped to the changed surface; avoid broad style-only rewrites for unrelated code.
