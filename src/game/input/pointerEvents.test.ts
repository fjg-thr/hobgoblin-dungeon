import { describe, expect, it } from "vitest";
import { stopPointerEventPropagation } from "./pointerEvents";

describe("stopPointerEventPropagation", () => {
  it("stops propagation when Phaser provides an event object", () => {
    let stopped = false;

    stopPointerEventPropagation({
      stopPropagation: () => {
        stopped = true;
      }
    });

    expect(stopped).toBe(true);
  });
});
