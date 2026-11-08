export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
export type Cell = PieceType | null
export type Phase = 'playing' | 'paused' | 'over'
export type Rotation = 0 | 1 | 2 | 3
export type Rng = () => number

export const COLS = 10
export const ROWS = 20

export interface ActivePiece {
  type: PieceType
  rotation: Rotation
  /** Column of the piece's bounding box (left edge). */
  x: number
  /** Row of the piece's bounding box (top edge). */
  y: number
}

export interface QuadriftState {
  /** ROWS x COLS, row 0 is the top. */
  board: Cell[][]
  piece: ActivePiece
  next: PieceType
  /** Remaining pieces of the current 7-bag. */
  bag: PieceType[]
  score: number
  lines: number
  level: number
  phase: Phase
}
