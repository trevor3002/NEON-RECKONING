/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Share2, PlusSquare, X, RotateCcw, Check } from 'lucide-react';

interface IOSInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuide: React.FC<IOSInstallGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono-tech">
      <div className="relative w-full max-w-sm rounded-xl bg-[#090d1c] border border-cyan-500/70 p-6 shadow-2xl shadow-cyan-950/80 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              INSTALL ON IPHONE
            </h3>
            <p className="text-[11px] text-cyan-400">
              Zero browser bars · Full-screen standalone
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-xs bg-[#050711] border border-[#1b253f] p-3 rounded-lg mb-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-200 shrink-0 font-bold text-[11px]">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-200">Tap Safari's Share Button</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Look for the box with an arrow pointing up at the bottom of Safari.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-200 shrink-0 font-bold text-[11px]">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-200">Select "Add to Home Screen"</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Scroll down in the share sheet and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-200 shrink-0 font-bold text-[11px]">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-200">Launch & Play Fullscreen</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tap the icon from your home screen for native full-screen 60fps action!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition-colors cursor-pointer"
        >
          GOT IT
        </button>
      </div>
    </div>
  );
};

// Orientation Alert for Portrait mode
export const LandscapeOrientationHint: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth <= 840 || /iphone|ipad|ipod|android/i.test(navigator.userAgent);
        const portrait = window.innerHeight > window.innerWidth && isMobile;
        setIsPortrait(portrait);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 bg-[#090d1c]/90 border border-amber-400/80 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-black/80 font-mono-tech text-[11px] text-amber-300 animate-bounce pointer-events-none">
      <RotateCcw className="w-3.5 h-3.5" />
      <span>ROTATE IPHONE TO LANDSCAPE FOR BEST COMBAT</span>
    </div>
  );
};
