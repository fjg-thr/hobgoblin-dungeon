import assert from "node:assert/strict";
import test from "node:test";
import { SHOOT_KEY_CODES } from "./input";

test("shoot controls include Space and J", () => {
  assert.deepEqual(
    [...SHOOT_KEY_CODES].sort((a, b) => a - b),
    [32, 74]
  );
});
