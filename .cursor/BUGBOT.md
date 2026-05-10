# Bugbot review instructions

Review this repository as a Next.js app that boots a Phaser game client-side.

Prioritize findings that could break the playable prototype:

- Client/server boundaries: `src/game/**` and Phaser imports must stay behind
  client-only entry points or dynamic imports. Flag changes that import Phaser
  into server components, metadata files, or other server-rendered paths.
- Runtime gameplay invariants: verify movement, collision, enemy targeting,
  projectile lifecycles, pickups, health, ammo, score, and game-over/reset flows
  still have bounded state updates and sensible cleanup.
- Map generation: ensure generated dungeon rows remain rectangular and match
  `MAP_WIDTH`/`MAP_HEIGHT`, player and enemy starts are on playable tiles, and
  blocking tile/prop logic stays consistent with rendering.
- Asset manifests: when asset keys, paths, frame sizes, or metadata filenames
  change, check that matching files exist under `public/assets` and that preload
  and animation setup still reference the same keys.
- React lifecycle: flag leaked Phaser game instances, unguarded browser globals
  during server rendering, missing effect cleanup, or duplicate boot paths.
- TypeScript strictness: prefer precise types over `any`, avoid weakening strict
  compiler guarantees, and keep imports aligned with existing path aliases.
- Performance-sensitive loops: in per-frame update logic, watch for unnecessary
  allocation, unbounded object creation, or work that scales poorly with enemy,
  projectile, effect, or pickup counts.

For review comments, include a concrete failure mode and the smallest suggested
fix. Avoid style-only comments unless they hide a real bug or maintainability
risk in gameplay code.
