/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Disc3, ShieldCheck, Zap } from 'lucide-react';
import { GameStats, LevelData } from '../game/types';

interface SectorClearModalProps {
  stats: GameStats;
  currentLevel: LevelData;
  onNextSector: () => void;
}

export const SectorClearModal: React.FC<SectorClearModalProps> = ({
  stats,
  currentLevel,
  onNextSector
}) => {
  return (
    <div className="absolute inset-0 bg-[#04060d]/90 flex items-center justify-center p-4 z-40 select-none font-mono-tech">
      <div className="bg-[#0b1021] border border-cyan-500/60 rounded-lg p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl shadow-cyan-950/60 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-400 mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-cyan-300 tracking-wider">
            SECTOR SECURED
          </h2>
          <p className="text-xs text-slate-400">
            {currentLevel.name} successfully bypassed
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 bg-[#060914] border border-[#172036] p-3 rounded text-left text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">DATACORES RETRIEVED</span>
            <span className="text-cyan-400 font-bold tabular-nums">
              {stats.datacoresCollected} / {currentLevel.requiredDatacores}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">HOSTILES ELIMINATED</span>
            <span className="text-pink-400 font-bold tabular-nums">{stats.kills}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">MISSION TIME</span>
            <span className="text-slate-200 font-bold tabular-nums">
              {Math.floor(stats.timeElapsed)}s
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">TOTAL SCORE</span>
            <span className="text-amber-400 font-bold tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Proceed CTA */}
        <button
          onClick={onNextSector}
          className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-bold text-xs tracking-wider rounded transition-all transform hover:scale-[1.02] cursor-pointer"
        >
          <span>INFILTRATE NEXT SECTOR</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
