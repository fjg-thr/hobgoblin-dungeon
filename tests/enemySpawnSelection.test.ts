import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { enemySpawnDistanceForActiveCount, selectInitialEnemyStarts } from "../src/game/enemySpawnSelection";

describe("selectInitialEnemyStarts", () => {
  it("caps initial enemies and prefers starts outside the alert radius", () => {
    const starts = [
      { x: 11.5, y: 9.5 },
      { x: 6.5, y: 10.5 },
      { x: 20.5, y: 6.5 },
      { x: 9.5, y: 17.5 }
    ];

    assert.deepEqual(selectInitialEnemyStarts(starts, { x: 11.5, y: 4.5 }, 1, 6.5), [{ x: 9.5, y: 17.5 }]);
  });

  it("does not return an unsafe initial start when every candidate is inside the minimum distance", () => {
    const starts = [
      { x: 2, y: 0 },
      { x: 4, y: 0 },
      { x: 3, y: 0 }
    ];

    assert.deepEqual(selectInitialEnemyStarts(starts, { x: 0, y: 0 }, 1, 10), []);
  });
});

describe("enemySpawnDistanceForActiveCount", () => {
  it("uses the initial safe distance until at least one enemy is active", () => {
    assert.equal(enemySpawnDistanceForActiveCount(0, 5.2, 7.15), 7.15);
  });

  it("uses the normal spawn distance after enemies are already active", () => {
    assert.equal(enemySpawnDistanceForActiveCount(1, 5.2, 7.15), 5.2);
  });
});
