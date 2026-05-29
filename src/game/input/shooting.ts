interface ShootKeyLike {
  isDown: boolean;
}

export interface ShootInputKeys<TShootKey extends ShootKeyLike = ShootKeyLike> {
  shoot: TShootKey;
  shootAlt?: TShootKey;
}

export const isShootRequested = (shotQueued: boolean, keys: ShootInputKeys): boolean => {
  return shotQueued || keys.shoot.isDown || keys.shootAlt?.isDown === true;
};
