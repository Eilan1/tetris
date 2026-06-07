/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import useTetris from '@/src/hooks/useTetris';
import TetrisBoard from '@/src/components/TetrisBoard';
import DisplayPanel from '@/src/components/DisplayPanel';
import ControlsOverlay from '@/src/components/ControlsOverlay';
import { audio } from '@/src/lib/audio';

export default function App() {
  const { state, startGame, movePiece, dropPiece, hardDrop, rotatePiece, toggleGhost, togglePause } = useTetris();
  
  const activeKeys = useRef<Set<string>>(new Set());
  const actionTimers = useRef<Record<string, { timer: number, interval: number }>>({});

  const startAction = (action: string, fn: () => void, initialDelay: number, repeatDelay: number) => {
    if (!actionTimers.current[action]) {
      audio.init();
      fn();
      actionTimers.current[action] = {
        timer: window.setTimeout(() => {
          if (actionTimers.current[action]) {
            actionTimers.current[action].interval = window.setInterval(() => {
              fn();
            }, repeatDelay);
          }
        }, initialDelay),
        interval: 0
      };
    }
  };

  const stopAction = (action: string) => {
    if (actionTimers.current[action]) {
      clearTimeout(actionTimers.current[action].timer);
      clearInterval(actionTimers.current[action].interval);
      delete actionTimers.current[action];
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling for gameplay keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      // Attempt to init audio on any key press
      audio.init();
      
      if (e.repeat) return; // We handle repeat ourselves
      activeKeys.current.add(e.key);

      if (e.key.toLowerCase() === 'p') togglePause();
      if (e.key.toLowerCase() === 'u') toggleGhost();
      if (e.key.toLowerCase() === 'y') audio.toggleMusic();

      if (!state.isPlaying || state.gameOver || state.isPaused) return;

      switch(e.key) {
        case 'ArrowLeft': 
        case 'a': 
        case 'A': 
          startAction('left', () => movePiece(-1), 267, 100);
          break;
        case 'ArrowRight': 
        case 'd': 
        case 'D': 
          startAction('right', () => movePiece(1), 267, 100);
          break;
        case 'ArrowDown': 
        case 's': 
        case 'S': 
          startAction('down', dropPiece, 50, 33);
          break;
        case 'ArrowUp': 
        case 'w': 
        case 'W': 
          rotatePiece(); 
          break;
        case ' ': 
          startAction('harddrop', hardDrop, 500, 500); 
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.current.delete(e.key);
      
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
        stopAction('left');
        // If the other direction is still held, switch to it
        if (activeKeys.current.has('ArrowRight') || activeKeys.current.has('d') || activeKeys.current.has('D')) {
           startAction('right', () => movePiece(1), 267, 100);
        }
      } else if (['ArrowRight', 'd', 'D'].includes(e.key)) {
        stopAction('right');
        if (activeKeys.current.has('ArrowLeft') || activeKeys.current.has('a') || activeKeys.current.has('A')) {
           startAction('left', () => movePiece(-1), 267, 100);
        }
      } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
        stopAction('down');
      } else if (e.key === ' ') {
        stopAction('harddrop');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      Object.values(actionTimers.current).forEach(({ timer, interval }) => {
        clearTimeout(timer);
        clearInterval(interval);
      });
      actionTimers.current = {};
    };
  }, [state.isPlaying, state.gameOver, state.isPaused, movePiece, dropPiece, hardDrop, rotatePiece, toggleGhost, togglePause]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center safe-area-pt overflow-hidden">
      <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center md:gap-14 lg:gap-24 w-full max-w-[1400px] px-2 h-full max-h-[1000px] py-2 md:py-10">
        
        {/* Left Side: Stats */}
        <div className="hidden md:flex flex-col w-[320px] shrink-0 justify-center">
           <DisplayPanel score={state.score} lines={state.lines} level={state.level} highScore={state.highScore} />
        </div>

        {/* Center: Board */}
        <div className="relative h-full max-h-[65vh] md:max-h-full w-auto aspect-[10/20] flex items-center justify-center shrink-0">
            {/* Top Stats for Mobile */}
            <div className="md:hidden absolute -top-[54px] left-0 right-0 flex justify-between px-4 py-3 bg-black border-[3px] border-white z-20">
                <div className="text-white text-[16px] font-bold">SCORE: <span className="text-white/80">{state.score.toString().padStart(6,'0')}</span></div>
                <div className="text-white text-[16px] font-bold text-yellow-400">HI: <span className="text-white/80">{state.highScore.toString().padStart(6,'0')}</span></div>
            </div>

            <TetrisBoard state={state} />

            {/* Overlay for Game Over / Start */}
            {(!state.isPlaying || state.gameOver) && (
              <div className="absolute inset-2 bg-black/95 flex flex-col items-center justify-center z-20 text-white p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] border-[6px] border-white">
                {state.gameOver && <h1 className="text-5xl text-white font-bold mb-8 drop-shadow-md text-center leading-tight">GAME<br/>OVER</h1>}
                <button 
                  onClick={startGame}
                  className="bg-transparent border-[6px] border-white text-white px-8 py-5 font-bold text-3xl hover:bg-white hover:text-black active:translate-y-[3px] uppercase select-none outline-none transition-colors"
                >
                  {state.gameOver ? 'RETRY' : 'START'}
                </button>
              </div>
            )}
        </div>

        {/* Right Side Controls for Desktop & Mobile Overlay */}
        <div className="flex w-full md:w-[320px] shrink-0 mt-auto md:mt-0 md:items-center justify-center pb-safe-offset-4 pointer-events-auto">
           <ControlsOverlay 
             onStartAction={startAction}
             onStopAction={stopAction}
             onMove={movePiece} 
             onDrop={dropPiece} 
             onHardDrop={hardDrop} 
             onRotate={rotatePiece} 
             className="md:hidden flex-row mt-4"
           />
           <div className="hidden md:flex flex-col items-center gap-10">
              {/* Desktop rendering of controls to match requested layout visually */}
              <ControlsOverlay 
               onStartAction={startAction}
               onStopAction={stopAction}
               onMove={movePiece} 
               onDrop={dropPiece} 
               onHardDrop={hardDrop} 
               onRotate={rotatePiece} 
               className="flex-col !gap-12"
             />
           </div>
        </div>

      </div>
    </div>
  );
}
