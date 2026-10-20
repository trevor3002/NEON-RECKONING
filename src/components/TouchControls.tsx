/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { KeyInputState, Player } from '../game/types';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sword,
  Crosshair,
  Zap,
  Shield,
  ChevronsRight,
  Sparkles,
  Repeat
} from 'lucide-react';

interface TouchControlsProps {
  player: Player | null;
  onInput: (key: keyof KeyInputState, isDown: boolean) => void;
  isPortrait?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  player,
  onInput,
  isPortrait = false
}) => {
  // Track active touches per button to prevent multi-finger interference
  const activeTouchesRef = useRef<Map<string, number>>(new Map());

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore haptic failure on unsupported platforms
      }
    }
  };

  const handleTouchStart = (key: keyof KeyInputState, e: React.TouchEvent) => {
    e.preventDefault();
    triggerHaptic();
    onInput(key, true);
  };

  const handleTouchEnd = (key: keyof KeyInputState, e: React.TouchEvent) => {
    e.preventDefault();
    onInput(key, false);
  };

  return (
    <div
      className={`touch-control select-none z-30 ${
        isPortrait
          ? 'w-full px-4 py-3 bg-[#070914] border-t border-[#1a233b] flex items-center justify-between gap-4'
          : 'absolute inset-0 pointer-events-none flex items-end justify-between p-4 pb-safe pl-safe pr-safe'
      }`}
    >
      {/* ========================================================= */}
      {/* LEFT CLUSTER: VIRTUAL D-PAD (Movement & Climbing)          */}
      {/* ========================================================= */}
      <div className="pointer-events-auto flex flex-col items-center select-none">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Central background cross */}
          <div className="absolute w-28 h-28 bg-[#090d1c]/80 border border-[#212f4d] rounded-2xl backdrop-blur-sm -z-10 shadow-lg" />

          {/* UP Button (Climb Up) */}
          <button
            onTouchStart={(e) => handleTouchStart('up', e)}
            onTouchEnd={(e) => handleTouchEnd('up', e)}
            onTouchCancel={(e) => handleTouchEnd('up', e)}
            onMouseDown={() => onInput('up', true)}
            onMouseUp={() => onInput('up', false)}
            onMouseLeave={() => onInput('up', false)}
            aria-label="Climb Up"
            className="absolute top-0 w-12 h-12 flex items-center justify-center bg-[#0d1428] active:bg-cyan-500/40 border border-[#233355] active:border-cyan-400 rounded-xl text-cyan-400 shadow-md transition-transform active:scale-95"
          >
            <ArrowUp className="w-6 h-6" />
          </button>

          {/* DOWN Button (Climb Down) */}
          <button
            onTouchStart={(e) => handleTouchStart('down', e)}
            onTouchEnd={(e) => handleTouchEnd('down', e)}
            onTouchCancel={(e) => handleTouchEnd('down', e)}
            onMouseDown={() => onInput('down', true)}
            onMouseUp={() => onInput('down', false)}
            onMouseLeave={() => onInput('down', false)}
            aria-label="Climb Down"
            className="absolute bottom-0 w-12 h-12 flex items-center justify-center bg-[#0d1428] active:bg-cyan-500/40 border border-[#233355] active:border-cyan-400 rounded-xl text-cyan-400 shadow-md transition-transform active:scale-95"
          >
            <ArrowDown className="w-6 h-6" />
          </button>

          {/* LEFT Button (Run Left) */}
          <button
            onTouchStart={(e) => handleTouchStart('left', e)}
            onTouchEnd={(e) => handleTouchEnd('left', e)}
            onTouchCancel={(e) => handleTouchEnd('left', e)}
            onMouseDown={() => onInput('left', true)}
            onMouseUp={() => onInput('left', false)}
            onMouseLeave={() => onInput('left', false)}
            aria-label="Move Left"
            className="absolute left-0 w-12 h-12 flex items-center justify-center bg-[#0d1428] active:bg-cyan-500/40 border border-[#233355] active:border-cyan-400 rounded-xl text-cyan-400 shadow-md transition-transform active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* RIGHT Button (Run Right) */}
          <button
            onTouchStart={(e) => handleTouchStart('right', e)}
            onTouchEnd={(e) => handleTouchEnd('right', e)}
            onTouchCancel={(e) => handleTouchEnd('right', e)}
            onMouseDown={() => onInput('right', true)}
            onMouseUp={() => onInput('right', false)}
            onMouseLeave={() => onInput('right', false)}
            aria-label="Move Right"
            className="absolute right-0 w-12 h-12 flex items-center justify-center bg-[#0d1428] active:bg-cyan-500/40 border border-[#233355] active:border-cyan-400 rounded-xl text-cyan-400 shadow-md transition-transform active:scale-95"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          {/* Center decorative hub */}
          <div className="w-6 h-6 rounded-full bg-[#121c38] border border-cyan-500/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT CLUSTER: ACTION BUTTONS (Combat, Jump, Dash, Specials) */}
      {/* ========================================================= */}
      <div className="pointer-events-auto flex flex-col items-end gap-2 select-none">
        {/* Top Secondary Strip: Specials, Heal & Swap */}
        <div className="flex items-center gap-2">
          {/* Swap Weapon */}
          <button
            onTouchStart={(e) => handleTouchStart('swapWeapon', e)}
            onTouchEnd={(e) => handleTouchEnd('swapWeapon', e)}
            onTouchCancel={(e) => handleTouchEnd('swapWeapon', e)}
            onMouseDown={() => onInput('swapWeapon', true)}
            onMouseUp={() => onInput('swapWeapon', false)}
            aria-label="Swap Weapon"
            className="w-10 h-10 flex flex-col items-center justify-center bg-[#0b1124]/90 active:bg-cyan-900 border border-[#202e4d] active:border-cyan-400 rounded-lg text-slate-300 shadow-md transition-transform active:scale-95"
          >
            <Repeat className="w-4 h-4 text-cyan-400" />
            <span className="text-[8px] text-slate-400">SWAP</span>
          </button>

          {/* Nano-Stim Heal */}
          <button
            onTouchStart={(e) => handleTouchStart('useHeal', e)}
            onTouchEnd={(e) => handleTouchEnd('useHeal', e)}
            onTouchCancel={(e) => handleTouchEnd('useHeal', e)}
            onMouseDown={() => onInput('useHeal', true)}
            onMouseUp={() => onInput('useHeal', false)}
            aria-label="Use Nano Stim"
            className="w-10 h-10 flex flex-col items-center justify-center bg-[#0b1e19]/90 active:bg-emerald-800 border border-emerald-600/60 active:border-emerald-400 rounded-lg text-emerald-300 shadow-md transition-transform active:scale-95"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-[8px] font-bold text-emerald-300">
              {player ? `${player.nanoStims}x` : 'STIM'}
            </span>
          </button>

          {/* EMP Nova (Special 1) */}
          <button
            onTouchStart={(e) => handleTouchStart('specialEMP', e)}
            onTouchEnd={(e) => handleTouchEnd('specialEMP', e)}
            onTouchCancel={(e) => handleTouchEnd('specialEMP', e)}
            onMouseDown={() => onInput('specialEMP', true)}
            onMouseUp={() => onInput('specialEMP', false)}
            aria-label="EMP Nova Special"
            className={`w-11 h-10 flex flex-col items-center justify-center border rounded-lg shadow-md transition-transform active:scale-95 ${
              (player?.energy ?? 0) >= 45
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 active:bg-cyan-500'
                : 'bg-[#0d1322]/80 border-slate-800 text-slate-600'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-[8px] font-bold">EMP</span>
          </button>

          {/* Phantom Slice (Special 2) */}
          <button
            onTouchStart={(e) => handleTouchStart('specialDashSlash', e)}
            onTouchEnd={(e) => handleTouchEnd('specialDashSlash', e)}
            onTouchCancel={(e) => handleTouchEnd('specialDashSlash', e)}
            onMouseDown={() => onInput('specialDashSlash', true)}
            onMouseUp={() => onInput('specialDashSlash', false)}
            aria-label="Phantom Slice Special"
            className={`w-11 h-10 flex flex-col items-center justify-center border rounded-lg shadow-md transition-transform active:scale-95 ${
              (player?.energy ?? 0) >= 60
                ? 'bg-pink-950/90 border-pink-400 text-pink-300 active:bg-pink-500'
                : 'bg-[#0d1322]/80 border-slate-800 text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-[8px] font-bold">SLICE</span>
          </button>
        </div>

        {/* Primary Action Buttons (Arcade Diamond Cluster) */}
        <div className="relative w-44 h-36 flex items-center justify-center">
          {/* DASH / DODGE (Left in cluster) */}
          <button
            onTouchStart={(e) => handleTouchStart('dash', e)}
            onTouchEnd={(e) => handleTouchEnd('dash', e)}
            onTouchCancel={(e) => handleTouchEnd('dash', e)}
            onMouseDown={() => onInput('dash', true)}
            onMouseUp={() => onInput('dash', false)}
            onMouseLeave={() => onInput('dash', false)}
            aria-label="Dodge Dash"
            className="absolute left-0 top-6 w-13 h-13 flex flex-col items-center justify-center bg-[#091b24]/90 active:bg-emerald-600/40 border border-emerald-500/70 active:border-emerald-300 rounded-full text-emerald-400 shadow-lg transition-transform active:scale-90"
          >
            <ChevronsRight className="w-5 h-5" />
            <span className="text-[8px] font-bold">DASH</span>
          </button>

          {/* BLASTER SHOOT (Top in cluster) */}
          <button
            onTouchStart={(e) => handleTouchStart('shoot', e)}
            onTouchEnd={(e) => handleTouchEnd('shoot', e)}
            onTouchCancel={(e) => handleTouchEnd('shoot', e)}
            onMouseDown={() => onInput('shoot', true)}
            onMouseUp={() => onInput('shoot', false)}
            onMouseLeave={() => onInput('shoot', false)}
            aria-label="Plasma Blaster"
            className="absolute top-0 right-13 w-13 h-13 flex flex-col items-center justify-center bg-[#09152b]/90 active:bg-cyan-500/40 border border-cyan-500/80 active:border-cyan-300 rounded-full text-cyan-400 shadow-lg transition-transform active:scale-90"
          >
            <Crosshair className="w-5 h-5" />
            <span className="text-[8px] font-bold">GUN</span>
          </button>

          {/* KATANA SLASH (Right in cluster - BIG) */}
          <button
            onTouchStart={(e) => handleTouchStart('attack', e)}
            onTouchEnd={(e) => handleTouchEnd('attack', e)}
            onTouchCancel={(e) => handleTouchEnd('attack', e)}
            onMouseDown={() => onInput('attack', true)}
            onMouseUp={() => onInput('attack', false)}
            onMouseLeave={() => onInput('attack', false)}
            aria-label="Katana Slash"
            className="absolute right-0 top-4 w-15 h-15 flex flex-col items-center justify-center bg-gradient-to-tr from-pink-950 via-[#1e0a18] to-pink-900 active:from-pink-600 active:to-pink-400 border-2 border-pink-500 active:border-pink-300 rounded-full text-pink-300 shadow-xl shadow-pink-950/50 transition-transform active:scale-90"
          >
            <Sword className="w-6 h-6 text-pink-400" />
            <span className="text-[9px] font-bold tracking-wider">SLASH</span>
          </button>

          {/* JUMP (Bottom in cluster - BIG) */}
          <button
            onTouchStart={(e) => handleTouchStart('jump', e)}
            onTouchEnd={(e) => handleTouchEnd('jump', e)}
            onTouchCancel={(e) => handleTouchEnd('jump', e)}
            onMouseDown={() => onInput('jump', true)}
            onMouseUp={() => onInput('jump', false)}
            onMouseLeave={() => onInput('jump', false)}
            aria-label="Jump / Double Jump"
            className="absolute bottom-0 right-12 w-14 h-14 flex flex-col items-center justify-center bg-gradient-to-tr from-cyan-950 via-[#071826] to-cyan-900 active:from-cyan-500 active:to-cyan-400 border-2 border-cyan-400 active:border-cyan-200 rounded-full text-cyan-300 shadow-xl shadow-cyan-950/50 transition-transform active:scale-90"
          >
            <ArrowUp className="w-6 h-6 text-cyan-400" />
            <span className="text-[9px] font-bold tracking-wider">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
