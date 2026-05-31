import { describe, expect, it } from "vitest";

import { createDungeon, getTileCode, isTileBlocked, MAP_HEIGHT, MAP_WIDTH } from "./startingDungeon";

const playableTiles = new Set([".", "c", "m", "B", "S"]);

describe("createDungeon", () => {
  it("creates a map with valid dimensions and playable spawn points", () => {
    const dungeon = createDungeon(() => 0.42);

    expect(dungeon.width).toBe(MAP_WIDTH);
    expect(dungeon.height).toBe(MAP_HEIGHT);
    expect(dungeon.rows).toHaveLength(MAP_HEIGHT);
    expect(dungeon.rows.every((row) => row.length === MAP_WIDTH)).toBe(true);

    const playerTile = getTileCode(dungeon, Math.floor(dungeon.playerStart.x), Math.floor(dungeon.playerStart.y));
    expect(playableTiles.has(playerTile)).toBe(true);
    expect(isTileBlocked(playerTile)).toBe(false);

    expect(dungeon.enemyStarts.length).toBeGreaterThan(0);
    dungeon.enemyStarts.forEach((start) => {
      const enemyTile = getTileCode(dungeon, Math.floor(start.x), Math.floor(start.y));
      expect(playableTiles.has(enemyTile)).toBe(true);
      expect(isTileBlocked(enemyTile)).toBe(false);
    });
  });

  it("does not place blocking props on reserved start tiles", () => {
    const dungeon = createDungeon(() => 0.42);
    const reservedTiles = new Set([
      `${Math.floor(dungeon.playerStart.x)},${Math.floor(dungeon.playerStart.y)}`,
      ...dungeon.enemyStarts.map((start) => `${Math.floor(start.x)},${Math.floor(start.y)}`)
    ]);

    expect(dungeon.props.some((prop) => reservedTiles.has(`${prop.x},${prop.y}`))).toBe(false);
  });
});
