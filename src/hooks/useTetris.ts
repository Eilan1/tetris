import { useState, useEffect, useCallback, useRef } from 'react';
import {
  COLS, ROWS, PieceType, TETROMINO_SHAPES,
  createEmptyGrid, checkCollision, getTickDelay,
  SRS_KICKS_NORMAL, SRS_KICKS_I, GameState
} from '@/src/lib/tetrisUtils';
import { audio } from '@/src/lib/audio';

const getInitialHighScore = () => {
  try { return parseInt(localStorage.getItem('tetris_highscore') || '0', 10); } 
  catch (e) { return 0; }
};

const initialState: GameState = {
  grid: createEmptyGrid(),
  piece: null,
  score: 0,
  lines: 0,
  level: 0,
  highScore: getInitialHighScore(),
  clearingLines: [],
  gameOver: false,
  isPlaying: false,
  isPaused: false,
  showGhost: false,
  shakeFrames: 0
};

export default function useTetris() {
  const [state, setState] = useState<GameState>(initialState);
  
  // Real-time access to state for handlers running across intervals
  const stateRef = useRef(state);
  stateRef.current = state;
  
  const bagRef = useRef<PieceType[]>([]);

  const getNextPieceType = useCallback(() => {
    if (bagRef.current.length === 0) {
      const newBag: PieceType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
      for (let i = newBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
      }
      bagRef.current = newBag;
    }
    return bagRef.current.pop()!;
  }, []);

  const spawnNextPiece = useCallback((grid: number[][], currentScore: number, currentLines: number, currentLevel: number, currentHighScore: number) => {
    const type = getNextPieceType();
    const nextShape = TETROMINO_SHAPES[type].shapes[0];
    const x = Math.floor((COLS - nextShape[0].length) / 2);
    const y = 0;

    let isGameOver = false;
    if (checkCollision(grid, nextShape, x, y)) {
      isGameOver = true;
      audio.playGameOver();
    }

    setState(prev => ({
      ...prev,
      grid,
      lines: currentLines,
      level: currentLevel,
      score: currentScore,
      highScore: currentHighScore,
      clearingLines: [],
      piece: isGameOver ? null : { type, x, y, rot: 0 },
      gameOver: isGameOver,
      isPlaying: !isGameOver
    }));
  }, [getNextPieceType]);

  const lockPiece = useCallback(() => {
    const s = stateRef.current;
    if (!s.piece) return;

    const newGrid = s.grid.map(row => [...row]);
    const shape = TETROMINO_SHAPES[s.piece.type].shapes[s.piece.rot];

    // Stamp piece to map
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const py = s.piece.y + r;
          const px = s.piece.x + c;
          if (py >= 0 && py < ROWS) {
            newGrid[py][px] = shape[r][c];
          }
        }
      }
    }

    // Identify full lines
    const fullRows: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (newGrid[r].every(cell => cell !== 0)) {
        fullRows.push(r);
      }
    }

    if (fullRows.length > 0) {
      if (fullRows.length === 4) audio.playTetris();
      else audio.playClear();

      // Trigger clear animation state
      setState(prev => ({ ...prev, grid: newGrid, piece: null, clearingLines: fullRows, shakeFrames: prev.shakeFrames + 1 }));

      setTimeout(() => {
        const finalGrid = newGrid.filter((_, idx) => !fullRows.includes(idx));
        for (let i = 0; i < fullRows.length; i++) {
          finalGrid.unshift(new Array(COLS).fill(0));
        }

        const newLines = s.lines + fullRows.length;
        const newLevel = Math.floor(newLines / 10);
        const base = [0, 40, 100, 300, 1200][fullRows.length] || 0;
        const newScore = s.score + base * (s.level + 1);
        const newHighScore = Math.max(s.highScore, newScore);
        
        if (newHighScore > s.highScore) {
          localStorage.setItem('tetris_highscore', newHighScore.toString());
        }

        spawnNextPiece(finalGrid, newScore, newLines, newLevel, newHighScore);
      }, 300);

    } else {
      audio.playLock();
      spawnNextPiece(newGrid, s.score, s.lines, s.level, s.highScore);
    }

  }, [spawnNextPiece]);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying || s.gameOver || !s.piece || s.clearingLines.length > 0) return;

    const shape = TETROMINO_SHAPES[s.piece.type].shapes[s.piece.rot];
    if (!checkCollision(s.grid, shape, s.piece.x, s.piece.y + 1)) {
      setState(prev => ({ ...prev, piece: { ...prev.piece!, y: prev.piece!.y + 1 } }));
    } else {
      lockPiece();
    }
  }, [lockPiece]);

  const movePiece = useCallback((dx: number) => {
    const s = stateRef.current;
    if (!s.isPlaying || s.gameOver || s.isPaused || !s.piece || s.clearingLines.length > 0) return;

    const shape = TETROMINO_SHAPES[s.piece.type].shapes[s.piece.rot];
    if (!checkCollision(s.grid, shape, s.piece.x + dx, s.piece.y)) {
      audio.playMove();
      setState(prev => prev.piece ? { ...prev, piece: { ...prev.piece, x: prev.piece.x + dx } } : prev);
    }
  }, []);

  const dropPiece = useCallback(() => {
    const s = stateRef.current;
    if (s.clearingLines.length > 0 || s.isPaused) return;
    
    if (s.isPlaying && !s.gameOver && s.piece) {
       const shape = TETROMINO_SHAPES[s.piece.type].shapes[s.piece.rot];
       if (!checkCollision(s.grid, shape, s.piece.x, s.piece.y + 1)) {
         audio.playMove();
       }
    }

    tick();
  }, [tick]);

  const hardDrop = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying || s.gameOver || s.isPaused || !s.piece || s.clearingLines.length > 0) return;

    const shape = TETROMINO_SHAPES[s.piece.type].shapes[s.piece.rot];
    let newY = s.piece.y;
    let dropped = false;
    
    while (!checkCollision(s.grid, shape, s.piece.x, newY + 1)) {
      newY++;
      dropped = true;
    }

    stateRef.current = { 
        ...s, 
        shakeFrames: dropped ? s.shakeFrames + 1 : s.shakeFrames,
        piece: { ...s.piece, y: newY }, 
    };
    
    lockPiece();
  }, [lockPiece]);

  const rotatePiece = useCallback((dir: number = 1) => {
    const s = stateRef.current;
    if (!s.isPlaying || s.gameOver || s.isPaused || !s.piece || s.clearingLines.length > 0) return;

    const p = s.piece;
    if (p.type === 'O') return; 

    const newRot = (p.rot + dir + 4) % 4;
    const testShape = TETROMINO_SHAPES[p.type].shapes[newRot];

    let kicks: [number, number][] = [[0, 0]];
    const kickKey = `${p.rot}-${newRot}`;
    
    if (p.type === 'I') {
      if (SRS_KICKS_I[kickKey]) kicks = SRS_KICKS_I[kickKey];
    } else {
      if (SRS_KICKS_NORMAL[kickKey]) kicks = SRS_KICKS_NORMAL[kickKey];
    }

    for (let i = 0; i < kicks.length; i++) {
      const [dx, dy] = kicks[i];
      if (!checkCollision(s.grid, testShape, p.x + dx, p.y + dy)) {
        audio.playRotate();
        setState(prev => prev.piece ? { ...prev, piece: { ...prev.piece, rot: newRot, x: p.x + dx, y: p.y + dy } } : prev);
        return;
      }
    }
  }, []);

  const toggleGhost = useCallback(() => {
    setState(prev => ({ ...prev, showGhost: !prev.showGhost }));
  }, []);

  const togglePause = useCallback(() => {
    setState(prev => {
      if (!prev.isPlaying || prev.gameOver) return prev;
      return { ...prev, isPaused: !prev.isPaused };
    });
  }, []);

  const startGame = useCallback(() => {
    audio.init();
    bagRef.current = [];
    const type = getNextPieceType();
    const shape = TETROMINO_SHAPES[type].shapes[0];
    const x = Math.floor((COLS - shape[0].length) / 2);
    
    setState({
      ...initialState,
      highScore: getInitialHighScore(),
      isPlaying: true,
      piece: { type, x, y: 0, rot: 0 } // Keeps inherited ghost toggle if we wanted, but initialState resets it. We can restore ghost state:
    });
    // Restore ghost state
    setState(prev => ({ ...prev, showGhost: stateRef.current.showGhost }));
  }, [getNextPieceType]);

  useEffect(() => {
    if (!state.isPlaying || state.gameOver || state.isPaused || state.clearingLines.length > 0) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const loop = () => {
      // Decrease shakeframes inside loop or component? If we want a timer, it's easier to handle CSS animation for shake.
      tick();
      timeoutId = setTimeout(loop, getTickDelay(stateRef.current.level));
    };

    timeoutId = setTimeout(loop, getTickDelay(state.level));

    return () => clearTimeout(timeoutId);
  }, [state.isPlaying, state.gameOver, state.isPaused, state.clearingLines.length, state.level, tick]);

  return { state, startGame, movePiece, dropPiece, hardDrop, rotatePiece, toggleGhost, togglePause };
}
