import assert from "node:assert/strict";
import test from "node:test";

import {
  MAP_HEIGHT,
  MAP_WIDTH,
  createDungeon,
  getTileCode,
  isTileBlocked,
  type DungeonMap
} from "../../src/game/maps/startingDungeon";

const createSeededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const tileKey = (x: number, y: number): string => `${x},${y}`;

const tileFromPoint = (point: { x: number; y: number }): { x: number; y: number } => ({
  x: Math.floor(point.x),
  y: Math.floor(point.y)
});

const reachableTilesFromPlayer = (dungeon: DungeonMap): Set<string> => {
  const start = tileFromPoint(dungeon.playerStart);
  const queue = [start];
  const visited = new Set<string>([tileKey(start.x, start.y)]);

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];

    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ] as const) {
      const next = { x: current.x + dx, y: current.y + dy };
      const key = tileKey(next.x, next.y);

      if (visited.has(key) || isTileBlocked(getTileCode(dungeon, next.x, next.y))) {
        continue;
      }

      visited.add(key);
      queue.push(next);
    }
  }

  return visited;
};

test("generated dungeons keep player, enemies, and stairs on reachable tiles", () => {
  for (let seed = 1; seed <= 30; seed += 1) {
    const dungeon = createDungeon(createSeededRandom(seed));
    const reachableTiles = reachableTilesFromPlayer(dungeon);
    const start = tileFromPoint(dungeon.playerStart);
    const stairY = dungeon.rows.findIndex((row) => row.includes("S"));
    const stairX = stairY >= 0 ? dungeon.rows[stairY].indexOf("S") : -1;

    assert.equal(dungeon.width, MAP_WIDTH, `seed ${seed}: width`);
    assert.equal(dungeon.height, MAP_HEIGHT, `seed ${seed}: height`);
    assert.equal(dungeon.rows.length, MAP_HEIGHT, `seed ${seed}: row count`);
    assert.ok(dungeon.rows.every((row) => row.length === MAP_WIDTH), `seed ${seed}: row widths`);
    assert.ok(!isTileBlocked(getTileCode(dungeon, start.x, start.y)), `seed ${seed}: player start is walkable`);
    assert.ok(reachableTiles.has(tileKey(start.x, start.y)), `seed ${seed}: player start is reachable`);
    assert.ok(stairX >= 0 && stairY >= 0, `seed ${seed}: stairs exist`);
    assert.ok(reachableTiles.has(tileKey(stairX, stairY)), `seed ${seed}: stairs are reachable`);

    dungeon.enemyStarts.forEach((enemyStart, enemyIndex) => {
      const enemyTile = tileFromPoint(enemyStart);
      assert.ok(!isTileBlocked(getTileCode(dungeon, enemyTile.x, enemyTile.y)), `seed ${seed}: enemy ${enemyIndex} is walkable`);
      assert.ok(reachableTiles.has(tileKey(enemyTile.x, enemyTile.y)), `seed ${seed}: enemy ${enemyIndex} is reachable`);
    });
  }
});

test("generated dungeon props stay on playable non-reserved tiles", () => {
  for (let seed = 1; seed <= 30; seed += 1) {
    const dungeon = createDungeon(createSeededRandom(seed));
    const playerTile = tileFromPoint(dungeon.playerStart);
    const reserved = new Set<string>([
      tileKey(playerTile.x, playerTile.y),
      ...dungeon.enemyStarts.map((start) => {
        const tile = tileFromPoint(start);
        return tileKey(tile.x, tile.y);
      })
    ]);
    const seenProps = new Set<string>();

    dungeon.props.forEach((prop) => {
      const key = tileKey(prop.x, prop.y);

      assert.ok(!isTileBlocked(getTileCode(dungeon, prop.x, prop.y)), `seed ${seed}: prop ${key} is on a walkable tile`);
      assert.ok(!reserved.has(key), `seed ${seed}: prop ${key} avoids start tiles`);
      assert.ok(!seenProps.has(key), `seed ${seed}: prop ${key} is unique`);
      assert.equal(prop.blocks, true, `seed ${seed}: prop ${key} blocks movement`);

      seenProps.add(key);
    });
  }
});
