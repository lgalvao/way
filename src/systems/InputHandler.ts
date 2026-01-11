import Phaser from 'phaser';
import { InputState } from '../types';

/**
 * Handles keyboard input for both players
 */
export class InputHandler {
  private scene: Phaser.Scene;

  // Player 1 keys (WASD + Space)
  private p1Keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    action: Phaser.Input.Keyboard.Key;
  };

  // Player 2 keys (IJKL + Enter)
  private p2Keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    action: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeys();
  }

  private setupKeys(): void {
    const keyboard = this.scene.input.keyboard!;

    // Player 1: WASD + Space (also arrow keys)
    this.p1Keys = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      action: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    // Also add arrow keys for P1
    const upArrow = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const downArrow = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const leftArrow = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const rightArrow = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    // Player 2: IJKL + Enter
    this.p2Keys = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      action: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    };

    // Store arrow keys for P1 alternate control
    this.p1ArrowKeys = { up: upArrow, down: downArrow, left: leftArrow, right: rightArrow };
  }

  private p1ArrowKeys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  /**
   * Get input state for a player
   * @param playerId 1 or 2
   * @param facing Fighter's facing direction (1 = right, -1 = left)
   */
  getInputState(playerId: 1 | 2, facing: 1 | -1): InputState {
    const keys = playerId === 1 ? this.p1Keys : this.p2Keys;
    const arrows = playerId === 1 ? this.p1ArrowKeys : null;

    // Raw direction
    let rawX = 0;
    let rawY = 0;

    if (keys.left.isDown || arrows?.left.isDown) rawX -= 1;
    if (keys.right.isDown || arrows?.right.isDown) rawX += 1;
    if (keys.up.isDown || arrows?.up.isDown) rawY -= 1;
    if (keys.down.isDown || arrows?.down.isDown) rawY += 1;

    // Convert to relative direction (positive = toward opponent)
    // If facing right (1), right is forward. If facing left (-1), left is forward.
    const relativeX = (rawX * facing) as -1 | 0 | 1;

    return {
      direction: {
        x: relativeX,
        y: rawY as -1 | 0 | 1,
      },
      action: keys.action.isDown,
      actionJustPressed: Phaser.Input.Keyboard.JustDown(keys.action),
    };
  }

  /**
   * Check if player is holding back (for blocking)
   */
  isHoldingBack(playerId: 1 | 2, facing: 1 | -1): boolean {
    const input = this.getInputState(playerId, facing);
    return input.direction.x === -1;
  }
}
