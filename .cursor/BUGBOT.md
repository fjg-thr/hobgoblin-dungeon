# Cursor Bugbot Review Rules

Use these repository-specific guidelines when reviewing pull requests for this
Next.js and Phaser dungeon prototype.

## Review priorities

- Prioritize correctness, regressions, runtime failures, data loss, security,
  accessibility, and missing verification over style-only suggestions.
- Treat generated or processed asset outputs in `public/assets/**` as low signal
  unless a code change depends on their keys, dimensions, frame names, or paths.
- Call out any change that can break `npm run build` or TypeScript compilation.
- Prefer actionable findings with the exact failure mode and the smallest safe
  fix. Avoid broad refactor requests that are not required for the changed code.

## Next.js and React expectations

- Keep browser-only Phaser code out of server components and server-side
  execution paths. Flag direct `window`, `document`, canvas, audio, or Phaser
  usage unless the code is client-only.
- Check that client components using hooks or browser APIs include the expected
  client boundary.
- Watch for hydration-sensitive code, nondeterministic render output, and
  unguarded asset loading that can fail during production builds.

## Phaser gameplay expectations

- Verify Phaser scene changes clean up timers, tweens, keyboard handlers,
  pointer handlers, sounds, particles, and display objects when scenes restart
  or shut down.
- Check coordinate conversions, tile bounds, collision checks, depth sorting,
  camera behavior, and enemy/player state transitions for off-by-one and stale
  reference bugs.
- When asset manifests or sprite-sheet JSON change, confirm code references use
  matching asset keys, frame names, frame dimensions, and file paths.
- Flag gameplay changes that can create impossible states, such as negative
  health or ammo, invulnerable enemies, permanent input lockout, endless
  spawning, or power-ups that never expire.

## Testing and verification

- For code changes, expect at least one relevant verification command in the PR
  description or discussion, such as `npm run build`.
- If a bug fix or gameplay rule change lacks a focused test or reproducible
  manual verification note, mention the risk and the missing check.
