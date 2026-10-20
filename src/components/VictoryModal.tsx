/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, Trophy, Award, Zap } from 'lucide-react';
import { GameStats } from '../game/types';

interface VictoryModalProps {
  stats: GameStats;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onPlayAgain
}) => {
  // Calculate Rank based on score & time
  let rank = 'B';
  let rankColor = 'text-cyan-400';
  if (stats.score > 4000 && stats.damageTaken < 100) {
    rank = 'S';
    rankColor = 'text-amber-400';
  } else if (stats.score > 2500) {
    rank = 'A';
    rankColor = 'text-cyan-300';
  }

  return (
    <div className="absolute inset-0 bg-[#04060d]/90 flex items-center justify-center p-4 z-40 select-none font-mono-tech">
      <div className="bg-[#0b1224] border border-amber-400/70 rounded-lg p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl shadow-amber-950/50 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-amber-950/80 border border-amber-400 flex items-center justify-center text-amber-400 mb-1 shadow-lg shadow-amber-500/20">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-amber-300 tracking-wider">
            OPERATION COMPLETE
          </h2>
          <p className="text-xs text-slate-300">
            Overlord Goliath-X neutralized. Cyber core successfully decrypted.
          </p>
        </div>

        {/* Rank Showcase */}
        <div className="bg-[#060a17] border border-[#1b2b4a] p-3 rounded flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">OPERATIONAL RANK</span>
            <span className={`text-4xl font-extrabold font-pixel ${rankColor} drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]`}>
              {rank}
            </span>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">TOTAL SCORE</span>
            <span className="text-xl font-bold text-amber-400 tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-2 bg-[#060a17] border border-[#17243e] p-3 rounded text-left text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">ENEMIES DESTROYED</span>
            <span className="text-slate-200 font-bold tabular-nums">{stats.kills}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">DAMAGE SUSTAINED</span>
            <span className="text-slate-200 font-bold tabular-nums">{stats.damageTaken} HP</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">TOTAL INFILTRATION TIME</span>
            <span className="text-slate-200 font-bold tabular-nums">
              {Math.floor(stats.timeElapsed)}s
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">CYBER THREAT LEVEL</span>
            <span className="text-emerald-400 font-bold">PURGED</span>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-bold text-xs tracking-wider rounded transition-all transform hover:scale-[1.02] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>INITIALIZE NEW RUN</span>
        </button>
      </div>
    </div>
  );
};
