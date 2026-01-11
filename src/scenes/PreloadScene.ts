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

    // Load sprite sheets (use P2 sprites for both - P1 has rendering issues)
    // Sheets: 686x514 with 4x3 grid, 170x170 per frame, 2px spacing
    this.load.spritesheet('fighter_p1', 'assets/sprites/fighter_p2_clean.png', {
      frameWidth: 170,
      frameHeight: 170,
      spacing: 2,
    });

    this.load.spritesheet('fighter_p2', 'assets/sprites/fighter_p2_clean.png', {
      frameWidth: 170,
      frameHeight: 170,
      spacing: 2,
    });

    // Load backgrounds
    this.load.image('bg_dojo', 'assets/backgrounds/dojo.png');
    this.load.image('bg_mountain', 'assets/backgrounds/mountain.png');
    this.load.image('bg_pagoda', 'assets/backgrounds/pagoda.png');
    this.load.image('bg_beach', 'assets/backgrounds/beach.png');
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
    // Frame mapping based on the sprite sheets (4x3 grid):
    // Row 0: 0=Idle, 1=Walk, 2=Crouch, 3=Jump
    // Row 1: 4=HighKick, 5=MidPunch, 6=Sweep, 7=Block
    // Row 2: 8=LowPunch, 9=HighPunch, 10=MidKick, 11=Impact/Ready

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
      key: `${key}_high_kick`,
      frames: [{ key, frame: 4 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_mid_punch`,
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

    this.anims.create({
      key: `${key}_low_punch`,
      frames: [{ key, frame: 8 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_high_punch`,
      frames: [{ key, frame: 9 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_mid_kick`,
      frames: [{ key, frame: 10 }],
      frameRate: 1,
    });

    this.anims.create({
      key: `${key}_impact`,
      frames: [{ key, frame: 11 }],
      frameRate: 1,
    });
  }
}
