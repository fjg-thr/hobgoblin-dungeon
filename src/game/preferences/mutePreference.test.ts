import { describe, expect, it } from "vitest";
import { readMutedPreference, writeMutedPreference } from "./mutePreference";

const throwingStorage = {
  getItem: () => {
    throw new Error("storage blocked");
  },
  setItem: () => {
    throw new Error("storage blocked");
  }
} as unknown as Storage;

describe("mute preference helpers", () => {
  it("falls back to unmuted when storage reads throw", () => {
    expect(readMutedPreference(throwingStorage)).toBe(false);
  });

  it("ignores storage write failures", () => {
    expect(() => writeMutedPreference(true, throwingStorage)).not.toThrow();
  });
});
