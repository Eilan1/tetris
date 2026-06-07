export type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export const COLS = 10;
export const ROWS = 20;

export interface PieceState {
  type: PieceType;
  x: number;
  y: number;
  rot: number;
}

export interface GameState {
  grid: number[][];
  piece: PieceState | null;
  score: number;
  lines: number;
  level: number;
  highScore: number;
  clearingLines: number[];
  gameOver: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  showGhost: boolean;
  shakeFrames: number;
}

export const TETROMINO_SHAPES: Record<PieceType, { id: number; shapes: number[][][] }> = {
  I: { id: 1, shapes: [[[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]], [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]], [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]] },
  J: { id: 2, shapes: [[[2,0,0], [2,2,2], [0,0,0]], [[0,2,2], [0,2,0], [0,2,0]], [[0,0,0], [2,2,2], [0,0,2]], [[0,2,0], [0,2,0], [2,2,0]]] },
  L: { id: 3, shapes: [[[0,0,3], [3,3,3], [0,0,0]], [[0,3,0], [0,3,0], [0,3,3]], [[0,0,0], [3,3,3], [3,0,0]], [[3,3,0], [0,3,0], [0,3,0]]] },
  O: { id: 4, shapes: [[[4,4], [4,4]], [[4,4], [4,4]], [[4,4], [4,4]], [[4,4], [4,4]]] },
  S: { id: 5, shapes: [[[0,5,5], [5,5,0], [0,0,0]], [[0,5,0], [0,5,5], [0,0,5]], [[0,0,0], [0,5,5], [5,5,0]], [[5,0,0], [5,5,0], [0,5,0]]] },
  T: { id: 6, shapes: [[[0,6,0], [6,6,6], [0,0,0]], [[0,6,0], [0,6,6], [0,6,0]], [[0,0,0], [6,6,6], [0,6,0]], [[0,6,0], [6,6,0], [0,6,0]]] },
  Z: { id: 7, shapes: [[[7,7,0], [0,7,7], [0,0,0]], [[0,0,7], [0,7,7], [0,7,0]], [[0,0,0], [7,7,0], [0,7,7]], [[0,7,0], [7,7,0], [7,0,0]]] }
};

export const SRS_KICKS_NORMAL: Record<string, [number, number][]> = {
  '0-1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '1-0': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  '1-2': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  '2-1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '2-3': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
  '3-2': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
  '3-0': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
  '0-3': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
};

export const SRS_KICKS_I: Record<string, [number, number][]> = {
  '0-1': [[0,0], [-2,0], [1,0], [-2,1], [1,-2]],
  '1-0': [[0,0], [2,0], [-1,0], [2,-1], [-1,2]],
  '1-2': [[0,0], [-1,0], [2,0], [-1,-2], [2,1]],
  '2-1': [[0,0], [1,0], [-2,0], [1,2], [-2,-1]],
  '2-3': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
  '3-2': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
  '3-0': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
  '0-3': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
};

export const NES_PALETTES = [
  { primary: '#0058F8', secondary: '#3CBCFC' }, // 0
  { primary: '#00A800', secondary: '#B8F818' }, // 1
  { primary: '#D800CC', secondary: '#F878F8' }, // 2
  { primary: '#0058F8', secondary: '#58D854' }, // 3
  { primary: '#E40058', secondary: '#58F898' }, // 4
  { primary: '#5878F8', secondary: '#68B0D8' }, // 5
  { primary: '#F83800', secondary: '#7C7C7C' }, // 6
  { primary: '#6844FC', secondary: '#A80020' }, // 7
  { primary: '#0058F8', secondary: '#F83800' }, // 8
  { primary: '#F83800', secondary: '#FCA044' }, // 9
];

export function getBlockColor(id: number, level: number): string {
  if (id === 0) return 'transparent';
  // Diverse colors: Blue, Green, Red, Yellow, Purple
  const colors: Record<number, string> = {
    1: '#4B6CFE', // I: Blue
    2: '#3CB371', // J: Green
    3: '#FF6347', // L: Red
    4: '#FFD700', // O: Yellow
    5: '#D800CC', // S: Purple
    6: '#4B6CFE', // T: Blue
    7: '#3CB371', // Z: Green
  };
  return colors[id] || '#FFFFFF';
}

export function createEmptyGrid(): number[][] {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

export function checkCollision(grid: number[][], shape: number[][], x: number, y: number): boolean {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        const newX = x + col;
        const newY = y + row;
        // Wall boundaries
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
        // Lock boundaries
        if (newY >= 0 && grid[newY][newX] !== 0) return true;
      }
    }
  }
  return false;
}

export function getTickDelay(level: number): number {
  if (level === 0) return 48 * 16.639;
  if (level === 1) return 43 * 16.639;
  if (level === 2) return 38 * 16.639;
  if (level === 3) return 33 * 16.639;
  if (level === 4) return 28 * 16.639;
  if (level === 5) return 23 * 16.639;
  if (level === 6) return 18 * 16.639;
  if (level === 7) return 13 * 16.639;
  if (level === 8) return 8 * 16.639;
  if (level === 9) return 6 * 16.639;
  if (level >= 10 && level <= 12) return 5 * 16.639;
  if (level >= 13 && level <= 15) return 4 * 16.639;
  if (level >= 16 && level <= 18) return 3 * 16.639;
  if (level >= 19 && level <= 28) return 2 * 16.639;
  return 1 * 16.639;
}

export function getGhostY(grid: number[][], piece: PieceState): number {
  if (!piece) return 0;
  const shape = TETROMINO_SHAPES[piece.type].shapes[piece.rot];
  let newY = piece.y;
  while (!checkCollision(grid, shape, piece.x, newY + 1)) {
    newY++;
  }
  return newY;
}

