# Bugbot Review Guidelines

Review this repository as a Next.js App Router project that hosts a browser-only Phaser game.

## Review Priorities

- Prioritize correctness, runtime crashes, security issues, data loss, accessibility regressions, and broken build/deploy behavior.
- Prefer actionable findings with a concrete failing scenario. Avoid style-only or subjective feedback unless it points to a likely bug.
- Treat generated media assets as low signal unless a code change references a missing, renamed, or mismatched asset.

## Project-Specific Checks

- Verify browser-only APIs (`window`, `document`, canvas, audio, pointer events, Phaser globals) stay out of server components and module paths that can execute during SSR.
- Check that React components which create or own Phaser state clean up scenes, event listeners, timers, tweens, audio, and DOM handlers when unmounted or restarted.
- Confirm game-loop changes are frame-rate safe and do not create unbounded timers, intervals, listeners, sprites, particle emitters, tweens, or physics bodies.
- Validate gameplay state transitions for start, pause/mute, damage, death, restart, pickups, enemy spawning, scoring, and ammo so repeated runs do not leak or reuse stale state.
- For asset changes, ensure every manifest entry points to an existing file, frame dimensions match the corresponding sheet metadata, and code references match manifest keys exactly.
- For map or collision updates, look for blocked spawn points, unreachable rooms, invalid tile coordinates, and player/enemy movement that can pass through walls or get permanently stuck.
- For audio changes, ensure mute state applies to newly created sounds and that browser autoplay restrictions are respected.
- For dependency, build, or config changes, call out anything that can break `npm install`, `npm run build`, or deployment on a clean machine.

## Expected Verification

- TypeScript and build-sensitive changes should be validated with `npm run build` or an equivalent focused command.
- Gameplay/UI behavior changes should include a short manual verification path in the PR description when automated coverage is not practical.
