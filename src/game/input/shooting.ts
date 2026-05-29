interface ShootKeyLike {
  isDown: boolean;
}

export interface ShootInputKeys {
  shoot: ShootKeyLike;
  shootAlt?: ShootKeyLike;
}

export const isShootRequested = (shotQueued: boolean, keys: ShootInputKeys): boolean => {
  return shotQueued || keys.shoot.isDown || keys.shootAlt?.isDown === true;
};
