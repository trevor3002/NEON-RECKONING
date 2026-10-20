/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { Player } from '../game/types';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
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
  player,
  mode = 'overlay'
}) => {
  const triggerHaptic = (ms: number = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // Ignored if not permitted by browser
      }
    }
  };

  const handleTouchAction = useCallback(
    (actionKey: keyof typeof engine.heldKeys, isDown: boolean, hapticMs: number = 8) => {
      engine.heldKeys[actionKey] = isDown;
      if (isDown) {
        triggerHaptic(hapticMs);
      }
    },
    [engine]
  );

  // Common D-Pad rendering
  const renderDPad = () => (
    <div className="relative w-34 h-34 sm:w-36 sm:h-36 bg-[#0a0f1d]/75 backdrop-blur-sm border border-[#1e2a47] rounded-full p-1 shadow-lg shadow-black/60 select-none">
      {/* UP Button (Climb Up) */}
      <button
        aria-label="Climb Up"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('up', true);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('up', false);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleTouchAction('up', false);
        }}
        onMouseDown={() => handleTouchAction('up', true)}
        onMouseUp={() => handleTouchAction('up', false)}
        onMouseLeave={() => handleTouchAction('up', false)}
        className="absolute top-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-[#131b31] active:bg-cyan-500/40 border border-[#233152] active:border-cyan-400 rounded-t-lg flex items-center justify-center text-slate-300 active:text-cyan-300 transition-colors cursor-pointer"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* DOWN Button (Climb Down) */}
      <button
        aria-label="Climb Down"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('down', true);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('down', false);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleTouchAction('down', false);
        }}
        onMouseDown={() => handleTouchAction('down', true)}
        onMouseUp={() => handleTouchAction('down', false)}
        onMouseLeave={() => handleTouchAction('down', false)}
        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-[#131b31] active:bg-cyan-500/40 border border-[#233152] active:border-cyan-400 rounded-b-lg flex items-center justify-center text-slate-300 active:text-cyan-300 transition-colors cursor-pointer"
      >
        <ArrowDown className="w-5 h-5" />
      </button>

      {/* LEFT Button (Run Left) */}
      <button
        aria-label="Move Left"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('left', true);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('left', false);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleTouchAction('left', false);
        }}
        onMouseDown={() => handleTouchAction('left', true)}
        onMouseUp={() => handleTouchAction('left', false)}
        onMouseLeave={() => handleTouchAction('left', false)}
        className="absolute left-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#131b31] active:bg-cyan-500/40 border border-[#233152] active:border-cyan-400 rounded-l-lg flex items-center justify-center text-slate-300 active:text-cyan-300 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* RIGHT Button (Run Right) */}
      <button
        aria-label="Move Right"
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchAction('right', true);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchAction('right', false);
        }}
        onTouchCancel={(e) => {
          e.preventDefault();
          handleTouchAction('right', false);
        }}
        onMouseDown={() => handleTouchAction('right', true)}
        onMouseUp={() => handleTouchAction('right', false)}
        onMouseLeave={() => handleTouchAction('right', false)}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#131b31] active:bg-cyan-500/40 border border-[#233152] active:border-cyan-400 rounded-r-lg flex items-center justify-center text-slate-300 active:text-cyan-300 transition-colors cursor-pointer"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Center Hub */}
      <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-[#0a0e1c] border border-[#1b2640] flex items-center justify-center pointer-events-none">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/40 animate-pulse" />
      </div>
    </div>
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
  // DECK MODE: Used when phone is in PORTRAIT
  // Completely separate from game viewport, zero obstruction!
  // ----------------------------------------------------
  if (mode === 'deck') {
    return (
      <div className="w-full h-full flex flex-col justify-between p-3 select-none touch-control pointer-events-auto">
        {/* Top bar of deck: specials & utilities */}
        <div className="w-full flex items-center justify-center border-b border-[#18233a] pb-2">
          {renderSpecials()}
        </div>

        {/* Bottom row: D-Pad on left, Action Diamond on right */}
        <div className="w-full flex items-center justify-between px-1 pt-1">
          {renderDPad()}
          {renderActionDiamond()}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // OVERLAY MODE: Used when phone is in LANDSCAPE or on PC
  // ----------------------------------------------------
  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none touch-control overflow-hidden">
      {/* Bottom Left Thumb Zone: D-Pad */}
      <div className="absolute bottom-3 left-3 pl-safe pb-safe pointer-events-auto flex items-center justify-center">
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
