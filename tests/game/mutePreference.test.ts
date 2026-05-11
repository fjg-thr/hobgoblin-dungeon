import assert from "node:assert/strict";
import test from "node:test";

import {
  MUTED_PREFERENCE_KEY,
  readMutedPreference,
  writeMutedPreference
} from "../../src/game/preferences/mutePreference";

const createThrowingStorage = (): Storage =>
  ({
    getItem() {
      throw new DOMException("blocked", "SecurityError");
    },
    setItem() {
      throw new DOMException("blocked", "SecurityError");
    }
  }) as Storage;

test("readMutedPreference falls back to unmuted when storage is unavailable", () => {
  assert.equal(readMutedPreference(createThrowingStorage()), false);
});

test("writeMutedPreference ignores storage failures", () => {
  assert.doesNotThrow(() => writeMutedPreference(true, createThrowingStorage()));
});

test("mute preference stores and reads the persisted muted state", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    }
  } as Storage;

  writeMutedPreference(true, storage);

  assert.equal(values.get(MUTED_PREFERENCE_KEY), "1");
  assert.equal(readMutedPreference(storage), true);
});
