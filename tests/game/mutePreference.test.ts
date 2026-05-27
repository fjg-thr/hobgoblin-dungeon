import assert from "node:assert/strict";
import test from "node:test";

import { readMutedPreference, writeMutedPreference } from "../../src/game/storage/mutePreference";

const createThrowingStorage = (): Storage => ({
  get length(): number {
    throw new DOMException("Blocked", "SecurityError");
  },
  clear() {
    throw new DOMException("Blocked", "SecurityError");
  },
  getItem() {
    throw new DOMException("Blocked", "SecurityError");
  },
  key() {
    throw new DOMException("Blocked", "SecurityError");
  },
  removeItem() {
    throw new DOMException("Blocked", "SecurityError");
  },
  setItem() {
    throw new DOMException("Blocked", "SecurityError");
  }
});

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>();

  return {
    get length(): number {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    }
  };
};

test("readMutedPreference reads stored mute state", () => {
  const storage = createMemoryStorage();

  assert.equal(readMutedPreference(storage), false);

  storage.setItem("hobgoblin-dungeon-muted", "1");
  assert.equal(readMutedPreference(storage), true);

  storage.setItem("hobgoblin-dungeon-muted", "0");
  assert.equal(readMutedPreference(storage), false);
});

test("writeMutedPreference stores mute state", () => {
  const storage = createMemoryStorage();

  writeMutedPreference(storage, true);
  assert.equal(storage.getItem("hobgoblin-dungeon-muted"), "1");

  writeMutedPreference(storage, false);
  assert.equal(storage.getItem("hobgoblin-dungeon-muted"), "0");
});

test("readMutedPreference returns false when storage is unavailable", () => {
  assert.equal(readMutedPreference(createThrowingStorage()), false);
});

test("writeMutedPreference ignores unavailable storage", () => {
  assert.doesNotThrow(() => writeMutedPreference(createThrowingStorage(), true));
});
