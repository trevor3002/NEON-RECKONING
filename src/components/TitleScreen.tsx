/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Volume2, VolumeX, Monitor, Maximize2, Share2, Check, Smartphone } from 'lucide-react';
import { audio } from '../game/audio';
import { LEVELS } from '../game/levels';

interface TitleScreenProps {
  onStartGame: (sectorIndex: number) => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  crtEnabled,
  onToggleCrt
}) => {
  const [selectedSector, setSelectedSector] = useState(0);
  const [isMuted, setIsMuted] = useState(audio.getIsMuted());
  const [copied, setCopied] = useState(false);

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-between items-center p-3 sm:p-6 md:p-8 bg-[#04060d]/90 font-mono-tech select-none z-30 overflow-y-auto">
      {/* Top utility row */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-cyan-400 font-bold text-[10px] sm:text-xs">NEON RECKONING</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-semibold text-[10px] sm:text-xs flex items-center gap-1">
            <Smartphone className="w-3 h-3 inline sm:hidden" />
            PHONE & PC READY
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2 py-1 bg-[#0d1222] hover:bg-[#1a2340] border border-[#232f4f] rounded text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer text-[10px] sm:text-xs"
            title="Copy game link to share with friends"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'COPIED!' : 'SHARE'}</span>
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-1 px-2 py-1 bg-[#0d1222] hover:bg-[#1a2340] border border-[#232f4f] rounded text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer text-[10px] sm:text-xs"
            title="Toggle Fullscreen Mode"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">FULLSCREEN</span>
          </button>
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1 px-2 py-1 bg-[#0d1222] hover:bg-[#1a2340] border border-[#232f4f] rounded text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer text-[10px] sm:text-xs"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-pink-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'AUDIO'}</span>
          </button>
          <button
            onClick={onToggleCrt}
            className={`flex items-center gap-1 px-2 py-1 border rounded transition-colors cursor-pointer text-[10px] sm:text-xs ${
              crtEnabled
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-400'
                : 'bg-[#0d1222] border-[#232f4f] text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CRT</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center gap-3 sm:gap-5 my-auto text-center w-full max-w-lg py-2">
        {/* Inline SVG Cyberpunk Title Lockup */}
        <div className="w-full">
          <svg viewBox="0 0 540 110" className="w-full drop-shadow-[0_0_24px_rgba(0,243,255,0.45)]">
            <defs>
              <linearGradient id="neonCyanPink" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f3ff" />
                <stop offset="50%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#ff007f" />
              </linearGradient>
              <linearGradient id="subGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffe600" />
                <stop offset="100%" stopColor="#ff6600" />
              </linearGradient>
            </defs>

            {/* Background cyber grid accents */}
            <path
              d="M 10 20 L 40 5 L 500 5 L 530 20 L 500 95 L 470 105 L 70 105 L 10 95 Z"
              fill="#080c1a"
              stroke="#1f2b47"
              strokeWidth="2"
            />
            <path
              d="M 40 5 L 500 5"
              stroke="#00f3ff"
              strokeWidth="3"
            />
            <path
              d="M 70 105 L 470 105"
              stroke="#ff007f"
              strokeWidth="3"
            />

            {/* Main Title Wordmark */}
            <text
              x="270"
              y="60"
              textAnchor="middle"
              fill="url(#neonCyanPink)"
              fontFamily="'Press Start 2P', monospace"
              fontSize="28"
              letterSpacing="2"
              fontWeight="bold"
            >
              NEON RECKONING
            </text>

            {/* Subtitle Accent */}
            <text
              x="270"
              y="86"
              textAnchor="middle"
              fill="url(#subGradient)"
              fontFamily="'Chakra Petch', sans-serif"
              fontSize="12"
              letterSpacing="6"
              fontWeight="700"
            >
              PIXEL CYBERPUNK ACTION
            </text>
          </svg>
        </div>

        {/* Tactical Mission Brief */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed px-2">
          Infiltrate the mega-corporation spire. Slash with katana combos, climb conduits, dodge security lasers, and take down Mech Goliath-X.
        </p>

        {/* Sector Selection Strip */}
        <div className="flex flex-col gap-1.5 w-full max-w-md px-2">
          <span className="text-[10px] sm:text-[11px] text-slate-400 text-left">CHOOSE INFILTRATION SECTOR:</span>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {LEVELS.map((lvl, index) => (
              <button
                key={lvl.id}
                onClick={() => setSelectedSector(index)}
                className={`p-1.5 sm:p-2 border text-left rounded transition-all cursor-pointer ${
                  selectedSector === index
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/50'
                    : 'bg-[#090d1c] border-[#1d273e] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <div className="text-[9px] sm:text-[10px] text-slate-400">SECTOR 0{lvl.id}</div>
                <div className="text-[11px] sm:text-xs font-bold truncate">{lvl.name.split(':')[1] || lvl.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Game CTA Button */}
        <button
          onClick={() => onStartGame(selectedSector)}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-cyan-500 to-pink-600 hover:from-cyan-400 hover:to-pink-500 text-white font-bold text-xs sm:text-sm tracking-wider rounded border border-white/20 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current shrink-0" />
          <span>START INFILTRATION</span>
        </button>
      </div>

      {/* Bottom Flat Control Hint Line (Phone & Desktop optimized) */}
      <div className="w-full max-w-4xl text-center border-t border-[#1a233b] pt-2 text-[10px] sm:text-xs text-slate-400 shrink-0">
        <div className="block sm:hidden text-cyan-400 font-semibold">
          📱 VIRTUAL TOUCH D-PAD & BUTTONS ACTIVE · ROTATE FOR FULLSCREEN
        </div>
        <div className="hidden sm:block">
          <span className="text-cyan-400 font-semibold">CONTROLS:</span>{' '}
          <span>A/D Move · W/S Climb · Space Jump · Shift Dash · J/Click Slash · K/R-Click Blaster · E EMP · F Slice · R Heal</span>
        </div>
      </div>
    </div>
  );
};
