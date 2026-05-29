import { describe, expect, it } from "vitest";
import { isShootRequested } from "./shooting";

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
