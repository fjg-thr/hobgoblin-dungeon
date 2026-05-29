interface ShootKeyLike {
  isDown: boolean;
}

export interface ShootInputKeys<TShootKey extends ShootKeyLike = ShootKeyLike> {
  shoot: TShootKey;
  shootAlt?: TShootKey;
}

export const forEachShootKey = <TShootKey extends ShootKeyLike>(keys: ShootInputKeys<TShootKey>, visit: (key: TShootKey) => void) => {
  visit(keys.shoot);

  if (keys.shootAlt) {
    visit(keys.shootAlt);
  }
};

export const isShootRequested = (shotQueued: boolean, keys: ShootInputKeys): boolean => {
  return shotQueued || keys.shoot.isDown || keys.shootAlt?.isDown === true;
};
