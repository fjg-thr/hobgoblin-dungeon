import { describe, expect, it, vi } from "vitest";

import { readMutedPreference, writeMutedPreference } from "../../src/game/mutePreference";

describe("mute preference storage", () => {
  it("falls back when browser localStorage access throws", () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
    const blockedWindow = {};

    Object.defineProperty(blockedWindow, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Blocked", "SecurityError");
      }
    });

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: blockedWindow
    });

    try {
      expect(readMutedPreference()).toBe(false);
      expect(() => writeMutedPreference(true)).not.toThrow();
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, "window", originalWindow);
      } else {
        Reflect.deleteProperty(globalThis, "window");
      }
    }
  });

  it("falls back to unmuted when storage reads throw", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new DOMException("Blocked", "SecurityError");
      }),
      setItem: vi.fn()
    };

    expect(readMutedPreference(storage)).toBe(false);
  });

  it("does not throw when storage writes are blocked", () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new DOMException("Blocked", "SecurityError");
      })
    };

    expect(() => writeMutedPreference(true, storage)).not.toThrow();
  });
});
