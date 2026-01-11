/**
 * Input state returned by InputHandler
 */
export interface InputState {
  direction: { x: -1 | 0 | 1; y: -1 | 0 | 1 };
  action: boolean;
  actionJustPressed: boolean;
}

/**
 * Fighter state machine states
 */
export type FighterStateName =
  | 'IDLE'
  | 'WALK'
  | 'CROUCH'
  | 'JUMP'
  | 'AIRBORNE'
  | 'ATTACK'
  | 'BLOCK'
  | 'BLOCKSTUN'
  | 'HITSTUN'
  | 'KNOCKDOWN'
  | 'WAKEUP'
  | 'WIN'
  | 'LOSS';

/**
 * Hitbox type determines blocking requirements
 */
export type HitboxType = 'high' | 'mid' | 'low';

/**
 * Attack data definition
 */
export interface AttackData {
  name: string;
  animationKey: string;
  hitboxType: HitboxType;
  startup: number;      // Frames before hitbox active
  active: number;       // Frames hitbox is active
  recovery: number;     // Frames after hitbox inactive
  damage: number;       // Point value
  hitstun: number;      // Frames opponent is stunned
  blockstun: number;    // Frames opponent is in blockstun
  knockback: number;    // Pixels to push opponent
  hitboxOffset: { x: number; y: number };
  hitboxSize: { width: number; height: number };
}

/**
 * Direction vector for attack lookup
 */
export type DirectionVector = `${-1 | 0 | 1},${-1 | 0 | 1}`;

/**
 * Match state tracking
 */
export interface MatchState {
  currentRound: number;
  roundsToWin: number;
  scores: { p1: number; p2: number };
  roundWins: { p1: number; p2: number };
  timeRemaining: number;
  isPaused: boolean;
  isRoundActive: boolean;
}

/**
 * Hit event data
 */
export interface HitEvent {
  attacker: 1 | 2;
  defender: 1 | 2;
  attack: AttackData;
  wasBlocked: boolean;
}
