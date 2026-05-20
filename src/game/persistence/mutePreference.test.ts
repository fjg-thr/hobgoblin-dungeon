import assert from "node:assert/strict";
import test from "node:test";

import { readMutedPreference, writeMutedPreference } from "./mutePreference.ts";

test("readMutedPreference returns false when localStorage access throws", () => {
  const storage = {
    getItem() {
      throw new DOMException("Blocked", "SecurityError");
    },
    setItem() {
      throw new DOMException("Blocked", "SecurityError");
    }
  };

  assert.equal(readMutedPreference(storage), false);
});

test("writeMutedPreference ignores localStorage write failures", () => {
  const storage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new DOMException("Blocked", "SecurityError");
    }
  };

  assert.doesNotThrow(() => writeMutedPreference(storage, true));
});

test("mute preference round-trips through available localStorage", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    }
  };

  assert.equal(readMutedPreference(storage), false);

  writeMutedPreference(storage, true);
  assert.equal(readMutedPreference(storage), true);

  writeMutedPreference(storage, false);
  assert.equal(readMutedPreference(storage), false);
});
