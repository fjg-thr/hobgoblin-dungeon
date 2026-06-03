export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface StorageSource {
  readonly localStorage: StorageLike;
}

export const getStorageFromSource = (source: StorageSource | undefined): StorageLike | undefined => {
  if (!source) {
    return undefined;
  }

  try {
    return source.localStorage;
  } catch {
    return undefined;
  }
};

export const readStorageFlag = (storage: StorageLike | undefined, key: string): boolean => {
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(key) === "1";
  } catch {
    return false;
  }
};

export const writeStorageFlag = (storage: StorageLike | undefined, key: string, enabled: boolean): void => {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, enabled ? "1" : "0");
  } catch {
    // Storage can be denied in private or embedded browser contexts.
  }
};
