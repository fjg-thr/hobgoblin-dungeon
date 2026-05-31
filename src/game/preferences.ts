const MUTED_PREFERENCE_KEY = "hobgoblin-dungeon-muted";

const getBrowserStorage = (): Storage | undefined => {
  try {
    return (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
  } catch {
    return undefined;
  }
};

export function readMutedPreference(storage: Storage | undefined = getBrowserStorage()): boolean {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(MUTED_PREFERENCE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeMutedPreference(muted: boolean, storage: Storage | undefined = getBrowserStorage()) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(MUTED_PREFERENCE_KEY, muted ? "1" : "0");
  } catch {
    // Some browsers expose localStorage but deny access in private or sandboxed contexts.
  }
}
