# Cursor Bugbot review guide

Use this file as repository-specific guidance for Cursor Bugbot code reviews. These
instructions become authoritative after this file is merged to the default branch;
PRs that add or change this file may not be reviewed with the new guidance yet.

## Managed service checks

Repository files can provide review context, but they cannot prove that hosted
Bugbot is enabled. When validating deployment, confirm these outside the repo when
available:

- Cursor dashboard or organization settings have Bugbot enabled for this project.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- A live pull request receives a Bugbot review or responds to a manual trigger.

Manual PR triggers can be posted as a top-level comment:

- `cursor review`
- `bugbot run`
- For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`
  to request additional request IDs or log details.

## Project profile

This is a Next.js App Router, React, TypeScript, and Phaser 4 dungeon prototype.
Most user-facing behavior lives in `src/game/scenes/DungeonScene.ts`, with runtime
asset loading driven by `src/game/assets/manifest.ts`. The app renders a Phaser
canvas from React rather than a conventional component-heavy HTML UI.

Prioritize review findings that affect:

- Build or type safety in Next.js, React, TypeScript, or Phaser integration.
- Runtime gameplay regressions in movement, collision, camera follow, enemy AI,
  ammo, power-ups, scoring, death/restart flow, start screen, how-to-play modal,
  debug overlay, and scene cleanup.
- Phaser lifecycle issues such as leaked timers, tweens, input handlers, audio
  objects, sprites, graphics, or stale scene references after restart.
- Asset manifest drift: every runtime asset in `assetManifest` must have a
  matching file, metadata shape, frame dimensions, animation row, and key usage.
- Audio loading and mute behavior. The source of truth for loaded audio is
  `assetManifest.audio`; `public/assets/audio/audio-manifest.json` is auxiliary
  consistency data when audio files are touched.
- Canvas UX: pointer zones, keyboard/mouse affordances, responsive placement,
  readable overlays, and accessible surrounding DOM where applicable.

This repo does not currently configure Tailwind or Shadcn. For DOM changes, prefer
semantic HTML and existing `src/app/globals.css` patterns. For Phaser UI changes,
review the canvas interaction and layout directly.

## Verification commands

Use the narrowest commands that cover the changed surface. Good defaults are:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is not reliable for the current Next version in this repo, so do not
block unrelated PRs solely because that script is unavailable or fails due to the
known Next lint command removal. If verification dirties generated files such as
`next-env.d.ts` or `tsconfig.tsbuildinfo`, restore or remove those artifacts unless
the PR intentionally changes generated Next/TypeScript output.

For asset generation or processing changes, also run the explicit script that owns
the touched assets, for example:

- `python3 tools/process_assets.py`
- `node tools/process_actor_death_assets.mjs`
- `node tools/process_combat_juice_assets.mjs`
- `node tools/generate_brute_ammo_sprites.mjs`
- `node tools/generate_powerup_sprites.mjs`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`

## Known baseline context

Do not block unrelated PRs for these existing mismatches, but call out changes that
make them worse or claim to fix adjacent behavior without addressing them:

- README says `Space` or `J` fires. Current runtime keyboard firing uses `SPACE`;
  pointer/click firing also works, and in-game instructions mention SPACE.
- README describes blast as a rare late-game power-up, while current code unlocks
  blast earlier through `POWERUP_CONFIG`.
- Current code has seeker ammo and seeker projectiles that are not fully documented
  in README controls or power-up copy.
- `src/app/layout.tsx` references `/opengraph-image.png`, but this baseline may
  not include a matching app or public image file.
- Dependency audits may report existing Next.js/PostCSS advisories. Keep security
  hardening separate from focused gameplay, asset, or Bugbot guidance PRs unless a
  change modifies dependency or build-tool behavior.

## Review style

Lead with concrete bugs, regressions, or missing verification. Include file and
line references when possible. Avoid broad refactors unless they directly reduce
risk in the changed area. Prefer small, actionable findings over general advice.
