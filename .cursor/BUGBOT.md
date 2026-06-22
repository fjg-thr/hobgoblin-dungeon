# Cursor Bugbot Review Guide

Use this guide when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin prototype.

## Deployment boundary

- This file gives Bugbot repo-specific review context only. It does not enable the hosted Bugbot service by itself.
- Hosted enablement must be verified in Cursor dashboard/org settings, GitHub integration repository access, or the Bugbot Admin API by someone with the required permissions.
- After `.cursor/BUGBOT.md` is merged to the default branch, smoke-test a real PR review to prove the hosted service is active.
- Manual PR comments, when Bugbot is enabled: `cursor review` or `bugbot run`.
- Verbose diagnostics: `cursor review verbose=true` or `bugbot run verbose=true`.

## Project shape

- Next.js App Router shell with a client-only Phaser game mounted by `src/game/GameCanvas.tsx`.
- Main gameplay is concentrated in `src/game/scenes/DungeonScene.ts`; review lifecycle, input, depth ordering, tweens/timers, cleanup, and camera/resize behavior carefully.
- Runtime asset source of truth is `src/game/assets/manifest.ts`. Keep it aligned with files under `public/assets/**` when sprites, audio, or metadata change.
- Dungeon generation and tile constants live in `src/game/maps/startingDungeon.ts`.
- DOM styling is plain CSS in `src/app/globals.css`; Tailwind is not configured in this repo.

## Review priorities

- Phaser lifecycle: avoid duplicate game instances under React strict mode, clean up timers/tweens/listeners, and preserve `gameRef.current?.destroy(true)` unmount behavior.
- Input: current runtime firing is `Space` plus pointer/click. Do not assume `J` works unless the implementation adds it; the README still mentions `J`.
- Gameplay balance: check kill/time unlocks, ammo caps, pickup spawn odds, and power-up timers for regressions that make runs unwinnable or trivial.
- Scene UX: validate pointer zones, keyboard affordances, sound toggle behavior, start/how-to-play/game-over overlays, responsive layout, and canvas-specific accessibility limits.
- Assets: new generated spritesheets need matching JSON/frame dimensions and manifest entries. Avoid stale references to generated source files as runtime assets.
- Audio: `assetManifest.audio` is what the scene loads. `public/assets/audio/audio-manifest.json` is auxiliary/consistency-only when touched.
- Metadata: `src/app/layout.tsx` references `/opengraph-image.png`; block PRs that worsen metadata/share-image behavior, but treat the missing asset as an existing baseline unless the PR touches that area.

## Known baselines

- `npm run lint` is not reliable with the current Next version; prefer build plus TypeScript checks.
- `npm ci` currently reports existing audit findings. Do not block unrelated PRs solely on those dependency advisories unless dependencies change.
- Next build/type generation may rewrite `next-env.d.ts` and create `tsconfig.tsbuildinfo`; these should not be committed unless intentionally changing generated typing behavior.
- README/control mismatch: README says `Space` or `J` fires, but current code binds shooting to `Space` only.
- README/gameplay mismatch: seeker ammo exists in code and unlocks after 4 kills or 30s, but is not documented in README controls.
- README/gameplay mismatch: README calls blast rare late-game, but current code unlocks blast after 2 kills or 16s.

## Suggested verification

For code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For asset/tooling changes, also run the exact touched generator or processor, for example:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

Manual smoke checks for gameplay PRs:

- Start screen renders, how-to-play opens/closes, and a run starts.
- WASD/arrows move isometrically; mouse aim, click fire, and Space fire work.
- Ammo, seeker ammo after unlock, hearts, quickshot, haste, ward, blast, score, life meter, sound toggle, game over, restart, and F3 debug overlay still behave plausibly.
- Resize the browser and confirm camera/HUD/start/game-over overlays remain usable.
