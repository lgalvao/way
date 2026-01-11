import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { FightScene } from './scenes/FightScene';
import { GAME, PHYSICS, COLORS } from './config';

/**
 * Iron Fist Web - A browser-based fighting game
 * Built with Phaser 3
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  parent: 'game-container',
  backgroundColor: COLORS.BACKGROUND,
  pixelArt: true,
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PHYSICS.GRAVITY },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, FightScene],
};

// Start the game
new Phaser.Game(config);
