/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Enemy, Projectile, CollectibleItem, ObstacleHazard, Ladder, Platform, ExitDoor } from './types';

// Palette definitions for classic detailed cyberpunk pixel art
export const PALETTE = {
  bgDark: '#080912',
  bgMid: '#121528',
  cyberCyan: '#00f3ff',
  cyberPink: '#ff007f',
  cyberYellow: '#ffe600',
  cyberOrange: '#ff6600',
  cyberGreen: '#00ff88',
  cyberPurple: '#9d00ff',
  steelDark: '#1a1d2e',
  steelMid: '#2d334d',
  steelLight: '#4d567a',
  white: '#f8fafc',
  laserRed: '#ff1744',
  dangerOrange: '#ff9100'
};

// Render Player with state animations and pixel fidelity
export function renderPlayer(ctx: CanvasRenderingContext2D, p: Player, gameTime: number) {
  ctx.save();
  ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h / 2));
  ctx.scale(p.facing, 1);

  // Flash white/red when taking damage
  if (p.flashTimer > 0 && Math.floor(gameTime * 20) % 2 === 0) {
    ctx.filter = 'brightness(2.5) drop-shadow(0 0 8px #ff1744)';
  } else if (p.invulnerableTimer > 0) {
    ctx.globalAlpha = 0.65 + 0.35 * Math.sin(gameTime * 25);
  }

  // Dash ghost / speed blur
  if (p.isDashing) {
    ctx.shadowColor = PALETTE.cyberCyan;
    ctx.shadowBlur = 12;
  }

  const anim = p.animFrame;
  const state = p.state;

  // Base coordinates relative to center
  const bx = -p.w / 2;
  const by = -p.h / 2;

  // --- Scarf / Cape (Billows behind runner with physics lag) ---
  ctx.fillStyle = PALETTE.cyberPink;
  const scarfOffset = Math.sin(gameTime * 12) * 3;
  const scarfX = bx - 2;
  const scarfY = by + 9;

  if (state === 'RUN') {
    ctx.fillRect(scarfX - 8, scarfY + scarfOffset, 8, 3);
    ctx.fillRect(scarfX - 14, scarfY + scarfOffset * 1.5, 6, 2);
  } else if (state === 'JUMP') {
    ctx.fillRect(scarfX - 5, scarfY + 6, 5, 4);
    ctx.fillRect(scarfX - 8, scarfY + 10, 4, 3);
  } else if (state === 'FALL') {
    ctx.fillRect(scarfX - 6, scarfY - 4, 6, 3);
    ctx.fillRect(scarfX - 10, scarfY - 8, 5, 2);
  } else if (state === 'DASH') {
    ctx.fillStyle = PALETTE.cyberCyan;
    ctx.fillRect(scarfX - 16, scarfY, 16, 4);
    ctx.fillRect(scarfX - 24, scarfY + 1, 9, 2);
  } else {
    // Idle gentle flutter
    ctx.fillRect(scarfX - 4, scarfY + scarfOffset * 0.5, 5, 3);
    ctx.fillRect(scarfX - 7, scarfY + scarfOffset * 0.8 + 1, 4, 2);
  }

  // --- Legs Animation ---
  ctx.fillStyle = PALETTE.steelDark;
  let legLeftY = 0;
  let legRightY = 0;
  let legLeftX = 0;
  let legRightX = 0;

  if (state === 'RUN') {
    const cycle = (anim % 6);
    if (cycle === 0) { legLeftX = -4; legRightX = 4; legLeftY = -1; legRightY = 1; }
    else if (cycle === 1) { legLeftX = -2; legRightX = 2; legLeftY = 0; legRightY = 0; }
    else if (cycle === 2) { legLeftX = 1; legRightX = -1; legLeftY = 2; legRightY = -2; }
    else if (cycle === 3) { legLeftX = 4; legRightX = -4; legLeftY = 1; legRightY = -1; }
    else if (cycle === 4) { legLeftX = 2; legRightX = -2; legLeftY = 0; legRightY = 0; }
    else { legLeftX = -1; legRightX = 1; legLeftY = -2; legRightY = 2; }
  } else if (state === 'JUMP') {
    legLeftY = -3;
    legRightY = -1;
  } else if (state === 'CLIMB') {
    const climbOffset = (Math.floor(p.y / 8) % 2 === 0) ? 3 : -3;
    legLeftY = climbOffset;
    legRightY = -climbOffset;
  }

  // Back leg
  ctx.fillStyle = '#151726';
  ctx.fillRect(bx + 4 + legRightX, by + 22 + legRightY, 5, 11);
  // Boots with cyber tread
  ctx.fillStyle = PALETTE.steelMid;
  ctx.fillRect(bx + 4 + legRightX, by + 30 + legRightY, 6, 4);

  // Front leg
  ctx.fillStyle = PALETTE.steelDark;
  ctx.fillRect(bx + 11 + legLeftX, by + 22 + legLeftY, 5, 11);
  ctx.fillStyle = PALETTE.steelMid;
  ctx.fillRect(bx + 11 + legLeftX, by + 30 + legLeftY, 6, 4);
  // Boot neon thruster strip
  ctx.fillStyle = PALETTE.cyberCyan;
  ctx.fillRect(bx + 11 + legLeftX, by + 32 + legLeftY, 5, 1);

  // --- Torso & Tactical Armor ---
  const bodyBob = (state === 'RUN' && (anim % 2 === 0)) ? 1 : 0;
  ctx.fillStyle = PALETTE.steelDark;
  ctx.fillRect(bx + 6, by + 10 + bodyBob, 10, 13);

  // Tactical chestplate
  ctx.fillStyle = PALETTE.steelMid;
  ctx.fillRect(bx + 7, by + 11 + bodyBob, 8, 7);

  // Glowing Cyber Matrix / Reactor lines
  ctx.fillStyle = PALETTE.cyberCyan;
  ctx.fillRect(bx + 9, by + 13 + bodyBob, 4, 3);
  ctx.fillRect(bx + 7, by + 19 + bodyBob, 8, 2); // Utility belt

  // Belt buckle
  ctx.fillStyle = PALETTE.cyberYellow;
  ctx.fillRect(bx + 10, by + 19 + bodyBob, 2, 2);

  // --- Head & Visor ---
  // Helmet
  ctx.fillStyle = PALETTE.steelDark;
  ctx.fillRect(bx + 7, by + 2 + bodyBob, 8, 8);
  ctx.fillRect(bx + 6, by + 4 + bodyBob, 10, 5);

  // Glowing Cybernetic Visor
  ctx.fillStyle = PALETTE.cyberCyan;
  ctx.fillRect(bx + 11, by + 4 + bodyBob, 5, 3);
  // Visor reflection
  ctx.fillStyle = PALETTE.white;
  ctx.fillRect(bx + 14, by + 4 + bodyBob, 2, 1);

  // Mask filter / collar
  ctx.fillStyle = PALETTE.cyberPink;
  ctx.fillRect(bx + 8, by + 8 + bodyBob, 6, 2);

  // --- Arms & Combat Gestures ---
  if (state === 'ATTACK_1' || state === 'ATTACK_2' || state === 'ATTACK_3') {
    // Sword swing poses
    renderKatanaAttack(ctx, bx, by, state, p.stateTimer);
  } else if (state === 'SHOOT') {
    // Aiming gun forward
    ctx.fillStyle = PALETTE.steelMid;
    ctx.fillRect(bx + 12, by + 11 + bodyBob, 7, 4); // Arm extended
    // Plasma pistol
    ctx.fillStyle = PALETTE.steelLight;
    ctx.fillRect(bx + 18, by + 10 + bodyBob, 7, 4);
    ctx.fillStyle = PALETTE.cyberCyan;
    ctx.fillRect(bx + 23, by + 11 + bodyBob, 3, 2); // Plasma muzzle
  } else if (state === 'CLIMB') {
    // Gripping ladder
    ctx.fillStyle = PALETTE.steelLight;
    const armOffset = (Math.floor(p.y / 8) % 2 === 0) ? -4 : 2;
    ctx.fillRect(bx + 4, by + 6 + armOffset, 4, 6);
    ctx.fillRect(bx + 14, by + 6 - armOffset, 4, 6);
  } else {
    // Regular arm / holster
    ctx.fillStyle = PALETTE.steelMid;
    ctx.fillRect(bx + 5, by + 12 + bodyBob, 4, 8);
    // Sheathed Katana on back
    ctx.save();
    ctx.rotate(-0.35);
    ctx.fillStyle = PALETTE.steelMid;
    ctx.fillRect(bx + 3, by + 6, 3, 16);
    ctx.fillStyle = PALETTE.cyberCyan;
    ctx.fillRect(bx + 4, by + 4, 2, 4);
    ctx.restore();
  }

  ctx.restore();
}

// Render dynamic Katana combo swings
function renderKatanaAttack(ctx: CanvasRenderingContext2D, bx: number, by: number, state: string, timer: number) {
  ctx.save();

  if (state === 'ATTACK_1') {
    // Horizontal Slash forward
    ctx.fillStyle = PALETTE.steelLight;
    ctx.fillRect(bx + 13, by + 11, 8, 4); // Arm

    // Blade
    ctx.fillStyle = PALETTE.cyberCyan;
    ctx.fillRect(bx + 20, by + 11, 16, 3);
    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(bx + 22, by + 12, 14, 1);

    // Dynamic neon slash arc
    const progress = Math.min(timer / 0.18, 1);
    ctx.beginPath();
    ctx.arc(bx + 18, by + 14, 24, -0.6 + progress * 0.4, 0.6 + progress * 0.4);
    ctx.strokeStyle = PALETTE.cyberCyan;
    ctx.lineWidth = 4;
    ctx.shadowColor = PALETTE.cyberCyan;
    ctx.shadowBlur = 10;
    ctx.stroke();
  } else if (state === 'ATTACK_2') {
    // Rising Uppercut Slash
    ctx.fillStyle = PALETTE.steelLight;
    ctx.fillRect(bx + 12, by + 8, 6, 7);

    // Blade pointing up-forward
    ctx.fillStyle = PALETTE.cyberPink;
    ctx.fillRect(bx + 16, by - 10, 4, 20);
    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(bx + 17, by - 8, 2, 16);

    // Rising neon curve
    ctx.beginPath();
    ctx.arc(bx + 14, by + 4, 26, 0.4, -1.2, true);
    ctx.strokeStyle = PALETTE.cyberPink;
    ctx.lineWidth = 5;
    ctx.shadowColor = PALETTE.cyberPink;
    ctx.shadowBlur = 12;
    ctx.stroke();
  } else if (state === 'ATTACK_3') {
    // Heavy Cleave downward
    ctx.fillStyle = PALETTE.steelLight;
    ctx.fillRect(bx + 13, by + 14, 8, 5);

    // Heavy long blade striking ground
    ctx.fillStyle = PALETTE.cyberYellow;
    ctx.fillRect(bx + 20, by + 12, 18, 5);
    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(bx + 22, by + 13, 16, 2);

    // Heavy shockwave arc
    ctx.beginPath();
    ctx.arc(bx + 16, by + 16, 30, -1.4, 0.8);
    ctx.strokeStyle = PALETTE.cyberYellow;
    ctx.lineWidth = 6;
    ctx.shadowColor = PALETTE.cyberOrange;
    ctx.shadowBlur = 16;
    ctx.stroke();
  }

  ctx.restore();
}

// Render Enemies with custom pixel designs
export function renderEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, gameTime: number) {
  ctx.save();
  ctx.translate(Math.round(enemy.x + enemy.w / 2), Math.round(enemy.y + enemy.h / 2));
  ctx.scale(enemy.facing, 1);

  if (enemy.flashTimer > 0) {
    ctx.filter = 'brightness(2.5)';
  }

  const bx = -enemy.w / 2;
  const by = -enemy.h / 2;

  // Telegraph warning aura when preparing attack
  if (enemy.isTelegraphing) {
    ctx.strokeStyle = PALETTE.laserRed;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx - 3, by - 3, enemy.w + 6, enemy.h + 6);
  }

  switch (enemy.type) {
    case 'DRONE': {
      // Floating Drone with thrusters and cyclops red camera
      const hover = Math.sin(gameTime * 8) * 3;
      
      // Drone chassis
      ctx.fillStyle = PALETTE.steelDark;
      ctx.fillRect(bx + 2, by + 3 + hover, 18, 10);
      ctx.fillStyle = PALETTE.steelMid;
      ctx.fillRect(bx + 4, by + 5 + hover, 14, 6);

      // Rotating top antenna
      ctx.fillStyle = PALETTE.steelLight;
      ctx.fillRect(bx + 9, by + hover, 3, 3);
      ctx.fillStyle = PALETTE.cyberCyan;
      ctx.fillRect(bx + 8, by - 1 + hover, 5, 1);

      // Flashing Cyclops Camera Eye
      ctx.fillStyle = enemy.isTelegraphing ? PALETTE.laserRed : PALETTE.cyberCyan;
      ctx.fillRect(bx + 15, by + 6 + hover, 4, 4);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(bx + 17, by + 7 + hover, 2, 2);

      // Twin Thrusters
      ctx.fillStyle = PALETTE.steelDark;
      ctx.fillRect(bx + 4, by + 13 + hover, 4, 2);
      ctx.fillRect(bx + 13, by + 13 + hover, 4, 2);

      // Pulsing Thruster flames
      const flameH = 2 + Math.floor(Math.random() * 4);
      ctx.fillStyle = PALETTE.cyberCyan;
      ctx.fillRect(bx + 5, by + 15 + hover, 2, flameH);
      ctx.fillRect(bx + 14, by + 15 + hover, 2, flameH);

      // Laser sight targeting line when telegraphing
      if (enemy.isTelegraphing) {
        ctx.strokeStyle = 'rgba(255, 23, 68, 0.7)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(bx + 18, by + 8 + hover);
        ctx.lineTo(bx + 160, by + 8 + hover);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      break;
    }

    case 'HOUND': {
      // Cybernetic Stalker Hound
      const runCycle = Math.floor(gameTime * 12) % 4;
      const legSpread = (runCycle === 0 || runCycle === 2) ? 4 : -3;

      // Body chassis
      ctx.fillStyle = PALETTE.steelDark;
      ctx.fillRect(bx + 4, by + 4, 20, 8);
      ctx.fillStyle = PALETTE.steelMid;
      ctx.fillRect(bx + 7, by + 3, 14, 4);

      // Spinal red LED strip
      ctx.fillStyle = PALETTE.laserRed;
      ctx.fillRect(bx + 8, by + 2, 10, 2);

      // Head & razor jaws
      ctx.fillStyle = PALETTE.steelMid;
      ctx.fillRect(bx + 20, by + 3, 8, 7);
      // Red glowing eye
      ctx.fillStyle = PALETTE.laserRed;
      ctx.fillRect(bx + 24, by + 4, 3, 2);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(bx + 25, by + 4, 1, 1);

      // Cyber legs (front and back)
      ctx.fillStyle = PALETTE.steelDark;
      ctx.fillRect(bx + 5 - legSpread, by + 12, 3, 7);
      ctx.fillRect(bx + 18 + legSpread, by + 12, 3, 7);

      // Paws
      ctx.fillStyle = PALETTE.steelMid;
      ctx.fillRect(bx + 5 - legSpread, by + 17, 5, 2);
      ctx.fillRect(bx + 18 + legSpread, by + 17, 5, 2);

      // Cyber tail with antenna tip
      ctx.fillStyle = PALETTE.steelLight;
      ctx.fillRect(bx + 1, by + 3, 3, 4);
      ctx.fillRect(bx - 1, by + 1, 2, 3);
      ctx.fillStyle = PALETTE.cyberPink;
      ctx.fillRect(bx - 2, by, 2, 2);
      break;
    }

    case 'ENFORCER': {
      // Heavy Cyborg Riot Guard
      // Heavy Exoskeleton Body
      ctx.fillStyle = PALETTE.steelDark;
      ctx.fillRect(bx + 4, by + 6, 16, 18);
      ctx.fillStyle = PALETTE.steelMid;
      ctx.fillRect(bx + 6, by + 8, 12, 12);

      // Head / Armor visor
      ctx.fillStyle = PALETTE.steelLight;
      ctx.fillRect(bx + 8, by + 1, 9, 6);
      ctx.fillStyle = PALETTE.laserRed;
      ctx.fillRect(bx + 13, by + 3, 4, 2);

      // Legs
      ctx.fillStyle = PALETTE.steelDark;
      ctx.fillRect(bx + 5, by + 24, 6, 14);
      ctx.fillRect(bx + 13, by + 24, 6, 14);
      ctx.fillStyle = PALETTE.steelMid;
      ctx.fillRect(bx + 5, by + 34, 7, 4);
      ctx.fillRect(bx + 13, by + 34, 7, 4);

      // Riot Blaster
      ctx.fillStyle = PALETTE.steelLight;
      ctx.fillRect(bx + 16, by + 14, 10, 5);

      // Heavy Energy Riot Shield (protects front)
      if (enemy.shieldActive !== false) {
        ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
        ctx.strokeStyle = PALETTE.cyberCyan;
        ctx.lineWidth = 2;
        ctx.fillRect(bx + 20, by + 2, 6, 34);
        ctx.strokeRect(bx + 20, by + 2, 6, 34);

        // Shield energy pattern
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(bx + 22, by + 12, 2, 14);
      }
      break;
    }

    case 'BOSS_GOLIATH': {
      // Overlord Goliath-X Heavy Mech Boss
      const pulse = Math.sin(gameTime * 6) * 0.3 + 0.7;

      // Heavy treads / base chassis
      ctx.fillStyle = '#0f111a';
      ctx.fillRect(bx + 4, by + 46, 56, 18);
      ctx.fillStyle = PALETTE.steelDark;
      ctx.fillRect(bx + 6, by + 48, 52, 14);
      // Wheels / treads wheels
      for (let w = 0; w < 4; w++) {
        ctx.fillStyle = PALETTE.steelMid;
        ctx.fillRect(bx + 10 + w * 12, by + 51, 8, 8);
        ctx.fillStyle = PALETTE.cyberCyan;
        ctx.fillRect(bx + 13 + w * 12, by + 54, 2, 2);
      }

      // Torso / Mech Core
      ctx.fillStyle = PALETTE.steelDark;
      ctx.fillRect(bx + 12, by + 16, 40, 30);
      ctx.fillStyle = PALETTE.steelMid;
      ctx.fillRect(bx + 16, by + 18, 32, 24);

      // Central Reactor Core (Weak Point - Pulsing!)
      ctx.fillStyle = PALETTE.cyberPink;
      ctx.fillRect(bx + 24, by + 22, 16, 16);
      ctx.fillStyle = `rgba(255, 0, 127, ${pulse})`;
      ctx.fillRect(bx + 26, by + 24, 12, 12);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(bx + 29, by + 27, 6, 6);

      // Shoulder Missile Pods
      ctx.fillStyle = PALETTE.steelMid;
      ctx.fillRect(bx + 4, by + 6, 16, 12);
      ctx.fillRect(bx + 44, by + 6, 16, 12);
      // Missile tubes
      for (let m = 0; m < 3; m++) {
        ctx.fillStyle = PALETTE.laserRed;
        ctx.fillRect(bx + 6 + m * 5, by + 8, 3, 3);
        ctx.fillRect(bx + 46 + m * 5, by + 8, 3, 3);
      }

      // Heavy Gatling / Plasma Cannons
      ctx.fillStyle = PALETTE.steelLight;
      ctx.fillRect(bx + 48, by + 28, 18, 8);
      ctx.fillStyle = PALETTE.cyberOrange;
      ctx.fillRect(bx + 62, by + 29, 6, 6);

      // Mech Head / Command Sensor Bar
      ctx.fillStyle = PALETTE.steelDark;
      ctx.fillRect(bx + 26, by + 6, 12, 8);
      ctx.fillStyle = PALETTE.laserRed;
      ctx.fillRect(bx + 28, by + 9, 8, 2);
      break;
    }
  }

  // Draw Health Bar above enemy if damaged
  if (enemy.hp < enemy.maxHp && enemy.type !== 'BOSS_GOLIATH') {
    const barW = Math.max(enemy.w, 20);
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(bx, by - 8, barW, 4);
    ctx.fillStyle = hpRatio > 0.4 ? PALETTE.cyberGreen : PALETTE.laserRed;
    ctx.fillRect(bx, by - 8, barW * hpRatio, 4);
  }

  ctx.restore();
}

// Render Projectiles
export function renderProjectile(ctx: CanvasRenderingContext2D, p: Projectile) {
  ctx.save();
  ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h / 2));

  if (p.type === 'PLASMA') {
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    // Bright core
    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(-p.w / 4, -p.h / 4, p.w / 2, p.h / 2);
  } else if (p.type === 'MISSILE') {
    ctx.fillStyle = PALETTE.steelMid;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.fillStyle = PALETTE.laserRed;
    ctx.fillRect(p.w / 4, -p.h / 2, p.w / 4, p.h);
    // Missile exhaust
    ctx.fillStyle = PALETTE.dangerOrange;
    ctx.fillRect(-p.w / 2 - 3, -1, 3, 2);
  } else if (p.type === 'ENERGY_SLICE') {
    ctx.strokeStyle = PALETTE.cyberCyan;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-p.w / 2, -p.h / 2);
    ctx.lineTo(p.w / 2, p.h / 2);
    ctx.stroke();
  }

  ctx.restore();
}

// Render Collectible Items
export function renderItem(ctx: CanvasRenderingContext2D, item: CollectibleItem, gameTime: number) {
  if (item.collected) return;
  ctx.save();
  const bob = Math.sin(gameTime * 5 + item.bobTimer) * 3;
  ctx.translate(Math.round(item.x + item.w / 2), Math.round(item.y + item.h / 2 + bob));

  const bx = -item.w / 2;
  const by = -item.h / 2;

  switch (item.type) {
    case 'DATACORE': {
      // Rotating Hologram Prism Cube
      ctx.shadowColor = PALETTE.cyberCyan;
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
      ctx.strokeStyle = PALETTE.cyberCyan;
      ctx.lineWidth = 1.5;
      
      const angle = gameTime * 3;
      const cosA = Math.cos(angle);
      const w = (item.w / 2) * Math.abs(cosA);
      
      ctx.beginPath();
      ctx.moveTo(0, by);
      ctx.lineTo(w, by + item.h / 2);
      ctx.lineTo(0, by + item.h);
      ctx.lineTo(-w, by + item.h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner glowing core
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(-2, -2, 4, 4);
      break;
    }

    case 'NANO_STIM': {
      // Medical Injector
      ctx.shadowColor = PALETTE.cyberGreen;
      ctx.shadowBlur = 8;
      ctx.fillStyle = PALETTE.steelLight;
      ctx.fillRect(bx + 4, by + 2, 8, 12);
      ctx.fillStyle = PALETTE.cyberGreen;
      ctx.fillRect(bx + 6, by + 4, 4, 8);
      // White emergency cross
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(bx + 7, by + 6, 2, 4);
      ctx.fillRect(bx + 6, by + 7, 4, 2);
      break;
    }

    case 'ENERGY_CELL': {
      // Battery / Power Cell
      ctx.shadowColor = PALETTE.cyberYellow;
      ctx.shadowBlur = 8;
      ctx.fillStyle = PALETTE.steelMid;
      ctx.fillRect(bx + 3, by + 2, 10, 12);
      ctx.fillStyle = PALETTE.cyberYellow;
      ctx.fillRect(bx + 5, by + 4, 6, 8);
      // Lightning bolt icon
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(bx + 7, by + 5, 2, 3);
      ctx.fillRect(bx + 6, by + 7, 3, 2);
      break;
    }

    case 'CREDIT_CACHE': {
      // Cyber Credits Coin
      ctx.shadowColor = PALETTE.cyberOrange;
      ctx.shadowBlur = 6;
      ctx.fillStyle = PALETTE.cyberOrange;
      ctx.beginPath();
      ctx.arc(0, 0, item.w / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.cyberYellow;
      ctx.beginPath();
      ctx.arc(0, 0, item.w / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.bgDark;
      ctx.fillRect(-1, -3, 2, 6);
      break;
    }
  }

  ctx.restore();
}

// Render Hazards (Lasers, Electrified Grates, Steam Vents, Destructible Crates)
export function renderHazard(ctx: CanvasRenderingContext2D, h: ObstacleHazard, gameTime: number) {
  ctx.save();

  if (h.type === 'LASER_BARRIER') {
    // Emitters on ends
    ctx.fillStyle = PALETTE.steelMid;
    if (h.isVertical) {
      ctx.fillRect(h.x, h.y, h.w, 4);
      ctx.fillRect(h.x, h.y + h.h - 4, h.w, 4);
      // Active Laser beam
      if (h.active) {
        ctx.fillStyle = 'rgba(255, 23, 68, 0.25)';
        ctx.fillRect(h.x + 2, h.y + 4, h.w - 4, h.h - 8);
        ctx.fillStyle = PALETTE.laserRed;
        ctx.fillRect(h.x + h.w / 2 - 1, h.y + 4, 2, h.h - 8);
        // Core beam
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(h.x + h.w / 2, h.y + 4, 1, h.h - 8);
      }
    } else {
      ctx.fillRect(h.x, h.y, 4, h.h);
      ctx.fillRect(h.x + h.w - 4, h.y, 4, h.h);
      if (h.active) {
        ctx.fillStyle = 'rgba(255, 23, 68, 0.25)';
        ctx.fillRect(h.x + 4, h.y + 2, h.w - 8, h.h - 4);
        ctx.fillStyle = PALETTE.laserRed;
        ctx.fillRect(h.x + 4, h.y + h.h / 2 - 1, h.w - 8, 2);
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(h.x + 4, h.y + h.h / 2, h.w - 8, 1);
      }
    }
  } else if (h.type === 'ELECTRIC_GRATE') {
    // Metallic Grate
    ctx.fillStyle = PALETTE.steelDark;
    ctx.fillRect(h.x, h.y, h.w, h.h);
    // Grate bars
    ctx.fillStyle = PALETTE.steelMid;
    for (let gx = h.x; gx < h.x + h.w; gx += 6) {
      ctx.fillRect(gx, h.y, 2, h.h);
    }
    // High-voltage sparks if active
    if (h.active) {
      ctx.strokeStyle = PALETTE.cyberCyan;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = 0; s < 4; s++) {
        const sx = h.x + Math.random() * h.w;
        const sy = h.y + Math.random() * h.h;
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (Math.random() - 0.5) * 8, sy - Math.random() * 6);
      }
      ctx.stroke();
    }
  } else if (h.type === 'STEAM_VENT') {
    ctx.fillStyle = PALETTE.steelMid;
    ctx.fillRect(h.x, h.y + h.h - 6, h.w, 6);
    if (h.active) {
      // Steam cloud particles
      ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
      for (let i = 0; i < 5; i++) {
        const puffX = h.x + Math.random() * h.w;
        const puffY = h.y + Math.random() * (h.h - 6);
        ctx.beginPath();
        ctx.arc(puffX, puffY, 3 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (h.type === 'CRATE') {
    // Destructible Supply Crate
    ctx.fillStyle = PALETTE.steelDark;
    ctx.fillRect(h.x, h.y, h.w, h.h);
    ctx.strokeStyle = PALETTE.steelLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(h.x + 1, h.y + 1, h.w - 2, h.h - 2);
    // Hazard diagonal stripe
    ctx.fillStyle = PALETTE.cyberYellow;
    ctx.fillRect(h.x + 4, h.y + h.h / 2 - 2, h.w - 8, 4);
    ctx.fillStyle = PALETTE.bgDark;
    ctx.fillRect(h.x + 8, h.y + h.h / 2 - 1, 4, 2);
  }

  ctx.restore();
}

// Render Ladder
export function renderLadder(ctx: CanvasRenderingContext2D, ladder: Ladder, gameTime: number) {
  ctx.save();
  // Side rails
  ctx.fillStyle = PALETTE.steelMid;
  ctx.fillRect(ladder.x, ladder.y, 3, ladder.h);
  ctx.fillRect(ladder.x + ladder.w - 3, ladder.y, 3, ladder.h);

  // Rungs with pulsating neon cyan power lines
  const pulseRung = Math.floor(gameTime * 8) % 4;
  for (let ry = ladder.y + 4; ry < ladder.y + ladder.h; ry += 8) {
    const isLit = (Math.floor(ry / 8) % 4) === pulseRung;
    ctx.fillStyle = isLit ? PALETTE.cyberCyan : PALETTE.steelLight;
    ctx.fillRect(ladder.x + 3, ry, ladder.w - 6, 2);
  }
  ctx.restore();
}

// Render Platform
export function renderPlatform(ctx: CanvasRenderingContext2D, plat: Platform) {
  ctx.save();
  // Main surface
  ctx.fillStyle = PALETTE.steelDark;
  ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

  // Top metallic walking edge
  ctx.fillStyle = PALETTE.steelMid;
  ctx.fillRect(plat.x, plat.y, plat.w, 3);

  // Neon edge glow strip
  ctx.fillStyle = plat.type === 'MOVING' ? PALETTE.cyberOrange : PALETTE.cyberCyan;
  ctx.fillRect(plat.x, plat.y, plat.w, 1);

  // Structural rivets / grating pattern
  if (plat.h >= 10) {
    ctx.fillStyle = '#0f121d';
    for (let px = plat.x + 8; px < plat.x + plat.w - 4; px += 16) {
      ctx.fillRect(px, plat.y + 6, 2, 2);
    }
  }

  ctx.restore();
}

// Render Exit Blast Door
export function renderExitDoor(ctx: CanvasRenderingContext2D, door: ExitDoor, gameTime: number) {
  ctx.save();
  // Door frame
  ctx.fillStyle = PALETTE.steelDark;
  ctx.fillRect(door.x, door.y, door.w, door.h);
  ctx.strokeStyle = PALETTE.steelLight;
  ctx.lineWidth = 2;
  ctx.strokeRect(door.x, door.y, door.w, door.h);

  // Vertical partition
  ctx.fillStyle = PALETTE.steelMid;
  ctx.fillRect(door.x + door.w / 2 - 1, door.y, 2, door.h);

  // Status Lock Light
  const isUnlocked = door.isUnlocked;
  ctx.fillStyle = isUnlocked ? PALETTE.cyberGreen : PALETTE.laserRed;
  ctx.shadowColor = isUnlocked ? PALETTE.cyberGreen : PALETTE.laserRed;
  ctx.shadowBlur = 8;
  ctx.fillRect(door.x + door.w / 2 - 4, door.y + 6, 8, 8);

  // Hologram terminal above door
  const text = isUnlocked ? 'ACCESS' : 'LOCKED';
  ctx.fillStyle = isUnlocked ? PALETTE.cyberGreen : PALETTE.laserRed;
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, door.x + door.w / 2, door.y - 4);

  ctx.restore();
}
