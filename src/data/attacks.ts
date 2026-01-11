import { AttackData, DirectionVector } from '../types';

/**
 * Attack definitions mapped by direction vector
 * Vector format: "x,y" where holding toward opponent is positive X
 */
export const ATTACKS: Record<DirectionVector, AttackData> = {
  // Neutral - Mid Punch (Frame 5)
  '0,0': {
    name: 'Mid Punch',
    animationKey: 'mid_punch',
    hitboxType: 'mid',
    startup: 4,
    active: 3,
    recovery: 8,
    damage: 0.25,
    hitstun: 12,
    blockstun: 6,
    knockback: 40,
    hitboxOffset: { x: 60, y: -20 },
    hitboxSize: { width: 80, height: 60 },
  },

  // Up - High Kick (Frame 4)
  '0,-1': {
    name: 'High Kick',
    animationKey: 'high_kick',
    hitboxType: 'high',
    startup: 8,
    active: 4,
    recovery: 12,
    damage: 1.0,
    hitstun: 20,
    blockstun: 10,
    knockback: 80,
    hitboxOffset: { x: 50, y: -80 },
    hitboxSize: { width: 100, height: 80 },
  },

  // Forward+Up - Flying Kick (Frame 4 but with movement)
  '1,-1': {
    name: 'Flying Kick',
    animationKey: 'high_kick',
    hitboxType: 'mid',
    startup: 10,
    active: 6,
    recovery: 18,
    damage: 1.0,
    hitstun: 24,
    blockstun: 14,
    knockback: 120,
    hitboxOffset: { x: 80, y: -40 },
    hitboxSize: { width: 120, height: 80 },
  },

  // Forward - High Punch (Frame 9)
  '1,0': {
    name: 'High Punch',
    animationKey: 'high_punch',
    hitboxType: 'high',
    startup: 6,
    active: 4,
    recovery: 10,
    damage: 0.5,
    hitstun: 16,
    blockstun: 8,
    knockback: 60,
    hitboxOffset: { x: 70, y: -40 },
    hitboxSize: { width: 90, height: 70 },
  },

  // Forward+Down - Low Sweep (Frame 6)
  '1,1': {
    name: 'Low Sweep',
    animationKey: 'sweep',
    hitboxType: 'low',
    startup: 10,
    active: 5,
    recovery: 16,
    damage: 0.5,
    hitstun: 20,
    blockstun: 10,
    knockback: 80,
    hitboxOffset: { x: 60, y: 60 },
    hitboxSize: { width: 120, height: 60 },
  },

  // Down - Low Punch (Frame 8)
  '0,1': {
    name: 'Low Punch',
    animationKey: 'low_punch',
    hitboxType: 'low',
    startup: 5,
    active: 3,
    recovery: 9,
    damage: 0.25,
    hitstun: 12,
    blockstun: 6,
    knockback: 40,
    hitboxOffset: { x: 50, y: 40 },
    hitboxSize: { width: 80, height: 50 },
  },

  // Back - Mid Kick (Frame 10)
  '-1,0': {
    name: 'Mid Kick',
    animationKey: 'mid_kick',
    hitboxType: 'mid',
    startup: 12,
    active: 6,
    recovery: 14,
    damage: 0.5,
    hitstun: 18,
    blockstun: 10,
    knockback: 100,
    hitboxOffset: { x: 70, y: 20 },
    hitboxSize: { width: 100, height: 80 },
  },

  // Back+Up - Back High Kick (Frame 4)
  '-1,-1': {
    name: 'Back Kick',
    animationKey: 'high_kick',
    hitboxType: 'high',
    startup: 8,
    active: 5,
    recovery: 12,
    damage: 0.5,
    hitstun: 16,
    blockstun: 8,
    knockback: 60,
    hitboxOffset: { x: 40, y: -60 },
    hitboxSize: { width: 90, height: 70 },
  },

  // Back+Down - Low Back Kick (Frame 10)
  '-1,1': {
    name: 'Low Back Kick',
    animationKey: 'mid_kick',
    hitboxType: 'low',
    startup: 14,
    active: 4,
    recovery: 18,
    damage: 0.5,
    hitstun: 22,
    blockstun: 12,
    knockback: 90,
    hitboxOffset: { x: 40, y: 40 },
    hitboxSize: { width: 110, height: 50 },
  },
};

/**
 * Get attack data for a direction vector
 */
export function getAttack(x: -1 | 0 | 1, y: -1 | 0 | 1): AttackData {
  const key = `${x},${y}` as DirectionVector;
  return ATTACKS[key];
}
