import { cellsOf, PIECE_TYPES, pieceSize } from './pieces'
import {
  COLS,
  ROWS,
  type ActivePiece,
  type Cell,
  type PieceType,
  type QuadriftState,
  type Rng,
  type Rotation,
} from './types'

// ---- Helpers ----

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
}

function shuffledBag(rng: Rng): PieceType[] {
  let bag = [...PIECE_TYPES]
  for (let i = bag.length - 1; i > 0; i--) {
    let j = Math.floor(rng() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

/** Takes the next piece out of the 7-bag, refilling it when empty. */
function draw(bag: PieceType[], rng: Rng): [PieceType, PieceType[]] {
  let rest = bag.length > 0 ? bag : shuffledBag(rng)
  return [rest[0], rest.slice(1)]
}

function spawn(type: PieceType): ActivePiece {
  return {
    type,
    rotation: 0,
    x: Math.floor((COLS - pieceSize(type)) / 2),
    y: 0,
  }
}

function collides(board: Cell[][], piece: ActivePiece): boolean {
  return cellsOf(piece).some(
    ([x, y]) =>
      x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x] !== null),
  )
}

// ---- Scoring ----

const LINE_POINTS = [0, 100, 300, 500, 800]

export function levelFor(lines: number): number {
  return 1 + Math.floor(lines / 10)
}

/** Gravity interval in milliseconds. */
export function levelSpeed(level: number): number {
  return Math.max(80, 800 - (level - 1) * 70)
}

// ---- Game flow ----

export function createGame(rng: Rng = Math.random): QuadriftState {
  let [first, bag1] = draw([], rng)
  let [next, bag2] = draw(bag1, rng)
  return {
    board: emptyBoard(),
    piece: spawn(first),
    next,
    bag: bag2,
    score: 0,
    lines: 0,
    level: 1,
    phase: 'playing',
  }
}

export function ghostY(state: QuadriftState): number {
  let piece = state.piece
  while (!collides(state.board, { ...piece, y: piece.y + 1 })) {
    piece = { ...piece, y: piece.y + 1 }
  }
  return piece.y
}

function tryPiece(state: QuadriftState, piece: ActivePiece): QuadriftState {
  if (state.phase !== 'playing' || collides(state.board, piece)) return state
  return { ...state, piece }
}

export function move(state: QuadriftState, dx: -1 | 1): QuadriftState {
  return tryPiece(state, { ...state.piece, x: state.piece.x + dx })
}

const KICKS = [0, -1, 1, -2, 2]

/** Rotates the piece, trying small horizontal kicks if it hits a wall. */
export function rotate(state: QuadriftState, dir: 1 | -1 = 1): QuadriftState {
  if (state.phase !== 'playing') return state
  let rotation = ((state.piece.rotation + dir + 4) % 4) as Rotation
  for (let kick of KICKS) {
    let candidate = { ...state.piece, rotation, x: state.piece.x + kick }
    if (!collides(state.board, candidate)) return { ...state, piece: candidate }
  }
  return state
}

/** Moves down by one row for +1 point. Does nothing when blocked (gravity locks). */
export function softDrop(state: QuadriftState): QuadriftState {
  let moved = tryPiece(state, { ...state.piece, y: state.piece.y + 1 })
  return moved === state ? state : { ...moved, score: moved.score + 1 }
}

/** Gravity step: move down, or lock the piece when it cannot move. */
export function tick(
  state: QuadriftState,
  rng: Rng = Math.random,
): QuadriftState {
  if (state.phase !== 'playing') return state
  let moved = tryPiece(state, { ...state.piece, y: state.piece.y + 1 })
  return moved === state ? lockPiece(state, rng) : moved
}

export function hardDrop(
  state: QuadriftState,
  rng: Rng = Math.random,
): QuadriftState {
  if (state.phase !== 'playing') return state
  let y = ghostY(state)
  let distance = y - state.piece.y
  return lockPiece(
    {
      ...state,
      piece: { ...state.piece, y },
      score: state.score + 2 * distance,
    },
    rng,
  )
}

export function lockPiece(
  state: QuadriftState,
  rng: Rng = Math.random,
): QuadriftState {
  let board = state.board.map((row) => [...row])
  for (let [x, y] of cellsOf(state.piece)) {
    if (y >= 0) board[y][x] = state.piece.type
  }

  let kept = board.filter((row) => row.some((cell) => cell === null))
  let cleared = ROWS - kept.length
  let nextBoard = [
    ...Array.from({ length: cleared }, () => Array<Cell>(COLS).fill(null)),
    ...kept,
  ]

  let lines = state.lines + cleared
  let level = levelFor(lines)
  // Points use the level the lines were cleared at (before levelling up).
  let score = state.score + LINE_POINTS[cleared] * state.level

  let piece = spawn(state.next)
  let [next, bag] = draw(state.bag, rng)
  let over = collides(nextBoard, piece)

  return {
    board: nextBoard,
    piece,
    next,
    bag,
    score,
    lines,
    level,
    phase: over ? 'over' : 'playing',
  }
}

export function pause(state: QuadriftState): QuadriftState {
  return state.phase === 'playing' ? { ...state, phase: 'paused' } : state
}

export function togglePause(state: QuadriftState): QuadriftState {
  if (state.phase === 'playing') return { ...state, phase: 'paused' }
  if (state.phase === 'paused') return { ...state, phase: 'playing' }
  return state
}
