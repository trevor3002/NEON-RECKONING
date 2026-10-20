/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'SECTOR_CLEAR' | 'VICTORY' | 'GAME_OVER';

export type WeaponType = 'KATANA' | 'BLASTER';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PlayerState = 
  | 'IDLE' 
  | 'RUN' 
  | 'JUMP' 
  | 'FALL' 
  | 'CLIMB' 
  | 'DASH' 
  | 'ATTACK_1' 
  | 'ATTACK_2' 
  | 'ATTACK_3' 
  | 'SHOOT' 
  | 'HURT' 
  | 'DEAD';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: 1 | -1; // 1 = right, -1 = left
  state: PlayerState;
  stateTimer: number;
  
  // Health & Energy
  hp: number;
  maxHp: number;
  energy: number; // 0 - 100 for special attacks
  maxEnergy: number;
  nanoStims: number; // healing charges
  credits: number;
  
  // Combat
  activeWeapon: WeaponType;
  comboCount: number;
  comboResetTimer: number;
  attackCooldown: number;
  shootCooldown: number;
  specialCooldown: number;
  
  // Movement & Traversal
  isGrounded: boolean;
  isClimbing: boolean;
  canDoubleJump: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  
  // Dash / Dodge
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  invulnerableTimer: number;
  
  // Animation & Visuals
  animFrame: number;
  animTimer: number;
  flashTimer: number;
}

export type EnemyType = 'DRONE' | 'HOUND' | 'ENFORCER' | 'BOSS_GOLIATH';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  state: 'PATROL' | 'ALERT' | 'ATTACK' | 'HURT' | 'DEAD';
  stateTimer: number;
  attackCooldown: number;
  telegraphTimer: number;
  isTelegraphing: boolean;
  flashTimer: number;
  shieldActive?: boolean; // For riot enforcers
  patrolStartX: number;
  patrolRange: number;
  
  // Boss specific
  bossPhase?: number;
  bossAttackPattern?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  isEnemy: boolean;
  damage: number;
  color: string;
  lifetime: number;
  type: 'PLASMA' | 'MISSILE' | 'EMP' | 'ENERGY_SLICE';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  isGravity: boolean;
  shape?: 'RECT' | 'CIRCLE' | 'LINE' | 'SPARK';
  length?: number;
}

export type ItemType = 'DATACORE' | 'NANO_STIM' | 'ENERGY_CELL' | 'CREDIT_CACHE';

export interface CollectibleItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  w: number;
  h: number;
  collected: boolean;
  bobTimer: number;
  value: number;
}

export interface ObstacleHazard {
  id: string;
  type: 'LASER_BARRIER' | 'ELECTRIC_GRATE' | 'STEAM_VENT' | 'CRATE';
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  timer: number;
  cycleDuration: number;
  hp?: number; // for crates
  isVertical?: boolean;
}

export interface Ladder {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'SOLID' | 'ONE_WAY' | 'MOVING';
  vx?: number;
  vy?: number;
  minX?: number;
  maxX?: number;
}

export interface ExitDoor {
  x: number;
  y: number;
  w: number;
  h: number;
  isUnlocked: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  playerSpawn: Vector2D;
  exitDoor: ExitDoor;
  requiredDatacores: number;
  platforms: Platform[];
  ladders: Ladder[];
  hazards: ObstacleHazard[];
  items: CollectibleItem[];
  enemies: Enemy[];
}

export interface KeyInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  dash: boolean;
  attack: boolean;
  shoot: boolean;
  specialEMP: boolean;
  specialDashSlash: boolean;
  useHeal: boolean;
  swapWeapon: boolean;
}

export interface GameStats {
  score: number;
  kills: number;
  datacoresCollected: number;
  totalDatacores: number;
  damageTaken: number;
  timeElapsed: number;
  comboMax: number;
}
