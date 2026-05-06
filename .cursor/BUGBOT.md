# Bugbot review instructions

Use these project-specific checks when reviewing pull requests for this repository.

## Project context

- This is a Next.js app that renders a Phaser-powered browser game from `src/game`.
- The game relies on generated sprite sheets, JSON frame metadata, and audio manifests under `public/assets`.
- Most gameplay behavior is centralized in `src/game/scenes/DungeonScene.ts`; changes there can affect movement, combat, spawning, pickups, UI overlays, and audio.

## Review priorities

- Flag client/server boundary regressions. Phaser and browser-only APIs must stay behind client components or runtime guards.
- Check that asset references remain synchronized across `src/game/assets/manifest.ts`, Phaser preload calls, and files under `public/assets`.
- Verify sprite sheet frame sizes, animation keys, atlas names, and JSON metadata match the image assets they describe.
- Look for gameplay state bugs caused by timers, scene restarts, pointer input, keyboard input, damage invulnerability, pickup lifetimes, or enemy spawn ramps.
- Watch for leaks from Phaser event listeners, tweens, timers, sounds, and input handlers when scenes restart or React components unmount.
- Treat generated asset tooling changes as production-impacting. Review file paths, output dimensions, transparency handling, and manifest updates.
- Confirm UI and input changes remain keyboard-accessible where DOM controls are involved.
- Prefer focused, maintainable changes that follow the existing TypeScript style and avoid unrelated refactors.

## Verification expectations

- For application code changes, expect `npm run build` or an equivalent TypeScript/Next.js validation to pass.
- For asset or tooling changes, expect the relevant generator or processor script to be run when practical, and verify generated metadata matches committed files.
- If a change intentionally skips a validation step, the pull request should explain why and describe the manual checks performed.
