import { describe, expect, it } from "vitest";

import { calculateGameOverLayout } from "./gameOverLayout";

const titleSize = { width: 360, height: 128 };
const buttonSize = { width: 240, height: 64 };

describe("calculateGameOverLayout", () => {
  it("recomputes restart hit area from the current viewport", () => {
    const small = calculateGameOverLayout({ width: 800, height: 600 }, titleSize, buttonSize);
    const large = calculateGameOverLayout({ width: 1200, height: 900 }, titleSize, buttonSize);

    expect(small.content.x).toBe(400);
    expect(small.content.y).toBe(258);
    expect(large.content.x).toBe(600);
    expect(large.content.y).toBe(387);
    expect(large.restartZone.y).toBeGreaterThan(small.restartZone.y);
  });

  it("keeps panel and button scales inside their intended bounds", () => {
    const narrow = calculateGameOverLayout({ width: 160, height: 160 }, titleSize, buttonSize);
    const wide = calculateGameOverLayout({ width: 2400, height: 1600 }, titleSize, buttonSize);

    expect(narrow.panelScale).toBe(0.42);
    expect(narrow.buttonScale).toBe(0.22);
    expect(wide.panelScale).toBe(0.66);
    expect(wide.buttonScale).toBe(0.34);
  });
});
