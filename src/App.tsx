/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { GameScreen, GameStats, Player, LevelData } from './game/types';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { SectorClearModal } from './components/SectorClearModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { VirtualGamepad } from './components/VirtualGamepad';
import { LandscapeOrientationHint } from './components/IOSInstallGuide';
import { audio } from './game/audio';
import { RotateCw, Maximize2, Volume2, VolumeX, Pause } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameScreen>('TITLE');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMobilePortrait, setIsMobilePortrait] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // HUD mirror state updated at throttle
  const [hudStats, setHudStats] = useState<GameStats>({
    score: 0,
    kills: 0,
    datacoresCollected: 0,
    totalDatacores: 3,
    damageTaken: 0,
    timeElapsed: 0,
    comboMax: 0
  });

  const [hudPlayer, setHudPlayer] = useState<Player | null>(null);
  const [hudLevel, setHudLevel] = useState<LevelData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Internal virtual resolution (crisp pixel art 640x360 scaled to viewport)
    canvas.width = 640;
    canvas.height = 360;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    engine.onStateChange = (nextState) => {
      setGameState(nextState);
    };

    // Throttle HUD state updates to avoid React performance hit
    let lastHudUpdate = 0;
    engine.onStatsUpdate = (stats, player, currentLevel) => {
      const now = performance.now();
      if (now - lastHudUpdate > 80) { // ~12 fps is plenty for HUD numbers, canvas renders at smooth 60fps
        lastHudUpdate = now;
        setHudStats({ ...stats });
        setHudPlayer({ ...player });
        setHudLevel({ ...currentLevel });
      }
    };

    engine.startLoop();

    // Responsive screen & orientation detection
    const checkOrientation = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024;
      const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth <= 900;
      setIsTouchDevice(hasTouch);
      setIsMobilePortrait(isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Audio unlocking on first touch/click (crucial for iOS Safari & Android Chrome)
    const unlockAudio = () => {
      audio.playClimbStep();
    };
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('click', unlockAudio, { once: true });

    // Global Key listener for Title screen start via Space / Enter
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (engine.gameState === 'TITLE' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        engine.startRun(0);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('keydown', handleGlobalKey);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
      engine.stopLoop();
      audio.stopBGM();
    };
  }, []);

  // Sync CRT option with engine
  const handleToggleCrt = () => {
    setCrtEnabled((prev) => !prev);
  };

  const handleStartGame = (sectorIndex: number) => {
    if (engineRef.current) {
      engineRef.current.startRun(sectorIndex);
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('PLAYING');
    }
  };

  const handleRestartSector = () => {
    if (engineRef.current) {
      engineRef.current.loadLevel(engineRef.current.currentLevelIndex);
      engineRef.current.player.hp = engineRef.current.player.maxHp;
      engineRef.current.player.energy = engineRef.current.player.maxEnergy;
      engineRef.current.setGameState('PLAYING');
    }
  };

  const handleNextSector = () => {
    if (engineRef.current) {
      const nextIndex = engineRef.current.currentLevelIndex + 1;
      engineRef.current.loadLevel(nextIndex);
      engineRef.current.setGameState('PLAYING');
    }
  };

  const handleQuitToTitle = () => {
    if (engineRef.current) {
      audio.stopBGM();
      engineRef.current.setGameState('TITLE');
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ---------------------------------------------------------------
  // RENDER: PHONE PORTRAIT MODE (Cyber Arcade Deck Layout)
  // Top half: 16:9 gameplay screen
  // Bottom half: Dedicated cyber gamepad deck with zero occlusion!
  // ---------------------------------------------------------------
  if (isMobilePortrait) {
    return (
      <div className="relative w-screen h-screen bg-[#04060c] overflow-hidden flex flex-col justify-between font-mono-tech select-none touch-control">
        {/* Top Half: 16:9 Game Screen Viewport */}
        <div className="relative w-full aspect-[16/9] bg-black overflow-hidden shrink-0 border-b border-cyan-500/40 shadow-xl shadow-cyan-950/40">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain pixel-art bg-[#080912]"
          />

          {/* CRT scanlines overlay */}
          {crtEnabled && (
            <div className="absolute inset-0 pointer-events-none z-10 crt-overlay crt-vignette" />
          )}

          {/* Compact HUD over game viewport in portrait */}
          {gameState === 'PLAYING' && hudPlayer && hudLevel && (
            <GameHUD
              player={hudPlayer}
              stats={hudStats}
              level={hudLevel}
              enemies={engineRef.current?.enemies || []}
              crtEnabled={crtEnabled}
              onToggleCrt={handleToggleCrt}
              onPause={() => {
                if (engineRef.current) engineRef.current.setGameState('PAUSED');
              }}
              isMobilePortrait={true}
            />
          )}

          {/* Overlays / Modals in Top Viewport if active */}
          {gameState === 'TITLE' && (
            <TitleScreen
              onStartGame={handleStartGame}
              crtEnabled={crtEnabled}
              onToggleCrt={handleToggleCrt}
            />
          )}

          {gameState === 'PAUSED' && (
            <PauseModal
              onResume={handleResume}
              onRestart={handleRestartSector}
              onQuit={handleQuitToTitle}
              crtEnabled={crtEnabled}
              onToggleCrt={handleToggleCrt}
            />
          )}

          {gameState === 'SECTOR_CLEAR' && hudLevel && (
            <SectorClearModal
              stats={hudStats}
              currentLevel={hudLevel}
              onNextSector={handleNextSector}
            />
          )}

          {gameState === 'GAME_OVER' && (
            <GameOverModal
              stats={hudStats}
              onRetry={handleRestartSector}
              onQuit={handleQuitToTitle}
            />
          )}

          {gameState === 'VICTORY' && (
            <VictoryModal
              stats={hudStats}
              onPlayAgain={() => handleStartGame(0)}
            />
          )}
        </div>

        {/* Middle Deck Info & Utility Strip */}
        <div className="w-full bg-[#080c1a] border-b border-[#1b253e] px-3 py-1.5 flex items-center justify-between text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold text-[11px]">CYBER DECK</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-[10px]">
              {gameState === 'PLAYING' && hudLevel ? hudLevel.name.split(':')[0] : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#10172e] border border-[#213155] rounded text-[10px] text-cyan-300 active:bg-cyan-900 cursor-pointer"
            >
              <RotateCw className="w-3 h-3 text-cyan-400" />
              <span>ROTATE FOR LANDSCAPE</span>
            </button>
            <button
              onClick={() => {
                audio.toggleMute();
              }}
              className="p-1 bg-[#10172e] border border-[#213155] rounded text-slate-300 active:text-cyan-400 cursor-pointer"
            >
              {audio.getIsMuted() ? <VolumeX className="w-3 h-3 text-pink-500" /> : <Volume2 className="w-3 h-3 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Bottom Half: Dedicated Cyber Gamepad Deck */}
        <div className="w-full flex-1 bg-gradient-to-b from-[#070b18] to-[#04060c] flex items-center justify-center relative overflow-hidden pb-safe">
          {hudPlayer && engineRef.current ? (
            <VirtualGamepad
              engine={engineRef.current}
              player={hudPlayer}
              mode="deck"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-center text-slate-500 text-xs px-4">
              <span className="text-cyan-400 font-semibold">TAP "START INFILTRATION" TO ENGAGE CONTROLS</span>
              <span className="text-[10px] text-slate-600">Gamepad deck activates during active mission</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------
  // RENDER: LANDSCAPE MODE & DESKTOP (Full Viewport Experience)
  // ---------------------------------------------------------------
  return (
    <div className="relative w-screen h-screen bg-[#05060a] overflow-hidden flex items-center justify-center select-none touch-control">
      {/* 
        Isolated Canvas Viewport:
        Using 16:9 aspect ratio and pixel-art CSS scaling 
      */}
      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] aspect-[16/9] flex items-center justify-center bg-black overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pixel-art bg-[#080912]"
        />

        {/* Optional Authentic CRT Scanline & Vignette Overlay */}
        {crtEnabled && (
          <div className="absolute inset-0 pointer-events-none z-10 crt-overlay crt-vignette" />
        )}

        {/* Landscape rotation hint if on small screen portrait */}
        <LandscapeOrientationHint />

        {/* Live In-Game World-Matched HUD */}
        {gameState === 'PLAYING' && hudPlayer && hudLevel && (
          <GameHUD
            player={hudPlayer}
            stats={hudStats}
            level={hudLevel}
            enemies={engineRef.current?.enemies || []}
            crtEnabled={crtEnabled}
            onToggleCrt={handleToggleCrt}
            onPause={() => {
              if (engineRef.current) engineRef.current.setGameState('PAUSED');
            }}
          />
        )}

        {/* On-screen touch controls in Landscape Overlay mode */}
        {gameState === 'PLAYING' && hudPlayer && engineRef.current && (
          <VirtualGamepad
            engine={engineRef.current}
            player={hudPlayer}
            mode="overlay"
          />
        )}

        {/* Title Screen Overlay */}
        {gameState === 'TITLE' && (
          <TitleScreen
            onStartGame={handleStartGame}
            crtEnabled={crtEnabled}
            onToggleCrt={handleToggleCrt}
          />
        )}

        {/* Pause Screen Overlay */}
        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={handleResume}
            onRestart={handleRestartSector}
            onQuit={handleQuitToTitle}
            crtEnabled={crtEnabled}
            onToggleCrt={handleToggleCrt}
          />
        )}

        {/* Sector Clear Overlay */}
        {gameState === 'SECTOR_CLEAR' && hudLevel && (
          <SectorClearModal
            stats={hudStats}
            currentLevel={hudLevel}
            onNextSector={handleNextSector}
          />
        )}

        {/* Game Over Screen */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            stats={hudStats}
            onRetry={handleRestartSector}
            onQuit={handleQuitToTitle}
          />
        )}

        {/* Victory Screen */}
        {gameState === 'VICTORY' && (
          <VictoryModal
            stats={hudStats}
            onPlayAgain={() => handleStartGame(0)}
          />
        )}
      </div>
    </div>
  );
}
