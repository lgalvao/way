/**
 * Game constants and physics configuration
 */

export const GAME = {
  WIDTH: 1280,
  HEIGHT: 720,
  FPS: 60,
} as const;

export const PHYSICS = {
  GRAVITY: 1200,    // Scaled down from 1800
  WALK_SPEED: 260,  // Scaled down from 400
  JUMP_VELOCITY: -470, // Scaled down from -700
  GROUND_Y: 580,    // Adjusted for 720p (floor level)
  PUSHBACK_ON_BLOCK: 50, // Scaled down
  PUSHBACK_ON_HIT: 80,   // Scaled down
  MIN_FIGHTER_DISTANCE: 40,
} as const;

export const STAGE = {
  LEFT_BOUND: 70,
  RIGHT_BOUND: 1210,
  P1_START_X: 330,
  P2_START_X: 950,
} as const;

export const FIGHTER = {
  WIDTH: 70,
  HEIGHT: 150,     // Scaled from 220
  HURTBOX_WIDTH: 55,
  HURTBOX_HEIGHT: 140,
  CROUCH_HEIGHT: 80,
  CROUCH_HURTBOX_HEIGHT: 70,
} as const;

export const COLORS = {
  P1: 0x4488ff,
  P2: 0xff4444,
  HITBOX: 0xff0000,
  HURTBOX: 0x00ff00,
  GROUND: 0x2a2a3a,
  BACKGROUND: 0x1a1a2e,
} as const;

export const TIMING = {
  HITSTUN_FRAMES: 18,
  BLOCKSTUN_FRAMES: 10,
  POINT_PAUSE_MS: 500,
  ROUND_START_DELAY_MS: 1500,
} as const;
