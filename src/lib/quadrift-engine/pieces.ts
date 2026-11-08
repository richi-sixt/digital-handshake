import type { ActivePiece, PieceType, Rotation } from './types'

export const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

// Spawn orientation of each piece, as a square matrix (1 = filled).
const MATRICES: Record<PieceType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

function rotateClockwise(m: number[][]): number[][] {
  const n = m.length
  return m.map((_, r) => m.map((__, c) => m[n - 1 - c][r]))
}

/** [dx, dy] offsets of the four filled cells, for each of the 4 rotations. */
const OFFSETS: Record<PieceType, [number, number][][]> = (() => {
  let result = {} as Record<PieceType, [number, number][][]>
  for (let type of PIECE_TYPES) {
    let matrix = MATRICES[type]
    let rotations: [number, number][][] = []
    for (let i = 0; i < 4; i++) {
      let cells: [number, number][] = []
      matrix.forEach((row, y) =>
        row.forEach((v, x) => {
          if (v) cells.push([x, y])
        }),
      )
      rotations.push(cells)
      matrix = rotateClockwise(matrix)
    }
    result[type] = rotations
  }
  return result
})()

export function pieceSize(type: PieceType): number {
  return MATRICES[type].length
}

export function offsetsOf(
  type: PieceType,
  rotation: Rotation,
): [number, number][] {
  return OFFSETS[type][rotation]
}

/** Absolute board cells [x, y] occupied by a piece. */
export function cellsOf(piece: ActivePiece): [number, number][] {
  return OFFSETS[piece.type][piece.rotation].map(([dx, dy]) => [
    piece.x + dx,
    piece.y + dy,
  ])
}
