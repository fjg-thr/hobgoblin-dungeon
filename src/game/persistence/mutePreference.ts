const MUTE_STORAGE_KEY = "hobgoblin-dungeon-muted";

type MutePreferenceStorage = Pick<Storage, "getItem" | "setItem">;

export const getBrowserStorage = (): MutePreferenceStorage | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

export const readMutedPreference = (storage: MutePreferenceStorage | undefined = getBrowserStorage()): boolean => {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(MUTE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export const writeMutedPreference = (storage: MutePreferenceStorage | undefined, muted: boolean): void => {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // Browsers can block storage in private or restricted contexts; audio still toggles for this session.
  }
};
