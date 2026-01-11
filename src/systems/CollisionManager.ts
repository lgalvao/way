import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';
import { HitEvent } from '../types';

/**
 * Handles collision detection between fighters
 */
export class CollisionManager {
  private hitThisFrame: Set<string> = new Set();

  /**
   * Check for hitbox vs hurtbox collisions
   * Returns hit event if collision occurred
   */
  checkCollisions(p1: Fighter, p2: Fighter): HitEvent | null {
    // Reset hit tracking each frame
    this.hitThisFrame.clear();

    // Check P1 attacking P2
    const p1Hit = this.checkAttack(p1, p2);
    if (p1Hit) return p1Hit;

    // Check P2 attacking P1
    const p2Hit = this.checkAttack(p2, p1);
    if (p2Hit) return p2Hit;

    return null;
  }

  private checkAttack(attacker: Fighter, defender: Fighter): HitEvent | null {
    // Attacker must be in attack state with active hitbox
    if (!attacker.stateMachine.isInState('ATTACK')) return null;

    const hitbox = attacker.getHitboxBounds();
    if (!hitbox) return null;

    // Defender must not be in hitstun or blockstun
    if (defender.stateMachine.isInState('HITSTUN')) return null;
    if (defender.stateMachine.isInState('BLOCKSTUN')) return null;

    const hurtbox = defender.getHurtboxBounds();

    // Check AABB overlap
    if (Phaser.Geom.Rectangle.Overlaps(hitbox, hurtbox)) {
      // Prevent multiple hits from same attack
      const hitKey = `${attacker.playerId}-${attacker.attackFrame}`;
      if (this.hitThisFrame.has(hitKey)) return null;
      this.hitThisFrame.add(hitKey);

      const attack = attacker.currentAttack!;

      // Check if defender is blocking
      const wasBlocked = defender.canBlock(attack.hitboxType);

      return {
        attacker: attacker.playerId,
        defender: defender.playerId,
        attack,
        wasBlocked,
      };
    }

    return null;
  }

  /**
   * Prevent fighters from overlapping
   */
  separateFighters(p1: Fighter, p2: Fighter): void {
    const minDistance = 80;
    const distance = Math.abs(p1.x - p2.x);

    if (distance < minDistance) {
      const overlap = (minDistance - distance) / 2;
      const sign = p1.x < p2.x ? -1 : 1;

      p1.x += overlap * sign;
      p2.x -= overlap * sign;
    }
  }
}
