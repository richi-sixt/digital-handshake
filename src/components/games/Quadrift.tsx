'use client'

import { useEffect, useReducer, useRef, useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/i18n'
import { useHighScore } from '@/lib/high-score'
import {
  COLS,
  ROWS,
  cellsOf,
  createGame,
  ghostY,
  hardDrop,
  levelSpeed,
  move,
  offsetsOf,
  pause,
  rotate,
  softDrop,
  tick,
  togglePause,
  type PieceType,
  type QuadriftState,
} from '@/lib/quadrift-engine'

const HIGH_SCORE_KEY = 'quadrift_high_score'

type Action =
  | 'new'
  | 'left'
  | 'right'
  | 'rotate'
  | 'soft'
  | 'hard'
  | 'tick'
  | 'pause'
  | 'toggle'

// The game only exists after "Start": random pieces on the server would
// cause a hydration mismatch, and nothing should fall before the player is ready.
function reducer(
  state: QuadriftState | null,
  action: Action,
): QuadriftState | null {
  if (action === 'new') return createGame()
  if (!state) return state
  switch (action) {
    case 'left':
      return move(state, -1)
    case 'right':
      return move(state, 1)
    case 'rotate':
      return rotate(state)
    case 'soft':
      return softDrop(state)
    case 'hard':
      return hardDrop(state)
    case 'tick':
      return tick(state)
    case 'pause':
      return pause(state)
    case 'toggle':
      return togglePause(state)
  }
}

const COLORS: Record<PieceType, string> = {
  I: 'bg-cyan-500 dark:bg-cyan-600',
  O: 'bg-yellow-400 dark:bg-yellow-500',
  T: 'bg-violet-500 dark:bg-violet-600',
  S: 'bg-green-500 dark:bg-green-600',
  Z: 'bg-red-500 dark:bg-red-600',
  J: 'bg-blue-500 dark:bg-blue-600',
  L: 'bg-orange-500 dark:bg-orange-600',
}

type CellKind = PieceType | 'ghost' | null

function Block({ kind, look3d }: { kind: CellKind; look3d: boolean }) {
  return (
    <div
      className={clsx(
        'aspect-square',
        kind === null && 'bg-zinc-100 dark:bg-zinc-800/50',
        kind === 'ghost' &&
          'bg-violet-500/10 ring-1 ring-violet-400/50 ring-inset',
        kind !== null &&
          kind !== 'ghost' && [
            COLORS[kind],
            look3d
              ? 'shadow-[inset_2px_2px_0_rgba(255,255,255,0.35),inset_-2px_-2px_0_rgba(0,0,0,0.3)]'
              : 'ring-1 ring-black/10 ring-inset',
          ],
      )}
    />
  )
}

function buildCells(state: QuadriftState | null): CellKind[] {
  let cells: CellKind[] = Array<CellKind>(COLS * ROWS).fill(null)
  if (!state) return cells
  state.board.forEach((row, y) =>
    row.forEach((cell, x) => {
      cells[y * COLS + x] = cell
    }),
  )
  if (state.phase === 'over') return cells
  let gy = ghostY(state)
  for (let [x, y] of cellsOf({ ...state.piece, y: gy })) {
    if (y >= 0 && cells[y * COLS + x] === null) cells[y * COLS + x] = 'ghost'
  }
  for (let [x, y] of cellsOf(state.piece)) {
    if (y >= 0) cells[y * COLS + x] = state.piece.type
  }
  return cells
}

function NextPreview({
  type,
  look3d,
}: {
  type: PieceType | null
  look3d: boolean
}) {
  let cells: CellKind[] = Array<CellKind>(16).fill(null)
  if (type) {
    let offsets = offsetsOf(type, 0)
    let minX = Math.min(...offsets.map(([x]) => x))
    let maxX = Math.max(...offsets.map(([x]) => x))
    let minY = Math.min(...offsets.map(([, y]) => y))
    let maxY = Math.max(...offsets.map(([, y]) => y))
    let ox = Math.floor((4 - (maxX - minX + 1)) / 2)
    let oy = Math.floor((4 - (maxY - minY + 1)) / 2)
    for (let [x, y] of offsets)
      cells[(y - minY + oy) * 4 + (x - minX + ox)] = type
  }
  return (
    <div className="grid w-20 grid-cols-4 gap-px rounded-lg bg-zinc-200 p-px dark:bg-zinc-700">
      {cells.map((kind, i) => (
        <Block key={i} kind={kind} look3d={look3d} />
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-lg bg-zinc-100 px-3 py-2 text-center dark:bg-zinc-800">
      <div className="text-xs text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="text-lg font-semibold text-zinc-800 tabular-nums dark:text-zinc-200">
        {value}
      </div>
    </div>
  )
}

const PRIMARY_BUTTON =
  'rounded-md bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400 dark:bg-violet-600 dark:hover:bg-violet-500'
const SECONDARY_BUTTON =
  'rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'

export function Quadrift() {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, null)
  const [look3d, setLook3d] = useState(false)
  const [high, submitScore] = useHighScore(HIGH_SCORE_KEY)
  const boardRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<{
    x: number
    y: number
    t: number
    moved: boolean
  } | null>(null)

  const phase = state?.phase
  const level = state?.level
  const score = state?.score ?? 0

  // Gravity. The interval restarts when the level (speed) or phase changes.
  useEffect(() => {
    if (phase !== 'playing' || !level) return
    let id = setInterval(() => dispatch('tick'), levelSpeed(level))
    return () => clearInterval(id)
  }, [phase, level])

  // Keyboard, only while a game is running so the page scrolls normally otherwise.
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'paused') return
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      let action: Action | null = null
      switch (e.key) {
        case 'ArrowLeft':
          action = 'left'
          break
        case 'ArrowRight':
          action = 'right'
          break
        case 'ArrowDown':
          action = 'soft'
          break
        case 'ArrowUp':
          action = e.repeat ? null : 'rotate'
          break
        case ' ':
          action = e.repeat ? null : 'hard'
          break
        case 'p':
        case 'P':
          action = e.repeat ? null : 'toggle'
          break
      }
      if (!action) return
      e.preventDefault()
      dispatch(action)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase])

  // Pause when the player leaves the tab or window.
  useEffect(() => {
    function onBlur() {
      dispatch('pause')
    }
    function onVisibility() {
      if (document.hidden) dispatch('pause')
    }
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // Store the high score once a game is over.
  useEffect(() => {
    if (phase === 'over') submitScore(score)
  }, [phase, score, submitScore])

  // Touch gestures: horizontal drag moves, vertical drag soft-drops, tap rotates.
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse') return
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      t: Date.now(),
      moved: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    let g = gesture.current
    let board = boardRef.current
    if (!g || !board) return
    let cell = board.getBoundingClientRect().width / COLS
    while (e.clientX - g.x >= cell) {
      dispatch('right')
      g.x += cell
      g.moved = true
    }
    while (e.clientX - g.x <= -cell) {
      dispatch('left')
      g.x -= cell
      g.moved = true
    }
    while (e.clientY - g.y >= cell) {
      dispatch('soft')
      g.y += cell
      g.moved = true
    }
  }

  function onPointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    let g = gesture.current
    gesture.current = null
    if (g && e.type === 'pointerup' && !g.moved && Date.now() - g.t < 300) {
      dispatch('rotate')
    }
  }

  let cells = buildCells(state)
  let playing = phase === 'playing'
  let isNewRecord = phase === 'over' && score > 0 && score === high

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Board */}
        <div className="flex flex-col items-center">
          <div
            ref={boardRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            className="relative grid w-60 touch-none grid-cols-10 gap-px overflow-hidden rounded-xl bg-zinc-200 p-px select-none sm:w-68 dark:bg-zinc-700"
          >
            {cells.map((kind, i) => (
              <Block key={i} kind={kind} look3d={look3d} />
            ))}

            {(!state || phase === 'paused' || phase === 'over') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/85 p-4 text-center backdrop-blur-sm dark:bg-zinc-900/85">
                {phase === 'over' && (
                  <>
                    <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                      {t('quadrift.gameOver')}
                    </div>
                    <div className="text-sm text-zinc-700 dark:text-zinc-300">
                      {t('quadrift.finalScore', { score })}
                    </div>
                    {isNewRecord && (
                      <div className="rounded-lg bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        {t('quadrift.newRecord')}
                      </div>
                    )}
                  </>
                )}
                {phase === 'paused' && (
                  <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                    {t('quadrift.paused')}
                  </div>
                )}
                <button
                  type="button"
                  className={PRIMARY_BUTTON}
                  onClick={() =>
                    dispatch(phase === 'paused' ? 'toggle' : 'new')
                  }
                >
                  {phase === 'paused'
                    ? t('quadrift.resume')
                    : phase === 'over'
                      ? t('quadrift.newGame')
                      : t('quadrift.start')}
                </button>
              </div>
            )}
          </div>

          {/* On-screen controls for touch devices */}
          <div className="mt-3 grid w-60 grid-cols-5 gap-2 sm:w-68 lg:hidden">
            {(
              [
                ['left', '←', 'quadrift.left'],
                ['rotate', '↻', 'quadrift.rotate'],
                ['right', '→', 'quadrift.right'],
                ['soft', '↓', 'quadrift.down'],
                ['hard', '⤓', 'quadrift.drop'],
              ] as const
            ).map(([action, label, key]) => (
              <button
                key={action}
                type="button"
                aria-label={t(key)}
                disabled={!playing}
                onClick={() => dispatch(action)}
                className={clsx(
                  SECONDARY_BUTTON,
                  'touch-manipulation px-0 text-lg active:scale-95 disabled:opacity-40',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-row flex-wrap items-start justify-center gap-3 sm:flex-col sm:items-stretch">
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {t('quadrift.next')}
            </div>
            <NextPreview type={state?.next ?? null} look3d={look3d} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            <Stat label={t('quadrift.score')} value={score} />
            <Stat label={t('quadrift.level')} value={level ?? 1} />
            <Stat label={t('quadrift.lines')} value={state?.lines ?? 0} />
            <Stat label={t('quadrift.best')} value={high} />
          </div>
          <div className="flex flex-col gap-2">
            {(playing || phase === 'paused') && (
              <button
                type="button"
                className={SECONDARY_BUTTON}
                onClick={() => dispatch('toggle')}
              >
                {playing ? t('quadrift.pause') : t('quadrift.resume')}
              </button>
            )}
            {state && (
              <button
                type="button"
                className={SECONDARY_BUTTON}
                onClick={() => dispatch('new')}
              >
                {t('quadrift.newGame')}
              </button>
            )}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={look3d}
                onChange={(e) => setLook3d(e.target.checked)}
                className="accent-violet-500"
              />
              {t('quadrift.look3d')}
            </label>
          </div>
        </div>
      </div>

      <p className="mt-6 hidden text-center text-sm text-zinc-600 lg:block dark:text-zinc-400">
        {t('quadrift.controls')}
      </p>
      <p className="mt-6 text-center text-sm text-zinc-600 lg:hidden dark:text-zinc-400">
        {t('quadrift.touchHint')}
      </p>
    </div>
  )
}
