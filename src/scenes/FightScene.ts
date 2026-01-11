import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';
import { InputHandler } from '../systems/InputHandler';
import { CollisionManager } from '../systems/CollisionManager';
import { GAME, PHYSICS, STAGE } from '../config';
import { HitEvent } from '../types';

/**
 * Main fight scene - where the battle happens
 */
export class FightScene extends Phaser.Scene {
  private player1!: Fighter;
  private player2!: Fighter;
  private inputHandler!: InputHandler;
  private collisionManager!: CollisionManager;

  // UI elements
  private p1ScoreText!: Phaser.GameObjects.Text;
  private p2ScoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private centerText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;

  // Score tracking
  private scores = { p1: 0, p2: 0 };
  private roundWins = { p1: 0, p2: 0 };
  private currentRound = 1;
  private isPaused = false;

  // Timer
  private roundTime = 60;
  private timerEvent!: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'FightScene' });
  }

  create(): void {
    this.createBackground();
    this.createFighters();
    this.createUI();

    // Initialize systems
    this.inputHandler = new InputHandler(this);
    this.collisionManager = new CollisionManager();

    // Start the round
    this.startRound();

    // Add control hints
    this.add.text(10, 10, 'P1: WASD + SPACE | P2: IJKL + ENTER | Hold BACK to block', {
      fontSize: '18px',
      color: '#666688',
    });
  }


  private ground!: Phaser.Physics.Arcade.StaticGroup;


  private bgSprite!: Phaser.GameObjects.Image;
  private backgroundKeys = ['bg_dojo', 'bg_mountain', 'bg_pagoda', 'bg_beach'];

  private createBackground(): void {
    // Pick a random background
    const randomBg = Phaser.Utils.Array.GetRandom(this.backgroundKeys);
    
    // Add background image (scaled to fit)
    this.bgSprite = this.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2, randomBg);
    this.bgSprite.setDisplaySize(GAME.WIDTH, GAME.HEIGHT);

    // Ground line (visual)
    this.add.line(
      GAME.WIDTH / 2,
      PHYSICS.GROUND_Y,
      -GAME.WIDTH / 2,
      0,
      GAME.WIDTH / 2,
      0,
      0x4a3728
    ).setLineWidth(4);

    // Physics Ground
    this.ground = this.physics.add.staticGroup();
    // Create a transparent ground block at GROUND_Y
    const groundRect = this.add.rectangle(GAME.WIDTH/2, PHYSICS.GROUND_Y + 20, GAME.WIDTH, 40, 0x000000, 0);
    this.ground.add(groundRect);
  }

  private createFighters(): void {
    // Create Player 1 (left side, blue)
    this.player1 = new Fighter(this, STAGE.P1_START_X, PHYSICS.GROUND_Y, 1);

    // Create Player 2 (right side, red)
    this.player2 = new Fighter(this, STAGE.P2_START_X, PHYSICS.GROUND_Y, 2);

    // Link opponents
    this.player1.opponent = this.player2;
    this.player2.opponent = this.player1;

    // Add collision interacting with ground
    this.physics.add.collider(this.player1, this.ground);
    this.physics.add.collider(this.player2, this.ground);
  }

  private createUI(): void {
    const scoreStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    };

    // Player 1 score (left)
    this.p1ScoreText = this.add.text(100, 60, 'P1: 0', {
      ...scoreStyle,
      color: '#4488ff',
    });

    // Timer (center)
    this.timerText = this.add.text(GAME.WIDTH / 2, 60, '60', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5, 0);

    // Round indicator
    this.roundText = this.add.text(GAME.WIDTH / 2, 130, 'ROUND 1', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#888888',
    }).setOrigin(0.5, 0);

    // Player 2 score (right)
    this.p2ScoreText = this.add.text(GAME.WIDTH - 100, 60, 'P2: 0', {
      ...scoreStyle,
      color: '#ff4444',
    }).setOrigin(1, 0);

    // Round wins display
    this.add.text(100, 120, `Wins: ${this.roundWins.p1}`, {
      fontSize: '20px',
      color: '#4488ff',
    });
    this.add.text(GAME.WIDTH - 100, 120, `Wins: ${this.roundWins.p2}`, {
      fontSize: '20px',
      color: '#ff4444',
    }).setOrigin(1, 0);

    // Center text for announcements
    this.centerText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 - 100, '', {
      fontSize: '72px',
      fontFamily: 'Arial Black',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0);
  }

  private startRound(): void {
    this.isPaused = true;
    this.roundTime = 60;
    this.scores = { p1: 0, p2: 0 };
    this.updateScoreDisplay();
    this.updateTimerDisplay();
    this.roundText.setText(`ROUND ${this.currentRound}`);

    // Show round start announcement
    this.showCenterText(`ROUND ${this.currentRound}`, 1000);
    
    this.time.delayedCall(1200, () => {
      this.showCenterText('FIGHT!', 800);
      this.isPaused = false;
      this.startTimer();
    });
  }

  private startTimer(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.roundTime--;
        this.updateTimerDisplay();

        if (this.roundTime <= 0) {
          this.handleTimeUp();
        }
      },
      loop: true,
    });
  }

  private updateTimerDisplay(): void {
    this.timerText.setText(this.roundTime.toString());
    
    // Flash red when low
    if (this.roundTime <= 10) {
      this.timerText.setColor(this.roundTime % 2 === 0 ? '#ff4444' : '#ffffff');
    } else {
      this.timerText.setColor('#ffffff');
    }
  }

  private showCenterText(text: string, duration: number): void {
    this.centerText.setText(text).setAlpha(1);

    this.tweens.add({
      targets: this.centerText,
      alpha: 0,
      duration: 500,
      delay: duration - 500,
      ease: 'Power2',
    });
  }

  update(_time: number, delta: number): void {
    if (this.isPaused) return;

    // Get inputs
    const p1Input = this.inputHandler.getInputState(1, this.player1.facing);
    const p2Input = this.inputHandler.getInputState(2, this.player2.facing);

    // Update fighters
    this.player1.update(p1Input, delta);
    this.player2.update(p2Input, delta);

    // Check collisions
    const hitEvent = this.collisionManager.checkCollisions(this.player1, this.player2);
    if (hitEvent) {
      this.handleHit(hitEvent);
    }

    // Keep fighters separated
    this.collisionManager.separateFighters(this.player1, this.player2);
  }

  private handleHit(event: HitEvent): void {
    const defender = event.defender === 1 ? this.player1 : this.player2;

    if (event.wasBlocked) {
      // Blocked hit
      defender.blockHit(event.attack);
      this.showCenterText('BLOCKED!', 500);
    } else {
      // Clean hit
      defender.takeHit(event.attack);

      // Update score
      if (event.attacker === 1) {
        this.scores.p1 += event.attack.damage;
      } else {
        this.scores.p2 += event.attack.damage;
      }

      this.updateScoreDisplay();

      // Show hit feedback
      const pointType = event.attack.damage >= 1 ? 'IPPON!' : event.attack.damage >= 0.5 ? 'WAZA-ARI!' : 'HIT!';
      this.showCenterText(pointType, 800);

      // Check for round win (2 points needed)
      if (this.scores.p1 >= 2 || this.scores.p2 >= 2) {
        this.handleRoundEnd();
      }
    }
  }

  private handleTimeUp(): void {
    this.timerEvent.destroy();
    this.isPaused = true;

    // Player with more points wins
    if (this.scores.p1 > this.scores.p2) {
      this.roundWins.p1++;
      this.showCenterText('TIME! P1 WINS!', 2000);
    } else if (this.scores.p2 > this.scores.p1) {
      this.roundWins.p2++;
      this.showCenterText('TIME! P2 WINS!', 2000);
    } else {
      this.showCenterText('TIME! DRAW!', 2000);
    }

    this.time.delayedCall(2500, () => {
      this.checkMatchEnd();
    });
  }

  private updateScoreDisplay(): void {
    this.p1ScoreText.setText(`P1: ${this.scores.p1.toFixed(1)}`);
    this.p2ScoreText.setText(`P2: ${this.scores.p2.toFixed(1)}`);
  }

  private handleRoundEnd(): void {
    this.timerEvent?.destroy();
    this.isPaused = true;
    
    const winner = this.scores.p1 >= 2 ? 1 : 2;
    if (winner === 1) {
      this.roundWins.p1++;
    } else {
      this.roundWins.p2++;
    }
    
    this.showCenterText(`PLAYER ${winner} WINS!`, 2000);

    // Play victory animation for the winner
    if (winner === 1) {
      this.player1.playAnimation('impact');
    } else {
      this.player2.playAnimation('impact');
    }

    this.time.delayedCall(2500, () => {
      this.checkMatchEnd();
    });
  }

  private checkMatchEnd(): void {
    // Best of 3: first to 2 round wins
    if (this.roundWins.p1 >= 2 || this.roundWins.p2 >= 2) {
      const matchWinner = this.roundWins.p1 >= 2 ? 1 : 2;
      this.showCenterText(`PLAYER ${matchWinner} WINS THE MATCH!`, 4000);
      
      // Reset match after delay
      this.time.delayedCall(4500, () => {
        this.roundWins = { p1: 0, p2: 0 };
        this.currentRound = 1;
        
        // Change background for new match
        const newBg = Phaser.Utils.Array.GetRandom(this.backgroundKeys);
        this.bgSprite.setTexture(newBg);
        
        this.player1.resetPosition();
        this.player2.resetPosition();
        this.startRound();
      });
    } else {
      // Next round
      this.currentRound++;
      this.player1.resetPosition();
      this.player2.resetPosition();
      this.startRound();
    }
  }
}
