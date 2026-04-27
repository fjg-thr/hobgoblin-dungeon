export const assetManifest = {
  character: {
    key: "hobgoblin",
    path: "/assets/characters/hobgoblin-sprite-sheet.png",
    metadataPath: "/assets/characters/hobgoblin-sprite-sheet.json",
    frameWidth: 64,
    frameHeight: 64,
    directions: ["southeast", "southwest", "northeast", "northwest"] as const
  },
  enemies: {
    goblin: {
      key: "goblin",
      path: "/assets/characters/goblin-sprite-sheet.png",
      metadataPath: "/assets/characters/goblin-sprite-sheet.json",
      frameWidth: 64,
      frameHeight: 64,
      directions: ["southeast", "southwest", "northeast", "northwest"] as const
    },
    brute: {
      key: "brute",
      path: "/assets/characters/brute-sprite-sheet.png",
      metadataPath: "/assets/characters/brute-sprite-sheet.json",
      frameWidth: 64,
      frameHeight: 64,
      directions: ["southeast", "southwest", "northeast", "northwest"] as const
    }
  },
  tiles: {
    stone_floor: "/assets/tiles/stone_floor.png",
    cracked_floor: "/assets/tiles/cracked_floor.png",
    mossy_floor: "/assets/tiles/mossy_floor.png",
    dark_wall: "/assets/tiles/dark_wall.png",
    vertical_wall: "/assets/tiles/vertical_wall.png",
    corner_wall: "/assets/tiles/corner_wall.png",
    low_dark_wall: "/assets/tiles/low_dark_wall.png",
    low_vertical_wall: "/assets/tiles/low_vertical_wall.png",
    low_corner_wall: "/assets/tiles/low_corner_wall.png",
    low_wall_north: "/assets/tiles/low_wall_north.png",
    low_wall_south: "/assets/tiles/low_wall_south.png",
    low_wall_east: "/assets/tiles/low_wall_east.png",
    low_wall_west: "/assets/tiles/low_wall_west.png",
    low_corner_ne: "/assets/tiles/low_corner_ne.png",
    low_corner_nw: "/assets/tiles/low_corner_nw.png",
    low_corner_se: "/assets/tiles/low_corner_se.png",
    low_corner_sw: "/assets/tiles/low_corner_sw.png",
    stairs_down: "/assets/tiles/stairs_down.png",
    chasm_edge: "/assets/tiles/chasm_edge.png",
    wooden_bridge: "/assets/tiles/wooden_bridge.png",
    torch: "/assets/tiles/torch.png",
    bone_pile: "/assets/tiles/bone_pile.png",
    small_treasure: "/assets/tiles/small_treasure.png",
    red_banner: "/assets/tiles/red_banner.png",
    rubble: "/assets/tiles/rubble.png",
    wooden_post: "/assets/tiles/wooden_post.png",
    small_candle: "/assets/tiles/small_candle.png"
  },
  effects: {
    shadow_blob: "/assets/effects/shadow_blob.png",
    torch_glow: "/assets/effects/torch_glow.png",
    dust_particle: "/assets/effects/dust_particle.png"
  },
  animatedEffects: {
    torchFlame: {
      key: "torch_flame_loop",
      path: "/assets/effects/torch-flame-loop.png",
      frameWidth: 64,
      frameHeight: 64
    },
    candleFlame: {
      key: "candle_flame_loop",
      path: "/assets/effects/candle-flame-loop.png",
      frameWidth: 64,
      frameHeight: 64
    },
    hasteSparkle: {
      key: "haste_sparkle_loop",
      path: "/assets/effects/haste-sparkle-sprite-sheet.png",
      frameWidth: 64,
      frameHeight: 64
    },
    blast: {
      key: "blast_impact",
      path: "/assets/effects/blast-sprite-sheet.png",
      frameWidth: 64,
      frameHeight: 64
    }
  },
  powerUps: {
    key: "powerups",
    path: "/assets/effects/powerups-sprite-sheet.png",
    metadataPath: "/assets/effects/powerups-sprite-sheet.json",
    frameWidth: 32,
    frameHeight: 32,
    types: ["quickshot", "haste", "ward", "blast"] as const
  },
  pickups: {
    ammo: {
      key: "ammo_pickup",
      path: "/assets/effects/ammo-pickup-sprite-sheet.png",
      metadataPath: "/assets/effects/ammo-pickup-sprite-sheet.json",
      frameWidth: 32,
      frameHeight: 32
    }
  },
  projectiles: {
    staffBolt: {
      key: "staff_bolt",
      path: "/assets/effects/staff-bolt-sprite-sheet.png",
      metadataPath: "/assets/effects/staff-bolt-sprite-sheet.json",
      frameWidth: 32,
      frameHeight: 32
    }
  },
  ui: {
    small_dark_panel: "/assets/ui/small_dark_panel.png",
    debug_label_bg: "/assets/ui/debug_label_bg.png",
    keyboard_hint_panel: "/assets/ui/keyboard_hint_panel.png",
    life_meter_frame: "/assets/ui/life_meter_frame_empty.png",
    life_heart: "/assets/ui/life-heart.png",
    game_over_panel: "/assets/ui/game_over_panel.png",
    start_over_button: "/assets/ui/start_over_button.png"
  },
  uiSprites: {
    startTitle: {
      key: "start_title_loop",
      path: "/assets/ui/start-title-sprite-sheet.png",
      frameWidth: 640,
      frameHeight: 320
    },
    gameOverTitle: {
      key: "game_over_title_loop",
      path: "/assets/ui/game-over-sprite-sheet.png",
      frameWidth: 560,
      frameHeight: 260
    },
    lifeMeterLoop: {
      key: "life_meter_loop",
      path: "/assets/ui/life-meter-sprite-sheet.png",
      frameWidth: 640,
      frameHeight: 240
    },
    hudPanels: {
      key: "hud_panels",
      path: "/assets/ui/hud-panels-sprite-sheet.png",
      frameWidth: 224,
      frameHeight: 58
    },
    lifeHeartBurst: {
      key: "life_heart_burst",
      path: "/assets/ui/life-heart-burst.png",
      frameWidth: 64,
      frameHeight: 64
    },
    lifeHeartShimmer: {
      key: "life_heart_shimmer",
      path: "/assets/ui/life-heart-shimmer-sprite-sheet.png",
      frameWidth: 64,
      frameHeight: 64
    }
  },
  audio: {
    staffShot: "/assets/audio/staff_shot.wav",
    projectileHit: "/assets/audio/projectile_hit.wav",
    enemyHit: "/assets/audio/enemy_hit.wav",
    enemyDown: "/assets/audio/enemy_down.wav",
    playerHurt: "/assets/audio/player_hurt.wav",
    pickup: "/assets/audio/pickup.wav",
    powerup: "/assets/audio/powerup.wav",
    heartPickup: "/assets/audio/heart_pickup.wav",
    ammoPickup: "/assets/audio/ammo_pickup.wav",
    gameOver: "/assets/audio/game_over.wav",
    start: "/assets/audio/start.wav",
    uiToggle: "/assets/audio/ui_toggle.wav",
    blast: "/assets/audio/blast.wav",
    dungeonAmbience: "/assets/audio/dungeon_ambience.wav",
    retroDungeonTheme: "/assets/audio/retro_dungeon_theme.wav"
  }
} as const;

export type TileAssetKey = keyof typeof assetManifest.tiles;
export type EffectAssetKey = keyof typeof assetManifest.effects;
export type UiAssetKey = keyof typeof assetManifest.ui;
export type AudioAssetKey = keyof typeof assetManifest.audio;
