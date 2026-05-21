import { describe, expect, test } from "vitest";

type ModuleExports = Record<string, unknown>;
type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};
type ReadStoredMutePreference = (storage?: Pick<StorageLike, "getItem">) => boolean;
type WriteStoredMutePreference = (muted: boolean, storage?: Pick<StorageLike, "setItem">) => void;
type GameOverLayoutOptions = {
  cameraWidth: number;
  cameraHeight: number;
  titleWidth: number;
  titleHeight: number;
  buttonWidth: number;
  buttonHeight: number;
};
type GetGameOverLayout = (options: GameOverLayoutOptions) => {
  overlay: { width: number; height: number };
  content: { x: number; y: number };
  panelScale: number;
  button: { y: number; scale: number };
  restartZone: { x: number; y: number; width: number; height: number };
};

const loadUiState = async (): Promise<ModuleExports> => {
  const moduleUrl = new URL("./uiState.ts", import.meta.url).href;
  return import(/* @vite-ignore */ moduleUrl).catch(() => ({}));
};

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const throwingStorage: StorageLike = {
  getItem() {
    throw new DOMException("Storage blocked", "SecurityError");
  },
  setItem() {
    throw new DOMException("Storage blocked", "SecurityError");
  }
};

describe("uiState helpers", () => {
  test("mute preference helpers tolerate unavailable browser storage", async () => {
    const uiState = await loadUiState();
    const readStoredMutePreference = uiState.readStoredMutePreference as ReadStoredMutePreference | undefined;
    const writeStoredMutePreference = uiState.writeStoredMutePreference as WriteStoredMutePreference | undefined;

    expect(typeof readStoredMutePreference).toBe("function");
    expect(typeof writeStoredMutePreference).toBe("function");
    if (!readStoredMutePreference || !writeStoredMutePreference) {
      return;
    }

    expect(readStoredMutePreference(throwingStorage)).toBe(false);
    expect(() => writeStoredMutePreference(true, throwingStorage)).not.toThrow();
  });

  test("mute preference helpers persist the muted flag as stable storage values", async () => {
    const uiState = await loadUiState();
    const readStoredMutePreference = uiState.readStoredMutePreference as ReadStoredMutePreference | undefined;
    const writeStoredMutePreference = uiState.writeStoredMutePreference as WriteStoredMutePreference | undefined;

    expect(typeof readStoredMutePreference).toBe("function");
    expect(typeof writeStoredMutePreference).toBe("function");
    if (!readStoredMutePreference || !writeStoredMutePreference) {
      return;
    }

    const storage = new MemoryStorage();

    expect(readStoredMutePreference(storage)).toBe(false);
    writeStoredMutePreference(true, storage);
    expect(readStoredMutePreference(storage)).toBe(true);
    writeStoredMutePreference(false, storage);
    expect(readStoredMutePreference(storage)).toBe(false);
  });

  test("documented shooting keys include both Space and J", async () => {
    const uiState = await loadUiState();
    const shootKeyNames = uiState.SHOOT_KEY_NAMES as readonly string[] | undefined;

    expect(shootKeyNames).toContain("SPACE");
    expect(shootKeyNames).toContain("J");
  });

  test("game-over layout recomputes overlay and restart bounds for the active camera size", async () => {
    const uiState = await loadUiState();
    const getGameOverLayout = uiState.getGameOverLayout as GetGameOverLayout | undefined;

    expect(typeof getGameOverLayout).toBe("function");
    if (!getGameOverLayout) {
      return;
    }

    const small = getGameOverLayout({
      cameraWidth: 800,
      cameraHeight: 600,
      titleWidth: 512,
      titleHeight: 220,
      buttonWidth: 240,
      buttonHeight: 72
    });
    const wide = getGameOverLayout({
      cameraWidth: 1200,
      cameraHeight: 600,
      titleWidth: 512,
      titleHeight: 220,
      buttonWidth: 240,
      buttonHeight: 72
    });

    expect(small.overlay).toEqual({ width: 800, height: 600 });
    expect(wide.overlay).toEqual({ width: 1200, height: 600 });
    expect(small.content.x).toBe(400);
    expect(wide.content.x).toBe(600);
    expect(wide.restartZone.x).toBe(600);
    expect(wide.restartZone.x).not.toBe(small.restartZone.x);
  });
});
