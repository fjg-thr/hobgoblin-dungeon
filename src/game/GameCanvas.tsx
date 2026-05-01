"use client";

import { useEffect, useRef } from "react";
import type * as PhaserType from "phaser";

export default function GameCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<PhaserType.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) {
      return;
    }

    let cancelled = false;

    async function bootGame(host: HTMLDivElement) {
      const [Phaser, { DungeonScene }] = await Promise.all([
        import("phaser"),
        import("./scenes/DungeonScene")
      ]);

      if (cancelled || gameRef.current) {
        return;
      }

      const config: PhaserType.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: host,
        width: Math.max(1, window.innerWidth),
        height: Math.max(1, window.innerHeight),
        backgroundColor: "#050607",
        pixelArt: true,
        roundPixels: true,
        antialias: false,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.NO_CENTER,
          width: Math.max(1, window.innerWidth),
          height: Math.max(1, window.innerHeight)
        },
        render: {
          pixelArt: true,
          antialias: false,
          antialiasGL: false,
          roundPixels: true
        },
        scene: [DungeonScene]
      };

      gameRef.current = new Phaser.Game(config);
    }

    void bootGame(hostRef.current);

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={hostRef} className="game-shell" />;
}
