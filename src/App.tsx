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
    // Enter fullscreen on the user's first explicit play gesture where supported.
    const root = document.documentElement;
    if (!document.fullscreenElement && root.requestFullscreen) {
      root.requestFullscreen().then(() => {
        const orientation = (screen as Screen & { orientation?: ScreenOrientation }).orientation;
        if (orientation && 'lock' in orientation) {
          (orientation as ScreenOrientation & { lock?: (value: string) => Promise<void> }).lock?.('landscape').catch(() => {});
        }
      }).catch(() => {});
    }
    if (engineRef.current) engineRef.current.startRun(sectorIndex);
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
  // RENDER: LANDSCAPE MODE & DESKTOP (Full Viewport Experience)
  // ---------------------------------------------------------------
  return (
    <div className="fixed inset-0 w-[100dvw] h-[100dvh] bg-[#05060a] overflow-hidden flex items-center justify-center select-none touch-control">
      {/* 
        Isolated Canvas Viewport:
        Using 16:9 aspect ratio and pixel-art CSS scaling 
      */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#080912] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-fill pixel-art bg-[#080912]"
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
