import assert from "node:assert/strict";
import test from "node:test";

import { getStorageFromSource, readStorageFlag, type StorageLike, writeStorageFlag } from "../src/game/storagePreference";

const createMemoryStorage = (): StorageLike => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
};

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error("storage denied");
  },
  setItem: () => {
    throw new Error("storage denied");
  }
};

test("readStorageFlag returns false when storage access fails", () => {
  assert.equal(readStorageFlag(throwingStorage, "hobgoblin-dungeon-muted"), false);
});

test("readStorageFlag only treats 1 as true", () => {
  const storage = createMemoryStorage();

  writeStorageFlag(storage, "hobgoblin-dungeon-muted", true);
  assert.equal(readStorageFlag(storage, "hobgoblin-dungeon-muted"), true);

  writeStorageFlag(storage, "hobgoblin-dungeon-muted", false);
  assert.equal(readStorageFlag(storage, "hobgoblin-dungeon-muted"), false);
});

test("writeStorageFlag ignores storage access failures", () => {
  assert.doesNotThrow(() => writeStorageFlag(throwingStorage, "hobgoblin-dungeon-muted", true));
});

test("getStorageFromSource returns undefined when localStorage access fails", () => {
  const source = Object.defineProperty({} as { readonly localStorage: StorageLike }, "localStorage", {
    get: () => {
      throw new Error("localStorage denied");
    }
  });

  assert.equal(getStorageFromSource(source), undefined);
});
