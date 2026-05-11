export const MUTED_PREFERENCE_KEY = "hobgoblin-dungeon-muted";

type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

const browserStorage = (): PreferenceStorage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const readMutedPreference = (storage: PreferenceStorage | null = browserStorage()): boolean => {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(MUTED_PREFERENCE_KEY) === "1";
  } catch {
    return false;
  }
};

export const writeMutedPreference = (muted: boolean, storage: PreferenceStorage | null = browserStorage()): void => {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(MUTED_PREFERENCE_KEY, muted ? "1" : "0");
  } catch {
    // Storage can be blocked in privacy-restricted contexts; mute still works in memory.
  }
};
