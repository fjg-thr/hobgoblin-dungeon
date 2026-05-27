const MUTED_PREFERENCE_KEY = "hobgoblin-dungeon-muted";

export const readMutedPreference = (storage: Storage | undefined): boolean => {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(MUTED_PREFERENCE_KEY) === "1";
  } catch {
    return false;
  }
};

export const writeMutedPreference = (storage: Storage | undefined, muted: boolean): void => {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(MUTED_PREFERENCE_KEY, muted ? "1" : "0");
  } catch {
    // Storage can be blocked in private/sandboxed contexts; audio still works in memory.
  }
};
