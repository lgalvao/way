import Phaser from 'phaser';

/**
 * Preload scene - loads all game assets with a loading bar
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4488ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(Math.round(value * 100) + '%');
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load sprite sheets (cleaned with transparent backgrounds)
    // Sheets: 514x518 with 2px spacing between frames
    // Grid: 3x4 -> 170x128 per frame
    this.load.spritesheet('fighter_p1', 'assets/sprites/fighter_p1_clean.png', {
      frameWidth: 170,
      frameHeight: 128,
      spacing: 2,
    });

    this.load.spritesheet('fighter_p2', 'assets/sprites/fighter_p2_clean.png', {
      frameWidth: 170,
      frameHeight: 128,
      spacing: 2,
    });

    // Load background
    this.load.image('bg_dojo', 'assets/backgrounds/dojo.png');
  }

  create(): void {
    // Create animations for P1
    this.createFighterAnimations('fighter_p1');
    // Create animations for P2
    this.createFighterAnimations('fighter_p2');

    // Start fight scene
    this.scene.start('FightScene');
  }

  private createFighterAnimations(key: string): void {
    // Frame mapping based on the generated sprite sheets (3x4 grid):
    // Row 0: 0=Idle, 1=Walk, 2=Crouch
    // Row 1: 3=Jump, 4=HighKick, 5=Punch  
    // Row 2: 6=Sweep, 7=Block, (8 extra)
    // Row 3: (9, 10, 11 extra poses)

    this.anims.create({
      key: `${key}_idle`,
      frames: [{ key, frame: 0 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_walk`,
      frames: [{ key, frame: 1 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_crouch`,
      frames: [{ key, frame: 2 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_jump`,
      frames: [{ key, frame: 3 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_highkick`,
      frames: [{ key, frame: 4 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_punch`,
      frames: [{ key, frame: 5 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_sweep`,
      frames: [{ key, frame: 6 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_block`,
      frames: [{ key, frame: 7 }],
      frameRate: 1,
    });
  }
}
