import { describe, expect, it } from "vitest";
import { forEachShootKey, isShootRequested } from "./shooting";

const key = (isDown: boolean) => ({ isDown });

describe("isShootRequested", () => {
  it("recognizes the alternate fire key", () => {
    expect(
      isShootRequested(false, {
        shoot: key(false),
        shootAlt: key(true)
      })
    ).toBe(true);
  });
});

describe("forEachShootKey", () => {
  it("visits primary and alternate fire keys", () => {
    const shoot = key(false);
    const shootAlt = key(false);
    const visited: Array<{ isDown: boolean }> = [];

    forEachShootKey({ shoot, shootAlt }, (shootKey) => visited.push(shootKey));

    expect(visited).toEqual([shoot, shootAlt]);
  });
});
