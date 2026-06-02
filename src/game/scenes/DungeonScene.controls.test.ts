import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SHOOT_CONTROL_LABEL, SHOOT_KEY_BINDINGS, isShootInputActive } from "../controls";

const workspaceRoot = process.cwd();

describe("documented shoot controls", () => {
  it("keeps the README and scene wired to the same keyboard fire controls", () => {
    const readme = readFileSync(join(workspaceRoot, "README.md"), "utf8");
    const scene = readFileSync(join(workspaceRoot, "src/game/scenes/DungeonScene.ts"), "utf8");

    expect(readme).toContain("`Space` or `J`: fire");
    expect(SHOOT_CONTROL_LABEL).toBe("SPACE/J");
    expect(SHOOT_KEY_BINDINGS).toEqual([
      { inputKey: "shoot", phaserKeyCode: "SPACE", label: "SPACE" },
      { inputKey: "shootAlt", phaserKeyCode: "J", label: "J" }
    ]);
    expect(scene).toContain("SHOOT_KEY_BINDINGS.forEach");
    expect(scene).toContain("isShootInputActive");
  });

  it("accepts queued shots and either keyboard fire key", () => {
    expect(isShootInputActive(true, {})).toBe(true);
    expect(isShootInputActive(false, { shoot: { isDown: true } })).toBe(true);
    expect(isShootInputActive(false, { shootAlt: { isDown: true } })).toBe(true);
    expect(isShootInputActive(false, { shoot: { isDown: false }, shootAlt: { isDown: false } })).toBe(false);
  });
});
