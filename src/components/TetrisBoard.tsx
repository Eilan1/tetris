import React, { useEffect, useRef, useState } from 'react';
import { GameState, getBlockColor, TETROMINO_SHAPES, COLS, ROWS, getGhostY } from '@/src/lib/tetrisUtils';

interface Props {
  state: GameState;
}

export default function TetrisBoard({ state }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (state.shakeFrames > 0) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 200);
      return () => clearTimeout(t);
    }
  }, [state.shakeFrames]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const blockW = canvas.width / COLS;
    const blockH = canvas.height / ROWS;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawBlock = (x: number, y: number, colorId: number) => {
      const px = x * blockW;
      const py = y * blockH;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(px, py, blockW, blockH);

      const innerX = px + 2;
      const innerY = py + 2;
      const innerW = blockW - 4;
      const innerH = blockH - 4;

      ctx.fillStyle = getBlockColor(colorId, state.level);
      ctx.fillRect(innerX, innerY, innerW, innerH);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(innerX + innerW, innerY);
      ctx.lineTo(innerX + innerW - 3, innerY + 3);
      ctx.lineTo(innerX + 3, innerY + 3);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(innerX + 3, innerY + 3);
      ctx.lineTo(innerX + 3, innerY + innerH - 3);
      ctx.lineTo(innerX, innerY + innerH);
      ctx.fill();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.moveTo(innerX, innerY + innerH);
      ctx.lineTo(innerX + 3, innerY + innerH - 3);
      ctx.lineTo(innerX + innerW - 3, innerY + innerH - 3);
      ctx.lineTo(innerX + innerW, innerY + innerH);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(innerX + innerW, innerY);
      ctx.lineTo(innerX + innerW - 3, innerY + 3);
      ctx.lineTo(innerX + innerW - 3, innerY + innerH - 3);
      ctx.lineTo(innerX + innerW, innerY + innerH);
      ctx.fill();
    };

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = state.grid[r][c];
        const isClearing = state.clearingLines.includes(r);
        
        if (isClearing) {
           ctx.fillStyle = '#FFFFFF';
           ctx.fillRect(c * blockW, r * blockH, blockW, blockH);
        } else if (cell !== 0) {
          drawBlock(c, r, cell);
        } else {
           ctx.strokeStyle = 'rgba(255,255,255,0.05)';
           ctx.lineWidth = 1;
           ctx.strokeRect(c * blockW, r * blockH, blockW, blockH);
        }
      }
    }

    if (state.piece) {
      const shape = TETROMINO_SHAPES[state.piece.type].shapes[state.piece.rot];
      
      // Draw Ghost Piece
      if (state.showGhost) {
        const ghostY = getGhostY(state.grid, state.piece);
        ctx.globalAlpha = 0.2;
        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
              const py = ghostY + r;
              const px = state.piece.x + c;
              if (py >= 0 && py < ROWS) {
                drawBlock(px, py, shape[r][c]);
              }
            }
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // Draw Active Piece
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
             const py = state.piece.y + r;
             const px = state.piece.x + c;
             if (py >= 0 && py < ROWS) {
                drawBlock(px, py, shape[r][c]);
             }
          }
        }
      }
    }
  }, [state]);

  return (
    <div className={`relative aspect-[10/20] w-full max-w-[480px] bg-black border-[16px] border-[#1a1a1a] shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ${shake ? 'shake-anim' : ''}`}>
       <canvas 
          ref={canvasRef}
          width={400}
          height={800}
          className="w-full h-full block flex-1"
       />

       {state.isPaused && !state.gameOver && (
         <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
           <h2 className="text-white text-4xl font-bold tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">PAUSED</h2>
         </div>
       )}
    </div>
  );
}
