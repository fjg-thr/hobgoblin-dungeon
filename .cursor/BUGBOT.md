# Cursor Bugbot Review Rules

Review pull requests for high-confidence bugs that affect correctness, runtime stability, security, or deployability. Prefer actionable inline comments tied to changed lines, and skip stylistic nits unless they hide a real defect.

## Project context

- This is a Next.js app that mounts a Phaser-based dungeon prototype in the browser.
- Phaser scene code is browser-only; avoid SSR regressions, hydration hazards, and unguarded access to browser globals outside client-only code.
- Game data, sprite sheets, audio manifests, and asset processing scripts must stay in sync with the files under `public/assets`.

## Always flag

- Build-breaking TypeScript, React, Next.js, or Phaser API misuse.
- Phaser lifecycle leaks such as duplicated listeners, timers, tweens, sounds, or scene objects that survive restarts.
- Asset key, frame, dimension, or manifest mismatches that can crash loading or animation playback.
- Gameplay state bugs that can soft-lock a run, make enemies/projectiles invisible but active, or corrupt health, ammo, score, collision, or power-up state.
- Security issues, secret exposure, unsafe shell invocation, or untrusted file/path handling in scripts.
- Changes to generated assets without corresponding source/tooling updates when the mismatch affects runtime behavior.

## Usually ignore

- Pixel-art taste, color, naming, or minor copy changes unless they create a concrete runtime or accessibility issue.
- Large generated/binary asset diffs unless metadata, dimensions, paths, or manifests are inconsistent.
- Pure refactor comments that do not identify a user-visible or maintenance-blocking bug.
