import * as Phaser from "phaser";
import { assetManifest, type AudioAssetKey, type TileAssetKey } from "../assets/manifest";
import {
  HALF_TILE_HEIGHT,
  HALF_TILE_WIDTH,
  getTileCode,
  isTileBlocked,
  startingDungeon,
  tileAssetForCode,
  type DungeonProp,
  type PropKind,
  type TileCode
} from "../maps/startingDungeon";

type Direction = (typeof assetManifest.character.directions)[number];
type PowerUpKind = (typeof assetManifest.powerUps.types)[number];
type EnemyKind = keyof typeof assetManifest.enemies;

interface TilePoint {
  x: number;
  y: number;
}

interface WorldPoint {
  x: number;
  y: number;
}

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface CollisionBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface PropRenderConfig {
  origin: { x: number; y: number };
  yOffset: number;
  depthOffset: number;
  collision?: CollisionBox;
  glow?: {
    yOffset: number;
    alpha: number;
  };
}

interface EnemyActor {
  kind: EnemyKind;
  tile: TilePoint;
  direction: Direction;
  sprite: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Image;
  health: number;
  respawnAtMs: number;
  hurtUntilMs: number;
}

interface EnemyConfig {
  textureKey: string;
  keyPrefix: string;
  maxHealth: number;
  speed: number;
  radius: number;
  alertRange: number;
  attackAnimRange: number;
  contactRange: number;
  hitRange: number;
  score: number;
  respawnMs: number;
  spriteScale: number;
  shadowScale: number;
  shadowAlpha: number;
  knockbackMultiplier: number;
}

interface StaffProjectile {
  tile: TilePoint;
  velocity: TilePoint;
  sprite: Phaser.GameObjects.Sprite;
  alive: boolean;
  traveled: number;
  blastCharged: boolean;
}

interface PowerUp {
  kind: PowerUpKind;
  tile: TilePoint;
  sprite: Phaser.GameObjects.Sprite;
  glow: Phaser.GameObjects.Image;
  spawnedAtMs: number;
}

interface PowerUpConfig {
  row: number;
  weight: number;
  unlockKills: number;
  unlockElapsedMs: number;
  glowTint: number;
  glowAlpha: number;
  spriteScale: number;
  popupText: string;
  popupColor: string;
  debugColor: number;
}

interface HeartPickup {
  tile: TilePoint;
  sprite: Phaser.GameObjects.Image;
  glow: Phaser.GameObjects.Image;
  spawnedAtMs: number;
}

interface AmmoPickup {
  tile: TilePoint;
  sprite: Phaser.GameObjects.Sprite;
  glow: Phaser.GameObjects.Image;
  amount: number;
  spawnedAtMs: number;
}

const SCENE_KEY = "DungeonScene";
const MAP_OFFSET_X = startingDungeon.width * HALF_TILE_WIDTH + 40;
const MAP_OFFSET_Y = 48;
const PLAYER_RADIUS = 0.22;
const PLAYER_SPEED_TILES = 3.35;
const MAX_PLAYER_HEALTH = 3;
const ENEMY_HURT_FLASH_MS = 240;
const ENEMY_HIT_KNOCKBACK_TILES = 0.32;
const PLAYER_INVULN_MS = 900;
const PLAYER_POWER_FLASH_MS = 900;
const PROJECTILE_RADIUS = 0.12;
const PROJECTILE_SPEED_TILES = 7.5;
const PROJECTILE_MAX_DISTANCE = 8;
const PROJECTILE_COOLDOWN_MS = 260;
const PROJECTILE_AIM_SNAP_DEGREES = 15;
const MIN_POINTER_AIM_DISTANCE = 20;
const DIFFICULTY_STEP_MS = 14500;
const DIFFICULTY_SPAWN_CHECK_MS = 1900;
const MAX_ENEMIES = 8;
const MAX_BRUTES = 2;
const MAX_SIMULATION_DT = 1 / 35;
const BRUTE_UNLOCK_KILLS = 6;
const BRUTE_UNLOCK_MS = 42000;
const ENEMY_SAFE_SPAWN_DISTANCE = 5.2;
const INITIAL_AMMO = 14;
const MAX_AMMO = 24;
const AMMO_PICKUP_AMOUNT = 6;
const AMMO_PICKUP_RADIUS = 0.48;
const AMMO_PICKUP_SAFE_DISTANCE = 2.4;
const MAX_ACTIVE_AMMO_PICKUPS = 3;
const AMMO_SPAWN_INITIAL_MS = 4200;
const AMMO_SPAWN_INTERVAL_MS = 9000;
const LOW_AMMO_DROP_THRESHOLD = 5;
const QUICKSHOT_COOLDOWN_MS = 130;
const QUICKSHOT_DURATION_MS = 9000;
const HASTE_DURATION_MS = 8000;
const HASTE_SPEED_MULTIPLIER = 1.35;
const WARD_DURATION_MS = 7000;
const POWERUP_SPAWN_INITIAL_MS = 7000;
const POWERUP_SPAWN_INTERVAL_MS = 14000;
const POWERUP_PICKUP_RADIUS = 0.48;
const POWERUP_SAFE_DISTANCE = 2.8;
const MAX_ACTIVE_POWERUPS = 2;
const BLAST_RADIUS_TILES = 3.15;
const BLAST_DAMAGE = 4;
const HEART_PICKUP_RADIUS = 0.46;
const FIRST_HEART_DROP_KILLS = 3;
const HEART_DROP_KILL_STEP = 5;
const HEART_DROP_MIN_COUNT = 1;
const HEART_DROP_MAX_COUNT = 3;
const MAX_ACTIVE_HEART_PICKUPS = 3;
const HEART_PICKUP_SAFE_DISTANCE = 2.4;
const FOCUS_MASK_KEY = "player_focus_mask";

const ENEMY_CONFIG: Record<EnemyKind, EnemyConfig> = {
  goblin: {
    textureKey: assetManifest.enemies.goblin.key,
    keyPrefix: "goblin-",
    maxHealth: 3,
    speed: 2.05,
    radius: 0.22,
    alertRange: 6.4,
    attackAnimRange: 0.9,
    contactRange: 0.44,
    hitRange: 0.46,
    score: 100,
    respawnMs: 1800,
    spriteScale: 1,
    shadowScale: 0.82,
    shadowAlpha: 0.62,
    knockbackMultiplier: 1
  },
  brute: {
    textureKey: assetManifest.enemies.brute.key,
    keyPrefix: "brute-",
    maxHealth: 7,
    speed: 1.32,
    radius: 0.3,
    alertRange: 7.8,
    attackAnimRange: 1.05,
    contactRange: 0.56,
    hitRange: 0.58,
    score: 350,
    respawnMs: 5200,
    spriteScale: 1.34,
    shadowScale: 1.18,
    shadowAlpha: 0.7,
    knockbackMultiplier: 0.42
  }
};

const POWERUP_CONFIG: Record<PowerUpKind, PowerUpConfig> = {
  quickshot: {
    row: 0,
    weight: 72,
    unlockKills: 0,
    unlockElapsedMs: 0,
    glowTint: 0x72f2a6,
    glowAlpha: 0.2,
    spriteScale: 1.15,
    popupText: "QUICKSHOT",
    popupColor: "#9bf7c3",
    debugColor: 0x9bf7c3
  },
  haste: {
    row: 1,
    weight: 30,
    unlockKills: 4,
    unlockElapsedMs: 45000,
    glowTint: 0x78baff,
    glowAlpha: 0.18,
    spriteScale: 1.12,
    popupText: "HASTE",
    popupColor: "#9fc8ff",
    debugColor: 0x8bbdff
  },
  ward: {
    row: 2,
    weight: 12,
    unlockKills: 10,
    unlockElapsedMs: 90000,
    glowTint: 0xd5a8ff,
    glowAlpha: 0.16,
    spriteScale: 1.1,
    popupText: "WARD",
    popupColor: "#d7b4ff",
    debugColor: 0xcfa8ff
  },
  blast: {
    row: 3,
    weight: 7,
    unlockKills: 10,
    unlockElapsedMs: 85000,
    glowTint: 0xff5a35,
    glowAlpha: 0.24,
    spriteScale: 1.18,
    popupText: "BLAST",
    popupColor: "#ffad73",
    debugColor: 0xff6a3d
  }
};

const DEPTH_BANDS = {
  floor: 0,
  actorShadow: 2600,
  terrain: 3000,
  prop: 3000,
  actor: 3000,
  debug: 90000
} as const;
const HERO_DEPTH = DEPTH_BANDS.debug + 8;
const HERO_EFFECT_DEPTH = DEPTH_BANDS.debug + 9;
const HUD_DEPTH = DEPTH_BANDS.debug + 120;
const HERO_SPRITE_SCALE = 1.45;

const CAMERA_TARGET_VIEW_WIDTH = 1300;
const CAMERA_TARGET_VIEW_HEIGHT = 720;
const CAMERA_MIN_ZOOM = 1.28;
const CAMERA_MAX_ZOOM = 2;
const HUD_INSET_RATIO = 0.045;
const HUD_MIN_INSET_X = 42;
const HUD_MAX_INSET_X = 92;
const HUD_PANEL_SCREEN_SCALE = 1.08;
const HUD_PANEL_GAP_Y = 18;
const HUD_TOP_RATIO = 0.038;
const HUD_TOP_MIN_Y = 28;
const HUD_TOP_MAX_Y = 44;
const HUD_VALUE_SOURCE_X = 200;
const HUD_VALUE_SOURCE_Y = 23;
const POWERUP_TEXT_SOURCE_Y = 86;
const LIFE_METER_SCALE = 0.42;
const LIFE_HEART_SCALE = 0.66;
const LIFE_METER_MARGIN = { x: 42, y: 26 };
const LIFE_HEART_CENTERS = [
  { x: 166, y: 132 },
  { x: 320, y: 132 },
  { x: 474, y: 132 }
] as const;

const PROP_RENDER: Record<PropKind, PropRenderConfig> = {
  torch: {
    origin: { x: 0.5, y: 0.86 },
    yOffset: -16,
    depthOffset: 22,
    collision: { left: 0.35, right: 0.65, top: 0.28, bottom: 0.76 },
    glow: { yOffset: -38, alpha: 0.28 }
  },
  small_candle: {
    origin: { x: 0.5, y: 0.86 },
    yOffset: -10,
    depthOffset: 14,
    collision: { left: 0.36, right: 0.64, top: 0.38, bottom: 0.72 },
    glow: { yOffset: -24, alpha: 0.14 }
  },
  bone_pile: {
    origin: { x: 0.5, y: 0.76 },
    yOffset: -6,
    depthOffset: 10,
    collision: { left: 0.22, right: 0.78, top: 0.28, bottom: 0.76 }
  },
  small_treasure: {
    origin: { x: 0.5, y: 0.76 },
    yOffset: -6,
    depthOffset: 10,
    collision: { left: 0.22, right: 0.78, top: 0.3, bottom: 0.76 }
  },
  red_banner: {
    origin: { x: 0.5, y: 0.92 },
    yOffset: -18,
    depthOffset: 18,
    collision: { left: 0.35, right: 0.65, top: 0.24, bottom: 0.78 }
  },
  rubble: {
    origin: { x: 0.5, y: 0.78 },
    yOffset: -6,
    depthOffset: 11,
    collision: { left: 0.16, right: 0.84, top: 0.22, bottom: 0.82 }
  },
  wooden_post: {
    origin: { x: 0.5, y: 0.9 },
    yOffset: -16,
    depthOffset: 18,
    collision: { left: 0.34, right: 0.66, top: 0.22, bottom: 0.82 }
  }
};

export class DungeonScene extends Phaser.Scene {
  private playerTile: TilePoint = { ...startingDungeon.playerStart };
  private playerDirection: Direction = "southeast";
  private playerHealth = MAX_PLAYER_HEALTH;
  private playerInvulnerableUntilMs = 0;
  private playerPowerFlashUntilMs = 0;
  private player?: Phaser.GameObjects.Sprite;
  private shadow?: Phaser.GameObjects.Image;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private hudGraphics?: Phaser.GameObjects.Graphics;
  private scorePanel?: Phaser.GameObjects.Sprite;
  private scoreText?: Phaser.GameObjects.Text;
  private powerUpText?: Phaser.GameObjects.Text;
  private ammoPanel?: Phaser.GameObjects.Sprite;
  private ammoText?: Phaser.GameObjects.Text;
  private lifeMeterImage?: Phaser.GameObjects.Sprite;
  private lifeHeartImages: Phaser.GameObjects.Sprite[] = [];
  private muteButtonContainer?: Phaser.GameObjects.Container;
  private muteButtonBg?: Phaser.GameObjects.Graphics;
  private muteButtonText?: Phaser.GameObjects.Text;
  private muteButtonZone?: Phaser.GameObjects.Zone;
  private hasteSparkles?: Phaser.GameObjects.Sprite;
  private focusMask?: Phaser.GameObjects.Image;
  private focusMaskTexture?: Phaser.Textures.CanvasTexture;
  private focusMaskSignature = "";
  private gameOverContainer?: Phaser.GameObjects.Container;
  private gameOverButtonBounds?: Phaser.Geom.Rectangle;
  private startContainer?: Phaser.GameObjects.Container;
  private startButtonBounds?: Phaser.Geom.Rectangle;
  private coordinateLabels: Phaser.GameObjects.Text[] = [];
  private enemies: EnemyActor[] = [];
  private projectiles: StaffProjectile[] = [];
  private powerUps: PowerUp[] = [];
  private heartPickups: HeartPickup[] = [];
  private ammoPickups: AmmoPickup[] = [];
  private propBlockers: CollisionBox[] = [];
  private mapBounds: Bounds = { left: 0, right: 0, top: 0, bottom: 0 };
  private lastAimScreenPoint?: WorldPoint;
  private nextShotAtMs = 0;
  private runStartedAtMs = 0;
  private nextDifficultyCheckAtMs = 0;
  private nextPowerUpSpawnAtMs = 0;
  private nextAmmoSpawnAtMs = 0;
  private quickshotUntilMs = 0;
  private hasteUntilMs = 0;
  private wardUntilMs = 0;
  private blastShotReady = false;
  private nextWardBlockPopupAtMs = 0;
  private nextNoAmmoPopupAtMs = 0;
  private shotQueued = false;
  private playerScore = 0;
  private enemyKills = 0;
  private playerAmmo = INITIAL_AMMO;
  private nextHeartDropKill = FIRST_HEART_DROP_KILLS;
  private debugEnabled = false;
  private gameStarted = false;
  private gameOver = false;
  private muted = false;
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private ambienceSound?: Phaser.Sound.BaseSound;

  constructor() {
    super(SCENE_KEY);
  }

  preload() {
    this.load.spritesheet(assetManifest.character.key, assetManifest.character.path, {
      frameWidth: assetManifest.character.frameWidth,
      frameHeight: assetManifest.character.frameHeight
    });
    this.load.spritesheet(assetManifest.enemies.goblin.key, assetManifest.enemies.goblin.path, {
      frameWidth: assetManifest.enemies.goblin.frameWidth,
      frameHeight: assetManifest.enemies.goblin.frameHeight
    });
    this.load.spritesheet(assetManifest.enemies.brute.key, assetManifest.enemies.brute.path, {
      frameWidth: assetManifest.enemies.brute.frameWidth,
      frameHeight: assetManifest.enemies.brute.frameHeight
    });
    this.load.spritesheet(assetManifest.projectiles.staffBolt.key, assetManifest.projectiles.staffBolt.path, {
      frameWidth: assetManifest.projectiles.staffBolt.frameWidth,
      frameHeight: assetManifest.projectiles.staffBolt.frameHeight
    });
    this.load.spritesheet(assetManifest.animatedEffects.torchFlame.key, assetManifest.animatedEffects.torchFlame.path, {
      frameWidth: assetManifest.animatedEffects.torchFlame.frameWidth,
      frameHeight: assetManifest.animatedEffects.torchFlame.frameHeight
    });
    this.load.spritesheet(assetManifest.animatedEffects.candleFlame.key, assetManifest.animatedEffects.candleFlame.path, {
      frameWidth: assetManifest.animatedEffects.candleFlame.frameWidth,
      frameHeight: assetManifest.animatedEffects.candleFlame.frameHeight
    });
    this.load.spritesheet(assetManifest.animatedEffects.hasteSparkle.key, assetManifest.animatedEffects.hasteSparkle.path, {
      frameWidth: assetManifest.animatedEffects.hasteSparkle.frameWidth,
      frameHeight: assetManifest.animatedEffects.hasteSparkle.frameHeight
    });
    this.load.spritesheet(assetManifest.animatedEffects.blast.key, assetManifest.animatedEffects.blast.path, {
      frameWidth: assetManifest.animatedEffects.blast.frameWidth,
      frameHeight: assetManifest.animatedEffects.blast.frameHeight
    });
    Object.values(assetManifest.uiSprites).forEach((sheet) => {
      this.load.spritesheet(sheet.key, sheet.path, {
        frameWidth: sheet.frameWidth,
        frameHeight: sheet.frameHeight
      });
    });
    this.load.spritesheet(assetManifest.powerUps.key, assetManifest.powerUps.path, {
      frameWidth: assetManifest.powerUps.frameWidth,
      frameHeight: assetManifest.powerUps.frameHeight
    });
    this.load.spritesheet(assetManifest.pickups.ammo.key, assetManifest.pickups.ammo.path, {
      frameWidth: assetManifest.pickups.ammo.frameWidth,
      frameHeight: assetManifest.pickups.ammo.frameHeight
    });

    Object.entries(assetManifest.tiles).forEach(([key, path]) => this.load.image(key, path));
    Object.entries(assetManifest.effects).forEach(([key, path]) => this.load.image(key, path));
    Object.entries(assetManifest.ui).forEach(([key, path]) => this.load.image(key, path));
    Object.entries(assetManifest.audio).forEach(([key, path]) => this.load.audio(key, path));
  }

  create() {
    this.cameras.main.setBackgroundColor("#050607");
    this.updateCameraZoom();
    this.textures.getTextureKeys().forEach((key) => {
      const texture = this.textures.get(key);
      texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    });

    this.createAnimations();
    this.renderDungeon();
    this.createPlayer();
    this.createEnemies();
    this.createInput();
    this.createDebugLayer();
    this.createFocusMask();
    this.createHud();
    this.createMuteButton();
    this.mapBounds = this.calculateMapBounds();
    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.handleResize, this);
    });
    this.updateCamera(1);
    this.updateFocusMask(true);
    this.showStartScreen();
  }

  update(_: number, deltaMs: number) {
    const dt = Math.min(deltaMs / 1000, MAX_SIMULATION_DT);
    if (!this.gameStarted) {
      this.updatePlayerVisuals();
      this.updateCamera(dt);
      this.updateFocusMask();
      return;
    }

    if (this.gameOver) {
      this.updateFocusMask();
      return;
    }

    const movement = this.readMovementVector();

    if (movement.x !== 0 || movement.y !== 0) {
      this.playerDirection = this.directionFromVector(movement);
      this.movePlayer(movement, dt);
      this.player?.anims.play(`walk-${this.playerDirection}`, true);
    } else {
      this.player?.anims.play(`idle-${this.playerDirection}`, true);
    }

    this.tryShootProjectile();
    this.updateDifficulty();
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updatePowerUps();
    this.updateHeartPickups();
    this.updateAmmoPickups();
    this.updatePlayerVisuals();
    this.updateCamera(dt);
    this.updateFocusMask();
    this.updatePowerUpText();

    if (this.debugEnabled) {
      this.drawDebug();
    }
  }

  private createAnimations() {
    this.createActorAnimations(assetManifest.character.key, "", assetManifest.character.directions);
    this.createActorAnimations(assetManifest.enemies.goblin.key, "goblin-", assetManifest.enemies.goblin.directions);
    this.createActorAnimations(assetManifest.enemies.brute.key, "brute-", assetManifest.enemies.brute.directions);
    Object.values(ENEMY_CONFIG).forEach((config) => {
      assetManifest.enemies.goblin.directions.forEach((direction, row) => {
        this.anims.create({
          key: `${config.keyPrefix}attack-${direction}`,
          frames: this.anims.generateFrameNumbers(config.textureKey, {
            start: row * 10 + 4,
            end: row * 10 + 9
          }),
          frameRate: config.keyPrefix === "brute-" ? 8 : 12,
          repeat: -1
        });
      });
    });
    this.anims.create({
      key: assetManifest.animatedEffects.torchFlame.key,
      frames: this.anims.generateFrameNumbers(assetManifest.animatedEffects.torchFlame.key, { start: 0, end: 7 }),
      frameRate: 9,
      repeat: -1
    });
    this.anims.create({
      key: assetManifest.animatedEffects.candleFlame.key,
      frames: this.anims.generateFrameNumbers(assetManifest.animatedEffects.candleFlame.key, { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: assetManifest.animatedEffects.hasteSparkle.key,
      frames: this.anims.generateFrameNumbers(assetManifest.animatedEffects.hasteSparkle.key, { start: 0, end: 7 }),
      frameRate: 16,
      repeat: -1
    });
    this.anims.create({
      key: assetManifest.animatedEffects.blast.key,
      frames: this.anims.generateFrameNumbers(assetManifest.animatedEffects.blast.key, { start: 0, end: 7 }),
      frameRate: 16,
      repeat: 0
    });
    this.anims.create({
      key: assetManifest.uiSprites.startTitle.key,
      frames: this.anims.generateFrameNumbers(assetManifest.uiSprites.startTitle.key, { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: assetManifest.uiSprites.gameOverTitle.key,
      frames: this.anims.generateFrameNumbers(assetManifest.uiSprites.gameOverTitle.key, { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: assetManifest.uiSprites.lifeMeterLoop.key,
      frames: this.anims.generateFrameNumbers(assetManifest.uiSprites.lifeMeterLoop.key, { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: "hud-score-loop",
      frames: this.anims.generateFrameNumbers(assetManifest.uiSprites.hudPanels.key, { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: "hud-ammo-loop",
      frames: this.anims.generateFrameNumbers(assetManifest.uiSprites.hudPanels.key, { start: 4, end: 7 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: assetManifest.uiSprites.lifeHeartBurst.key,
      frames: this.anims.generateFrameNumbers(assetManifest.uiSprites.lifeHeartBurst.key, { start: 0, end: 7 }),
      frameRate: 15,
      repeat: 0
    });
    this.anims.create({
      key: assetManifest.uiSprites.lifeHeartShimmer.key,
      frames: this.anims.generateFrameNumbers(assetManifest.uiSprites.lifeHeartShimmer.key, { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    assetManifest.powerUps.types.forEach((kind) => {
      const config = POWERUP_CONFIG[kind];
      this.anims.create({
        key: `powerup-${kind}`,
        frames: this.anims.generateFrameNumbers(assetManifest.powerUps.key, {
          start: config.row * 8,
          end: config.row * 8 + 7
        }),
        frameRate: 10,
        repeat: -1
      });
    });
    this.anims.create({
      key: "ammo-pickup-loop",
      frames: this.anims.generateFrameNumbers(assetManifest.pickups.ammo.key, { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "staff-bolt-fly",
      frames: this.anims.generateFrameNumbers(assetManifest.projectiles.staffBolt.key, { start: 0, end: 7 }),
      frameRate: 14,
      repeat: -1
    });
    this.anims.create({
      key: "staff-bolt-impact",
      frames: this.anims.generateFrameNumbers(assetManifest.projectiles.staffBolt.key, { start: 8, end: 15 }),
      frameRate: 18,
      repeat: 0
    });
  }

  private createActorAnimations(textureKey: string, keyPrefix: string, directions: readonly Direction[]) {
    directions.forEach((direction, row) => {
      this.anims.create({
        key: `${keyPrefix}idle-${direction}`,
        frames: this.anims.generateFrameNumbers(textureKey, {
          start: row * 10,
          end: row * 10 + 3
        }),
        frameRate: 6,
        repeat: -1
      });
      this.anims.create({
        key: `${keyPrefix}walk-${direction}`,
        frames: this.anims.generateFrameNumbers(textureKey, {
          start: row * 10 + 4,
          end: row * 10 + 9
        }),
        frameRate: 10,
        repeat: -1
      });
    });
  }

  private renderDungeon() {
    this.addFloorEdgeSilhouette();

    for (let y = 0; y < startingDungeon.height; y += 1) {
      for (let x = 0; x < startingDungeon.width; x += 1) {
        const code = getTileCode(x, y);
        if (code === " " || code === "W") {
          continue;
        }

        const world = this.tileToWorld({ x, y });
        const assetKey = tileAssetForCode[code as Exclude<TileCode, " ">];
        this.addTileImage(assetKey, world, code, x, y);
      }
    }

    startingDungeon.props.forEach((prop) => this.addProp(prop));
  }

  private addFloorEdgeSilhouette() {
    const graphics = this.add.graphics();
    graphics.setDepth(DEPTH_BANDS.floor - 100);
    graphics.fillStyle(0x020303, 0.76);

    for (let y = 0; y < startingDungeon.height; y += 1) {
      for (let x = 0; x < startingDungeon.width; x += 1) {
        const code = getTileCode(x, y);
        if (!this.isFloorShapeTile(code)) {
          continue;
        }

        const world = this.tileToWorld({ x, y });
        graphics.fillPoints(
          [
            new Phaser.Math.Vector2(world.x, world.y - HALF_TILE_HEIGHT - 2),
            new Phaser.Math.Vector2(world.x + HALF_TILE_WIDTH + 5, world.y + 1),
            new Phaser.Math.Vector2(world.x, world.y + HALF_TILE_HEIGHT + 9),
            new Phaser.Math.Vector2(world.x - HALF_TILE_WIDTH - 5, world.y + 1)
          ],
          true
        );
      }
    }
  }

  private addTileImage(assetKey: TileAssetKey, world: WorldPoint, code: TileCode, tileX: number, tileY: number) {
    const image = this.add.image(world.x, world.y, assetKey);

    if (code === "S") {
      image.setOrigin(0.5, 0.75);
      image.setDepth(this.depthForTilePoint({ x: tileX + 0.5, y: tileY + 0.82 }, DEPTH_BANDS.floor, 5));
      return;
    }

    if (code === "B") {
      image.setOrigin(0.5, 0.58);
      image.setDepth(this.depthForTilePoint({ x: tileX + 0.5, y: tileY + 0.5 }, DEPTH_BANDS.floor, 12));
      return;
    }

    if (code === "h") {
      image.setOrigin(0.5, 0.58);
      image.setDepth(this.depthForTilePoint({ x: tileX + 0.5, y: tileY + 0.5 }, DEPTH_BANDS.floor, -35));
      return;
    }

    image.setOrigin(0.5, 0.61);
    image.setDepth(this.depthForTilePoint({ x: tileX + 0.5, y: tileY + 0.5 }, DEPTH_BANDS.floor, -30));
  }

  private addProp(prop: DungeonProp) {
    const config = PROP_RENDER[prop.kind];
    const anchor = this.propAnchor(prop);
    const image = this.add.image(anchor.x, anchor.y + config.yOffset, prop.kind);
    image.setOrigin(config.origin.x, config.origin.y);
    const depth = this.propDepth(prop, config);
    image.setDepth(depth);
    this.addPropAnimation(prop, anchor, depth);

    if (config.glow) {
      const glow = this.add.image(anchor.x, anchor.y + config.glow.yOffset, "torch_glow");
      glow.setOrigin(0.5, 0.5);
      glow.setAlpha(config.glow.alpha);
      glow.setBlendMode(Phaser.BlendModes.ADD);
      glow.setDepth(this.propDepth(prop, config) - 1);
    }

    if (prop.blocks && config.collision) {
      this.propBlockers.push(this.propCollisionBox(prop, config.collision));
    }
  }

  private createPlayer() {
    const world = this.tileToWorld(this.playerTile);
    this.shadow = this.add.image(world.x, world.y + 5, "shadow_blob");
    this.shadow.setOrigin(0.5, 0.5);
    this.shadow.setAlpha(0.74);
    this.shadow.setDepth(this.depthForTilePoint(this.playerTile, DEPTH_BANDS.actorShadow, 8));

    this.player = this.add.sprite(world.x, world.y, assetManifest.character.key, 0);
    this.player.setOrigin(0.5, 0.94);
    this.player.setScale(HERO_SPRITE_SCALE);
    this.player.setDepth(HERO_DEPTH);
    this.player.anims.play("idle-southeast");

    this.hasteSparkles = this.add.sprite(world.x, world.y - 18, assetManifest.animatedEffects.hasteSparkle.key, 0);
    this.hasteSparkles.setOrigin(0.5);
    this.hasteSparkles.setBlendMode(Phaser.BlendModes.ADD);
    this.hasteSparkles.setVisible(false);
    this.hasteSparkles.setDepth(HERO_EFFECT_DEPTH);
    this.hasteSparkles.anims.play(assetManifest.animatedEffects.hasteSparkle.key);
  }

  private createEnemies() {
    startingDungeon.enemyStarts.forEach((start) => {
      this.spawnEnemy(start);
    });
  }

  private createInput() {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.keys = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      shoot: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      shootAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      debug: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F3)
    };

    this.keys.debug.on("down", () => {
      this.debugEnabled = !this.debugEnabled;
      this.debugGraphics?.setVisible(this.debugEnabled);
      this.coordinateLabels.forEach((label) => label.setVisible(this.debugEnabled));
      if (!this.debugEnabled) {
        this.debugGraphics?.clear();
      }
    });
    this.keys.shoot.on("down", () => {
      if (!this.gameStarted) {
        this.startGame();
        return;
      }
      this.shotQueued = true;
    });
    this.keys.shootAlt.on("down", () => {
      if (!this.gameStarted) {
        this.startGame();
        return;
      }
      this.shotQueued = true;
    });

    this.input.on("pointermove", this.updatePointerAim, this);
    this.input.on("pointerdown", this.handleAimPointerDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointermove", this.updatePointerAim, this);
      this.input.off("pointerdown", this.handleAimPointerDown, this);
    });
  }

  private createDebugLayer() {
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(DEPTH_BANDS.debug);
    this.debugGraphics.setVisible(false);

    for (let y = 0; y < startingDungeon.height; y += 1) {
      for (let x = 0; x < startingDungeon.width; x += 1) {
        const code = getTileCode(x, y);
        if (code === " ") {
          continue;
        }
        const world = this.tileToWorld({ x, y });
        const label = this.add.text(world.x - 10, world.y - 8, `${x},${y}`, {
          fontFamily: "monospace",
          fontSize: "7px",
          color: isTileBlocked(code) ? "#ff7a6f" : "#99f0c5"
        });
        label.setDepth(DEPTH_BANDS.debug + 1);
        label.setVisible(false);
        this.coordinateLabels.push(label);
      }
    }
  }

  private createHud() {
    this.scorePanel = this.add.sprite(0, 0, assetManifest.uiSprites.hudPanels.key, 0);
    this.scorePanel.setOrigin(0, 0);
    this.scorePanel.setScrollFactor(0);
    this.scorePanel.setDepth(HUD_DEPTH);
    this.scorePanel.setFrame(0);
    this.addStaticShimmer(this.scorePanel, 0.94, 1, 1400);

    this.scoreText = this.add.text(0, 0, "0000", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffe9a9",
      stroke: "#060404",
      strokeThickness: 4
    });
    this.scoreText.setOrigin(1, 0.5);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(HUD_DEPTH + 1);

    this.powerUpText = this.add.text(0, 0, "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#9bf7c3",
      stroke: "#06120a",
      strokeThickness: 4
    });
    this.powerUpText.setScrollFactor(0);
    this.powerUpText.setDepth(HUD_DEPTH + 1);

    this.ammoPanel = this.add.sprite(0, 0, assetManifest.uiSprites.hudPanels.key, 4);
    this.ammoPanel.setOrigin(0, 0);
    this.ammoPanel.setScrollFactor(0);
    this.ammoPanel.setDepth(HUD_DEPTH);
    this.ammoPanel.setFrame(4);
    this.addStaticShimmer(this.ammoPanel, 0.94, 1, 1600);

    this.ammoText = this.add.text(0, 0, "", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#ffbd73",
      stroke: "#120706",
      strokeThickness: 4
    });
    this.ammoText.setOrigin(1, 0.5);
    this.ammoText.setScrollFactor(0);
    this.ammoText.setDepth(HUD_DEPTH + 1);

    this.lifeMeterImage = this.add.sprite(0, 0, assetManifest.uiSprites.lifeMeterLoop.key, 0);
    this.lifeMeterImage.setOrigin(0, 0);
    this.lifeMeterImage.setScrollFactor(0);
    this.lifeMeterImage.setDepth(HUD_DEPTH);
    this.lifeMeterImage.setFrame(0);
    this.addStaticShimmer(this.lifeMeterImage, 0.96, 1, 1700);
    this.lifeHeartImages = LIFE_HEART_CENTERS.map((center) => {
      const heart = this.add.sprite(
        0,
        0,
        assetManifest.uiSprites.lifeHeartShimmer.key,
        0
      );
      heart.setOrigin(0.5);
      heart.setScrollFactor(0);
      heart.setDepth(HUD_DEPTH + 1);
      heart.setFrame(0);
      this.addStaticShimmer(heart, 0.92, 1, 900 + Math.round(center.x));
      return heart;
    });

    this.hudGraphics = this.add.graphics();
    this.hudGraphics.setScrollFactor(0);
    this.hudGraphics.setDepth(HUD_DEPTH + 1);
    this.positionHud();
    this.drawLifeMeter();
    this.updateScoreText();
    this.updatePowerUpText();
    this.updateAmmoText();
  }

  private createMuteButton() {
    this.muted = this.readMutedPreference();
    this.sound.mute = this.muted;

    const width = 88;
    const height = 34;
    this.muteButtonBg = this.add.graphics();
    this.muteButtonText = this.add.text(width / 2, height / 2 + 1, "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#ffe9a9",
      stroke: "#080504",
      strokeThickness: 3
    });
    this.muteButtonText.setOrigin(0.5);

    this.muteButtonZone = this.add.zone(0, 0, width, height);
    this.muteButtonZone.setScrollFactor(0);
    this.muteButtonZone.setDepth(HUD_DEPTH + 55);
    this.muteButtonZone.setInteractive({ useHandCursor: true });
    this.muteButtonZone.on("pointerdown", () => this.toggleMute());

    this.muteButtonContainer = this.add.container(0, 0, [this.muteButtonBg, this.muteButtonText]);
    this.muteButtonContainer.setScrollFactor(0);
    this.muteButtonContainer.setDepth(HUD_DEPTH + 50);
    this.positionMuteButton();
    this.updateMuteButtonVisuals();
  }

  private readMutedPreference(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("hobgoblin-dungeon-muted") === "1";
  }

  private writeMutedPreference() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("hobgoblin-dungeon-muted", this.muted ? "1" : "0");
  }

  private toggleMute() {
    const wasMuted = this.muted;
    this.muted = !this.muted;
    this.sound.mute = this.muted;
    this.writeMutedPreference();
    this.updateMuteButtonVisuals();
    if (wasMuted && !this.muted) {
      this.playSfx("uiToggle", { volume: 0.24 });
    }
  }

  private updateMuteButtonVisuals() {
    if (!this.muteButtonBg || !this.muteButtonText) {
      return;
    }

    this.muteButtonBg.clear();
    this.muteButtonBg.fillStyle(this.muted ? 0x1b1516 : 0x121716, 0.92);
    this.muteButtonBg.fillRoundedRect(0, 0, 88, 34, 5);
    this.muteButtonBg.lineStyle(1, this.muted ? 0x8f5454 : 0xa48645, 0.92);
    this.muteButtonBg.strokeRoundedRect(0.5, 0.5, 87, 33, 5);
    this.muteButtonText.setText(this.muted ? "MUTED" : "SOUND");
    this.muteButtonText.setColor(this.muted ? "#d68c8c" : "#ffe9a9");
  }

  private positionMuteButton() {
    const x = this.cameras.main.width - 106;
    const y = this.cameras.main.height - 52;
    this.muteButtonContainer?.setScale(this.uiScale());
    this.muteButtonContainer?.setPosition(this.uiX(x), this.uiY(y));
    this.muteButtonZone?.setScale(this.uiScale());
    this.muteButtonZone?.setPosition(this.uiX(x + 44), this.uiY(y + 17));
  }

  private playSfx(key: AudioAssetKey, config: { volume?: number; rate?: number; detune?: number } = {}) {
    if (this.muted || !this.sound || this.sound.locked) {
      return;
    }

    this.sound.play(key, {
      volume: 0.34,
      ...config
    });
  }

  private startBackgroundMusic() {
    if (!this.backgroundMusic) {
      this.backgroundMusic = this.sound.add("retroDungeonTheme", {
        loop: true,
        volume: 0.075
      });
    }

    if (!this.ambienceSound) {
      this.ambienceSound = this.sound.add("dungeonAmbience", {
        loop: true,
        volume: 0.035
      });
    }

    if (!this.backgroundMusic.isPlaying) {
      this.backgroundMusic.play();
    }
    if (!this.ambienceSound.isPlaying) {
      this.ambienceSound.play();
    }
  }

  private stopBackgroundMusic() {
    if (this.backgroundMusic?.isPlaying) {
      this.backgroundMusic.stop();
    }
    if (this.ambienceSound?.isPlaying) {
      this.ambienceSound.stop();
    }
  }

  private addStaticShimmer(target: Phaser.GameObjects.GameObject, fromAlpha: number, toAlpha: number, duration: number) {
    this.tweens.add({
      targets: target,
      alpha: { from: fromAlpha, to: toAlpha },
      duration,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1
    });
  }

  private createFocusMask() {
    const camera = this.cameras.main;
    const texture = this.textures.createCanvas(FOCUS_MASK_KEY, camera.width, camera.height);
    if (!texture) {
      return;
    }
    this.focusMaskTexture = texture;
    this.focusMask = this.add.image(0, 0, FOCUS_MASK_KEY);
    this.focusMask.setOrigin(0, 0);
    this.focusMask.setScrollFactor(1);
    this.focusMask.setDepth(DEPTH_BANDS.debug + 5);
  }

  private readMovementVector(): TilePoint {
    if (!this.keys) {
      return { x: 0, y: 0 };
    }

    const up = this.keys.up.isDown || this.keys.w.isDown;
    const down = this.keys.down.isDown || this.keys.s.isDown;
    const left = this.keys.left.isDown || this.keys.a.isDown;
    const right = this.keys.right.isDown || this.keys.d.isDown;

    let x = 0;
    let y = 0;

    if (up) {
      x -= 1;
      y -= 1;
    }
    if (down) {
      x += 1;
      y += 1;
    }
    if (left) {
      x -= 1;
      y += 1;
    }
    if (right) {
      x += 1;
      y -= 1;
    }

    const length = Math.hypot(x, y);
    return length > 0 ? { x: x / length, y: y / length } : { x, y };
  }

  private movePlayer(vector: TilePoint, dt: number) {
    const step = this.currentPlayerSpeed() * dt;
    const nextX = { x: this.playerTile.x + vector.x * step, y: this.playerTile.y };
    if (!this.collides(nextX, PLAYER_RADIUS)) {
      this.playerTile.x = nextX.x;
    }

    const nextY = { x: this.playerTile.x, y: this.playerTile.y + vector.y * step };
    if (!this.collides(nextY, PLAYER_RADIUS)) {
      this.playerTile.y = nextY.y;
    }
  }

  private tryShootProjectile() {
    if (!this.gameStarted || this.gameOver || !this.keys || (!this.shotQueued && !this.keys.shoot.isDown && !this.keys.shootAlt.isDown)) {
      return;
    }

    const now = this.time.now;
    if (this.playerAmmo <= 0) {
      this.shotQueued = false;
      if (now >= this.nextNoAmmoPopupAtMs) {
        this.nextNoAmmoPopupAtMs = now + 650;
        this.showWorldPopup("NO AMMO", this.playerTile, "#ff8b66");
        this.playSfx("uiToggle", { volume: 0.16, rate: 0.78 });
      }
      return;
    }

    if (now < this.nextShotAtMs) {
      return;
    }

    this.shotQueued = false;
    this.nextShotAtMs = now + this.currentProjectileCooldown();
    this.playerAmmo = Math.max(0, this.playerAmmo - 1);
    this.updateAmmoText();
    this.playSfx("staffShot", { volume: 0.26, rate: Phaser.Math.FloatBetween(0.94, 1.04) });
    const shot = this.resolveShotVector();
    const velocity = shot.tileVelocity;
    const blastCharged = this.blastShotReady;
    this.blastShotReady = false;
    this.updatePowerUpText();
    const start = {
      x: this.playerTile.x + velocity.x * 0.45,
      y: this.playerTile.y + velocity.y * 0.45
    };
    const world = this.tileToWorld(start);
    const sprite = this.add.sprite(Math.round(world.x), Math.round(world.y - 18), assetManifest.projectiles.staffBolt.key, 0);
    sprite.setOrigin(0.5, 0.5);
    sprite.setScale(1.15);
    sprite.setDepth(this.depthForTilePoint(start, DEPTH_BANDS.actor + 900, 24));
    sprite.setAngle(shot.angleDegrees);
    sprite.anims.play("staff-bolt-fly");

    this.projectiles.push({
      tile: start,
      velocity,
      sprite,
      alive: true,
      traveled: 0,
      blastCharged
    });
  }

  private updatePointerAim(pointer: Phaser.Input.Pointer) {
    this.lastAimScreenPoint = {
      x: pointer.x,
      y: pointer.y
    };
  }

  private handleAimPointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.gameStarted || this.gameOver) {
      return;
    }

    this.updatePointerAim(pointer);
    this.shotQueued = true;
  }

  private resolveShotVector(): { tileVelocity: TilePoint; angleDegrees: number } {
    const fallback = this.directionToVector(this.playerDirection);
    const fallbackAngle = this.projectileAngle(fallback);
    const world = this.tileToWorld(this.playerTile);
    const camera = this.cameras.main;
    const view = camera.worldView;
    const playerScreen = {
      x: (world.x - view.x) * camera.zoom,
      y: (world.y - view.y - 18) * camera.zoom
    };

    if (!this.lastAimScreenPoint) {
      return {
        tileVelocity: fallback,
        angleDegrees: this.snapAngleDegrees(fallbackAngle)
      };
    }

    const delta = {
      x: this.lastAimScreenPoint.x - playerScreen.x,
      y: this.lastAimScreenPoint.y - playerScreen.y
    };
    const distance = Math.hypot(delta.x, delta.y);
    if (distance < MIN_POINTER_AIM_DISTANCE) {
      return {
        tileVelocity: fallback,
        angleDegrees: this.snapAngleDegrees(fallbackAngle)
      };
    }

    const angleDegrees = this.snapAngleDegrees(Phaser.Math.RadToDeg(Math.atan2(delta.y, delta.x)));
    return {
      tileVelocity: this.screenAngleToTileVelocity(angleDegrees),
      angleDegrees
    };
  }

  private snapAngleDegrees(angleDegrees: number): number {
    return Math.round(angleDegrees / PROJECTILE_AIM_SNAP_DEGREES) * PROJECTILE_AIM_SNAP_DEGREES;
  }

  private screenAngleToTileVelocity(angleDegrees: number): TilePoint {
    const radians = Phaser.Math.DegToRad(angleDegrees);
    const screenVector = {
      x: Math.cos(radians),
      y: Math.sin(radians)
    };
    const tileVelocity = {
      x: 0.5 * (screenVector.x / HALF_TILE_WIDTH + screenVector.y / HALF_TILE_HEIGHT),
      y: 0.5 * (screenVector.y / HALF_TILE_HEIGHT - screenVector.x / HALF_TILE_WIDTH)
    };
    const length = Math.hypot(tileVelocity.x, tileVelocity.y);
    return length > 0
      ? {
          x: tileVelocity.x / length,
          y: tileVelocity.y / length
        }
      : this.directionToVector(this.playerDirection);
  }

  private currentProjectileCooldown(): number {
    return this.time.now < this.quickshotUntilMs ? QUICKSHOT_COOLDOWN_MS : PROJECTILE_COOLDOWN_MS;
  }

  private currentPlayerSpeed(): number {
    return this.time.now < this.hasteUntilMs ? PLAYER_SPEED_TILES * HASTE_SPEED_MULTIPLIER : PLAYER_SPEED_TILES;
  }

  private startRunTimers() {
    const now = this.time.now;
    this.runStartedAtMs = now;
    this.nextDifficultyCheckAtMs = now + DIFFICULTY_SPAWN_CHECK_MS;
    this.nextPowerUpSpawnAtMs = now + POWERUP_SPAWN_INITIAL_MS;
    this.nextAmmoSpawnAtMs = now + AMMO_SPAWN_INITIAL_MS;
    this.quickshotUntilMs = 0;
    this.hasteUntilMs = 0;
    this.wardUntilMs = 0;
    this.blastShotReady = false;
    this.nextWardBlockPopupAtMs = 0;
    this.nextNoAmmoPopupAtMs = 0;
    this.enemyKills = 0;
    this.playerAmmo = INITIAL_AMMO;
    this.nextHeartDropKill = FIRST_HEART_DROP_KILLS;
  }

  private updateDifficulty() {
    const now = this.time.now;
    if (now >= this.nextDifficultyCheckAtMs) {
      this.nextDifficultyCheckAtMs = now + this.currentDifficultySpawnCheckMs();
      const targetEnemyCount = this.targetEnemyCount();
      if (this.activeEnemyCount() < targetEnemyCount && this.enemies.length < MAX_ENEMIES) {
        const spawnTile = this.findSafeSpawnTile(ENEMY_SAFE_SPAWN_DISTANCE);
        if (spawnTile) {
          this.spawnEnemy(spawnTile, this.chooseEnemyKind());
        }
      }
    }

    if (now >= this.nextPowerUpSpawnAtMs) {
      this.nextPowerUpSpawnAtMs = now + POWERUP_SPAWN_INTERVAL_MS;
      if (this.powerUps.length < MAX_ACTIVE_POWERUPS) {
        const spawnTile = this.findSafeSpawnTile(POWERUP_SAFE_DISTANCE);
        const kind = this.choosePowerUpKind();
        if (spawnTile && kind) {
          this.spawnPowerUp(spawnTile, kind);
        }
      }
    }

    if (now >= this.nextAmmoSpawnAtMs) {
      this.nextAmmoSpawnAtMs = now + this.currentAmmoSpawnIntervalMs();
      if (this.ammoPickups.length < MAX_ACTIVE_AMMO_PICKUPS && this.playerAmmo < MAX_AMMO) {
        const spawnTile = this.findSafeSpawnTile(AMMO_PICKUP_SAFE_DISTANCE);
        if (spawnTile) {
          this.spawnAmmoPickup(spawnTile, AMMO_PICKUP_AMOUNT);
        }
      }
    }
  }

  private targetEnemyCount(): number {
    const elapsed = Math.max(0, this.time.now - this.runStartedAtMs);
    const killPressure = Math.floor(this.enemyKills / 5);
    return Phaser.Math.Clamp(1 + Math.floor(elapsed / DIFFICULTY_STEP_MS) + killPressure, 1, MAX_ENEMIES);
  }

  private activeEnemyCount(): number {
    return this.enemies.reduce((total, enemy) => total + (enemy.health > 0 ? 1 : 0), 0);
  }

  private currentDifficultySpawnCheckMs(): number {
    const elapsed = Math.max(0, this.time.now - this.runStartedAtMs);
    const pressure = Math.floor(elapsed / DIFFICULTY_STEP_MS) + Math.floor(this.enemyKills / 6);
    return Phaser.Math.Clamp(DIFFICULTY_SPAWN_CHECK_MS - pressure * 90, 1250, DIFFICULTY_SPAWN_CHECK_MS);
  }

  private currentAmmoSpawnIntervalMs(): number {
    const elapsed = Math.max(0, this.time.now - this.runStartedAtMs);
    const pressure = Math.floor(elapsed / DIFFICULTY_STEP_MS);
    const lowAmmoHelp = this.playerAmmo <= LOW_AMMO_DROP_THRESHOLD ? 0.58 : 1;
    return Math.round(Phaser.Math.Clamp(AMMO_SPAWN_INTERVAL_MS - pressure * 420, 5200, AMMO_SPAWN_INTERVAL_MS) * lowAmmoHelp);
  }

  private chooseEnemyKind(): EnemyKind {
    const elapsed = Math.max(0, this.time.now - this.runStartedAtMs);
    const bruteCount = this.enemies.filter((enemy) => enemy.kind === "brute").length;
    const bruteUnlocked = this.enemyKills >= BRUTE_UNLOCK_KILLS || elapsed >= BRUTE_UNLOCK_MS;
    if (!bruteUnlocked || bruteCount >= MAX_BRUTES) {
      return "goblin";
    }

    const pressure = Math.floor(elapsed / DIFFICULTY_STEP_MS) + Math.floor(this.enemyKills / 5);
    const bruteChance = Phaser.Math.Clamp(0.18 + pressure * 0.035, 0.18, 0.42);
    return Math.random() < bruteChance ? "brute" : "goblin";
  }

  private choosePowerUpKind(): PowerUpKind | undefined {
    const elapsed = Math.max(0, this.time.now - this.runStartedAtMs);
    const available = assetManifest.powerUps.types.filter((kind) => {
      const config = POWERUP_CONFIG[kind];
      return this.enemyKills >= config.unlockKills || elapsed >= config.unlockElapsedMs;
    });

    const totalWeight = available.reduce((total, kind) => total + POWERUP_CONFIG[kind].weight, 0);
    if (totalWeight <= 0) {
      return undefined;
    }

    let roll = Phaser.Math.Between(1, totalWeight);
    for (const kind of available) {
      roll -= POWERUP_CONFIG[kind].weight;
      if (roll <= 0) {
        return kind;
      }
    }

    return available[0];
  }

  private spawnEnemy(tile: TilePoint, kind: EnemyKind = "goblin"): EnemyActor {
    const config = ENEMY_CONFIG[kind];
    const spawnTile = { ...tile };
    const world = this.tileToWorld(spawnTile);
    const shadow = this.add.image(Math.round(world.x), Math.round(world.y + 5), "shadow_blob");
    shadow.setOrigin(0.5, 0.5);
    shadow.setAlpha(config.shadowAlpha);
    shadow.setScale(config.shadowScale);
    shadow.setDepth(this.depthForTilePoint(spawnTile, DEPTH_BANDS.actorShadow, 6));

    const sprite = this.add.sprite(Math.round(world.x), Math.round(world.y), config.textureKey, 0);
    sprite.setOrigin(0.5, 0.94);
    sprite.setScale(config.spriteScale);
    sprite.setDepth(this.depthForTilePoint(spawnTile, DEPTH_BANDS.actor, 12));
    sprite.anims.play(`${config.keyPrefix}idle-northwest`);

    const enemy = {
      kind,
      tile: spawnTile,
      direction: "northwest" as Direction,
      sprite,
      shadow,
      health: config.maxHealth,
      respawnAtMs: 0,
      hurtUntilMs: 0
    };
    this.enemies.push(enemy);
    return enemy;
  }

  private updatePowerUps() {
    this.powerUps.forEach((powerUp) => {
      const distance = Math.hypot(powerUp.tile.x - this.playerTile.x, powerUp.tile.y - this.playerTile.y);
      if (distance <= POWERUP_PICKUP_RADIUS) {
        this.collectPowerUp(powerUp);
        return;
      }

      const config = POWERUP_CONFIG[powerUp.kind];
      const world = this.tileToWorld(powerUp.tile);
      const bob = Math.sin((this.time.now - powerUp.spawnedAtMs) / 260) * 3;
      powerUp.sprite.setPosition(Math.round(world.x), Math.round(world.y - 18 + bob));
      powerUp.sprite.setScale(config.spriteScale + Math.sin((this.time.now - powerUp.spawnedAtMs) / 220) * 0.05);
      powerUp.sprite.setDepth(this.depthForTilePoint(powerUp.tile, DEPTH_BANDS.actor, 10));
      powerUp.glow.setPosition(Math.round(world.x), Math.round(world.y - 7));
      powerUp.glow.setDepth(this.depthForTilePoint(powerUp.tile, DEPTH_BANDS.actorShadow, 5));
    });

    this.powerUps = this.powerUps.filter((powerUp) => powerUp.sprite.active);
  }

  private spawnPowerUp(tile: TilePoint, kind: PowerUpKind) {
    const config = POWERUP_CONFIG[kind];
    const spawnTile = { ...tile };
    const world = this.tileToWorld(spawnTile);
    const glow = this.add.image(Math.round(world.x), Math.round(world.y - 7), "torch_glow");
    glow.setOrigin(0.5);
    glow.setScale(0.52);
    glow.setAlpha(config.glowAlpha);
    glow.setTint(config.glowTint);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setDepth(this.depthForTilePoint(spawnTile, DEPTH_BANDS.actorShadow, 5));

    const sprite = this.add.sprite(Math.round(world.x), Math.round(world.y - 18), assetManifest.powerUps.key, config.row * 8);
    sprite.setOrigin(0.5);
    sprite.setScale(config.spriteScale);
    sprite.setDepth(this.depthForTilePoint(spawnTile, DEPTH_BANDS.actor, 10));
    sprite.anims.play(`powerup-${kind}`);

    this.tweens.add({
      targets: glow,
      alpha: { from: Math.max(0.08, config.glowAlpha - 0.08), to: config.glowAlpha + 0.1 },
      scale: { from: 0.48, to: 0.58 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.powerUps.push({
      kind,
      tile: spawnTile,
      sprite,
      glow,
      spawnedAtMs: this.time.now
    });
  }

  private collectPowerUp(powerUp: PowerUp) {
    const now = this.time.now;
    const config = POWERUP_CONFIG[powerUp.kind];
    switch (powerUp.kind) {
      case "quickshot":
        this.quickshotUntilMs = Math.max(this.quickshotUntilMs, now) + QUICKSHOT_DURATION_MS;
        this.nextShotAtMs = Math.min(this.nextShotAtMs, now + QUICKSHOT_COOLDOWN_MS);
        break;
      case "haste":
        this.hasteUntilMs = Math.max(this.hasteUntilMs, now) + HASTE_DURATION_MS;
        break;
      case "ward":
        this.wardUntilMs = Math.max(this.wardUntilMs, now) + WARD_DURATION_MS;
        break;
      case "blast":
        this.blastShotReady = true;
        this.nextShotAtMs = Math.min(this.nextShotAtMs, now + 90);
        break;
    }

    this.playerPowerFlashUntilMs = now + PLAYER_POWER_FLASH_MS;
    this.showWorldPopup(config.popupText, powerUp.tile, config.popupColor);
    this.playSfx(powerUp.kind === "quickshot" ? "pickup" : "powerup", {
      volume: powerUp.kind === "ward" ? 0.34 : 0.28,
      rate: powerUp.kind === "haste" ? 1.12 : 1
    });
    this.tweens.killTweensOf(powerUp.glow);
    powerUp.sprite.destroy();
    powerUp.glow.destroy();
    this.updatePowerUpText();
  }

  private triggerBlastPowerUp(center: TilePoint) {
    const world = this.tileToWorld(center);
    const blast = this.add.sprite(Math.round(world.x), Math.round(world.y - 18), assetManifest.animatedEffects.blast.key, 0);
    blast.setOrigin(0.5);
    blast.setScale(1.45);
    blast.setDepth(this.depthForTilePoint(center, DEPTH_BANDS.actor + 1100, 26));
    blast.anims.play(assetManifest.animatedEffects.blast.key);
    blast.once("animationcomplete", () => blast.destroy());
    this.playSfx("blast", { volume: 0.36 });

    this.enemies.forEach((enemy) => {
      if (enemy.health <= 0) {
        return;
      }
      const distance = Math.hypot(enemy.tile.x - center.x, enemy.tile.y - center.y);
      if (distance > BLAST_RADIUS_TILES) {
        return;
      }
      const hitVector = distance > 0 ? { x: (enemy.tile.x - center.x) / distance, y: (enemy.tile.y - center.y) / distance } : this.directionToVector(this.playerDirection);
      this.damageEnemy(enemy, hitVector, BLAST_DAMAGE);
    });
  }

  private updateHeartPickups() {
    this.heartPickups.forEach((pickup) => {
      const distance = Math.hypot(pickup.tile.x - this.playerTile.x, pickup.tile.y - this.playerTile.y);
      if (distance <= HEART_PICKUP_RADIUS) {
        this.collectHeartPickup(pickup);
        return;
      }

      const world = this.tileToWorld(pickup.tile);
      const bob = Math.sin((this.time.now - pickup.spawnedAtMs) / 320) * 2;
      pickup.sprite.setPosition(Math.round(world.x), Math.round(world.y - 21 + bob));
      pickup.sprite.setDepth(this.depthForTilePoint(pickup.tile, DEPTH_BANDS.actor, 9));
      pickup.glow.setPosition(Math.round(world.x), Math.round(world.y - 10));
      pickup.glow.setDepth(this.depthForTilePoint(pickup.tile, DEPTH_BANDS.actorShadow, 4));
    });

    this.heartPickups = this.heartPickups.filter((pickup) => pickup.sprite.active);
  }

  private collectHeartPickup(pickup: HeartPickup) {
    if (this.playerHealth >= MAX_PLAYER_HEALTH) {
      return;
    }

    this.playerHealth = Math.min(MAX_PLAYER_HEALTH, this.playerHealth + 1);
    this.drawLifeMeter();
    this.showWorldPopup("+HEART", pickup.tile, "#ff9aa8");
    this.playSfx("heartPickup", { volume: 0.32 });
    this.tweens.killTweensOf(pickup.glow);
    pickup.sprite.destroy();
    pickup.glow.destroy();
  }

  private spawnHeartPickup(tile: TilePoint) {
    const spawnTile = { ...tile };
    const world = this.tileToWorld(spawnTile);
    const glow = this.add.image(Math.round(world.x), Math.round(world.y - 10), "torch_glow");
    glow.setOrigin(0.5);
    glow.setScale(0.44);
    glow.setAlpha(0.2);
    glow.setTint(0xff6178);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setDepth(this.depthForTilePoint(spawnTile, DEPTH_BANDS.actorShadow, 4));

    const sprite = this.add.image(Math.round(world.x), Math.round(world.y - 21), "life_heart");
    sprite.setOrigin(0.5);
    sprite.setScale(0.26);
    sprite.setDepth(this.depthForTilePoint(spawnTile, DEPTH_BANDS.actor, 9));

    this.tweens.add({
      targets: glow,
      alpha: { from: 0.12, to: 0.34 },
      scale: { from: 0.4, to: 0.54 },
      duration: 980,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.heartPickups.push({
      tile: spawnTile,
      sprite,
      glow,
      spawnedAtMs: this.time.now
    });
  }

  private trySpawnHeartDropWave() {
    if (this.heartPickups.length >= MAX_ACTIVE_HEART_PICKUPS) {
      return;
    }

    const openSlots = MAX_ACTIVE_HEART_PICKUPS - this.heartPickups.length;
    const count = Math.min(openSlots, Phaser.Math.Between(HEART_DROP_MIN_COUNT, HEART_DROP_MAX_COUNT));
    for (let i = 0; i < count; i += 1) {
      const tile = this.findSafeSpawnTile(HEART_PICKUP_SAFE_DISTANCE);
      if (!tile) {
        return;
      }
      this.spawnHeartPickup(tile);
    }
  }

  private updateAmmoPickups() {
    this.ammoPickups.forEach((pickup) => {
      const distance = Math.hypot(pickup.tile.x - this.playerTile.x, pickup.tile.y - this.playerTile.y);
      if (distance <= AMMO_PICKUP_RADIUS) {
        this.collectAmmoPickup(pickup);
        return;
      }

      const world = this.tileToWorld(pickup.tile);
      const bob = Math.sin((this.time.now - pickup.spawnedAtMs) / 280) * 3;
      pickup.sprite.setPosition(Math.round(world.x), Math.round(world.y - 18 + bob));
      pickup.sprite.setDepth(this.depthForTilePoint(pickup.tile, DEPTH_BANDS.actor, 9));
      pickup.glow.setPosition(Math.round(world.x), Math.round(world.y - 9));
      pickup.glow.setDepth(this.depthForTilePoint(pickup.tile, DEPTH_BANDS.actorShadow, 4));
    });

    this.ammoPickups = this.ammoPickups.filter((pickup) => pickup.sprite.active);
  }

  private spawnAmmoPickup(tile: TilePoint, amount = AMMO_PICKUP_AMOUNT) {
    const spawnTile = { ...tile };
    const world = this.tileToWorld(spawnTile);
    const glow = this.add.image(Math.round(world.x), Math.round(world.y - 9), "torch_glow");
    glow.setOrigin(0.5);
    glow.setScale(0.38);
    glow.setAlpha(0.16);
    glow.setTint(0xff7e44);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setDepth(this.depthForTilePoint(spawnTile, DEPTH_BANDS.actorShadow, 4));

    const sprite = this.add.sprite(Math.round(world.x), Math.round(world.y - 18), assetManifest.pickups.ammo.key, 0);
    sprite.setOrigin(0.5);
    sprite.setScale(1.1);
    sprite.setDepth(this.depthForTilePoint(spawnTile, DEPTH_BANDS.actor, 9));
    sprite.anims.play("ammo-pickup-loop");

    this.tweens.add({
      targets: glow,
      alpha: { from: 0.1, to: 0.3 },
      scale: { from: 0.34, to: 0.48 },
      duration: 860,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.ammoPickups.push({
      tile: spawnTile,
      sprite,
      glow,
      amount,
      spawnedAtMs: this.time.now
    });
  }

  private collectAmmoPickup(pickup: AmmoPickup) {
    if (this.playerAmmo >= MAX_AMMO) {
      return;
    }

    const gained = Math.min(pickup.amount, MAX_AMMO - this.playerAmmo);
    this.playerAmmo += gained;
    this.updateAmmoText();
    this.showWorldPopup(`+${gained} AMMO`, pickup.tile, "#ffbd73");
    this.playSfx("ammoPickup", { volume: 0.28 });
    this.tweens.killTweensOf(pickup.glow);
    pickup.sprite.destroy();
    pickup.glow.destroy();
  }

  private tryDropAmmoFromEnemy(tile: TilePoint) {
    if (this.ammoPickups.length >= MAX_ACTIVE_AMMO_PICKUPS || this.playerAmmo >= MAX_AMMO) {
      return;
    }

    const lowAmmoBonus = this.playerAmmo <= LOW_AMMO_DROP_THRESHOLD ? 0.22 : 0;
    const bruteBonus = this.enemies.some((enemy) => enemy.kind === "brute" && Math.hypot(enemy.tile.x - tile.x, enemy.tile.y - tile.y) < 0.1) ? 0.12 : 0;
    if (Math.random() > 0.28 + lowAmmoBonus + bruteBonus) {
      return;
    }

    if (!this.collides(tile, PLAYER_RADIUS)) {
      this.spawnAmmoPickup({ ...tile }, AMMO_PICKUP_AMOUNT);
      return;
    }

    const safeTile = this.findSafeSpawnTile(AMMO_PICKUP_SAFE_DISTANCE);
    if (safeTile) {
      this.spawnAmmoPickup(safeTile, AMMO_PICKUP_AMOUNT);
    }
  }

  private findSafeSpawnTile(minDistanceFromPlayer: number): TilePoint | undefined {
    const candidates: TilePoint[] = [];

    for (let y = 0; y < startingDungeon.height; y += 1) {
      for (let x = 0; x < startingDungeon.width; x += 1) {
        if (!this.isPlayableTile(x, y)) {
          continue;
        }

        const tile = { x: x + 0.5, y: y + 0.5 };
        if (this.collides(tile, ENEMY_CONFIG.brute.radius)) {
          continue;
        }
        if (Math.hypot(tile.x - this.playerTile.x, tile.y - this.playerTile.y) < minDistanceFromPlayer) {
          continue;
        }
        if (this.enemies.some((enemy) => enemy.health > 0 && Math.hypot(tile.x - enemy.tile.x, tile.y - enemy.tile.y) < 1.35)) {
          continue;
        }
        if (this.powerUps.some((powerUp) => Math.hypot(tile.x - powerUp.tile.x, tile.y - powerUp.tile.y) < 2)) {
          continue;
        }
        if (this.heartPickups.some((pickup) => Math.hypot(tile.x - pickup.tile.x, tile.y - pickup.tile.y) < 1.8)) {
          continue;
        }
        if (this.ammoPickups.some((pickup) => Math.hypot(tile.x - pickup.tile.x, tile.y - pickup.tile.y) < 1.6)) {
          continue;
        }

        candidates.push(tile);
      }
    }

    if (candidates.length === 0) {
      return undefined;
    }

    return Phaser.Utils.Array.GetRandom(candidates);
  }

  private updateEnemies(dt: number) {
    const now = this.time.now;
    this.enemies.forEach((enemy, index) => {
      const config = ENEMY_CONFIG[enemy.kind];
      if (enemy.health <= 0) {
        if (enemy.respawnAtMs > 0 && now >= enemy.respawnAtMs) {
          if (this.activeEnemyCount() >= this.targetEnemyCount()) {
            enemy.respawnAtMs = now + 900;
            return;
          }
          const start = this.findSafeSpawnTile(ENEMY_SAFE_SPAWN_DISTANCE) ?? startingDungeon.enemyStarts[index % startingDungeon.enemyStarts.length] ?? startingDungeon.enemyStarts[0];
          enemy.tile = { ...start };
          enemy.health = config.maxHealth;
          enemy.respawnAtMs = 0;
          enemy.hurtUntilMs = 0;
          enemy.sprite.setVisible(true).setActive(true).clearTint().setAlpha(1).setScale(config.spriteScale);
          enemy.shadow.setVisible(true).setActive(true).setScale(config.shadowScale).setAlpha(config.shadowAlpha);
        } else {
          return;
        }
      }

      const toPlayer = { x: this.playerTile.x - enemy.tile.x, y: this.playerTile.y - enemy.tile.y };
      const distance = Math.hypot(toPlayer.x, toPlayer.y);
      const chase = distance > 0 ? { x: toPlayer.x / distance, y: toPlayer.y / distance } : { x: 0, y: 0 };

      if (distance > config.alertRange) {
        enemy.sprite.anims.play(`${config.keyPrefix}idle-${enemy.direction}`, true);
      } else {
        enemy.direction = this.directionFromVector(chase);
        if (distance > config.contactRange) {
          this.moveEnemy(enemy, chase, dt);
        }

        enemy.sprite.anims.play(
          distance <= config.attackAnimRange ? `${config.keyPrefix}attack-${enemy.direction}` : `${config.keyPrefix}idle-${enemy.direction}`,
          true
        );

        if (distance <= config.contactRange) {
          this.damagePlayer(chase);
        }
      }

      this.updateEnemyVisuals(enemy);
    });
  }

  private moveEnemy(enemy: EnemyActor, vector: TilePoint, dt: number) {
    const config = ENEMY_CONFIG[enemy.kind];
    const step = config.speed * dt;
    const nextX = { x: enemy.tile.x + vector.x * step, y: enemy.tile.y };
    if (!this.collides(nextX, config.radius)) {
      enemy.tile.x = nextX.x;
    }

    const nextY = { x: enemy.tile.x, y: enemy.tile.y + vector.y * step };
    if (!this.collides(nextY, config.radius)) {
      enemy.tile.y = nextY.y;
    }
  }

  private updateProjectiles(dt: number) {
    this.projectiles.forEach((projectile) => {
      if (!projectile.alive) {
        return;
      }

      const step = PROJECTILE_SPEED_TILES * dt;
      projectile.tile.x += projectile.velocity.x * step;
      projectile.tile.y += projectile.velocity.y * step;
      projectile.traveled += step;

    const hitEnemy = this.enemies.find((enemy) => {
      const config = ENEMY_CONFIG[enemy.kind];
      return enemy.health > 0 && Math.hypot(projectile.tile.x - enemy.tile.x, projectile.tile.y - enemy.tile.y) < config.hitRange;
    });
    if (hitEnemy) {
      if (!projectile.blastCharged) {
        this.damageEnemy(hitEnemy, projectile.velocity);
      }
      this.endProjectile(projectile, true);
      return;
    }

      if (projectile.traveled >= PROJECTILE_MAX_DISTANCE || this.collides(projectile.tile, PROJECTILE_RADIUS)) {
        this.endProjectile(projectile, true);
        return;
      }

      const world = this.tileToWorld(projectile.tile);
      projectile.sprite.setPosition(Math.round(world.x), Math.round(world.y - 18));
      projectile.sprite.setDepth(this.depthForTilePoint(projectile.tile, DEPTH_BANDS.actor + 900, 24));
    });

    this.projectiles = this.projectiles.filter((projectile) => projectile.alive || projectile.sprite.active);
  }

  private endProjectile(projectile: StaffProjectile, impact: boolean) {
    projectile.alive = false;
    if (!impact) {
      projectile.sprite.destroy();
      return;
    }

    if (projectile.blastCharged) {
      this.triggerBlastPowerUp({ ...projectile.tile });
    }
    this.playSfx("projectileHit", { volume: 0.2, rate: Phaser.Math.FloatBetween(0.92, 1.08) });
    projectile.sprite.setAngle(0);
    projectile.sprite.anims.play("staff-bolt-impact");
    projectile.sprite.once("animationcomplete", () => projectile.sprite.destroy());
  }

  private damageEnemy(enemy: EnemyActor, hitVector: TilePoint, damage = 1) {
    const config = ENEMY_CONFIG[enemy.kind];
    enemy.health -= damage;
    enemy.hurtUntilMs = this.time.now + ENEMY_HURT_FLASH_MS;
    enemy.sprite.setTint(0xfff0a6);
    this.playSfx("enemyHit", { volume: enemy.kind === "brute" ? 0.28 : 0.22, rate: enemy.kind === "brute" ? 0.82 : 1.06 });

    if (enemy.health <= 0) {
      this.enemyKills += 1;
      this.awardScore(config.score, enemy.tile);
      this.playSfx("enemyDown", { volume: enemy.kind === "brute" ? 0.36 : 0.28, rate: enemy.kind === "brute" ? 0.72 : 1 });
      this.tryDropAmmoFromEnemy(enemy.tile);
      if (this.enemyKills >= this.nextHeartDropKill) {
        this.trySpawnHeartDropWave();
        this.nextHeartDropKill += HEART_DROP_KILL_STEP;
      }
      enemy.respawnAtMs = this.time.now + config.respawnMs;
      enemy.sprite.setVisible(false).setActive(false).clearTint();
      enemy.shadow.setVisible(false).setActive(false);
      return;
    }

    this.knockEnemyBack(enemy, hitVector);
  }

  private knockEnemyBack(enemy: EnemyActor, vector: TilePoint) {
    const length = Math.hypot(vector.x, vector.y);
    if (length <= 0) {
      return;
    }

    const knockback = {
      x: (vector.x / length) * ENEMY_HIT_KNOCKBACK_TILES * ENEMY_CONFIG[enemy.kind].knockbackMultiplier,
      y: (vector.y / length) * ENEMY_HIT_KNOCKBACK_TILES * ENEMY_CONFIG[enemy.kind].knockbackMultiplier
    };
    const nextX = { x: enemy.tile.x + knockback.x, y: enemy.tile.y };
    if (!this.collides(nextX, ENEMY_CONFIG[enemy.kind].radius)) {
      enemy.tile.x = nextX.x;
    }

    const nextY = { x: enemy.tile.x, y: enemy.tile.y + knockback.y };
    if (!this.collides(nextY, ENEMY_CONFIG[enemy.kind].radius)) {
      enemy.tile.y = nextY.y;
    }
  }

  private awardScore(points: number, tile: TilePoint) {
    this.playerScore += points;
    this.updateScoreText();
    this.showWorldPopup(`+${points}`, tile, "#ffe49a");
  }

  private showWorldPopup(text: string, tile: TilePoint, color: string) {
    const world = this.tileToWorld(tile);
    const popup = this.add.text(Math.round(world.x), Math.round(world.y - 42), text, {
      fontFamily: "monospace",
      fontSize: "13px",
      color,
      stroke: "#120706",
      strokeThickness: 4
    });
    popup.setOrigin(0.5);
    popup.setDepth(DEPTH_BANDS.debug - 20);
    this.tweens.add({
      targets: popup,
      y: popup.y - 26,
      alpha: 0,
      duration: 720,
      ease: "Sine.easeOut",
      onComplete: () => popup.destroy()
    });
  }

  private updateScoreText() {
    this.scoreText?.setText(this.playerScore.toString().padStart(4, "0"));
  }

  private updatePowerUpText() {
    if (!this.powerUpText) {
      return;
    }

    const now = this.time.now;
    const labels = [
      { label: "QUICK", remainingMs: this.quickshotUntilMs - now },
      { label: "HASTE", remainingMs: this.hasteUntilMs - now },
      { label: "WARD", remainingMs: this.wardUntilMs - now }
    ].filter((entry) => entry.remainingMs > 0);
    const textParts = labels.map((entry) => `${entry.label} ${Math.ceil(entry.remainingMs / 1000)}s`);
    if (this.blastShotReady) {
      textParts.push("BLAST READY");
    }

    if (textParts.length === 0) {
      this.powerUpText.setText("");
      return;
    }

    this.powerUpText.setText(textParts.join("  "));
  }

  private updateAmmoText() {
    const color = this.playerAmmo <= LOW_AMMO_DROP_THRESHOLD ? "#ff8568" : "#ffbd73";
    this.ammoText?.setColor(color);
    this.ammoText?.setText(`${this.playerAmmo.toString().padStart(2, "0")}/${MAX_AMMO}`);
  }

  private cameraZoomForViewport() {
    const camera = this.cameras.main;
    const widthZoom = camera.width / CAMERA_TARGET_VIEW_WIDTH;
    const heightZoom = camera.height / CAMERA_TARGET_VIEW_HEIGHT;
    return Phaser.Math.Clamp(Math.min(widthZoom, heightZoom), CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
  }

  private updateCameraZoom() {
    this.cameras.main.setZoom(this.cameraZoomForViewport());
  }

  private uiScale(baseScale = 1) {
    return baseScale / this.cameras.main.zoom;
  }

  private uiX(screenX: number) {
    const camera = this.cameras.main;
    return (screenX - (1 - camera.zoom) * camera.width * 0.5) / camera.zoom;
  }

  private uiY(screenY: number) {
    const camera = this.cameras.main;
    return (screenY - (1 - camera.zoom) * camera.height * 0.5) / camera.zoom;
  }

  private screenX(cameraX: number) {
    const camera = this.cameras.main;
    return cameraX * camera.zoom + (1 - camera.zoom) * camera.width * 0.5;
  }

  private screenY(cameraY: number) {
    const camera = this.cameras.main;
    return cameraY * camera.zoom + (1 - camera.zoom) * camera.height * 0.5;
  }

  private screenRect(centerX: number, centerY: number, width: number, height: number) {
    const camera = this.cameras.main;
    const screenWidth = width * camera.zoom;
    const screenHeight = height * camera.zoom;
    return new Phaser.Geom.Rectangle(
      this.screenX(centerX) - screenWidth / 2,
      this.screenY(centerY) - screenHeight / 2,
      screenWidth,
      screenHeight
    );
  }

  private hudInsetX() {
    return Math.round(Phaser.Math.Clamp(this.cameras.main.width * HUD_INSET_RATIO, HUD_MIN_INSET_X, HUD_MAX_INSET_X));
  }

  private hudTopY() {
    return Math.round(Phaser.Math.Clamp(this.cameras.main.height * HUD_TOP_RATIO, HUD_TOP_MIN_Y, HUD_TOP_MAX_Y));
  }

  private positionHud() {
    const panelHeight = assetManifest.uiSprites.hudPanels.frameHeight * HUD_PANEL_SCREEN_SCALE;
    const panelX = this.hudInsetX();
    const scoreY = this.hudTopY();
    const ammoY = scoreY + panelHeight + HUD_PANEL_GAP_Y;
    const valueX = panelX + HUD_VALUE_SOURCE_X * HUD_PANEL_SCREEN_SCALE;
    const valueY = HUD_VALUE_SOURCE_Y * HUD_PANEL_SCREEN_SCALE;

    this.scorePanel?.setScale(this.uiScale(HUD_PANEL_SCREEN_SCALE));
    this.scorePanel?.setPosition(this.uiX(panelX), this.uiY(scoreY));
    this.scoreText?.setScale(this.uiScale(HUD_PANEL_SCREEN_SCALE));
    this.scoreText?.setPosition(this.uiX(valueX), this.uiY(scoreY + valueY));

    this.powerUpText?.setScale(this.uiScale(HUD_PANEL_SCREEN_SCALE));
    this.powerUpText?.setPosition(this.uiX(panelX + 4 * HUD_PANEL_SCREEN_SCALE), this.uiY(ammoY + POWERUP_TEXT_SOURCE_Y * HUD_PANEL_SCREEN_SCALE));

    this.ammoPanel?.setScale(this.uiScale(HUD_PANEL_SCREEN_SCALE));
    this.ammoPanel?.setPosition(this.uiX(panelX), this.uiY(ammoY));
    this.ammoText?.setScale(this.uiScale(HUD_PANEL_SCREEN_SCALE));
    this.ammoText?.setPosition(this.uiX(valueX), this.uiY(ammoY + valueY));

    this.positionLifeMeter();
  }

  private damagePlayer(directionAwayFromEnemy: TilePoint) {
    const now = this.time.now;
    if (now < this.wardUntilMs) {
      if (now >= this.nextWardBlockPopupAtMs) {
        this.nextWardBlockPopupAtMs = now + 520;
        this.showWorldPopup("WARD", this.playerTile, "#d7b4ff");
      }
      this.playerPowerFlashUntilMs = Math.max(this.playerPowerFlashUntilMs, now + 220);
      return;
    }

    if (now < this.playerInvulnerableUntilMs) {
      return;
    }

    const previousHealth = this.playerHealth;
    this.playerHealth = Math.max(0, this.playerHealth - 1);
    this.playerInvulnerableUntilMs = now + PLAYER_INVULN_MS;
    this.player?.setTint(0xff786a);
    if (this.playerHealth < previousHealth) {
      this.animateLostHeart(this.playerHealth);
      this.playSfx("playerHurt", { volume: 0.34 });
    }
    this.drawLifeMeter();

    const knockback = Math.hypot(directionAwayFromEnemy.x, directionAwayFromEnemy.y) > 0 ? directionAwayFromEnemy : this.directionToVector(this.playerDirection);
    const next = {
      x: this.playerTile.x + knockback.x * 0.34,
      y: this.playerTile.y + knockback.y * 0.34
    };
    if (!this.collides(next, PLAYER_RADIUS)) {
      this.playerTile = next;
    }

    if (this.playerHealth <= 0) {
      this.showGameOver();
    }
  }

  private collides(point: TilePoint, radius: number): boolean {
    const samples = [
      { x: point.x - radius, y: point.y - radius },
      { x: point.x + radius, y: point.y - radius },
      { x: point.x - radius, y: point.y + radius },
      { x: point.x + radius, y: point.y + radius }
    ];

    if (samples.some((sample) => isTileBlocked(getTileCode(Math.floor(sample.x), Math.floor(sample.y))))) {
      return true;
    }

    return this.propBlockers.some((box) => this.collidesWithBox(point, box, radius));
  }

  private directionFromVector(vector: TilePoint): Direction {
    if (vector.x >= 0 && vector.y >= 0) {
      return "southeast";
    }
    if (vector.x < 0 && vector.y < 0) {
      return "northwest";
    }
    if (vector.x >= 0 && vector.y < 0) {
      return "northeast";
    }
    return "southwest";
  }

  private directionToVector(direction: Direction): TilePoint {
    switch (direction) {
      case "northeast":
        return { x: Math.SQRT1_2, y: -Math.SQRT1_2 };
      case "northwest":
        return { x: -Math.SQRT1_2, y: -Math.SQRT1_2 };
      case "southwest":
        return { x: -Math.SQRT1_2, y: Math.SQRT1_2 };
      case "southeast":
      default:
        return { x: Math.SQRT1_2, y: Math.SQRT1_2 };
    }
  }

  private projectileAngle(vector: TilePoint): number {
    const worldDelta = {
      x: (vector.x - vector.y) * HALF_TILE_WIDTH,
      y: (vector.x + vector.y) * HALF_TILE_HEIGHT
    };
    return Phaser.Math.RadToDeg(Math.atan2(worldDelta.y, worldDelta.x));
  }

  private updatePlayerVisuals() {
    const world = this.tileToWorld(this.playerTile);
    const now = this.time.now;
    if (this.shadow) {
      this.shadow.setPosition(Math.round(world.x), Math.round(world.y + 5));
      this.shadow.setDepth(this.depthForTilePoint(this.playerTile, DEPTH_BANDS.actorShadow, 8));
    }
    if (this.player) {
      this.player.setPosition(Math.round(world.x), Math.round(world.y));
      this.player.setVisible(true);
      this.player.setActive(true);
      this.player.setScale(HERO_SPRITE_SCALE);
      this.player.setDepth(HERO_DEPTH);
      if (now < this.playerInvulnerableUntilMs) {
        this.player.setTint(0xff786a);
        this.player.setAlpha(Math.floor(now / 90) % 2 === 0 ? 0.55 : 1);
      } else if (now < this.playerPowerFlashUntilMs) {
        this.player.setTint(Math.floor(now / 90) % 2 === 0 ? 0x8fffc0 : 0xffe37a);
        this.player.setAlpha(1);
      } else if (now < this.wardUntilMs) {
        this.player.setTint(Math.floor(now / 180) % 2 === 0 ? 0xd7b4ff : 0xffd36f);
        this.player.setAlpha(1);
      } else if (now < this.hasteUntilMs) {
        this.player.setTint(0xa9d7ff);
        this.player.setAlpha(1);
      } else {
        this.player.clearTint();
        this.player.setAlpha(1);
      }
    }
    if (this.hasteSparkles) {
      const hasteActive = now < this.hasteUntilMs && !this.gameOver;
      this.hasteSparkles.setVisible(hasteActive);
      if (hasteActive) {
        this.hasteSparkles.setPosition(Math.round(world.x), Math.round(world.y - 28));
        this.hasteSparkles.setDepth(HERO_EFFECT_DEPTH);
        this.hasteSparkles.setAlpha(0.72 + Math.sin(now / 90) * 0.18);
      }
    }
  }

  private updateEnemyVisuals(enemy: EnemyActor) {
    const config = ENEMY_CONFIG[enemy.kind];
    const world = this.tileToWorld(enemy.tile);
    const visible = this.isWorldPointNearCamera(world, 180);
    enemy.sprite.setVisible(visible);
    enemy.shadow.setVisible(visible);
    enemy.shadow.setPosition(Math.round(world.x), Math.round(world.y + 5));
    enemy.shadow.setDepth(this.depthForTilePoint(enemy.tile, DEPTH_BANDS.actorShadow, 6));
    enemy.sprite.setPosition(Math.round(world.x), Math.round(world.y));
    enemy.sprite.setScale(config.spriteScale);
    enemy.sprite.setDepth(this.depthForTilePoint(enemy.tile, DEPTH_BANDS.actor, 12));
    if (this.time.now < enemy.hurtUntilMs) {
      enemy.sprite.setTint(Math.floor(this.time.now / 70) % 2 === 0 ? 0xfff0a6 : 0xff6b4a);
      enemy.sprite.setAlpha(0.78);
    } else {
      enemy.sprite.clearTint();
      enemy.sprite.setAlpha(1);
    }
  }

  private isWorldPointNearCamera(point: WorldPoint, padding: number): boolean {
    const view = this.cameras.main.worldView;
    return (
      point.x >= view.x - padding &&
      point.x <= view.right + padding &&
      point.y >= view.y - padding &&
      point.y <= view.bottom + padding
    );
  }

  private drawLifeMeter() {
    this.hudGraphics?.clear();
    this.positionLifeMeter();
    this.lifeHeartImages.forEach((heart, index) => {
      heart.setVisible(index < this.playerHealth);
    });
  }

  private positionLifeMeter() {
    if (!this.lifeMeterImage) {
      return;
    }

    const insetX = this.hudInsetX();
    const baseWidth = assetManifest.uiSprites.lifeMeterLoop.frameWidth * LIFE_METER_SCALE;
    const originX = this.cameras.main.width - baseWidth - insetX - LIFE_METER_MARGIN.x;
    this.lifeMeterImage.setScale(this.uiScale(LIFE_METER_SCALE));
    this.lifeMeterImage.setPosition(this.uiX(originX), this.uiY(LIFE_METER_MARGIN.y));
    this.lifeHeartImages.forEach((heart, index) => {
      const center = LIFE_HEART_CENTERS[index];
      heart.setScale(this.uiScale(LIFE_HEART_SCALE));
      heart.setPosition(
        this.uiX(originX + center.x * LIFE_METER_SCALE),
        this.uiY(LIFE_METER_MARGIN.y + center.y * LIFE_METER_SCALE)
      );
    });
  }

  private animateLostHeart(index: number) {
    const heart = this.lifeHeartImages[index];
    if (!heart) {
      return;
    }

    const burst = this.add.sprite(heart.x, heart.y, assetManifest.uiSprites.lifeHeartBurst.key, 0);
    burst.setOrigin(0.5);
    burst.setScale(this.uiScale(LIFE_HEART_SCALE));
    burst.setScrollFactor(0);
    burst.setDepth(DEPTH_BANDS.debug + 22);
    burst.anims.play(assetManifest.uiSprites.lifeHeartBurst.key);
    burst.once("animationcomplete", () => burst.destroy());
  }

  private updateFocusMask(force = false) {
    const camera = this.cameras.main;
    const world = this.tileToWorld(this.playerTile);
    const view = camera.worldView;
    const screenX = Math.round((world.x - view.x) * camera.zoom);
    const screenY = Math.round((world.y - view.y - 18) * camera.zoom);
    const width = Math.ceil(camera.width);
    const height = Math.ceil(camera.height);
    const quantizedX = Math.round(screenX / 2) * 2;
    const quantizedY = Math.round(screenY / 2) * 2;
    const signature = `${width}x${height}:${quantizedX}:${quantizedY}`;

    this.focusMask?.setScale(1 / camera.zoom);
    this.focusMask?.setPosition(view.x, view.y);

    if (!force && signature === this.focusMaskSignature) {
      return;
    }
    this.focusMaskSignature = signature;

    if (!this.focusMaskTexture || this.focusMaskTexture.width !== width || this.focusMaskTexture.height !== height) {
      this.focusMaskTexture?.destroy();
      if (this.textures.exists(FOCUS_MASK_KEY)) {
        this.textures.remove(FOCUS_MASK_KEY);
      }
      const texture = this.textures.createCanvas(FOCUS_MASK_KEY, width, height);
      if (!texture) {
        return;
      }
      this.focusMaskTexture = texture;
      this.focusMask?.setTexture(FOCUS_MASK_KEY);
    }
    const canvas = this.focusMaskTexture.getSourceImage() as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const innerRadius = Phaser.Math.Clamp(Math.min(width, height) * 0.1, 88, 126);
    const outerRadius = innerRadius + 260;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "rgba(0, 0, 0, 0.92)";
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "destination-out";
    const gradient = context.createRadialGradient(quantizedX, quantizedY, innerRadius, quantizedX, quantizedY, outerRadius);
    gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(0.22, "rgba(0, 0, 0, 0.96)");
    gradient.addColorStop(0.45, "rgba(0, 0, 0, 0.68)");
    gradient.addColorStop(0.68, "rgba(0, 0, 0, 0.36)");
    gradient.addColorStop(0.86, "rgba(0, 0, 0, 0.14)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";
    this.focusMaskTexture.refresh();
  }

  private showStartScreen() {
    this.startContainer?.destroy(true);
    this.input.off("pointerdown", this.handleStartPointerDown, this);
    const camera = this.cameras.main;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x020303, 0.58);
    overlay.fillRect(0, 0, camera.width, camera.height);

    const panelY = camera.height * 0.43;
    const titleSprite = this.add.sprite(0, 0, assetManifest.uiSprites.startTitle.key, 0);
    const titleScale = Phaser.Math.Clamp(Math.min((camera.width * 0.7) / titleSprite.width, (camera.height * 0.48) / titleSprite.height), 0.5, 0.86);
    titleSprite.setScale(titleScale);
    titleSprite.anims.play(assetManifest.uiSprites.startTitle.key);
    this.addStaticShimmer(titleSprite, 0.94, 1, 1200);

    const subtitle = this.add.text(0, titleSprite.displayHeight * 0.52, "Aim with the cursor. Spend ammo carefully.", {
      fontFamily: "monospace",
      fontSize: `${Math.round(14 * titleScale * 1.9)}px`,
      color: "#d9c79a",
      stroke: "#090909",
      strokeThickness: 3,
      align: "center"
    });
    subtitle.setOrigin(0.5);

    const button = this.add.image(0, titleSprite.displayHeight * 0.72, "start_over_button");
    const buttonScale = Phaser.Math.Clamp(Math.min((camera.width * 0.24) / button.width, 0.34), 0.22, 0.36);
    button.setScale(buttonScale);

    const buttonText = this.add.text(button.x, button.y, "START", {
      fontFamily: "monospace",
      fontSize: `${Math.round(21 * buttonScale * 2.8)}px`,
      color: "#ffe3a6",
      stroke: "#290909",
      strokeThickness: 4,
      align: "center"
    });
    buttonText.setOrigin(0.5);

    const content = this.add.container(camera.width / 2, panelY, [titleSprite, subtitle, button, buttonText]);
    const startZone = this.add.zone(camera.width / 2, panelY + button.y, button.displayWidth, button.displayHeight);
    startZone.setInteractive({ useHandCursor: true });
    startZone.on("pointerover", () => button.setTint(0xffe0a3));
    startZone.on("pointerout", () => button.clearTint());
    startZone.on("pointerdown", () => this.startGame());
    this.startButtonBounds = this.screenRect(startZone.x, startZone.y, startZone.width, startZone.height);
    this.input.on("pointerdown", this.handleStartPointerDown, this);

    this.startContainer = this.add.container(0, 0, [overlay, content, startZone]);
    this.startContainer.setScrollFactor(0);
    this.startContainer.setDepth(HUD_DEPTH + 30);
  }

  private handleStartPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.gameStarted || !this.startButtonBounds) {
      return;
    }

    if (Phaser.Geom.Rectangle.Contains(this.startButtonBounds, pointer.x, pointer.y)) {
      this.startGame();
    }
  }

  private startGame() {
    if (this.gameStarted) {
      return;
    }

    this.gameStarted = true;
    this.input.off("pointerdown", this.handleStartPointerDown, this);
    this.startButtonBounds = undefined;
    this.startContainer?.destroy(true);
    this.startContainer = undefined;
    this.playerHealth = MAX_PLAYER_HEALTH;
    this.playerScore = 0;
    this.playerTile = { ...startingDungeon.playerStart };
    this.playerDirection = "southeast";
    this.nextShotAtMs = 0;
    this.shotQueued = false;
    this.clearProjectiles();
    this.clearPowerUps();
    this.clearHeartPickups();
    this.clearAmmoPickups();
    this.clearEnemies();
    this.createEnemies();
    this.startRunTimers();
    this.player?.clearTint().setAlpha(1);
    this.player?.anims.play("idle-southeast", true);
    this.drawLifeMeter();
    this.updateScoreText();
    this.updateAmmoText();
    this.updatePowerUpText();
    this.updatePlayerVisuals();
    this.updateCamera(1);
    this.updateFocusMask(true);
    this.startBackgroundMusic();
    this.playSfx("start", { volume: 0.32 });
  }

  private showGameOver() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.player?.setTint(0x68615d);
    this.clearProjectiles();
    this.stopBackgroundMusic();
    this.playSfx("gameOver", { volume: 0.42 });
    const camera = this.cameras.main;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x020303, 0.74);
    overlay.fillRect(0, 0, camera.width, camera.height);

    const panelY = camera.height * 0.43;
    const gameOverSprite = this.add.sprite(0, 0, assetManifest.uiSprites.gameOverTitle.key, 0);
    const panelScale = Phaser.Math.Clamp(Math.min((camera.width * 0.5) / gameOverSprite.width, (camera.height * 0.28) / gameOverSprite.height), 0.42, 0.66);
    gameOverSprite.setScale(panelScale);
    gameOverSprite.anims.play(assetManifest.uiSprites.gameOverTitle.key);
    this.addStaticShimmer(gameOverSprite, 0.94, 1, 1000);

    const subtitle = this.add.text(0, gameOverSprite.displayHeight * 0.48, "The ruin keeps its gold.", {
      fontFamily: "monospace",
      fontSize: `${Math.round(12 * panelScale * 2.1)}px`,
      color: "#d9c79a",
      stroke: "#090909",
      strokeThickness: 3,
      align: "center"
    });
    subtitle.setOrigin(0.5);

    const finalScoreY = gameOverSprite.displayHeight * 0.64;
    const finalScoreBg = this.add.graphics();
    finalScoreBg.fillStyle(0x070504, 0.86);
    finalScoreBg.fillRoundedRect(-150, finalScoreY - 22, 300, 46, 5);
    finalScoreBg.lineStyle(2, 0xc4984d, 0.9);
    finalScoreBg.strokeRoundedRect(-149, finalScoreY - 21, 298, 44, 5);

    const finalScore = this.add.text(0, finalScoreY, `SCORE ${this.playerScore.toString().padStart(4, "0")}`, {
      fontFamily: "monospace",
      fontSize: `${Math.round(14 * panelScale * 2.1)}px`,
      color: "#ffe3a6",
      stroke: "#120706",
      strokeThickness: 4,
      align: "center"
    });
    finalScore.setOrigin(0.5);

    const button = this.add.image(0, gameOverSprite.displayHeight * 0.9, "start_over_button");
    const buttonScale = Phaser.Math.Clamp(Math.min((camera.width * 0.28) / button.width, 0.34), 0.22, 0.36);
    button.setScale(buttonScale);
    button.setInteractive();

    const buttonText = this.add.text(button.x, button.y, "START OVER", {
      fontFamily: "monospace",
      fontSize: `${Math.round(19 * buttonScale * 2.8)}px`,
      color: "#ffe3a6",
      stroke: "#290909",
      strokeThickness: 4,
      align: "center"
    });
    buttonText.setOrigin(0.5);

    const content = this.add.container(camera.width / 2, panelY, [gameOverSprite, subtitle, button, buttonText, finalScoreBg, finalScore]);
    content.setAlpha(0);

    const restartZone = this.add.zone(camera.width / 2, panelY + button.y, button.displayWidth, button.displayHeight);
    restartZone.setInteractive({ useHandCursor: true });
    restartZone.on("pointerover", () => button.setTint(0xffe0a3));
    restartZone.on("pointerout", () => button.clearTint());
    restartZone.on("pointerdown", () => this.restartGame());
    this.gameOverButtonBounds = this.screenRect(restartZone.x, restartZone.y, restartZone.width, restartZone.height);
    this.input.on("pointerdown", this.handleGameOverPointerDown, this);

    this.gameOverContainer = this.add.container(0, 0, [overlay, content, restartZone]);
    this.gameOverContainer.setScrollFactor(0);
    this.gameOverContainer.setDepth(HUD_DEPTH + 40);
    this.gameOverContainer.setAlpha(0);
    this.tweens.add({
      targets: this.gameOverContainer,
      alpha: 1,
      duration: 180,
      ease: "Sine.easeOut"
    });
    this.tweens.add({
      targets: content,
      alpha: 1,
      duration: 260,
      ease: "Sine.easeOut"
    });
  }

  private handleGameOverPointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.gameOver || !this.gameOverButtonBounds) {
      return;
    }

    if (Phaser.Geom.Rectangle.Contains(this.gameOverButtonBounds, pointer.x, pointer.y)) {
      this.restartGame();
    }
  }

  private restartGame() {
    this.gameStarted = true;
    this.gameOver = false;
    this.input.off("pointerdown", this.handleGameOverPointerDown, this);
    this.gameOverButtonBounds = undefined;
    this.gameOverContainer?.destroy(true);
    this.gameOverContainer = undefined;
    this.playerHealth = MAX_PLAYER_HEALTH;
    this.playerInvulnerableUntilMs = 0;
    this.playerPowerFlashUntilMs = 0;
    this.playerScore = 0;
    this.enemyKills = 0;
    this.playerAmmo = INITIAL_AMMO;
    this.nextHeartDropKill = FIRST_HEART_DROP_KILLS;
    this.quickshotUntilMs = 0;
    this.hasteUntilMs = 0;
    this.wardUntilMs = 0;
    this.nextWardBlockPopupAtMs = 0;
    this.playerTile = { ...startingDungeon.playerStart };
    this.playerDirection = "southeast";
    this.nextShotAtMs = 0;
    this.shotQueued = false;
    this.player?.clearTint().setAlpha(1);
    this.player?.anims.play("idle-southeast", true);
    this.clearProjectiles();
    this.clearPowerUps();
    this.clearHeartPickups();
    this.clearAmmoPickups();
    this.clearEnemies();
    this.createEnemies();
    this.startRunTimers();
    this.drawLifeMeter();
    this.updateScoreText();
    this.updateAmmoText();
    this.updatePowerUpText();
    this.updatePlayerVisuals();
    this.updateCamera(1);
    this.updateFocusMask(true);
    this.startBackgroundMusic();
    this.playSfx("start", { volume: 0.32 });
  }

  private clearProjectiles() {
    this.projectiles.forEach((projectile) => projectile.sprite.destroy());
    this.projectiles = [];
  }

  private clearPowerUps() {
    this.powerUps.forEach((powerUp) => {
      this.tweens.killTweensOf(powerUp.glow);
      powerUp.sprite.destroy();
      powerUp.glow.destroy();
    });
    this.powerUps = [];
  }

  private clearHeartPickups() {
    this.heartPickups.forEach((pickup) => {
      this.tweens.killTweensOf(pickup.glow);
      pickup.sprite.destroy();
      pickup.glow.destroy();
    });
    this.heartPickups = [];
  }

  private clearAmmoPickups() {
    this.ammoPickups.forEach((pickup) => {
      this.tweens.killTweensOf(pickup.glow);
      pickup.sprite.destroy();
      pickup.glow.destroy();
    });
    this.ammoPickups = [];
  }

  private clearEnemies() {
    this.enemies.forEach((enemy) => {
      enemy.sprite.destroy();
      enemy.shadow.destroy();
    });
    this.enemies = [];
  }

  private handleResize() {
    this.updateCameraZoom();
    this.focusMaskSignature = "";
    this.positionHud();
    this.positionMuteButton();
    if (!this.gameStarted && this.startContainer) {
      this.showStartScreen();
    }
    this.updateCamera(1);
    this.updateFocusMask(true);
  }

  private updateCamera(_dt: number) {
    const camera = this.cameras.main;
    const world = this.tileToWorld(this.playerTile);
    const offsetX = camera.width < 900 ? 0 : Math.min(camera.width * 0.08, 128) / camera.zoom;
    const offsetY = camera.height < 640 ? 34 / camera.zoom : Math.min(camera.height * 0.08, 92) / camera.zoom;
    camera.centerOn(Math.round(world.x - offsetX), Math.round(world.y - offsetY));
  }

  private drawDebug() {
    if (!this.debugGraphics) {
      return;
    }

    this.debugGraphics.clear();
    this.debugGraphics.lineStyle(1, 0x56f0a8, 0.8);

    for (let y = 0; y < startingDungeon.height; y += 1) {
      for (let x = 0; x < startingDungeon.width; x += 1) {
        const code = getTileCode(x, y);
        if (code === " ") {
          continue;
        }
        const world = this.tileToWorld({ x, y });
        const color = isTileBlocked(code) ? 0xff604d : 0x56f0a8;
        this.debugGraphics.lineStyle(1, color, 0.58);
        this.debugGraphics.strokePoints(
          [
            new Phaser.Math.Vector2(world.x, world.y - HALF_TILE_HEIGHT),
            new Phaser.Math.Vector2(world.x + HALF_TILE_WIDTH, world.y),
            new Phaser.Math.Vector2(world.x, world.y + HALF_TILE_HEIGHT),
            new Phaser.Math.Vector2(world.x - HALF_TILE_WIDTH, world.y),
            new Phaser.Math.Vector2(world.x, world.y - HALF_TILE_HEIGHT)
          ],
          false
        );
      }
    }

    this.propBlockers.forEach((box) => {
      const top = this.tileToWorld({ x: box.left, y: box.top });
      const right = this.tileToWorld({ x: box.right, y: box.top });
      const bottom = this.tileToWorld({ x: box.right, y: box.bottom });
      const left = this.tileToWorld({ x: box.left, y: box.bottom });
      this.debugGraphics?.lineStyle(1, 0xffcc66, 0.85);
      this.debugGraphics?.strokePoints(
        [
          new Phaser.Math.Vector2(top.x, top.y),
          new Phaser.Math.Vector2(right.x, right.y),
          new Phaser.Math.Vector2(bottom.x, bottom.y),
          new Phaser.Math.Vector2(left.x, left.y),
          new Phaser.Math.Vector2(top.x, top.y)
        ],
        false
      );
    });

    const center = this.tileToWorld(this.playerTile);
    this.debugGraphics.lineStyle(1, 0x70a7ff, 1);
    this.debugGraphics.strokeCircle(center.x, center.y, PLAYER_RADIUS * HALF_TILE_WIDTH);
    this.debugGraphics.fillStyle(0x70a7ff, 0.9);
    this.debugGraphics.fillCircle(center.x, center.y, 2);

    this.enemies.forEach((enemy) => {
      if (enemy.health <= 0) {
        return;
      }
      const enemyCenter = this.tileToWorld(enemy.tile);
      this.debugGraphics?.lineStyle(1, enemy.kind === "brute" ? 0xcfa8ff : 0xff4f4f, 1);
      this.debugGraphics?.strokeCircle(enemyCenter.x, enemyCenter.y, ENEMY_CONFIG[enemy.kind].radius * HALF_TILE_WIDTH);
    });

    this.projectiles.forEach((projectile) => {
      if (!projectile.alive) {
        return;
      }
      const projectileCenter = this.tileToWorld(projectile.tile);
      this.debugGraphics?.lineStyle(1, 0xffd166, 1);
      this.debugGraphics?.strokeCircle(projectileCenter.x, projectileCenter.y, PROJECTILE_RADIUS * HALF_TILE_WIDTH);
    });

    this.powerUps.forEach((powerUp) => {
      const powerUpCenter = this.tileToWorld(powerUp.tile);
      this.debugGraphics?.lineStyle(1, POWERUP_CONFIG[powerUp.kind].debugColor, 1);
      this.debugGraphics?.strokeCircle(powerUpCenter.x, powerUpCenter.y, POWERUP_PICKUP_RADIUS * HALF_TILE_WIDTH);
    });

    this.heartPickups.forEach((pickup) => {
      const pickupCenter = this.tileToWorld(pickup.tile);
      this.debugGraphics?.lineStyle(1, 0xff8ea0, 1);
      this.debugGraphics?.strokeCircle(pickupCenter.x, pickupCenter.y, HEART_PICKUP_RADIUS * HALF_TILE_WIDTH);
    });

    this.ammoPickups.forEach((pickup) => {
      const pickupCenter = this.tileToWorld(pickup.tile);
      this.debugGraphics?.lineStyle(1, 0xffbd73, 1);
      this.debugGraphics?.strokeCircle(pickupCenter.x, pickupCenter.y, AMMO_PICKUP_RADIUS * HALF_TILE_WIDTH);
    });
  }

  private propAnchor(prop: DungeonProp): WorldPoint {
    return this.tileToWorld({ x: prop.x + 0.5, y: prop.y + 0.5 });
  }

  private propDepth(prop: DungeonProp, config: PropRenderConfig): number {
    return this.depthForTilePoint({ x: prop.x + 0.5, y: prop.y + 0.86 }, DEPTH_BANDS.terrain, config.depthOffset);
  }

  private addPropAnimation(prop: DungeonProp, anchor: WorldPoint, depth: number) {
    if (prop.kind === "torch") {
      const flame = this.add.sprite(anchor.x - 4, anchor.y - 66, assetManifest.animatedEffects.torchFlame.key, 0);
      flame.setOrigin(0.5, 0.88);
      flame.setScale(0.34);
      flame.setDepth(depth + 2);
      flame.anims.play(assetManifest.animatedEffects.torchFlame.key);
      return;
    }

    if (prop.kind === "small_candle") {
      const flame = this.add.sprite(anchor.x, anchor.y - 43, assetManifest.animatedEffects.candleFlame.key, 0);
      flame.setOrigin(0.5, 0.9);
      flame.setScale(0.45);
      flame.setDepth(depth + 2);
      flame.anims.play(assetManifest.animatedEffects.candleFlame.key);
    }
  }

  private propCollisionBox(prop: DungeonProp, box: CollisionBox): CollisionBox {
    return {
      left: prop.x + box.left,
      right: prop.x + box.right,
      top: prop.y + box.top,
      bottom: prop.y + box.bottom
    };
  }

  private collidesWithBox(point: TilePoint, box: CollisionBox, radius: number): boolean {
    const closestX = Phaser.Math.Clamp(point.x, box.left, box.right);
    const closestY = Phaser.Math.Clamp(point.y, box.top, box.bottom);
    return Math.hypot(point.x - closestX, point.y - closestY) < radius;
  }

  private isPlayableTile(tileX: number, tileY: number): boolean {
    const code = getTileCode(tileX, tileY);
    return code !== " " && !isTileBlocked(code);
  }

  private isFloorShapeTile(code: TileCode): boolean {
    return code !== " " && code !== "W" && code !== "h";
  }

  private depthForTilePoint(point: TilePoint, band: number, offset = 0): number {
    return band + this.tileToWorld(point).y + offset;
  }

  private tileToWorld(point: TilePoint): WorldPoint {
    return {
      x: MAP_OFFSET_X + (point.x - point.y) * HALF_TILE_WIDTH,
      y: MAP_OFFSET_Y + (point.x + point.y) * HALF_TILE_HEIGHT
    };
  }

  private calculateMapBounds(): Bounds {
    const points = [
      this.tileToWorld({ x: 0, y: 0 }),
      this.tileToWorld({ x: startingDungeon.width, y: 0 }),
      this.tileToWorld({ x: 0, y: startingDungeon.height }),
      this.tileToWorld({ x: startingDungeon.width, y: startingDungeon.height })
    ];
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);

    return {
      left: Math.min(...xs) - 120,
      right: Math.max(...xs) + 120,
      top: Math.min(...ys) - 112,
      bottom: Math.max(...ys) + 120
    };
  }
}
