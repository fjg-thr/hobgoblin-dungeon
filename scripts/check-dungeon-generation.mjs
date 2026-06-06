import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createDungeon } = require("../tmp/dungeon-generation/maps/startingDungeon.js");

const countStairs = (rows) => rows.reduce((total, row) => total + [...row].filter((tile) => tile === "S").length, 0);

const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const assertSingleStairs = (name, random) => {
  const dungeon = createDungeon(random);
  const stairsCount = countStairs(dungeon.rows);

  assert.equal(
    stairsCount,
    1,
    `${name} should generate exactly one stairs tile, found ${stairsCount}\n${dungeon.rows.join("\n")}`
  );
};

assertSingleStairs("constant 0.45 random source", () => 0.45);

for (let seed = 1; seed <= 500; seed += 1) {
  assertSingleStairs(`seed ${seed}`, seededRandom(seed));
}

console.log("Dungeon generation stairs invariant passed for 501 maps.");
