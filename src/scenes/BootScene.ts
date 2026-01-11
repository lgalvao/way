import Phaser from 'phaser';

/**
 * Boot scene - minimal setup, transitions to PreloadScene
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Minimal assets for boot screen
  }

  create(): void {
    // Show a simple title while loading starts
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      'IRON FIST WEB',
      {
        fontSize: '48px',
        fontFamily: 'Arial Black',
        color: '#ffdd44',
      }
    ).setOrigin(0.5);

    // Transition to preload scene
    this.scene.start('PreloadScene');
  }
}
