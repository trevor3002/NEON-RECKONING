/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData } from './types';

export const LEVELS: LevelData[] = [
  // ==========================================
  // SECTOR 1: SUB-LEVEL 07: SLUM CONDUITS
  // ==========================================
  {
    id: 1,
    name: "Sector 01: Slum Conduits",
    subtitle: "Infiltrate the lower neon underbelly and retrieve 3 Datacores",
    width: 1400,
    height: 540,
    playerSpawn: { x: 40, y: 440 },
    requiredDatacores: 3,
    exitDoor: { x: 1320, y: 430, w: 28, h: 50, isUnlocked: false },
    platforms: [
      // Ground floor
      { x: 0, y: 480, w: 500, h: 60, type: 'SOLID' },
      { x: 580, y: 480, w: 820, h: 60, type: 'SOLID' }, // pit between 500 and 580 with electric grate

      // Mid tier structures
      { x: 120, y: 390, w: 140, h: 14, type: 'SOLID' },
      { x: 320, y: 340, w: 160, h: 14, type: 'SOLID' },
      { x: 540, y: 360, w: 120, h: 14, type: 'SOLID' },
      { x: 720, y: 390, w: 180, h: 14, type: 'SOLID' },

      // High catwalks
      { x: 180, y: 240, w: 220, h: 14, type: 'SOLID' },
      { x: 460, y: 210, w: 180, h: 14, type: 'SOLID' },
      { x: 700, y: 230, w: 240, h: 14, type: 'SOLID' },
      { x: 1000, y: 320, w: 160, h: 14, type: 'SOLID' },
      { x: 1120, y: 220, w: 180, h: 14, type: 'SOLID' },

      // Moving platform over dangerous drop
      { x: 500, y: 440, w: 70, h: 12, type: 'MOVING', vx: 45, minX: 490, maxX: 590 }
    ],
    ladders: [
      // Ladder from ground to mid-tier
      { x: 230, y: 240, w: 18, h: 150 },
      // Ladder from mid-tier to high catwalk
      { x: 465, y: 210, w: 18, h: 130 },
      // Ladder in eastern sector
      { x: 860, y: 230, w: 18, h: 160 },
      // Ladder to high sniper ledge
      { x: 1130, y: 220, w: 18, h: 180 }
    ],
    hazards: [
      // Electric pit at ground floor
      {
        id: 'h_elec_1',
        type: 'ELECTRIC_GRATE',
        x: 500,
        y: 500,
        w: 80,
        h: 20,
        active: true,
        timer: 0,
        cycleDuration: 2.0
      },
      // Laser barrier cycling on and off
      {
        id: 'h_laser_1',
        type: 'LASER_BARRIER',
        x: 380,
        y: 240,
        w: 12,
        h: 100,
        isVertical: true,
        active: true,
        timer: 0,
        cycleDuration: 2.5
      },
      {
        id: 'h_laser_2',
        type: 'LASER_BARRIER',
        x: 930,
        y: 390,
        w: 12,
        h: 90,
        isVertical: true,
        active: true,
        timer: 1.2,
        cycleDuration: 3.0
      },
      // Steam Vent
      {
        id: 'h_steam_1',
        type: 'STEAM_VENT',
        x: 760,
        y: 440,
        w: 24,
        h: 40,
        active: true,
        timer: 0,
        cycleDuration: 2.0
      },
      // Destructible Crates
      {
        id: 'crate_1',
        type: 'CRATE',
        x: 140,
        y: 372,
        w: 18,
        h: 18,
        active: true,
        timer: 0,
        cycleDuration: 0,
        hp: 20
      },
      {
        id: 'crate_2',
        type: 'CRATE',
        x: 820,
        y: 212,
        w: 18,
        h: 18,
        active: true,
        timer: 0,
        cycleDuration: 0,
        hp: 20
      },
      {
        id: 'crate_3',
        type: 'CRATE',
        x: 1060,
        y: 462,
        w: 18,
        h: 18,
        active: true,
        timer: 0,
        cycleDuration: 0,
        hp: 20
      }
    ],
    items: [
      // 3 Datacores required to open exit
      { id: 'dc_1', type: 'DATACORE', x: 210, y: 210, w: 16, h: 16, collected: false, bobTimer: 0.1, value: 500 },
      { id: 'dc_2', type: 'DATACORE', x: 530, y: 180, w: 16, h: 16, collected: false, bobTimer: 1.2, value: 500 },
      { id: 'dc_3', type: 'DATACORE', x: 1220, y: 190, w: 16, h: 16, collected: false, bobTimer: 2.4, value: 500 },

      // Healing Nano-stims
      { id: 'stim_1', type: 'NANO_STIM', x: 140, y: 350, w: 14, h: 14, collected: false, bobTimer: 0.5, value: 35 },
      { id: 'stim_2', type: 'NANO_STIM', x: 740, y: 360, w: 14, h: 14, collected: false, bobTimer: 1.8, value: 35 },

      // Energy cells for specials
      { id: 'cell_1', type: 'ENERGY_CELL', x: 380, y: 310, w: 14, h: 14, collected: false, bobTimer: 0.8, value: 50 },
      { id: 'cell_2', type: 'ENERGY_CELL', x: 840, y: 200, w: 14, h: 14, collected: false, bobTimer: 2.0, value: 50 },

      // Cyber credits
      { id: 'cred_1', type: 'CREDIT_CACHE', x: 290, y: 450, w: 12, h: 12, collected: false, bobTimer: 0.3, value: 150 },
      { id: 'cred_2', type: 'CREDIT_CACHE', x: 670, y: 450, w: 12, h: 12, collected: false, bobTimer: 1.4, value: 200 },
      { id: 'cred_3', type: 'CREDIT_CACHE', x: 1040, y: 290, w: 12, h: 12, collected: false, bobTimer: 2.1, value: 250 }
    ],
    enemies: [
      // Patrol Hound near start
      {
        id: 'e_hound_1',
        type: 'HOUND',
        x: 340,
        y: 454,
        vx: 0,
        vy: 0,
        w: 28,
        h: 18,
        facing: -1,
        hp: 35,
        maxHp: 35,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 1.5,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        patrolStartX: 340,
        patrolRange: 110
      },
      // Scout Drone in upper airway
      {
        id: 'e_drone_1',
        type: 'DRONE',
        x: 320,
        y: 180,
        vx: 0,
        vy: 0,
        w: 20,
        h: 16,
        facing: 1,
        hp: 25,
        maxHp: 25,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 2.0,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        patrolStartX: 320,
        patrolRange: 130
      },
      // Second Hound on mid ledge
      {
        id: 'e_hound_2',
        type: 'HOUND',
        x: 750,
        y: 364,
        vx: 0,
        vy: 0,
        w: 28,
        h: 18,
        facing: -1,
        hp: 35,
        maxHp: 35,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 1.5,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        patrolStartX: 750,
        patrolRange: 90
      },
      // Drone patrolling near exit high ground
      {
        id: 'e_drone_2',
        type: 'DRONE',
        x: 880,
        y: 200,
        vx: 0,
        vy: 0,
        w: 20,
        h: 16,
        facing: -1,
        hp: 25,
        maxHp: 25,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 1.8,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        patrolStartX: 880,
        patrolRange: 140
      },
      // Ground Hound near exit
      {
        id: 'e_hound_3',
        type: 'HOUND',
        x: 1080,
        y: 454,
        vx: 0,
        vy: 0,
        w: 28,
        h: 18,
        facing: -1,
        hp: 40,
        maxHp: 40,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 1.4,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        patrolStartX: 1080,
        patrolRange: 120
      }
    ]
  },

  // ==========================================
  // SECTOR 2: MEGACORP SPIRE: ROOFTOPS
  // ==========================================
  {
    id: 2,
    name: "Sector 02: Megacorp Spire",
    subtitle: "Navigate sky bridges, bypass riot enforcers, and steal 4 Datacores",
    width: 1600,
    height: 580,
    playerSpawn: { x: 50, y: 470 },
    requiredDatacores: 4,
    exitDoor: { x: 1520, y: 150, w: 28, h: 50, isUnlocked: false },
    platforms: [
      // Low rooftops
      { x: 0, y: 510, w: 380, h: 70, type: 'SOLID' },
      { x: 440, y: 510, w: 300, h: 70, type: 'SOLID' },
      { x: 800, y: 480, w: 320, h: 100, type: 'SOLID' },

      // Mid level sky bridges
      { x: 140, y: 400, w: 180, h: 14, type: 'SOLID' },
      { x: 380, y: 350, w: 160, h: 14, type: 'SOLID' },
      { x: 600, y: 310, w: 180, h: 14, type: 'SOLID' },
      { x: 840, y: 330, w: 200, h: 14, type: 'SOLID' },

      // High vantage points
      { x: 240, y: 240, w: 180, h: 14, type: 'SOLID' },
      { x: 480, y: 200, w: 200, h: 14, type: 'SOLID' },
      { x: 740, y: 180, w: 220, h: 14, type: 'SOLID' },
      { x: 1020, y: 220, w: 200, h: 14, type: 'SOLID' },
      { x: 1280, y: 290, w: 160, h: 14, type: 'SOLID' },
      { x: 1440, y: 200, w: 160, h: 380, type: 'SOLID' }, // Final tower

      // Dynamic moving sky trams
      { x: 380, y: 460, w: 56, h: 12, type: 'MOVING', vx: 40, minX: 370, maxX: 450 },
      { x: 1140, y: 370, w: 60, h: 12, type: 'MOVING', vx: 50, minX: 1130, maxX: 1270 },
      { x: 1300, y: 200, w: 60, h: 12, type: 'MOVING', vx: 45, minX: 1290, maxX: 1430 }
    ],
    ladders: [
      { x: 280, y: 240, w: 18, h: 160 },
      { x: 520, y: 200, w: 18, h: 150 },
      { x: 920, y: 180, w: 18, h: 150 },
      { x: 990, y: 330, w: 18, h: 150 }
    ],
    hazards: [
      // Electric drop pits
      { id: 'h2_elec_1', type: 'ELECTRIC_GRATE', x: 380, y: 540, w: 60, h: 20, active: true, timer: 0, cycleDuration: 1.8 },
      { id: 'h2_elec_2', type: 'ELECTRIC_GRATE', x: 740, y: 540, w: 60, h: 20, active: true, timer: 0, cycleDuration: 1.8 },

      // Laser security grids
      { id: 'h2_laser_1', type: 'LASER_BARRIER', x: 300, y: 400, w: 12, h: 110, isVertical: true, active: true, timer: 0, cycleDuration: 2.2 },
      { id: 'h2_laser_2', type: 'LASER_BARRIER', x: 700, y: 310, w: 12, h: 170, isVertical: true, active: true, timer: 1.0, cycleDuration: 2.6 },
      { id: 'h2_laser_3', type: 'LASER_BARRIER', x: 1040, y: 100, w: 12, h: 120, isVertical: true, active: true, timer: 0.5, cycleDuration: 2.4 },

      // Crates
      { id: 'crate_2_1', type: 'CRATE', x: 160, y: 382, w: 18, h: 18, active: true, timer: 0, cycleDuration: 0, hp: 25 },
      { id: 'crate_2_2', type: 'CRATE', x: 640, y: 292, w: 18, h: 18, active: true, timer: 0, cycleDuration: 0, hp: 25 },
      { id: 'crate_2_3', type: 'CRATE', x: 1080, y: 202, w: 18, h: 18, active: true, timer: 0, cycleDuration: 0, hp: 25 }
    ],
    items: [
      // 4 Datacores
      { id: 'dc_2_1', type: 'DATACORE', x: 260, y: 210, w: 16, h: 16, collected: false, bobTimer: 0.2, value: 600 },
      { id: 'dc_2_2', type: 'DATACORE', x: 580, y: 170, w: 16, h: 16, collected: false, bobTimer: 1.1, value: 600 },
      { id: 'dc_2_3', type: 'DATACORE', x: 860, y: 150, w: 16, h: 16, collected: false, bobTimer: 2.0, value: 600 },
      { id: 'dc_2_4', type: 'DATACORE', x: 1340, y: 260, w: 16, h: 16, collected: false, bobTimer: 2.8, value: 600 },

      // Nano-stims
      { id: 'stim_2_1', type: 'NANO_STIM', x: 200, y: 480, w: 14, h: 14, collected: false, bobTimer: 0.4, value: 35 },
      { id: 'stim_2_2', type: 'NANO_STIM', x: 940, y: 300, w: 14, h: 14, collected: false, bobTimer: 1.5, value: 35 },

      // Energy cells
      { id: 'cell_2_1', type: 'ENERGY_CELL', x: 420, y: 320, w: 14, h: 14, collected: false, bobTimer: 0.9, value: 50 },
      { id: 'cell_2_2', type: 'ENERGY_CELL', x: 1100, y: 190, w: 14, h: 14, collected: false, bobTimer: 2.2, value: 50 },

      // Credits
      { id: 'cred_2_1', type: 'CREDIT_CACHE', x: 500, y: 480, w: 12, h: 12, collected: false, bobTimer: 0.6, value: 300 },
      { id: 'cred_2_2', type: 'CREDIT_CACHE', x: 880, y: 450, w: 12, h: 12, collected: false, bobTimer: 1.7, value: 350 }
    ],
    enemies: [
      // Enforcer Guard on lower roof
      {
        id: 'e_enf_1',
        type: 'ENFORCER',
        x: 250,
        y: 472,
        vx: 0,
        vy: 0,
        w: 26,
        h: 38,
        facing: 1,
        hp: 70,
        maxHp: 70,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 2.2,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        shieldActive: true,
        patrolStartX: 250,
        patrolRange: 90
      },
      // Scout Drone in mid sky
      {
        id: 'e_drone_2_1',
        type: 'DRONE',
        x: 420,
        y: 280,
        vx: 0,
        vy: 0,
        w: 20,
        h: 16,
        facing: -1,
        hp: 30,
        maxHp: 30,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 1.8,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        patrolStartX: 420,
        patrolRange: 120
      },
      // Cyber Hound on upper bridge
      {
        id: 'e_hound_2_1',
        type: 'HOUND',
        x: 660,
        y: 292,
        vx: 0,
        vy: 0,
        w: 28,
        h: 18,
        facing: -1,
        hp: 45,
        maxHp: 45,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 1.3,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        patrolStartX: 660,
        patrolRange: 90
      },
      // Second Riot Enforcer guarding upper bridge
      {
        id: 'e_enf_2',
        type: 'ENFORCER',
        x: 880,
        y: 292,
        vx: 0,
        vy: 0,
        w: 26,
        h: 38,
        facing: -1,
        hp: 75,
        maxHp: 75,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 2.0,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        shieldActive: true,
        patrolStartX: 880,
        patrolRange: 80
      },
      // Hunter Drone in high sky
      {
        id: 'e_drone_2_2',
        type: 'DRONE',
        x: 1060,
        y: 160,
        vx: 0,
        vy: 0,
        w: 20,
        h: 16,
        facing: -1,
        hp: 30,
        maxHp: 30,
        state: 'PATROL',
        stateTimer: 0,
        attackCooldown: 1.6,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        patrolStartX: 1060,
        patrolRange: 120
      }
    ]
  },

  // ==========================================
  // SECTOR 3: REACTOR CORE: OVERLORD GOLIATH-X
  // ==========================================
  {
    id: 3,
    name: "Sector 03: Core Overlord",
    subtitle: "Defeat Boss Mech GOLIATH-X and disable the central reactor",
    width: 1000,
    height: 520,
    playerSpawn: { x: 80, y: 440 },
    requiredDatacores: 0, // Cleared when boss is defeated!
    exitDoor: { x: 920, y: 430, w: 28, h: 50, isUnlocked: false },
    platforms: [
      // Boss arena ground
      { x: 0, y: 480, w: 1000, h: 40, type: 'SOLID' },

      // High flanking platforms to reach boss core
      { x: 60, y: 380, w: 140, h: 14, type: 'SOLID' },
      { x: 80, y: 260, w: 160, h: 14, type: 'SOLID' },
      { x: 800, y: 380, w: 140, h: 14, type: 'SOLID' },
      { x: 760, y: 260, w: 160, h: 14, type: 'SOLID' },

      // Central hovering vantage platform
      { x: 420, y: 220, w: 160, h: 14, type: 'SOLID' }
    ],
    ladders: [
      { x: 120, y: 260, w: 18, h: 120 },
      { x: 160, y: 380, w: 18, h: 100 },
      { x: 840, y: 260, w: 18, h: 120 },
      { x: 810, y: 380, w: 18, h: 100 }
    ],
    hazards: [
      // Ground electric discharge grates during phase 2
      { id: 'h3_elec_1', type: 'ELECTRIC_GRATE', x: 260, y: 476, w: 100, h: 10, active: false, timer: 0, cycleDuration: 3.0 },
      { id: 'h3_elec_2', type: 'ELECTRIC_GRATE', x: 640, y: 476, w: 100, h: 10, active: false, timer: 1.5, cycleDuration: 3.0 },
      // Supply crates with emergency stims
      { id: 'crate_3_1', type: 'CRATE', x: 90, y: 362, w: 18, h: 18, active: true, timer: 0, cycleDuration: 0, hp: 20 },
      { id: 'crate_3_2', type: 'CRATE', x: 870, y: 362, w: 18, h: 18, active: true, timer: 0, cycleDuration: 0, hp: 20 }
    ],
    items: [
      // Emergency refills on high ledges
      { id: 'stim_3_1', type: 'NANO_STIM', x: 140, y: 230, w: 14, h: 14, collected: false, bobTimer: 0.3, value: 40 },
      { id: 'stim_3_2', type: 'NANO_STIM', x: 820, y: 230, w: 14, h: 14, collected: false, bobTimer: 1.5, value: 40 },
      { id: 'cell_3_1', type: 'ENERGY_CELL', x: 500, y: 190, w: 14, h: 14, collected: false, bobTimer: 0.8, value: 100 }
    ],
    enemies: [
      // The Big Boss: GOLIATH-X
      {
        id: 'boss_goliath',
        type: 'BOSS_GOLIATH',
        x: 460,
        y: 416,
        vx: 0,
        vy: 0,
        w: 64,
        h: 64,
        facing: -1,
        hp: 300,
        maxHp: 300,
        state: 'ALERT',
        stateTimer: 0,
        attackCooldown: 2.2,
        telegraphTimer: 0,
        isTelegraphing: false,
        flashTimer: 0,
        patrolStartX: 460,
        patrolRange: 160,
        bossPhase: 1,
        bossAttackPattern: 0
      }
    ]
  }
];
