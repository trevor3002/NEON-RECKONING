/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, Home, Skull } from 'lucide-react';
import { GameStats } from '../game/types';

interface GameOverModalProps {
  stats: GameStats;
  onRetry: () => void;
  onQuit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRetry,
  onQuit
}) => {
  return (
    <div className="absolute inset-0 bg-[#060205]/90 flex items-center justify-center p-4 z-40 select-none font-mono-tech">
      <div className="bg-[#12070c] border border-red-500/60 rounded-lg p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl shadow-red-950/70 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-red-500 mb-1 animate-pulse">
            <Skull className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-red-500 tracking-wider">
            RUNNER FLATLINED
          </h2>
          <p className="text-xs text-slate-400">
            Vital systems terminated. Cybernetic connection severed.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 bg-[#090306] border border-[#260e18] p-3 rounded text-left text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">HOSTILES ELIMINATED</span>
            <span className="text-red-400 font-bold tabular-nums">{stats.kills}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">DATACORES SECURED</span>
            <span className="text-cyan-400 font-bold tabular-nums">{stats.datacoresCollected}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">SURVIVAL TIME</span>
            <span className="text-slate-200 font-bold tabular-nums">
              {Math.floor(stats.timeElapsed)}s
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">FINAL SCORE</span>
            <span className="text-amber-400 font-bold tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider rounded transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REBOOT RUNNER (RETRY)</span>
          </button>

          <button
            onClick={onQuit}
            className="flex items-center justify-center gap-2 py-2 bg-transparent hover:bg-slate-900 border border-[#2b101d] text-slate-400 hover:text-slate-200 text-xs tracking-wider rounded transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
