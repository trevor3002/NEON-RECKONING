/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Monitor } from 'lucide-react';
import { audio } from '../game/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuit,
  crtEnabled,
  onToggleCrt
}) => {
  const isMuted = audio.getIsMuted();

  return (
    <div className="absolute inset-0 bg-[#04060d]/85 flex items-center justify-center p-4 z-40 select-none font-mono-tech">
      <div className="bg-[#0b1021] border border-[#232f4f] rounded-lg p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl shadow-cyan-950/40">
        <div className="flex items-center justify-between border-b border-[#1b253f] pb-3">
          <div className="text-sm font-bold text-cyan-400 tracking-wider">
            OPERATION PAUSED
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => audio.toggleMute()}
              className="p-1.5 bg-[#121930] hover:bg-[#1f2b52] border border-[#2b3a62] rounded text-slate-300 hover:text-cyan-400 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onToggleCrt}
              className={`p-1.5 border rounded cursor-pointer ${
                crtEnabled
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-400'
                  : 'bg-[#121930] border-[#2b3a62] text-slate-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Controls Reference */}
        <div className="flex flex-col gap-2 bg-[#060914] border border-[#172036] p-3 rounded text-xs">
          <div className="text-[11px] font-semibold text-slate-400">COMBAT & TRAVERSAL PROTOCOLS:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-300">
            <div><strong className="text-cyan-400">A / D</strong> : Move Left / Right</div>
            <div><strong className="text-cyan-400">W / S</strong> : Climb Ladder / Conduit</div>
            <div><strong className="text-cyan-400">Space</strong> : Jump / Double Jump</div>
            <div><strong className="text-cyan-400">Shift</strong> : Cyber Dash (i-frames)</div>
            <div><strong className="text-cyan-400">J / L-Click</strong> : Katana 3-Hit Combo</div>
            <div><strong className="text-cyan-400">K / R-Click</strong> : Plasma Blaster Gunfire</div>
            <div><strong className="text-cyan-400">E</strong> : EMP Nova Shockwave (45 EN)</div>
            <div><strong className="text-cyan-400">F</strong> : Phantom Slice Dash (60 EN)</div>
            <div><strong className="text-cyan-400">R / H</strong> : Use Nano-Stim Healing</div>
            <div><strong className="text-cyan-400">Q / 1,2</strong> : Swap Weapon</div>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider rounded transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME MISSION</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2 bg-[#121930] hover:bg-[#1a2444] border border-[#232f4f] text-slate-200 text-xs tracking-wider rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTART SECTOR</span>
          </button>

          <button
            onClick={onQuit}
            className="flex items-center justify-center gap-2 py-2 bg-transparent hover:bg-red-950/30 border border-transparent hover:border-red-800 text-slate-400 hover:text-red-400 text-xs tracking-wider rounded transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>ABORT TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
