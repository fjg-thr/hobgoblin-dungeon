const MUTE_PREFERENCE_KEY = "hobgoblin-dungeon-muted";

export type MutePreferenceStorage = Pick<Storage, "getItem" | "setItem">;

const getBrowserStorage = (): MutePreferenceStorage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const readMutedPreference = (storage = getBrowserStorage()): boolean => {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(MUTE_PREFERENCE_KEY) === "1";
  } catch {
    return false;
  }
};

export const writeMutedPreference = (muted: boolean, storage = getBrowserStorage()): void => {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(MUTE_PREFERENCE_KEY, muted ? "1" : "0");
  } catch {
    // Storage can be unavailable in private or embedded browser contexts.
  }
};
