/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { Player } from '../game/types';
import {
  ArrowUp,
  Sword,
  Crosshair,
  Zap,
  Shield,
  Wind,
  RotateCw
} from 'lucide-react';

interface VirtualGamepadProps {
  engine: GameEngine;
  player: Player;
  mode?: 'overlay' | 'deck';
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({
  engine,
  player
}) => {
  const movementPointer = useRef<number | null>(null);

  const triggerHaptic = (ms: number = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // Haptics are optional and may be blocked by the browser.
      }
    }
  };

  const handleTouchAction = useCallback(
    (actionKey: keyof typeof engine.heldKeys, isDown: boolean, hapticMs: number = 8) => {
      engine.heldKeys[actionKey] = isDown;
      if (isDown) triggerHaptic(hapticMs);
    },
    [engine]
  );

  // Invisible, full-size left-side touch area. Drag from its center in the
  // direction you want to move; no joystick, arrows, or D-pad are rendered.
  const stopMovement = () => {
    movementPointer.current = null;
    (['left', 'right', 'up', 'down'] as const).forEach((key) => {
      engine.heldKeys[key] = false;
    });
  };

  const renderDPad = () => (
    <div
      aria-label="Touch and drag here to move"
      onPointerDown={(e) => {
        e.preventDefault();
        movementPointer.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        const rect = e.currentTarget.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / Math.max(1, rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / Math.max(1, rect.height / 2);
        engine.heldKeys.left = dx < -0.18;
        engine.heldKeys.right = dx > 0.18;
        engine.heldKeys.up = dy < -0.18;
        engine.heldKeys.down = dy > 0.18;
      }}
      onPointerMove={(e) => {
        if (movementPointer.current !== e.pointerId) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / Math.max(1, rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / Math.max(1, rect.height / 2);
        engine.heldKeys.left = dx < -0.18;
        engine.heldKeys.right = dx > 0.18;
        engine.heldKeys.up = dy < -0.18;
        engine.heldKeys.down = dy > 0.18;
      }}
      onPointerUp={stopMovement}
      onPointerCancel={stopMovement}
      onLostPointerCapture={stopMovement}
      className="absolute inset-0 rounded-none bg-transparent border-0 select-none touch-control"
      style={{ touchAction: 'none' }}
    />
  );

  // Common Action Diamond rendering
  const renderActionDiamond = () => (
    <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center select-none">
      {/* KATANA SLASH BUTTON (Top-Left) */}
      <button
        aria-label="Katana Attack"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('attack', true, 12);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('attack', false);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleTouchAction('attack', false);
        }}
        onMouseDown={() => handleTouchAction('attack', true, 12)}
        onMouseUp={() => handleTouchAction('attack', false)}
        onMouseLeave={() => handleTouchAction('attack', false)}
        className="absolute top-1 left-2 sm:left-3 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 active:from-cyan-400 active:to-cyan-600 border-2 border-cyan-300 text-white flex flex-col items-center justify-center shadow-lg shadow-cyan-900/60 transition-transform active:scale-95 cursor-pointer"
      >
        <Sword className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-[7px] sm:text-[8px] font-bold tracking-wider">SLASH</span>
      </button>

      {/* PLASMA BLASTER SHOOT BUTTON (Top-Right) */}
      <button
        aria-label="Shoot Blaster"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('shoot', true, 10);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('shoot', false);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleTouchAction('shoot', false);
        }}
        onMouseDown={() => handleTouchAction('shoot', true, 10)}
        onMouseUp={() => handleTouchAction('shoot', false)}
        onMouseLeave={() => handleTouchAction('shoot', false)}
        className="absolute top-1 right-1 w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-pink-600 to-purple-700 active:from-pink-400 active:to-pink-600 border-2 border-pink-300 text-white flex flex-col items-center justify-center shadow-lg shadow-pink-900/60 transition-transform active:scale-95 cursor-pointer"
      >
        <Crosshair className="w-5 h-5" />
        <span className="text-[7px] sm:text-[8px] font-bold tracking-wider">SHOOT</span>
      </button>

      {/* DASH / DODGE BUTTON (Bottom-Left) */}
      <button
        aria-label="Dodge Dash"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('dash', true, 10);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('dash', false);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleTouchAction('dash', false);
        }}
        onMouseDown={() => handleTouchAction('dash', true, 10)}
        onMouseUp={() => handleTouchAction('dash', false)}
        onMouseLeave={() => handleTouchAction('dash', false)}
        className="absolute bottom-1 left-2 sm:left-4 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 active:from-emerald-400 active:to-emerald-600 border-2 border-emerald-300 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-950/60 transition-transform active:scale-95 cursor-pointer"
      >
        <Wind className="w-5 h-5" />
        <span className="text-[7px] sm:text-[8px] font-bold tracking-wider">DODGE</span>
      </button>

      {/* JUMP & DOUBLE JUMP BUTTON (Bottom-Right / Main Action) */}
      <button
        aria-label="Jump"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('jump', true, 10);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('jump', false);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleTouchAction('jump', false);
        }}
        onMouseDown={() => handleTouchAction('jump', true, 10)}
        onMouseUp={() => handleTouchAction('jump', false)}
        onMouseLeave={() => handleTouchAction('jump', false)}
        className="absolute bottom-0 right-1 sm:right-2 w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 active:from-amber-400 active:to-amber-500 border-2 border-amber-200 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-amber-950/60 transition-transform active:scale-95 cursor-pointer"
      >
        <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
        <span className="text-[8px] sm:text-[9px] font-extrabold tracking-wider">JUMP</span>
      </button>
    </div>
  );

  // Common Specials Strip
  const renderSpecials = () => (
    <div className="flex items-center gap-2">
      {/* Swap Weapon */}
      <button
        aria-label="Swap Weapon"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('swapWeapon', true, 10);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('swapWeapon', false);
        }}
        onMouseDown={() => handleTouchAction('swapWeapon', true, 10)}
        onMouseUp={() => handleTouchAction('swapWeapon', false)}
        className="w-10 h-10 rounded-full bg-[#0b1022]/90 active:bg-amber-500/40 border border-[#233154] active:border-amber-400 flex flex-col items-center justify-center text-slate-300 active:text-amber-300 shadow-md cursor-pointer"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span className="text-[7px] font-bold">SWAP</span>
      </button>

      {/* Nano-Stim Heal */}
      <button
        aria-label="Use Nano Stim"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('useHeal', true, 12);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('useHeal', false);
        }}
        onMouseDown={() => handleTouchAction('useHeal', true, 12)}
        onMouseUp={() => handleTouchAction('useHeal', false)}
        className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center shadow-md transition-colors cursor-pointer ${
          player.nanoStims > 0
            ? 'bg-[#061814]/90 border-emerald-500 text-emerald-300 active:bg-emerald-500/40'
            : 'bg-[#0c101c]/70 border-[#1c2438] text-slate-600'
        }`}
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="text-[7px] font-bold">STIM ({player.nanoStims})</span>
      </button>

      {/* Special EMP Nova */}
      <button
        aria-label="EMP Nova Strike"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('specialEMP', true, 15);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('specialEMP', false);
        }}
        onMouseDown={() => handleTouchAction('specialEMP', true, 15)}
        onMouseUp={() => handleTouchAction('specialEMP', false)}
        className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center shadow-md transition-colors cursor-pointer ${
          player.energy >= 45
            ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 active:bg-cyan-400/40 animate-pulse'
            : 'bg-[#0c101c]/70 border-[#1c2438] text-slate-600'
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        <span className="text-[7px] font-bold">EMP</span>
      </button>

      {/* Special Phantom Slice */}
      <button
        aria-label="Phantom Teleport Slice"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('specialDashSlash', true, 18);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('specialDashSlash', false);
        }}
        onMouseDown={() => handleTouchAction('specialDashSlash', true, 18)}
        onMouseUp={() => handleTouchAction('specialDashSlash', false)}
        className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center shadow-md transition-colors cursor-pointer ${
          player.energy >= 60
            ? 'bg-pink-950/90 border-pink-400 text-pink-300 active:bg-pink-400/40 animate-pulse'
            : 'bg-[#0c101c]/70 border-[#1c2438] text-slate-600'
        }`}
      >
        <Sword className="w-3.5 h-3.5" />
        <span className="text-[7px] font-bold">SLICE</span>
      </button>
    </div>
  );

  // ----------------------------------------------------
  // OVERLAY MODE: Used when phone is in LANDSCAPE or on PC
  // ----------------------------------------------------
  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none touch-control overflow-hidden">
      {/* Bottom Left Thumb Zone: D-Pad */}
      <div className="absolute bottom-0 left-0 h-[72%] w-[46%] pl-safe pb-safe pointer-events-auto flex items-end justify-start">
        {renderDPad()}
      </div>

      {/* Bottom Right Thumb Zone: Actions & Specials */}
      <div className="absolute bottom-3 right-3 pr-safe pb-safe pointer-events-auto flex flex-col items-end gap-1.5">
        {renderSpecials()}
        {renderActionDiamond()}
      </div>
    </div>
  );
};
