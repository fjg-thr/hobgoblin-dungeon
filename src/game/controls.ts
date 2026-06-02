export const SHOOT_KEY_BINDINGS = [
  { inputKey: "shoot", phaserKeyCode: "SPACE", label: "SPACE" },
  { inputKey: "shootAlt", phaserKeyCode: "J", label: "J" }
] as const;

export const SHOOT_CONTROL_LABEL = SHOOT_KEY_BINDINGS.map(({ label }) => label).join("/");

type ShootInputKey = (typeof SHOOT_KEY_BINDINGS)[number]["inputKey"];

interface PressableKey {
  isDown: boolean;
}

export type ShootInputState = Partial<Record<ShootInputKey, PressableKey>>;

export const isShootInputActive = (shotQueued: boolean, keys: ShootInputState) => {
  return shotQueued || SHOOT_KEY_BINDINGS.some(({ inputKey }) => keys[inputKey]?.isDown);
};
