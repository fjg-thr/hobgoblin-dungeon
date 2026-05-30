import assert from "node:assert/strict";
import test from "node:test";
import { createDungeon, getTileCode, isTileBlocked } from "./startingDungeon";

const seededRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

test("createDungeon keeps exactly one playable staircase", () => {
  const dungeon = createDungeon(seededRandom(225));
  const staircaseTiles: Array<{ x: number; y: number }> = [];

  dungeon.rows.forEach((row, y) => {
    [...row].forEach((code, x) => {
      if (code === "S") {
        staircaseTiles.push({ x, y });
      }
    });
  });

  assert.equal(staircaseTiles.length, 1);
  assert.equal(isTileBlocked(getTileCode(dungeon, staircaseTiles[0].x, staircaseTiles[0].y)), false);
});
