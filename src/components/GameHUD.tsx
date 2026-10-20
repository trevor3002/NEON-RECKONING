/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, GameStats, LevelData, Enemy } from '../game/types';
import { audio } from '../game/audio';
import { Volume2, VolumeX, Monitor, Shield, Zap, Heart, Disc3, Maximize2, Pause } from 'lucide-react';

interface GameHUDProps {
  player: Player;
  stats: GameStats;
  level: LevelData;
  enemies: Enemy[];
  crtEnabled: boolean;
  onToggleCrt: () => void;
  onPause: () => void;
  isMobilePortrait?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  stats,
  level,
  enemies,
  crtEnabled,
  onToggleCrt,
  onPause,
  isMobilePortrait = false
}) => {
  const isMuted = audio.getIsMuted();
  const boss = enemies.find((e) => e.type === 'BOSS_GOLIATH' && e.state !== 'DEAD');

  const hpRatio = Math.max(0, player.hp / player.maxHp);
  const energyRatio = Math.max(0, player.energy / player.maxEnergy);

  return (
    <div className={`absolute inset-0 pointer-events-none p-2 sm:p-4 flex flex-col justify-between font-mono-tech select-none z-20 ${isMobilePortrait ? 'pb-1' : ''}`}>
      {/* Top Perimeter Status Cluster */}
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        {/* Left: Health, Stims & Energy */}
        <div className="flex flex-col gap-1 bg-[#090b14]/90 border border-[#1e2538] p-1.5 sm:px-3 sm:py-2 rounded shadow-md backdrop-blur-none shrink-0">
          {/* Health Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-500 shrink-0" />
            <div className="w-20 sm:w-36 h-2.5 sm:h-3 bg-[#141829] border border-[#2b334d] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-100"
                style={{ width: `${hpRatio * 100}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold tabular-nums text-slate-200">
              {Math.ceil(player.hp)}/{player.maxHp}
            </span>
          </div>

          {/* Energy Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
            <div className="w-20 sm:w-36 h-2 bg-[#141829] border border-[#2b334d] overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${energyRatio * 100}%` }}
              />
            </div>
            <span className="text-[9px] sm:text-[11px] tabular-nums text-cyan-400">
              {Math.floor(player.energy)}%
            </span>
          </div>

          {/* Nano-Stims (hidden in compact mobile if on deck) */}
          {!isMobilePortrait && (
            <div className="flex items-center justify-between text-[11px] text-emerald-400 border-t border-[#1c2236] pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                NANO-STIMS: <strong className="tabular-nums">{player.nanoStims}</strong>
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">[R / H TO HEAL]</span>
            </div>
          )}
        </div>

        {/* Center: Sector Objective & Boss Gauge */}
        <div className="flex flex-col items-center gap-1">
          <div className="bg-[#090b14]/90 border border-[#1e2538] px-2 sm:px-4 py-1 sm:py-1.5 rounded flex items-center gap-2 sm:gap-3 shadow-md">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
              <span className="text-cyan-400 font-bold">{level.name.split(':')[0]}</span>
              <span>·</span>
              <span className="text-slate-400">{level.name.split(':')[1]}</span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-400">
              <Disc3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-cyan-400" />
              <span>DATACORES:</span>
              <span className="tabular-nums text-slate-100">
                {stats.datacoresCollected}/{level.requiredDatacores}
              </span>
              {level.exitDoor.isUnlocked && (
                <span className="ml-1 text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-600">
                  OPEN
                </span>
              )}
            </div>
          </div>

          {/* Boss Bar if present */}
          {boss && (
            <div className="w-48 sm:w-72 bg-[#090b14]/95 border border-red-500/60 p-1.5 sm:p-2 rounded flex flex-col gap-1 shadow-lg shadow-red-950/40">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-red-400">
                <span className="truncate">GOLIATH-X</span>
                <span className="tabular-nums">{boss.hp}/{boss.maxHp} HP</span>
              </div>
              <div className="w-full h-2 sm:h-2.5 bg-slate-900 border border-red-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-pink-600 to-amber-500 transition-all duration-150"
                  style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Credits, Score & Utility Toggles */}
        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          <div className="bg-[#090b14]/90 border border-[#1e2538] px-2 py-1 rounded text-right flex flex-col shadow-md">
            <div className="text-[10px] sm:text-xs text-amber-400 font-bold tabular-nums">
              {player.credits.toLocaleString()} <span className="text-amber-500 text-[8px] sm:text-[10px]">₵</span>
            </div>
            <div className="text-[9px] sm:text-[11px] text-slate-400 tabular-nums">
              <strong className="text-slate-200">{stats.score.toLocaleString()}</strong>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-col gap-1">
            <button
              onClick={onPause}
              title="Pause Game"
              className="p-1 sm:p-1.5 bg-[#0f1424] hover:bg-[#1c243f] border border-[#2b344d] rounded text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              title="Toggle Fullscreen"
              className="p-1 sm:p-1.5 bg-[#0f1424] hover:bg-[#1c243f] border border-[#2b344d] rounded text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={() => {
                audio.toggleMute();
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-1 sm:p-1.5 bg-[#0f1424] hover:bg-[#1c243f] border border-[#2b344d] rounded text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-500" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />}
            </button>
            {!isMobilePortrait && (
              <button
                onClick={onToggleCrt}
                title={crtEnabled ? 'Disable CRT Filter' : 'Enable CRT Filter'}
                className={`p-1 sm:p-1.5 border rounded transition-colors cursor-pointer ${
                  crtEnabled
                    ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400'
                    : 'bg-[#0f1424] border-[#2b344d] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Perimeter Action Cluster (Only rendered when not in dedicated deck mode) */}
      {!isMobilePortrait && (
        <div className="flex items-end justify-between gap-4">
          {/* Weapon & Combo cluster */}
          <div className="bg-[#090b14]/85 border border-[#1e2538] px-3 py-2 rounded flex items-center gap-3 shadow-md">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">ACTIVE WEAPON [Q]</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-bold ${
                    player.activeWeapon === 'KATANA' ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                >
                  KATANA
                </span>
                <span className="text-slate-600">/</span>
                <span
                  className={`text-xs font-bold ${
                    player.activeWeapon === 'BLASTER' ? 'text-pink-400' : 'text-slate-500'
                  }`}
                >
                  BLASTER
                </span>
              </div>
            </div>

            {player.comboCount > 0 && (
              <div className="border-l border-[#20273a] pl-2 text-xs font-bold text-amber-400 animate-pulse">
                COMBO x{player.comboCount}
              </div>
            )}
          </div>

          {/* Minimalist Flat Keybind Hint Bar (desktop only) */}
          <div className="hidden lg:flex items-center gap-3 bg-[#090b14]/75 border border-[#1a2030] px-3 py-1 rounded text-[11px] text-slate-400">
            <span><strong className="text-slate-200">A/D</strong> Move</span>
            <span>·</span>
            <span><strong className="text-slate-200">W/S</strong> Climb</span>
            <span>·</span>
            <span><strong className="text-slate-200">Space</strong> Jump</span>
            <span>·</span>
            <span><strong className="text-slate-200">Shift</strong> Dash</span>
            <span>·</span>
            <span><strong className="text-slate-200">J/L-Click</strong> Slash</span>
            <span>·</span>
            <span><strong className="text-slate-200">K/R-Click</strong> Blaster</span>
            <span>·</span>
            <span><strong className="text-slate-200">Esc</strong> Pause</span>
          </div>

          {/* Special Attacks & Dash Cooldown */}
          <div className="bg-[#090b14]/85 border border-[#1e2538] px-3 py-2 rounded flex items-center gap-3 shadow-md text-xs">
            {/* EMP Nova */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-400">EMP [E]</span>
              <span
                className={`font-semibold tabular-nums ${
                  player.energy >= 45 ? 'text-cyan-400' : 'text-slate-600'
                }`}
              >
                {player.energy >= 45 ? 'READY' : '45%'}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            {/* Phantom Slice */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-400">SLICE [F]</span>
              <span
                className={`font-semibold tabular-nums ${
                  player.energy >= 60 ? 'text-pink-400' : 'text-slate-600'
                }`}
              >
                {player.energy >= 60 ? 'READY' : '60%'}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            {/* Dash */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-400">DASH</span>
              <span
                className={`font-semibold tabular-nums ${
                  player.dashCooldown <= 0 ? 'text-emerald-400' : 'text-slate-600'
                }`}
              >
                {player.dashCooldown <= 0 ? 'READY' : 'CD'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
