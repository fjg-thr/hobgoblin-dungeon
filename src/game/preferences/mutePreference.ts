export const MUTE_PREFERENCE_KEY = "hobgoblin-dungeon-muted";

const browserLocalStorage = (): Storage | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

export const readMutedPreference = (storage: Storage | undefined = browserLocalStorage()): boolean => {
  try {
    return storage?.getItem(MUTE_PREFERENCE_KEY) === "1";
  } catch {
    return false;
  }
};

export const writeMutedPreference = (muted: boolean, storage: Storage | undefined = browserLocalStorage()) => {
  try {
    storage?.setItem(MUTE_PREFERENCE_KEY, muted ? "1" : "0");
  } catch {
    // Blocked storage should not prevent the game or mute toggle from working.
  }
};
