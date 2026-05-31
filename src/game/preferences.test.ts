import { describe, expect, it } from "vitest";

import { readMutedPreference, writeMutedPreference } from "./preferences";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  } as Storage;
};

const createThrowingStorage = () =>
  ({
    getItem: () => {
      throw new Error("storage blocked");
    },
    setItem: () => {
      throw new Error("storage blocked");
    }
  }) as unknown as Storage;

describe("mute preferences", () => {
  it("reads and writes muted state through local storage", () => {
    const storage = createMemoryStorage();

    expect(readMutedPreference(storage)).toBe(false);

    writeMutedPreference(true, storage);
    expect(readMutedPreference(storage)).toBe(true);

    writeMutedPreference(false, storage);
    expect(readMutedPreference(storage)).toBe(false);
  });

  it("falls back without throwing when storage access is blocked", () => {
    const storage = createThrowingStorage();

    expect(readMutedPreference(storage)).toBe(false);
    expect(() => writeMutedPreference(true, storage)).not.toThrow();
  });

  it("falls back without throwing when the localStorage getter is blocked", () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("localStorage getter blocked");
      }
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
});
