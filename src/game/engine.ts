/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Player,
  Enemy,
  Projectile,
  Particle,
  CollectibleItem,
  ObstacleHazard,
  LevelData,
  KeyInputState,
  GameStats,
  GameScreen
} from './types';
import { audio } from './audio';
import {
  renderPlayer,
  renderEnemy,
  renderProjectile,
  renderItem,
  renderHazard,
  renderLadder,
  renderPlatform,
  renderExitDoor,
  PALETTE
} from './sprites';
import { LEVELS } from './levels';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Game loop & timing
  private lastTime: number = 0;
  private gameTime: number = 0;
  private animFrameId: number | null = null;
  private hitstopTimer: number = 0;

  // Camera & Shake
  private cameraX: number = 0;
  private cameraY: number = 0;
  private cameraShake: number = 0;

  // Current Level & State
  public currentLevelIndex: number = 0;
  public currentLevel: LevelData;
  public player: Player;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public hazards: ObstacleHazard[] = [];
  public items: CollectibleItem[] = [];

  // Input system
  public heldKeys: KeyInputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    dash: false,
    attack: false,
    shoot: false,
    specialEMP: false,
    specialDashSlash: false,
    useHeal: false,
    swapWeapon: false
  };

  private prevHeldKeys: KeyInputState = { ...this.heldKeys };

  // Game stats
  public stats: GameStats = {
    score: 0,
    kills: 0,
    datacoresCollected: 0,
    totalDatacores: 3,
    damageTaken: 0,
    timeElapsed: 0,
    comboMax: 0
  };

  // State transitions & callbacks
  public gameState: GameScreen = 'TITLE';
  public onStateChange?: (state: GameScreen) => void;
  public onStatsUpdate?: (stats: GameStats, player: Player, currentLevel: LevelData) => void;

  // CRT Scanlines option
  public crtEnabled: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.currentLevel = LEVELS[0];
    this.player = this.createInitialPlayer(this.currentLevel.playerSpawn.x, this.currentLevel.playerSpawn.y);

    this.setupInputs();
    this.loadLevel(0);
  }

  private createInitialPlayer(x: number, y: number): Player {
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      w: 24,
      h: 36,
      facing: 1,
      state: 'IDLE',
      stateTimer: 0,
      hp: 100,
      maxHp: 100,
      energy: 100,
      maxEnergy: 100,
      nanoStims: 2,
      credits: 0,
      activeWeapon: 'KATANA',
      comboCount: 0,
      comboResetTimer: 0,
      attackCooldown: 0,
      shootCooldown: 0,
      specialCooldown: 0,
      isGrounded: false,
      isClimbing: false,
      canDoubleJump: true,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      invulnerableTimer: 0,
      animFrame: 0,
      animTimer: 0,
      flashTimer: 0
    };
  }

  public loadLevel(levelIndex: number) {
    this.currentLevelIndex = levelIndex;
    const lvl = LEVELS[levelIndex] || LEVELS[0];
    this.currentLevel = JSON.parse(JSON.stringify(lvl)); // Deep clone level data

    // Reset player position and status
    this.player.x = this.currentLevel.playerSpawn.x;
    this.player.y = this.currentLevel.playerSpawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.state = 'IDLE';
    this.player.isClimbing = false;
    this.player.isDashing = false;

    // Reset entities
    this.enemies = this.currentLevel.enemies;
    this.hazards = this.currentLevel.hazards;
    this.items = this.currentLevel.items;
    this.projectiles = [];
    this.particles = [];

    // Reset level-specific stats
    this.stats.totalDatacores = this.currentLevel.requiredDatacores;
    this.stats.datacoresCollected = 0;

    // Camera initial position
    this.cameraX = this.player.x - this.canvas.width / 2;
    this.cameraY = this.player.y - this.canvas.height / 2;
  }

  public startRun(startLevel: number = 0) {
    this.loadLevel(startLevel);
    this.player.hp = this.player.maxHp;
    this.player.energy = this.player.maxEnergy;
    this.player.nanoStims = 2;
    this.stats = {
      score: 0,
      kills: 0,
      datacoresCollected: 0,
      totalDatacores: this.currentLevel.requiredDatacores,
      damageTaken: 0,
      timeElapsed: 0,
      comboMax: 0
    };
    this.setGameState('PLAYING');
    audio.startBGM();
  }

  public setGameState(state: GameScreen) {
    this.gameState = state;
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.handleKey(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKey(e.code, false);
    });

    // Clear on blur to prevent stuck keys
    window.addEventListener('blur', () => {
      this.heldKeys = {
        left: false,
        right: false,
        up: false,
        down: false,
        jump: false,
        dash: false,
        attack: false,
        shoot: false,
        specialEMP: false,
        specialDashSlash: false,
        useHeal: false,
        swapWeapon: false
      };
    });

    // Canvas click attacks
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.gameState !== 'PLAYING') return;
      if (e.button === 0) {
        // Left click = Primary attack (Katana / active weapon)
        this.heldKeys.attack = true;
      } else if (e.button === 2) {
        // Right click = Blaster shoot
        this.heldKeys.shoot = true;
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.heldKeys.attack = false;
      if (e.button === 2) this.heldKeys.shoot = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public setInput(key: keyof KeyInputState, isDown: boolean) {
    this.heldKeys[key] = isDown;
  }

  private handleKey(code: string, isDown: boolean) {
    switch (code) {
      case 'KeyA':
      case 'ArrowLeft':
        this.heldKeys.left = isDown;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.heldKeys.right = isDown;
        break;
      case 'KeyW':
      case 'ArrowUp':
        this.heldKeys.up = isDown;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.heldKeys.down = isDown;
        break;
      case 'Space':
        this.heldKeys.jump = isDown;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'KeyC':
        this.heldKeys.dash = isDown;
        break;
      case 'KeyJ':
        this.heldKeys.attack = isDown;
        break;
      case 'KeyK':
        this.heldKeys.shoot = isDown;
        break;
      case 'KeyE':
        this.heldKeys.specialEMP = isDown;
        break;
      case 'KeyF':
        this.heldKeys.specialDashSlash = isDown;
        break;
      case 'KeyR':
      case 'KeyH':
        this.heldKeys.useHeal = isDown;
        break;
      case 'KeyQ':
      case 'Digit1':
      case 'Digit2':
        this.heldKeys.swapWeapon = isDown;
        break;
      case 'Escape':
        if (isDown) {
          if (this.gameState === 'PLAYING') {
            this.setGameState('PAUSED');
          } else if (this.gameState === 'PAUSED') {
            this.setGameState('PLAYING');
          }
        }
        break;
    }
  }

  public startLoop() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const rawDt = (time - this.lastTime) / 1000;
      this.lastTime = time;
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // ==========================================
  // UPDATE SIMULATION
  // ==========================================
  private update(dt: number) {
    if (this.gameState !== 'PLAYING') {
      // Just update camera pan or gentle world time if on title
      this.gameTime += dt;
      return;
    }

    // Hitstop for impact crunch
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    this.gameTime += dt;
    this.stats.timeElapsed += dt;

    // Detect edge triggers (just pressed)
    const justPressed = {
      jump: this.heldKeys.jump && !this.prevHeldKeys.jump,
      dash: this.heldKeys.dash && !this.prevHeldKeys.dash,
      attack: this.heldKeys.attack && !this.prevHeldKeys.attack,
      shoot: this.heldKeys.shoot && !this.prevHeldKeys.shoot,
      specialEMP: this.heldKeys.specialEMP && !this.prevHeldKeys.specialEMP,
      specialDashSlash: this.heldKeys.specialDashSlash && !this.prevHeldKeys.specialDashSlash,
      useHeal: this.heldKeys.useHeal && !this.prevHeldKeys.useHeal,
      swapWeapon: this.heldKeys.swapWeapon && !this.prevHeldKeys.swapWeapon
    };

    this.updatePlayer(dt, justPressed);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateHazards(dt);
    this.updateItems(dt);
    this.updateParticles(dt);
    this.updateCamera(dt);

    // Save previous key state
    this.prevHeldKeys = { ...this.heldKeys };

    // Update stats callback
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.stats, this.player, this.currentLevel);
    }
  }

  private updatePlayer(dt: number, justPressed: Record<string, boolean>) {
    const p = this.player;

    // Timers
    if (p.flashTimer > 0) p.flashTimer -= dt;
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.dashCooldown > 0) p.dashCooldown -= dt;
    if (p.attackCooldown > 0) p.attackCooldown -= dt;
    if (p.shootCooldown > 0) p.shootCooldown -= dt;
    if (p.specialCooldown > 0) p.specialCooldown -= dt;

    // Weapon swap
    if (justPressed.swapWeapon) {
      p.activeWeapon = p.activeWeapon === 'KATANA' ? 'BLASTER' : 'KATANA';
      audio.playClimbStep();
    }

    // Nano-stim heal
    if (justPressed.useHeal && p.nanoStims > 0 && p.hp < p.maxHp) {
      p.nanoStims--;
      p.hp = Math.min(p.maxHp, p.hp + 40);
      audio.playItemCollect('NANO_STIM');
      this.spawnSparks(p.x + p.w / 2, p.y + p.h / 2, PALETTE.cyberGreen, 14);
    }

    // Combo reset timer
    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) {
        p.comboCount = 0;
      }
    }

    // Check ladder climbing zone
    const overlappingLadder = this.currentLevel.ladders.find((lad) => {
      return (
        p.x + p.w > lad.x &&
        p.x < lad.x + lad.w &&
        p.y + p.h > lad.y &&
        p.y < lad.y + lad.h
      );
    });

    if (overlappingLadder) {
      if ((this.heldKeys.up || this.heldKeys.down) && !p.isClimbing) {
        p.isClimbing = true;
        p.vx = 0;
        p.vy = 0;
        // Snap center horizontally to ladder
        p.x = overlappingLadder.x + overlappingLadder.w / 2 - p.w / 2;
      }
    } else {
      p.isClimbing = false;
    }

    // CLIMBING STATE
    if (p.isClimbing) {
      p.state = 'CLIMB';
      p.isGrounded = false;
      const climbSpeed = 120;
      if (this.heldKeys.up) {
        p.vy = -climbSpeed;
        if (Math.floor(this.gameTime * 10) % 3 === 0) audio.playClimbStep();
      } else if (this.heldKeys.down) {
        p.vy = climbSpeed;
      } else {
        p.vy = 0;
      }
      p.vx = 0;

      // Jump off ladder
      if (justPressed.jump) {
        p.isClimbing = false;
        p.vy = -260;
        p.vx = (this.heldKeys.right ? 180 : this.heldKeys.left ? -180 : p.facing * 140);
        audio.playJump(false);
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return;
    }

    // DODGE / DASH
    if (justPressed.dash && p.dashCooldown <= 0 && !p.isDashing) {
      p.isDashing = true;
      p.dashTimer = 0.22;
      p.dashCooldown = 0.65;
      p.invulnerableTimer = 0.28;
      p.state = 'DASH';
      p.vy = 0;
      p.vx = p.facing * 380;
      audio.playDash();
      this.cameraShake = Math.max(this.cameraShake, 3);
      // Spawn dash ghost echoes
      this.spawnGhostParticles(p);
    }

    if (p.isDashing) {
      p.dashTimer -= dt;
      if (p.dashTimer <= 0) {
        p.isDashing = false;
        p.vx *= 0.5;
      }
      p.x += p.vx * dt;
      this.resolveHorizontalCollisions(p);
      return;
    }

    // SPECIAL ATTACKS
    // EMP Nova Strike
    if (justPressed.specialEMP && p.energy >= 45 && p.specialCooldown <= 0) {
      p.energy -= 45;
      p.specialCooldown = 0.8;
      audio.playEmpNova();
      this.cameraShake = 12;
      this.hitstopTimer = 0.05;
      this.triggerEmpNova();
    }

    // Phantom Teleport Slice
    if (justPressed.specialDashSlash && p.energy >= 60 && p.specialCooldown <= 0) {
      p.energy -= 60;
      p.specialCooldown = 1.0;
      audio.playPhantomSlice();
      this.cameraShake = 14;
      this.hitstopTimer = 0.06;
      this.triggerPhantomSlice();
    }

    // WEAPON ATTACKS
    // Katana Combat Combo (3 hits)
    if (justPressed.attack && p.attackCooldown <= 0) {
      p.attackCooldown = 0.22;
      p.comboCount = (p.comboCount % 3) + 1;
      p.comboResetTimer = 0.7;
      p.stateTimer = 0;

      if (p.comboCount === 1) p.state = 'ATTACK_1';
      else if (p.comboCount === 2) p.state = 'ATTACK_2';
      else p.state = 'ATTACK_3';

      audio.playKatanaSlash(p.comboCount);
      p.vx += p.facing * (p.comboCount === 3 ? 90 : 50); // slight forward lunge

      this.executeKatanaHitbox(p.comboCount);
    }

    // Plasma Blaster Shoot
    if ((justPressed.shoot || (this.heldKeys.shoot && p.shootCooldown <= 0)) && p.shootCooldown <= 0) {
      p.shootCooldown = 0.24;
      p.state = 'SHOOT';
      p.stateTimer = 0.15;
      audio.playBlasterShot();

      // Recoil
      p.vx -= p.facing * 35;
      this.cameraShake = Math.max(this.cameraShake, 2);

      // Spawn projectile
      this.projectiles.push({
        id: `p_bullet_${Date.now()}_${Math.random()}`,
        x: p.facing === 1 ? p.x + p.w + 2 : p.x - 12,
        y: p.y + 12,
        vx: p.facing * 520,
        vy: 0,
        w: 12,
        h: 4,
        isEnemy: false,
        damage: 22,
        color: PALETTE.cyberCyan,
        lifetime: 1.6,
        type: 'PLASMA'
      });
    }

    // Reset attack / shoot states when timers expire
    if (p.state.startsWith('ATTACK')) {
      p.stateTimer += dt;
      if (p.stateTimer > 0.25) {
        p.state = p.isGrounded ? 'IDLE' : 'FALL';
      }
    } else if (p.state === 'SHOOT') {
      p.stateTimer -= dt;
      if (p.stateTimer <= 0) {
        p.state = p.isGrounded ? 'IDLE' : 'FALL';
      }
    }

    // HORIZONTAL MOVEMENT
    const accel = p.isGrounded ? 1200 : 700;
    const maxSpeed = 190;
    const friction = p.isGrounded ? 900 : 300;

    if (this.heldKeys.left) {
      p.vx = Math.max(p.vx - accel * dt, -maxSpeed);
      p.facing = -1;
      if (p.isGrounded && !p.state.startsWith('ATTACK')) p.state = 'RUN';
    } else if (this.heldKeys.right) {
      p.vx = Math.min(p.vx + accel * dt, maxSpeed);
      p.facing = 1;
      if (p.isGrounded && !p.state.startsWith('ATTACK')) p.state = 'RUN';
    } else {
      // Apply friction
      if (p.vx > 0) {
        p.vx = Math.max(0, p.vx - friction * dt);
      } else if (p.vx < 0) {
        p.vx = Math.min(0, p.vx + friction * dt);
      }
      if (p.isGrounded && !p.state.startsWith('ATTACK') && p.state !== 'SHOOT') {
        p.state = 'IDLE';
      }
    }

    // JUMP & COYOTE TIME
    if (p.isGrounded) {
      p.coyoteTimer = 0.12;
      p.canDoubleJump = true;
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    if (justPressed.jump) {
      p.jumpBufferTimer = 0.12;
    } else {
      p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
    }

    // Normal Jump
    if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
      p.vy = -340;
      p.isGrounded = false;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      audio.playJump(false);
      this.spawnDust(p.x + p.w / 2, p.y + p.h, 6);
    } 
    // Double Jump
    else if (justPressed.jump && !p.isGrounded && p.canDoubleJump) {
      p.vy = -300;
      p.canDoubleJump = false;
      audio.playJump(true);
      this.spawnSparks(p.x + p.w / 2, p.y + p.h, PALETTE.cyberCyan, 10);
    }

    // Variable jump height (releasing jump cuts upward momentum)
    if (!this.heldKeys.jump && p.vy < -120) {
      p.vy *= 0.65;
    }

    // GRAVITY
    const gravity = 820;
    p.vy = Math.min(p.vy + gravity * dt, 560);

    // Apply movement with tile collision
    p.x += p.vx * dt;
    this.resolveHorizontalCollisions(p);

    p.y += p.vy * dt;
    this.resolveVerticalCollisions(p);

    // Aerial states
    if (!p.isGrounded && !p.state.startsWith('ATTACK') && p.state !== 'SHOOT') {
      p.state = p.vy < 0 ? 'JUMP' : 'FALL';
    }

    // Animation frame increment
    p.animTimer += dt;
    if (p.animTimer > 0.09) {
      p.animTimer = 0;
      p.animFrame = (p.animFrame + 1) % 12;
    }

    // Passive Energy regeneration
    p.energy = Math.min(p.maxEnergy, p.energy + dt * 10);

    // Check Sector Exit Door
    const door = this.currentLevel.exitDoor;
    if (
      p.x + p.w > door.x &&
      p.x < door.x + door.w &&
      p.y + p.h > door.y &&
      p.y < door.y + door.h
    ) {
      if (door.isUnlocked) {
        this.completeSector();
      }
    }
  }

  // Katana Hitbox checks against enemies and destructible crates
  private executeKatanaHitbox(comboStep: number) {
    const p = this.player;
    const reach = comboStep === 3 ? 42 : 32;
    const hitW = reach;
    const hitH = comboStep === 2 ? 44 : 32;
    const hitX = p.facing === 1 ? p.x + p.w : p.x - hitW;
    const hitY = p.y + 4;
    const damage = comboStep === 3 ? 45 : comboStep === 2 ? 30 : 20;

    let didHit = false;

    // Check enemies
    for (const enemy of this.enemies) {
      if (enemy.state === 'DEAD') continue;
      if (
        hitX < enemy.x + enemy.w &&
        hitX + hitW > enemy.x &&
        hitY < enemy.y + enemy.h &&
        hitY + hitH > enemy.y
      ) {
        // Enforcer shield check
        if (enemy.type === 'ENFORCER' && enemy.shieldActive && enemy.facing !== p.facing) {
          // Frontal attack blocked by riot shield unless combo 3
          if (comboStep < 3) {
            audio.playHitImpact(false);
            this.spawnSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, PALETTE.cyberCyan, 8);
            enemy.vx += p.facing * 40;
            continue;
          } else {
            // Combo 3 cleave breaks shield!
            enemy.shieldActive = false;
            audio.playHitImpact(true);
            this.spawnSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, PALETTE.cyberYellow, 16);
          }
        }

        // Damage enemy
        enemy.hp -= damage;
        enemy.flashTimer = 0.14;
        enemy.vx += p.facing * (comboStep === 3 ? 160 : 90);
        didHit = true;

        audio.playHitImpact(comboStep === 3);
        this.cameraShake = comboStep === 3 ? 7 : 4;
        this.hitstopTimer = comboStep === 3 ? 0.06 : 0.03;
        this.spawnSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, PALETTE.cyberPink, 12);

        if (enemy.hp <= 0) {
          this.defeatEnemy(enemy);
        }
      }
    }

    // Check destructible crates
    for (const hazard of this.hazards) {
      if (hazard.type === 'CRATE' && hazard.active && (hazard.hp ?? 0) > 0) {
        if (
          hitX < hazard.x + hazard.w &&
          hitX + hitW > hazard.x &&
          hitY < hazard.y + hazard.h &&
          hitY + hitH > hazard.y
        ) {
          hazard.hp = (hazard.hp ?? 20) - damage;
          audio.playHitImpact(true);
          this.spawnSparks(hazard.x + hazard.w / 2, hazard.y + hazard.h / 2, PALETTE.cyberYellow, 10);
          if (hazard.hp <= 0) {
            hazard.active = false;
            this.breakCrate(hazard);
          }
        }
      }
    }

    if (didHit) {
      this.stats.score += 25 * comboStep;
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 8);
    }
  }

  // Special 1: EMP Nova Shockwave
  private triggerEmpNova() {
    const p = this.player;
    const radius = 150;
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;

    // Clear enemy projectiles in radius
    this.projectiles = this.projectiles.filter((proj) => {
      const dist = Math.hypot(proj.x - cx, proj.y - cy);
      if (dist < radius) {
        this.spawnSparks(proj.x, proj.y, PALETTE.cyberCyan, 6);
        return false;
      }
      return true;
    });

    // Damage and stun enemies
    for (const enemy of this.enemies) {
      if (enemy.state === 'DEAD') continue;
      const dist = Math.hypot(enemy.x + enemy.w / 2 - cx, enemy.y + enemy.h / 2 - cy);
      if (dist < radius) {
        enemy.hp -= 55;
        enemy.flashTimer = 0.25;
        if (enemy.shieldActive) enemy.shieldActive = false; // EMP breaks shields!
        enemy.vx += (enemy.x > cx ? 1 : -1) * 140;
        this.spawnSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, PALETTE.cyberCyan, 18);
        if (enemy.hp <= 0) {
          this.defeatEnemy(enemy);
        }
      }
    }

    // Spawn EMP visual ring particle
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * 320,
        vy: Math.sin(angle) * 320,
        size: 3,
        color: PALETTE.cyberCyan,
        alpha: 1,
        decay: 3.0,
        isGravity: false,
        shape: 'SPARK'
      });
    }
  }

  // Special 2: Phantom Teleport Slice
  private triggerPhantomSlice() {
    const p = this.player;
    const startX = p.x;
    const endX = p.x + p.facing * 180;
    p.x = endX;
    this.resolveHorizontalCollisions(p);

    const minX = Math.min(startX, p.x);
    const maxX = Math.max(startX, p.x);

    // Damage all enemies in path
    for (const enemy of this.enemies) {
      if (enemy.state === 'DEAD') continue;
      if (enemy.x + enemy.w > minX && enemy.x < maxX && Math.abs(enemy.y - p.y) < 50) {
        enemy.hp -= 70;
        enemy.flashTimer = 0.3;
        this.spawnSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, PALETTE.cyberPink, 20);
        if (enemy.hp <= 0) {
          this.defeatEnemy(enemy);
        }
      }
    }

    // Trailing slash particles along line
    for (let sx = minX; sx < maxX; sx += 18) {
      this.spawnSparks(sx, p.y + 16, PALETTE.cyberPink, 4);
    }
  }

  // Break destructible crate & drop loot
  private breakCrate(crate: ObstacleHazard) {
    audio.playEnemyExplosion();
    this.spawnSparks(crate.x + crate.w / 2, crate.y + crate.h / 2, PALETTE.cyberYellow, 16);

    // Random reward
    const rand = Math.random();
    if (rand < 0.35) {
      this.items.push({
        id: `item_drop_${Date.now()}`,
        type: 'NANO_STIM',
        x: crate.x + 2,
        y: crate.y,
        w: 14,
        h: 14,
        collected: false,
        bobTimer: 0,
        value: 30
      });
    } else if (rand < 0.7) {
      this.items.push({
        id: `item_drop_${Date.now()}`,
        type: 'ENERGY_CELL',
        x: crate.x + 2,
        y: crate.y,
        w: 14,
        h: 14,
        collected: false,
        bobTimer: 0,
        value: 50
      });
    } else {
      this.items.push({
        id: `item_drop_${Date.now()}`,
        type: 'CREDIT_CACHE',
        x: crate.x + 2,
        y: crate.y,
        w: 12,
        h: 12,
        collected: false,
        bobTimer: 0,
        value: 150
      });
    }
  }

  // Resolve collisions with terrain platforms
  private resolveHorizontalCollisions(p: Player) {
    for (const plat of this.currentLevel.platforms) {
      if (
        p.x < plat.x + plat.w &&
        p.x + p.w > plat.x &&
        p.y < plat.y + plat.h &&
        p.y + p.h > plat.y
      ) {
        if (p.vx > 0) {
          p.x = plat.x - p.w;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = plat.x + plat.w;
          p.vx = 0;
        }
      }
    }

    // World boundary
    if (p.x < 0) p.x = 0;
    if (p.x + p.w > this.currentLevel.width) p.x = this.currentLevel.width - p.w;
  }

  private resolveVerticalCollisions(p: Player) {
    p.isGrounded = false;

    for (const plat of this.currentLevel.platforms) {
      if (
        p.x < plat.x + plat.w &&
        p.x + p.w > plat.x &&
        p.y < plat.y + plat.h &&
        p.y + p.h > plat.y
      ) {
        if (p.vy > 0) {
          // Landing on floor
          p.y = plat.y - p.h;
          p.vy = 0;
          p.isGrounded = true;

          // Stick to moving platform
          if (plat.type === 'MOVING' && plat.vx) {
            p.x += plat.vx * (1 / 60);
          }
        } else if (p.vy < 0) {
          // Hitting ceiling
          p.y = plat.y + plat.h;
          p.vy = 0;
        }
      }
    }

    // Fall into bottom pit check
    if (p.y > this.currentLevel.height + 40) {
      this.damagePlayer(40);
      p.x = this.currentLevel.playerSpawn.x;
      p.y = this.currentLevel.playerSpawn.y;
      p.vx = 0;
      p.vy = 0;
    }
  }

  // ==========================================
  // UPDATE ENEMIES
  // ==========================================
  private updateEnemies(dt: number) {
    const p = this.player;

    for (const enemy of this.enemies) {
      if (enemy.state === 'DEAD') continue;

      if (enemy.flashTimer > 0) enemy.flashTimer -= dt;
      if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;

      const distToPlayer = Math.hypot(p.x - enemy.x, p.y - enemy.y);
      const isFacingPlayer = (p.x > enemy.x ? 1 : -1) === enemy.facing;

      // Enemy specific AI
      switch (enemy.type) {
        case 'DRONE': {
          // Hover and follow horizontally
          if (distToPlayer < 280) {
            enemy.facing = p.x > enemy.x ? 1 : -1;
            // Float toward ideal firing range
            const targetX = p.x - enemy.facing * 140;
            enemy.vx += (targetX - enemy.x) * 2 * dt;
            enemy.vx = Math.max(-80, Math.min(80, enemy.vx));

            // Attack cycle
            if (enemy.attackCooldown <= 0 && isFacingPlayer) {
              enemy.isTelegraphing = true;
              enemy.telegraphTimer = 0.55;
              enemy.attackCooldown = 2.4;
              audio.playTelegraphAlert();
            }
          }

          if (enemy.isTelegraphing) {
            enemy.telegraphTimer -= dt;
            if (enemy.telegraphTimer <= 0) {
              enemy.isTelegraphing = false;
              // Fire plasma projectile
              this.projectiles.push({
                id: `e_proj_${Date.now()}_${Math.random()}`,
                x: enemy.facing === 1 ? enemy.x + enemy.w : enemy.x - 10,
                y: enemy.y + 8,
                vx: enemy.facing * 300,
                vy: (p.y - enemy.y) * 0.4,
                w: 8,
                h: 4,
                isEnemy: true,
                damage: 18,
                color: PALETTE.laserRed,
                lifetime: 2.0,
                type: 'PLASMA'
              });
              audio.playBlasterShot();
            }
          }

          enemy.x += enemy.vx * dt;
          break;
        }

        case 'HOUND': {
          // Patrol or pounce at player
          if (distToPlayer < 220 && Math.abs(p.y - enemy.y) < 60) {
            enemy.facing = p.x > enemy.x ? 1 : -1;

            if (enemy.attackCooldown <= 0 && !enemy.isTelegraphing) {
              enemy.isTelegraphing = true;
              enemy.telegraphTimer = 0.45;
              enemy.attackCooldown = 2.2;
              audio.playTelegraphAlert();
            }
          } else {
            // Patrol back and forth
            enemy.vx = enemy.facing * 50;
            if (enemy.x > enemy.patrolStartX + enemy.patrolRange) {
              enemy.facing = -1;
            } else if (enemy.x < enemy.patrolStartX - enemy.patrolRange) {
              enemy.facing = 1;
            }
          }

          if (enemy.isTelegraphing) {
            enemy.vx = 0;
            enemy.telegraphTimer -= dt;
            if (enemy.telegraphTimer <= 0) {
              enemy.isTelegraphing = false;
              // Pounce forward!
              enemy.vx = enemy.facing * 280;
              enemy.vy = -160;
              audio.playKatanaSlash(1);
            }
          }

          // Gravity
          enemy.vy += 800 * dt;
          enemy.x += enemy.vx * dt;
          enemy.y += enemy.vy * dt;

          // Platform ground collision
          for (const plat of this.currentLevel.platforms) {
            if (
              enemy.x < plat.x + plat.w &&
              enemy.x + enemy.w > plat.x &&
              enemy.y < plat.y + plat.h &&
              enemy.y + enemy.h > plat.y
            ) {
              if (enemy.vy > 0) {
                enemy.y = plat.y - enemy.h;
                enemy.vy = 0;
              }
            }
          }

          // Touch damage
          if (
            p.x < enemy.x + enemy.w &&
            p.x + p.w > enemy.x &&
            p.y < enemy.y + enemy.h &&
            p.y + p.h > enemy.y &&
            !p.isDashing
          ) {
            this.damagePlayer(15);
            p.vx = enemy.facing * 120;
          }
          break;
        }

        case 'ENFORCER': {
          // Riot guard patrol & shotgun blast
          enemy.facing = p.x > enemy.x ? 1 : -1;

          if (distToPlayer < 240 && enemy.attackCooldown <= 0) {
            enemy.isTelegraphing = true;
            enemy.telegraphTimer = 0.5;
            enemy.attackCooldown = 2.5;
            audio.playTelegraphAlert();
          }

          if (enemy.isTelegraphing) {
            enemy.telegraphTimer -= dt;
            if (enemy.telegraphTimer <= 0) {
              enemy.isTelegraphing = false;
              // Spread shotgun burst (3 pellets)
              audio.playBlasterShot();
              for (let i = -1; i <= 1; i++) {
                this.projectiles.push({
                  id: `enf_proj_${Date.now()}_${i}`,
                  x: enemy.facing === 1 ? enemy.x + enemy.w : enemy.x - 10,
                  y: enemy.y + 16,
                  vx: enemy.facing * 340,
                  vy: i * 70,
                  w: 6,
                  h: 4,
                  isEnemy: true,
                  damage: 16,
                  color: PALETTE.dangerOrange,
                  lifetime: 1.5,
                  type: 'PLASMA'
                });
              }
            }
          }
          break;
        }

        case 'BOSS_GOLIATH': {
          // Goliath-X Mech Boss
          enemy.facing = p.x > enemy.x ? 1 : -1;
          const isPhase2 = enemy.hp < enemy.maxHp * 0.5;

          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = isPhase2 ? 1.6 : 2.4;
            enemy.bossAttackPattern = ((enemy.bossAttackPattern || 0) + 1) % 3;

            if (enemy.bossAttackPattern === 0) {
              // Dual Heavy Plasma Cannons
              audio.playBlasterShot();
              this.projectiles.push({
                id: `boss_plasma_1_${Date.now()}`,
                x: enemy.facing === 1 ? enemy.x + enemy.w : enemy.x - 14,
                y: enemy.y + 32,
                vx: enemy.facing * 320,
                vy: 0,
                w: 16,
                h: 8,
                isEnemy: true,
                damage: 25,
                color: PALETTE.dangerOrange,
                lifetime: 2.2,
                type: 'PLASMA'
              });
            } else if (enemy.bossAttackPattern === 1) {
              // Launch Missiles into air that rain down!
              audio.playTelegraphAlert();
              for (let m = 0; m < (isPhase2 ? 4 : 2); m++) {
                this.projectiles.push({
                  id: `boss_missile_${Date.now()}_${m}`,
                  x: enemy.x + 16 + m * 12,
                  y: enemy.y - 10,
                  vx: (Math.random() - 0.5) * 60,
                  vy: -260,
                  w: 8,
                  h: 8,
                  isEnemy: true,
                  damage: 22,
                  color: PALETTE.laserRed,
                  lifetime: 3.0,
                  type: 'MISSILE'
                });
              }
            } else {
              // Ground shockwave or spawn drones
              this.cameraShake = 8;
              audio.playHitImpact(true);
              this.projectiles.push({
                id: `boss_shock_${Date.now()}`,
                x: enemy.x + enemy.w / 2,
                y: enemy.y + enemy.h - 10,
                vx: enemy.facing * 260,
                vy: 0,
                w: 18,
                h: 12,
                isEnemy: true,
                damage: 20,
                color: PALETTE.cyberPink,
                lifetime: 1.8,
                type: 'ENERGY_SLICE'
              });
            }
          }

          // Slow menacing patrol
          enemy.vx = enemy.facing * 35;
          enemy.x += enemy.vx * dt;
          break;
        }
      }
    }
  }

  // Defeat enemy handler
  private defeatEnemy(enemy: Enemy) {
    enemy.state = 'DEAD';
    this.stats.kills++;
    this.stats.score += enemy.type === 'BOSS_GOLIATH' ? 2500 : 150;
    audio.playEnemyExplosion();
    this.cameraShake = enemy.type === 'BOSS_GOLIATH' ? 20 : 6;
    this.spawnSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, PALETTE.cyberPink, 24);

    // Drop credit / stim
    if (Math.random() < 0.5 || enemy.type === 'BOSS_GOLIATH') {
      this.items.push({
        id: `drop_${Date.now()}`,
        type: Math.random() < 0.4 ? 'NANO_STIM' : 'CREDIT_CACHE',
        x: enemy.x + enemy.w / 2,
        y: enemy.y + enemy.h / 2,
        w: 12,
        h: 12,
        collected: false,
        bobTimer: 0,
        value: 100
      });
    }

    // If boss defeated, unlock blast door!
    if (enemy.type === 'BOSS_GOLIATH') {
      this.currentLevel.exitDoor.isUnlocked = true;
      audio.playVictoryFanfare();
    }
  }

  // ==========================================
  // UPDATE PROJECTILES
  // ==========================================
  private updateProjectiles(dt: number) {
    const p = this.player;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.lifetime -= dt;

      // Missiles track downward after rising
      if (proj.type === 'MISSILE') {
        proj.vy += 450 * dt;
      }

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      // Player bullet hit enemy
      if (!proj.isEnemy) {
        let hit = false;
        for (const enemy of this.enemies) {
          if (enemy.state === 'DEAD') continue;
          if (
            proj.x < enemy.x + enemy.w &&
            proj.x + proj.w > enemy.x &&
            proj.y < enemy.y + enemy.h &&
            proj.y + proj.h > enemy.y
          ) {
            enemy.hp -= proj.damage;
            enemy.flashTimer = 0.12;
            enemy.vx += (proj.vx > 0 ? 1 : -1) * 60;
            audio.playHitImpact(false);
            this.spawnSparks(proj.x, proj.y, proj.color, 8);
            if (enemy.hp <= 0) {
              this.defeatEnemy(enemy);
            }
            hit = true;
            break;
          }
        }

        // Hit crate
        for (const h of this.hazards) {
          if (h.type === 'CRATE' && h.active && (h.hp ?? 0) > 0) {
            if (
              proj.x < h.x + h.w &&
              proj.x + proj.w > h.x &&
              proj.y < h.y + h.h &&
              proj.y + proj.h > h.y
            ) {
              h.hp = (h.hp ?? 20) - proj.damage;
              audio.playHitImpact(false);
              this.spawnSparks(proj.x, proj.y, PALETTE.cyberYellow, 6);
              if (h.hp <= 0) {
                h.active = false;
                this.breakCrate(h);
              }
              hit = true;
              break;
            }
          }
        }

        if (hit || proj.lifetime <= 0) {
          this.projectiles.splice(i, 1);
          continue;
        }
      } 
      // Enemy projectile hit player
      else {
        if (
          proj.x < p.x + p.w &&
          proj.x + proj.w > p.x &&
          proj.y < p.y + p.h &&
          proj.y + proj.h > p.y
        ) {
          if (!p.isDashing && p.invulnerableTimer <= 0) {
            this.damagePlayer(proj.damage);
            this.spawnSparks(proj.x, proj.y, proj.color, 10);
            this.projectiles.splice(i, 1);
            continue;
          }
        }

        if (proj.lifetime <= 0) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Check collision with solid terrain
      for (const plat of this.currentLevel.platforms) {
        if (
          proj.x < plat.x + plat.w &&
          proj.x + proj.w > plat.x &&
          proj.y < plat.y + plat.h &&
          proj.y + proj.h > plat.y
        ) {
          this.spawnSparks(proj.x, proj.y, proj.color, 4);
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }
  }

  // ==========================================
  // UPDATE HAZARDS & OBSTACLES
  // ==========================================
  private updateHazards(dt: number) {
    const p = this.player;

    for (const h of this.hazards) {
      if (!h.active && h.type !== 'LASER_BARRIER' && h.type !== 'ELECTRIC_GRATE' && h.type !== 'STEAM_VENT') continue;

      // Cycling hazards
      if (h.cycleDuration > 0) {
        h.timer += dt;
        if (h.timer >= h.cycleDuration) {
          h.timer = 0;
          h.active = !h.active;
        }
      }

      // Contact check with player
      if (
        h.active &&
        p.x < h.x + h.w &&
        p.x + p.w > h.x &&
        p.y < h.y + h.h &&
        p.y + p.h > h.y
      ) {
        if (!p.isDashing && p.invulnerableTimer <= 0) {
          if (h.type === 'LASER_BARRIER') {
            this.damagePlayer(25);
            p.vx = -p.facing * 120;
          } else if (h.type === 'ELECTRIC_GRATE') {
            this.damagePlayer(15);
            p.vy = -180;
          } else if (h.type === 'STEAM_VENT') {
            p.vy = -380; // High steam boost!
            this.damagePlayer(8);
          }
        }
      }
    }

    // Update moving platforms
    for (const plat of this.currentLevel.platforms) {
      if (plat.type === 'MOVING' && plat.vx && plat.minX !== undefined && plat.maxX !== undefined) {
        plat.x += plat.vx * dt;
        if (plat.x > plat.maxX) {
          plat.x = plat.maxX;
          plat.vx = -Math.abs(plat.vx);
        } else if (plat.x < plat.minX) {
          plat.x = plat.minX;
          plat.vx = Math.abs(plat.vx);
        }
      }
    }
  }

  // ==========================================
  // UPDATE COLLECTIBLES
  // ==========================================
  private updateItems(dt: number) {
    const p = this.player;

    for (const item of this.items) {
      if (item.collected) continue;

      if (
        p.x < item.x + item.w &&
        p.x + p.w > item.x &&
        p.y < item.y + item.h &&
        p.y + p.h > item.y
      ) {
        item.collected = true;
        audio.playItemCollect(item.type);

        if (item.type === 'DATACORE') {
          this.stats.datacoresCollected++;
          this.stats.score += item.value;
          this.spawnSparks(item.x + item.w / 2, item.y + item.h / 2, PALETTE.cyberCyan, 18);

          // Check if all datacores collected to unlock door
          if (this.stats.datacoresCollected >= this.currentLevel.requiredDatacores) {
            this.currentLevel.exitDoor.isUnlocked = true;
            audio.playVictoryFanfare();
          }
        } else if (item.type === 'NANO_STIM') {
          p.nanoStims = Math.min(5, p.nanoStims + 1);
          p.hp = Math.min(p.maxHp, p.hp + 20);
          this.spawnSparks(item.x + item.w / 2, item.y + item.h / 2, PALETTE.cyberGreen, 12);
        } else if (item.type === 'ENERGY_CELL') {
          p.energy = Math.min(p.maxEnergy, p.energy + item.value);
          this.spawnSparks(item.x + item.w / 2, item.y + item.h / 2, PALETTE.cyberYellow, 12);
        } else if (item.type === 'CREDIT_CACHE') {
          p.credits += item.value;
          this.stats.score += item.value;
          this.spawnSparks(item.x + item.w / 2, item.y + item.h / 2, PALETTE.cyberOrange, 10);
        }
      }
    }
  }

  // Damage player logic
  private damagePlayer(amount: number) {
    const p = this.player;
    if (p.invulnerableTimer > 0) return;

    p.hp -= amount;
    p.flashTimer = 0.22;
    p.invulnerableTimer = 0.55;
    this.stats.damageTaken += amount;
    this.cameraShake = 9;
    audio.playPlayerHurt();

    if (p.hp <= 0) {
      p.hp = 0;
      p.state = 'DEAD';
      audio.playEnemyExplosion();
      this.setGameState('GAME_OVER');
    }
  }

  // Complete Sector
  private completeSector() {
    audio.playVictoryFanfare();
    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.setGameState('SECTOR_CLEAR');
    } else {
      this.setGameState('VICTORY');
    }
  }

  // Particles
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.alpha -= part.decay * dt;
      if (part.isGravity) {
        part.vy += 450 * dt;
      }
      part.x += part.vx * dt;
      part.y += part.vy * dt;

      if (part.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnSparks(x: number, y: number, color: string, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        color,
        alpha: 1,
        decay: 2.2 + Math.random() * 2.5,
        isGravity: true,
        shape: 'SPARK'
      });
    }
  }

  private spawnDust(x: number, y: number, count: number = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y,
        vx: (Math.random() - 0.5) * 40,
        vy: -20 - Math.random() * 30,
        size: 3 + Math.random() * 3,
        color: PALETTE.steelLight,
        alpha: 0.6,
        decay: 2.0,
        isGravity: false,
        shape: 'CIRCLE'
      });
    }
  }

  private spawnGhostParticles(p: Player) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: p.x - p.facing * (i * 12),
        y: p.y,
        vx: 0,
        vy: 0,
        size: p.w,
        color: PALETTE.cyberCyan,
        alpha: 0.5 - i * 0.15,
        decay: 4.0,
        isGravity: false,
        shape: 'RECT'
      });
    }
  }

  // Camera tracking
  private updateCamera(dt: number) {
    // Camera shake decay
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 18);
    }

    const p = this.player;
    // Look ahead in direction player is moving
    const lookAhead = p.facing * 60;
    const targetX = p.x + p.w / 2 + lookAhead - this.canvas.width / 2;
    const targetY = p.y + p.h / 2 - this.canvas.height / 2;

    // Smooth lerp
    this.cameraX += (targetX - this.cameraX) * 8 * dt;
    this.cameraY += (targetY - this.cameraY) * 6 * dt;

    // Clamping to level boundaries
    this.cameraX = Math.max(0, Math.min(this.currentLevel.width - this.canvas.width, this.cameraX));
    this.cameraY = Math.max(0, Math.min(this.currentLevel.height - this.canvas.height, this.cameraY));
  }

  // ==========================================
  // RENDER PIPELINE
  // ==========================================
  public render() {
    const ctx = this.ctx;
    const cvs = this.canvas;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Clear background
    ctx.fillStyle = PALETTE.bgDark;
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // Apply Camera translation with screen shake
    const shakeX = (Math.random() - 0.5) * this.cameraShake;
    const shakeY = (Math.random() - 0.5) * this.cameraShake;
    const camX = Math.round(this.cameraX + shakeX);
    const camY = Math.round(this.cameraY + shakeY);

    // --- PARALLAX BACKGROUND ---
    this.renderParallaxBackground(camX, camY);

    ctx.save();
    ctx.translate(-camX, -camY);

    // Ladders (behind platforms)
    for (const ladder of this.currentLevel.ladders) {
      renderLadder(ctx, ladder, this.gameTime);
    }

    // Platforms
    for (const plat of this.currentLevel.platforms) {
      renderPlatform(ctx, plat);
    }

    // Exit Blast Door
    renderExitDoor(ctx, this.currentLevel.exitDoor, this.gameTime);

    // Hazards
    for (const hazard of this.hazards) {
      if (hazard.active || hazard.type === 'LASER_BARRIER') {
        renderHazard(ctx, hazard, this.gameTime);
      }
    }

    // Items
    for (const item of this.items) {
      renderItem(ctx, item, this.gameTime);
    }

    // Enemies
    for (const enemy of this.enemies) {
      if (enemy.state !== 'DEAD') {
        renderEnemy(ctx, enemy, this.gameTime);
      }
    }

    // Player
    if (this.player.state !== 'DEAD') {
      renderPlayer(ctx, this.player, this.gameTime);
    }

    // Projectiles
    for (const proj of this.projectiles) {
      renderProjectile(ctx, proj);
    }

    // Particles
    for (const part of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, part.alpha);
      ctx.fillStyle = part.color;
      if (part.shape === 'CIRCLE') {
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(part.x, part.y, part.size, part.size);
      }
      ctx.restore();
    }

    ctx.restore(); // Undo camera translation

    // Atmospheric Rain & Fog Embers
    this.renderAtmosphere();

    ctx.restore();
  }

  // Parallax cyberpunk city skyline
  private renderParallaxBackground(camX: number, camY: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Layer 1: Distant dark skyline with neon windows
    const layer1OffsetX = (camX * 0.15) % 180;
    ctx.fillStyle = '#0a0d1c';
    for (let x = -180; x < w + 180; x += 45) {
      const bldgX = x - layer1OffsetX;
      const bldgH = 140 + Math.sin(x * 0.05) * 60;
      ctx.fillRect(bldgX, h - bldgH, 38, bldgH);

      // Flickering yellow/cyan window dots
      ctx.fillStyle = (Math.sin(x + this.gameTime) > 0.4) ? PALETTE.cyberCyan : '#ffe600';
      ctx.fillRect(bldgX + 8, h - bldgH + 18, 4, 4);
      ctx.fillRect(bldgX + 22, h - bldgH + 34, 4, 4);
      ctx.fillRect(bldgX + 12, h - bldgH + 62, 4, 4);
      ctx.fillStyle = '#0a0d1c';
    }

    // Layer 2: Closer industrial towers & glowing billboards
    const layer2OffsetX = (camX * 0.35) % 240;
    ctx.fillStyle = '#111528';
    for (let x = -240; x < w + 240; x += 80) {
      const bX = x - layer2OffsetX;
      const bH = 190 + Math.cos(x * 0.08) * 80;
      ctx.fillRect(bX, h - bH, 65, bH);

      // Holographic billboard
      if ((x / 80) % 2 === 0) {
        ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
        ctx.fillRect(bX + 10, h - bH + 20, 45, 18);
        ctx.fillStyle = PALETTE.cyberPink;
        ctx.font = '8px monospace';
        ctx.fillText('NEO-CORP', bX + 12, h - bH + 32);
        ctx.fillStyle = '#111528';
      }
    }

    // Flying spinner light streak zooming past
    const spinnerCycle = (this.gameTime * 220) % (w + 400);
    ctx.fillStyle = PALETTE.cyberCyan;
    ctx.fillRect(spinnerCycle - 200, 60 + Math.sin(this.gameTime) * 15, 18, 2);
    ctx.fillStyle = PALETTE.cyberPink;
    ctx.fillRect(spinnerCycle - 204, 61 + Math.sin(this.gameTime) * 15, 4, 1);
  }

  // Ambient rain drops & neon mist
  private renderAtmosphere() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Pixel rain streaks
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const rainCount = 45;
    for (let i = 0; i < rainCount; i++) {
      const rx = (i * 47 + this.gameTime * 200) % w;
      const ry = (i * 83 + this.gameTime * 650) % h;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 12);
    }
    ctx.stroke();
  }
}
