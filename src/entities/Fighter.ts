import Phaser from 'phaser';
import { StateMachine, State } from '../systems/StateMachine';
import { InputState, AttackData, FighterStateName, HitboxType } from '../types';
import { getAttack } from '../data/attacks';
import { PHYSICS, STAGE, FIGHTER } from '../config';

/**
 * Fighter entity - the main playable character
 * Uses colored rectangles for the prototype
 */
export class Fighter extends Phaser.GameObjects.Container {
  public playerId: 1 | 2;
  public facing: 1 | -1 = 1;
  public isGrounded: boolean = true;
  public isCrouching: boolean = false;
  public isBlocking: boolean = false;

  // State machine
  public stateMachine: StateMachine<Fighter>;

  // Attack tracking
  public currentAttack: AttackData | null = null;
  public attackFrame: number = 0;

  // Hitstun/blockstun tracking
  public stunFrames: number = 0;

  // Visual components
  private sprite: Phaser.GameObjects.Sprite;
  private hitboxGraphics: Phaser.GameObjects.Rectangle | null = null;

  // Physics body (for position/velocity)
  declare body: Phaser.Physics.Arcade.Body;

  // Hurtbox for collision detection
  public hurtbox: Phaser.GameObjects.Rectangle;

  // Opponent reference (set after both fighters created)
  public opponent: Fighter | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, playerId: 1 | 2) {
    super(scene, x, y);
    this.playerId = playerId;
    this.facing = playerId === 1 ? 1 : -1;

    // Create sprite (170x128 per frame, scale to ~FIGHTER.HEIGHT 150)
    // Scale: 150 / 128 ≈ 1.17
    const spriteKey = playerId === 1 ? 'fighter_p1' : 'fighter_p2';
    this.sprite = scene.add.sprite(0, 0, spriteKey, 0);
    this.sprite.setOrigin(0.5, 1.0); // Origin at feet (bottom)
    this.sprite.setScale(1.2); 
    this.add(this.sprite);

    // Create hurtbox (slightly smaller than body) - invisible in production
    this.hurtbox = scene.add.rectangle(
      x, y - FIGHTER.HURTBOX_HEIGHT / 2,
      FIGHTER.HURTBOX_WIDTH, FIGHTER.HURTBOX_HEIGHT,
      0x00ff00, 0  // Alpha 0 = invisible
    );
    // this.hurtbox.setStrokeStyle(2, 0x00ff00); // Uncomment for debug

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(FIGHTER.WIDTH, FIGHTER.HEIGHT);
    body.setOffset(-FIGHTER.WIDTH / 2, -FIGHTER.HEIGHT);
    body.setCollideWorldBounds(true);
    body.setGravityY(PHYSICS.GRAVITY);

    // Initialize state machine
    this.stateMachine = new StateMachine<Fighter>();
    this.setupStates();
    this.stateMachine.setState('IDLE');
  }

  private setupStates(): void {
    this.stateMachine.addState(new IdleState(this));
    this.stateMachine.addState(new WalkState(this));
    this.stateMachine.addState(new CrouchState(this));
    this.stateMachine.addState(new JumpState(this));
    this.stateMachine.addState(new AirborneState(this));
    this.stateMachine.addState(new AttackState(this));
    this.stateMachine.addState(new BlockState(this));
    this.stateMachine.addState(new BlockstunState(this));
    this.stateMachine.addState(new HitstunState(this));
  }

  update(input: InputState, delta: number): void {
    // Update facing direction to always face opponent
    if (this.opponent && !this.stateMachine.isInState('ATTACK')) {
      this.facing = this.opponent.x > this.x ? 1 : -1;
      this.sprite.setFlipX(this.facing === -1);
    }

    // Update hurtbox position and size based on crouch state
    const hurtHeight = this.isCrouching ? FIGHTER.CROUCH_HURTBOX_HEIGHT : FIGHTER.HURTBOX_HEIGHT;
    this.hurtbox.setSize(FIGHTER.HURTBOX_WIDTH, hurtHeight);
    this.hurtbox.setPosition(this.x, this.y - hurtHeight / 2);

    // Check if grounded
    this.isGrounded = this.body.blocked.down;

    // Update state machine
    this.stateMachine.update(input, delta);

    // Clamp to stage bounds
    this.x = Phaser.Math.Clamp(this.x, STAGE.LEFT_BOUND, STAGE.RIGHT_BOUND);
  }

  /**
   * Start an attack based on direction input
   */
  startAttack(dirX: -1 | 0 | 1, dirY: -1 | 0 | 1): void {
    this.currentAttack = getAttack(dirX, dirY);
    this.attackFrame = 0;
    this.stateMachine.setState('ATTACK');
  }

  /**
   * Set crouch visual
   */
  setCrouch(crouching: boolean): void {
    this.isCrouching = crouching;
    if (crouching) {
      this.playAnimation('crouch');
    }
  }

  /**
   * Play an animation for this fighter
   */
  playAnimation(anim: string): void {
    const key = this.playerId === 1 ? 'fighter_p1' : 'fighter_p2';
    const animKey = `${key}_${anim}`;
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey);
    }
  }

  /**
   * Check if this fighter can block a specific attack type
   */
  canBlock(attackType: HitboxType): boolean {
    if (!this.isBlocking) return false;
    
    // High attacks can only be blocked standing
    if (attackType === 'high' && this.isCrouching) return false;
    // Low attacks can only be blocked crouching
    if (attackType === 'low' && !this.isCrouching) return false;
    // Mid attacks can be blocked either way
    return true;
  }

  /**
   * Create hitbox graphics during active frames
   */
  showHitbox(): void {
    if (!this.currentAttack || this.hitboxGraphics) return;

    const attack = this.currentAttack;
    const offsetX = attack.hitboxOffset.x * this.facing;
    const offsetY = attack.hitboxOffset.y;

    // Hitbox is invisible in production (collision still works via getHitboxBounds)
    this.hitboxGraphics = this.scene.add.rectangle(
      this.x + offsetX,
      this.y + offsetY - FIGHTER.HEIGHT / 2,
      attack.hitboxSize.width,
      attack.hitboxSize.height,
      0xff0000,
      0  // Alpha 0 = invisible
    );
    // this.hitboxGraphics.setStrokeStyle(2, 0xff0000); // Uncomment for debug
  }

  /**
   * Remove hitbox graphics
   */
  hideHitbox(): void {
    if (this.hitboxGraphics) {
      this.hitboxGraphics.destroy();
      this.hitboxGraphics = null;
    }
  }

  /**
   * Get current hitbox bounds for collision detection
   */
  getHitboxBounds(): Phaser.Geom.Rectangle | null {
    if (!this.currentAttack || !this.hitboxGraphics) return null;

    const attack = this.currentAttack;
    const offsetX = attack.hitboxOffset.x * this.facing;
    const offsetY = attack.hitboxOffset.y;

    return new Phaser.Geom.Rectangle(
      this.x + offsetX - attack.hitboxSize.width / 2,
      this.y + offsetY - FIGHTER.HEIGHT / 2 - attack.hitboxSize.height / 2,
      attack.hitboxSize.width,
      attack.hitboxSize.height
    );
  }

  /**
   * Get hurtbox bounds for collision detection
   */
  getHurtboxBounds(): Phaser.Geom.Rectangle {
    const height = this.isCrouching ? FIGHTER.CROUCH_HURTBOX_HEIGHT : FIGHTER.HURTBOX_HEIGHT;
    return new Phaser.Geom.Rectangle(
      this.x - FIGHTER.HURTBOX_WIDTH / 2,
      this.y - height,
      FIGHTER.HURTBOX_WIDTH,
      height
    );
  }

  /**
   * Called when this fighter gets hit
   */
  takeHit(attack: AttackData): void {
    this.stunFrames = attack.hitstun;
    this.hideHitbox();
    this.currentAttack = null;
    this.stateMachine.setState('HITSTUN');

    // Apply knockback
    const knockbackDir = this.opponent ? (this.opponent.x > this.x ? -1 : 1) : -this.facing;
    this.body.setVelocityX(attack.knockback * knockbackDir * 10);
  }

  /**
   * Called when this fighter blocks an attack
   */
  blockHit(attack: AttackData): void {
    this.stunFrames = attack.blockstun;
    this.stateMachine.setState('BLOCKSTUN');

    // Apply reduced pushback
    const pushDir = this.opponent ? (this.opponent.x > this.x ? -1 : 1) : -this.facing;
    this.body.setVelocityX(PHYSICS.PUSHBACK_ON_BLOCK * pushDir * 5);
  }

  /**
   * Reset to starting position
   */
  resetPosition(): void {
    const startX = this.playerId === 1 ? STAGE.P1_START_X : STAGE.P2_START_X;
    this.setPosition(startX, PHYSICS.GROUND_Y);
    this.body.setVelocity(0, 0);
    this.hideHitbox();
    this.currentAttack = null;
    this.attackFrame = 0;
    this.stunFrames = 0;
    this.isCrouching = false;
    this.isBlocking = false;
    this.setCrouch(false);
    this.stateMachine.setState('IDLE');
  }

  /**
   * Visual flash when hit
   */
  flashHit(): void {
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });
  }

  /**
   * Visual flash when blocking
   */
  flashBlock(): void {
    this.sprite.setTint(0x88ffff);
    this.scene.time.delayedCall(80, () => {
      this.sprite.clearTint();
    });
  }
}

// ==================== STATES ====================

class IdleState implements State<Fighter> {
  name: FighterStateName = 'IDLE';
  owner: Fighter;

  constructor(owner: Fighter) {
    this.owner = owner;
  }

  enter(): void {
    this.owner.body.setVelocityX(0);
    this.owner.setCrouch(false);
    this.owner.isBlocking = false;
    this.owner.playAnimation('idle');
  }

  update(input: InputState, _delta: number): void {
    // Check for attack input
    if (input.actionJustPressed) {
      this.owner.startAttack(input.direction.x, input.direction.y);
      return;
    }

    // Check for jump (up input while grounded)
    if (input.direction.y === -1 && this.owner.isGrounded) {
      this.owner.stateMachine.setState('JUMP');
      return;
    }

    // Check for crouch
    if (input.direction.y === 1) {
      this.owner.stateMachine.setState('CROUCH');
      return;
    }

    // Check for blocking (holding back)
    if (input.direction.x === -1) {
      this.owner.stateMachine.setState('BLOCK');
      return;
    }

    // Check for forward movement
    if (input.direction.x === 1) {
      this.owner.stateMachine.setState('WALK');
    }
  }

  exit(): void {}
}

class WalkState implements State<Fighter> {
  name: FighterStateName = 'WALK';
  owner: Fighter;

  constructor(owner: Fighter) {
    this.owner = owner;
  }

  enter(): void {
    this.owner.playAnimation('walk');
  }

  update(input: InputState, _delta: number): void {
    // Check for attack input
    if (input.actionJustPressed) {
      this.owner.startAttack(input.direction.x, input.direction.y);
      return;
    }

    // Check for jump
    if (input.direction.y === -1 && this.owner.isGrounded) {
      this.owner.stateMachine.setState('JUMP');
      return;
    }

    // Apply movement (only forward movement in walk state)
    if (input.direction.x === 1) {
      this.owner.body.setVelocityX(this.owner.facing * PHYSICS.WALK_SPEED);
    } else if (input.direction.x === -1) {
      // Holding back = switch to block
      this.owner.stateMachine.setState('BLOCK');
    } else {
      this.owner.stateMachine.setState('IDLE');
    }
  }

  exit(): void {
    this.owner.body.setVelocityX(0);
  }
}

class CrouchState implements State<Fighter> {
  name: FighterStateName = 'CROUCH';
  owner: Fighter;

  constructor(owner: Fighter) {
    this.owner = owner;
  }

  enter(): void {
    this.owner.setCrouch(true);
    this.owner.body.setVelocityX(0);
  }

  update(input: InputState, _delta: number): void {
    // Check for attack (only low attacks while crouching)
    if (input.actionJustPressed) {
      // Force low attack direction
      this.owner.startAttack(input.direction.x, 1);
      return;
    }

    // Check for crouch block
    if (input.direction.x === -1) {
      this.owner.isBlocking = true;
    } else {
      this.owner.isBlocking = false;
    }

    // Stand up if not holding down
    if (input.direction.y !== 1) {
      this.owner.stateMachine.setState('IDLE');
    }
  }

  exit(): void {
    this.owner.setCrouch(false);
    this.owner.isBlocking = false;
  }
}

class JumpState implements State<Fighter> {
  name: FighterStateName = 'JUMP';
  owner: Fighter;

  constructor(owner: Fighter) {
    this.owner = owner;
  }

  enter(): void {
    this.owner.body.setVelocityY(PHYSICS.JUMP_VELOCITY);
    this.owner.playAnimation('jump');
  }

  update(_input: InputState, _delta: number): void {
    // Transition to airborne once we start falling
    if (this.owner.body.velocity.y >= 0) {
      this.owner.stateMachine.setState('AIRBORNE');
    }
  }

  exit(): void {}
}

class AirborneState implements State<Fighter> {
  name: FighterStateName = 'AIRBORNE';
  owner: Fighter;

  constructor(owner: Fighter) {
    this.owner = owner;
  }

  enter(): void {
    this.owner.playAnimation('jump');
  }

  update(input: InputState, _delta: number): void {
    // Allow air attacks
    if (input.actionJustPressed) {
      this.owner.startAttack(input.direction.x, input.direction.y);
      return;
    }

    // Land when grounded
    if (this.owner.isGrounded) {
      this.owner.stateMachine.setState('IDLE');
    }

    // Allow some air control
    if (input.direction.x !== 0) {
      const airSpeed = PHYSICS.WALK_SPEED * 0.5;
      this.owner.body.setVelocityX(input.direction.x * this.owner.facing * airSpeed);
    }
  }

  exit(): void {}
}

class BlockState implements State<Fighter> {
  name: FighterStateName = 'BLOCK';
  owner: Fighter;

  constructor(owner: Fighter) {
    this.owner = owner;
  }

  enter(): void {
    this.owner.isBlocking = true;
    this.owner.body.setVelocityX(-this.owner.facing * PHYSICS.WALK_SPEED * 0.5);
    this.owner.playAnimation('block');
  }

  update(input: InputState, _delta: number): void {
    // Still holding back
    if (input.direction.x === -1) {
      this.owner.body.setVelocityX(-this.owner.facing * PHYSICS.WALK_SPEED * 0.5);
      
      // Check for crouch block
      if (input.direction.y === 1) {
        this.owner.setCrouch(true);
      } else {
        this.owner.setCrouch(false);
      }
    } else {
      this.owner.stateMachine.setState('IDLE');
    }
  }

  exit(): void {
    this.owner.isBlocking = false;
    this.owner.setCrouch(false);
    this.owner.body.setVelocityX(0);
  }
}

class BlockstunState implements State<Fighter> {
  name: FighterStateName = 'BLOCKSTUN';
  owner: Fighter;

  constructor(owner: Fighter) {
    this.owner = owner;
  }

  enter(): void {
    this.owner.flashBlock();
  }

  update(_input: InputState, _delta: number): void {
    this.owner.stunFrames--;

    if (this.owner.stunFrames <= 0) {
      this.owner.stateMachine.setState('IDLE');
    }
  }

  exit(): void {
    this.owner.body.setVelocityX(0);
  }
}

class AttackState implements State<Fighter> {
  name: FighterStateName = 'ATTACK';
  owner: Fighter;

  constructor(owner: Fighter) {
    this.owner = owner;
  }

  enter(): void {
    this.owner.attackFrame = 0;
    this.owner.body.setVelocityX(0);
    
    // Play the attack animation
    if (this.owner.currentAttack) {
      this.owner.playAnimation(this.owner.currentAttack.animationKey);
    }
  }

  update(_input: InputState, _delta: number): void {
    const attack = this.owner.currentAttack;
    if (!attack) {
      this.owner.stateMachine.setState('IDLE');
      return;
    }

    this.owner.attackFrame++;

    const { startup, active, recovery } = attack;
    const totalFrames = startup + active + recovery;

    // Show hitbox during active frames
    if (this.owner.attackFrame > startup && this.owner.attackFrame <= startup + active) {
      this.owner.showHitbox();
    } else {
      this.owner.hideHitbox();
    }

    // Attack finished
    if (this.owner.attackFrame >= totalFrames) {
      this.owner.currentAttack = null;
      // Return to appropriate state
      if (!this.owner.isGrounded) {
        this.owner.stateMachine.setState('AIRBORNE');
      } else {
        this.owner.stateMachine.setState('IDLE');
      }
    }
  }

  exit(): void {
    this.owner.hideHitbox();
  }
}

class HitstunState implements State<Fighter> {
  name: FighterStateName = 'HITSTUN';
  owner: Fighter;

  constructor(owner: Fighter) {
    this.owner = owner;
  }

  enter(): void {
    this.owner.flashHit();
  }

  update(_input: InputState, _delta: number): void {
    this.owner.stunFrames--;

    if (this.owner.stunFrames <= 0) {
      this.owner.stateMachine.setState('IDLE');
    }
  }

  exit(): void {
    this.owner.body.setVelocityX(0);
  }
}
