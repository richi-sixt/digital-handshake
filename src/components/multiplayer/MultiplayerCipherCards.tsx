'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useTranslation, type TranslationKey } from '@/i18n'
import { GameLobby } from './GameLobby'
import {
  subscribeToRoom,
  unsubscribeFromRoom,
  type Room,
} from '@/lib/multiplayer'
import {
  clearSeat,
  endTurn,
  fetchKey,
  fetchMessages,
  giveClue,
  rematch,
  revealCard,
  sendMessage,
  setSeat,
  startGame,
} from '@/lib/cipher-cards'
import {
  WORDS_DE,
  WORDS_EN,
  canStartGame,
  getSeat,
  pickWords,
  playersOf,
  TEAMS,
  type CardColor,
  type ChatMessage,
  type CipherCardsState,
  type Key,
  type Role,
  type Team,
} from '@/lib/cipher-cards-engine'

// ---- Styling helpers ----

const TEAM_STYLES: Record<Team, { solid: string; soft: string; text: string }> = {
  red: {
    solid: 'bg-red-500 text-white',
    soft: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    text: 'text-red-600 dark:text-red-400',
  },
  blue: {
    solid: 'bg-blue-500 text-white',
    soft: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    text: 'text-blue-600 dark:text-blue-400',
  },
}

function revealedClass(color: CardColor): string {
  if (color === 'red') return 'bg-red-500 text-white'
  if (color === 'blue') return 'bg-blue-500 text-white'
  if (color === 'assassin') return 'bg-zinc-900 text-white dark:bg-black'
  return 'bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200'
}

/** Subtle hint colour for spymasters on cards that are not revealed yet. */
function keyHintClass(color: CardColor): string {
  if (color === 'red') return 'ring-2 ring-red-500'
  if (color === 'blue') return 'ring-2 ring-blue-500'
  if (color === 'assassin') return 'ring-2 ring-zinc-900 dark:ring-zinc-100'
  return 'ring-1 ring-amber-300 dark:ring-amber-700'
}

const ERROR_KEYS: Record<string, TranslationKey> = {
  spymaster_taken: 'mp.cipher.error.spymasterTaken',
  clue_on_board: 'mp.cipher.error.clueOnBoard',
  invalid_clue: 'mp.cipher.error.invalidClue',
  teams_incomplete: 'mp.cipher.error.teamsIncomplete',
}

// ---- Main component ----

export function MultiplayerCipherCards() {
  const { t, locale } = useTranslation()
  const [room, setRoom] = useState<Room | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [keyState, setKeyState] = useState<{ id: string; key: Key } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [clueWord, setClueWord] = useState('')
  const [clueCount, setClueCount] = useState(1)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const handleRoomUpdate = useCallback((updated: Room) => setRoom(updated), [])

  useEffect(() => {
    if (!room) return
    channelRef.current = subscribeToRoom(room.id, handleRoomUpdate)
    return () => {
      if (channelRef.current) {
        unsubscribeFromRoom(channelRef.current)
        channelRef.current = null
      }
    }
  }, [room?.id, handleRoomUpdate])

  const state = room?.game_state as CipherCardsState | undefined
  const phase = state?.phase
  const gameId = state?.words?.join('|') ?? ''
  const mySeat = state ? getSeat(state, playerId) : null
  const needsKey = phase === 'finished' || (phase === 'playing' && mySeat?.role === 'spymaster')

  // Fetch the key card for spymasters (and for everyone once the game is over)
  const roomId = room?.id
  const keyId = `${roomId}:${gameId}:${phase}`
  useEffect(() => {
    if (!roomId || !needsKey) return
    let cancelled = false
    fetchKey(roomId, playerId)
      .then((k) => {
        if (!cancelled) setKeyState({ id: keyId, key: k })
      })
      .catch((err) => console.error('[CipherCards] fetchKey failed:', err))
    return () => {
      cancelled = true
    }
  }, [roomId, playerId, needsKey, keyId])
  // Only use a key that belongs to the current game
  const key = needsKey && keyState?.id === keyId ? keyState.key : null

  async function run(action: () => Promise<Room>) {
    setBusy(true)
    setError(null)
    try {
      setRoom(await action())
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      const code = Object.keys(ERROR_KEYS).find((c) => message.includes(c))
      setError(code ? t(ERROR_KEYS[code]) : t('mp.cipher.error.generic'))
      console.error('[CipherCards]', err)
    } finally {
      setBusy(false)
    }
  }

  // ---- No room yet ----
  if (!room || !state) {
    return (
      <div className="flex flex-col gap-8">
        <GameLobby
          gameType="cipher-cards"
          maxPlayers={8}
          initialGameState={() => ({ phase: 'lobby', seats: {} }) as CipherCardsState}
          onRoomReady={(r, pid) => {
            setRoom(r)
            setPlayerId(pid)
          }}
        />
        <Rules defaultOpen />
      </div>
    )
  }

  const names = room.player_names ?? {}
  const nameOf = (pid: string) =>
    names[pid] || `P${room.players.indexOf(pid) + 1}`
  const isHost = room.host_player === playerId
  const teamName = (team: Team) => t(team === 'red' ? 'mp.cipher.teamRed' : 'mp.cipher.teamBlue')

  // ---- Lobby ----
  if (state.phase === 'lobby') {
    const unassigned = room.players.filter((pid) => !state.seats[pid])
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="text-center">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{t('mp.shareCodePlayers')}</div>
          <div className="mt-2 inline-block rounded-xl bg-zinc-100 px-6 py-3 font-mono text-3xl font-bold tracking-[0.3em] text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100">
            {room.code}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {TEAMS.map((team) => (
            <div
              key={team}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <h3 className={clsx('text-lg font-semibold', TEAM_STYLES[team].text)}>
                {teamName(team)}
              </h3>
              {(['spymaster', 'operative'] as Role[]).map((role) => {
                const members = playersOf(state, team, role)
                const mine = mySeat?.team === team && mySeat.role === role
                return (
                  <div key={role} className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {t(role === 'spymaster' ? 'mp.cipher.spymaster' : 'mp.cipher.operatives')}
                      </span>
                      <button
                        disabled={busy || mine}
                        onClick={() => run(() => setSeat(room.id, playerId, team, role))}
                        className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                      >
                        {t('mp.cipher.takeSeat')}
                      </button>
                    </div>
                    <div className="mt-2 flex min-h-7 flex-wrap gap-2">
                      {members.map((pid) => (
                        <span
                          key={pid}
                          className={clsx('rounded-full px-3 py-1 text-xs font-medium', TEAM_STYLES[team].soft)}
                        >
                          {nameOf(pid)}
                          {pid === playerId ? ` (${t('mp.you').replace(':', '')})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {unassigned.length > 0 && (
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {t('mp.cipher.unassigned')}: {unassigned.map(nameOf).join(', ')}
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          {mySeat && (
            <button
              disabled={busy}
              onClick={() => run(() => clearSeat(room.id, playerId))}
              className="text-sm text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              {t('mp.cipher.leaveSeat')}
            </button>
          )}
          {isHost ? (
            <>
              <button
                disabled={busy || !canStartGame(state)}
                onClick={() =>
                  run(() =>
                    startGame(room.id, playerId, pickWords(locale === 'de' ? WORDS_DE : WORDS_EN)),
                  )
                }
                className="rounded-lg bg-green-500 px-6 py-3 text-base font-medium text-white transition hover:bg-green-400 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
              >
                {t('mp.startGame')}
              </button>
              {!canStartGame(state) && (
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {t('mp.cipher.needTeams')}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('mp.cipher.waitHost')}</p>
          )}
          {error && <ErrorBox message={error} />}
        </div>

        {mySeat && (
          <TeamChat room={room} playerId={playerId} state={state} nameOf={nameOf} onRoom={setRoom} />
        )}

        <Rules defaultOpen />
      </div>
    )
  }

  // ---- Playing / finished ----
  const words = state.words ?? []
  const revealed = state.revealed ?? []
  const turn = state.turn ?? 'red'
  const finished = state.phase === 'finished'
  const clue = state.clue ?? null
  const isSpymaster = mySeat?.role === 'spymaster'
  const isActiveTeam = mySeat?.team === turn
  const canGiveClue = !finished && isSpymaster && isActiveTeam && !clue
  const canGuess = !finished && mySeat?.role === 'operative' && isActiveTeam && !!clue
  const remaining = state.remaining ?? { red: 0, blue: 0 }

  let statusText: string
  if (finished && state.winner) {
    statusText =
      state.endedBy === 'assassin'
        ? t('mp.cipher.winnerAssassin', { team: teamName(state.winner) })
        : t('mp.cipher.winner', { team: teamName(state.winner) })
  } else if (canGiveClue) {
    statusText = t('mp.cipher.giveClueHint')
  } else if (!clue) {
    statusText = t('mp.cipher.waitingClue', { team: teamName(turn) })
  } else if (canGuess) {
    statusText = t('mp.cipher.yourGuess')
  } else {
    statusText = t('mp.cipher.teamGuessing', { team: teamName(turn) })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {/* Scoreboard */}
      <div className="flex items-center justify-between gap-3">
        {TEAMS.map((team) => (
          <div
            key={team}
            className={clsx(
              'rounded-xl px-4 py-2 text-center text-sm font-semibold',
              TEAM_STYLES[team].solid,
              !finished && turn === team ? 'ring-4 ring-offset-2 ring-violet-400 dark:ring-offset-zinc-900' : 'opacity-70',
            )}
          >
            {teamName(team)}: {remaining[team]}
          </div>
        ))}
      </div>

      {/* Status and clue */}
      <div className="text-center">
        <div
          className={clsx(
            'text-lg font-semibold',
            finished && state.winner ? TEAM_STYLES[state.winner].text : 'text-zinc-800 dark:text-zinc-200',
          )}
        >
          {statusText}
        </div>
        {clue && !finished && (
          <div className="mt-2 text-base text-zinc-700 dark:text-zinc-300">
            {t('mp.cipher.clue')}: <span className="font-bold">{clue.word}</span> ({clue.count === 0 ? '0 / ∞' : clue.count})
            {' · '}
            {t('mp.cipher.guessesLeft', { n: state.guessesLeft ?? 0 })}
          </div>
        )}
        {mySeat && (
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {teamName(mySeat.team)} · {t(isSpymaster ? 'mp.cipher.spymaster' : 'mp.cipher.operatives')}
          </div>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {words.map((word, i) => {
          const color = revealed[i]
          const hint = !color && key ? key[i] : null
          return (
            <button
              key={i}
              disabled={busy || !canGuess || !!color}
              onClick={() => run(() => revealCard(room.id, playerId, i))}
              className={clsx(
                'flex aspect-[4/3] items-center justify-center rounded-lg px-1 text-center text-[11px] font-semibold leading-tight break-words transition sm:text-sm',
                color
                  ? revealedClass(color)
                  : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100',
                hint && keyHintClass(hint),
                canGuess && !color && 'hover:bg-zinc-200 dark:hover:bg-zinc-600',
                !canGuess && 'cursor-default',
              )}
            >
              {word}
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        {canGiveClue && (
          <form
            className="flex w-full max-w-md flex-wrap items-center justify-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const word = clueWord.trim()
              if (!word) return
              run(() => giveClue(room.id, playerId, word, clueCount)).then(() => setClueWord(''))
            }}
          >
            <input
              value={clueWord}
              onChange={(e) => setClueWord(e.target.value.replace(/\s/g, '').slice(0, 30))}
              placeholder={t('mp.cipher.clueWord')}
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            />
            <select
              value={clueCount}
              onChange={(e) => setClueCount(Number(e.target.value))}
              aria-label={t('mp.cipher.clueCount')}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            >
              {Array.from({ length: 10 }, (_, n) => (
                <option key={n} value={n}>
                  {n === 0 ? '0 / ∞' : n}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy || !clueWord.trim()}
              className="rounded-lg bg-violet-500 px-5 py-2.5 text-base font-medium text-white transition hover:bg-violet-400 disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-500"
            >
              {t('mp.cipher.giveClue')}
            </button>
          </form>
        )}

        {canGuess && (
          <button
            disabled={busy}
            onClick={() => run(() => endTurn(room.id, playerId))}
            className="rounded-lg bg-zinc-100 px-5 py-2.5 text-base font-medium text-zinc-700 transition hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
          >
            {t('mp.cipher.endTurn')}
          </button>
        )}

        {finished &&
          (isHost ? (
            <button
              disabled={busy}
              onClick={() => run(() => rematch(room.id, playerId))}
              className="rounded-lg bg-green-500 px-6 py-3 text-base font-medium text-white transition hover:bg-green-400 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-500"
            >
              {t('mp.cipher.rematch')}
            </button>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('mp.cipher.waitHost')}</p>
          ))}

        {error && <ErrorBox message={error} />}
      </div>

      {mySeat && (
        <TeamChat room={room} playerId={playerId} state={state} nameOf={nameOf} onRoom={setRoom} />
      )}

      <Rules />
    </div>
  )
}

// ---- Private team chat ----

const CHAT_ERROR_KEYS: Record<string, TranslationKey> = {
  chat_locked: 'mp.cipher.chat.locked',
  invalid_message: 'mp.cipher.chat.invalid',
}

/**
 * Chat that only the own team (spymaster + operatives) can read. Messages are
 * fetched via RPC; the public per-team counter in game_state tells us when.
 */
function TeamChat({
  room,
  playerId,
  state,
  nameOf,
  onRoom,
}: {
  room: Room
  playerId: string
  state: CipherCardsState
  nameOf: (pid: string) => string
  onRoom: (room: Room) => void
}) {
  const { t } = useTranslation()
  const seat = getSeat(state, playerId)
  const team = seat?.team
  const counter = team ? (state.chat?.[team] ?? 0) : 0
  const scope = `${room.id}:${team}:${state.words?.join('|') ?? ''}:${state.phase}`
  const [data, setData] = useState<{ scope: string; list: ChatMessage[] } | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!team) return
    let cancelled = false
    fetchMessages(room.id, playerId)
      .then((list) => {
        if (!cancelled) setData({ scope, list })
      })
      .catch((err) => console.error('[CipherCards] fetchMessages failed:', err))
    return () => {
      cancelled = true
    }
  }, [room.id, playerId, team, scope, counter])

  const list = data?.scope === scope ? data.list : []

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [list.length])

  if (!seat || !team) return null

  // Spymasters only read while their own team is guessing
  const locked =
    seat.role === 'spymaster' &&
    state.phase === 'playing' &&
    state.turn === team &&
    !!state.clue

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const body = text.trim()
    if (!body || locked) return
    setBusy(true)
    setError(null)
    try {
      onRoom(await sendMessage(room.id, playerId, body))
      setText('')
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      const code = Object.keys(CHAT_ERROR_KEYS).find((c) => message.includes(c))
      setError(code ? t(CHAT_ERROR_KEYS[code]) : t('mp.cipher.error.generic'))
      console.error('[CipherCards] sendMessage failed:', err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <h3 className={clsx('text-sm font-semibold', TEAM_STYLES[team].text)}>
        {t('mp.cipher.chat.title', {
          team: t(team === 'red' ? 'mp.cipher.teamRed' : 'mp.cipher.teamBlue'),
        })}
      </h3>
      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{t('mp.cipher.chat.private')}</p>

      <div
        ref={listRef}
        className="mt-3 flex max-h-48 min-h-16 flex-col gap-1.5 overflow-y-auto rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900/40"
      >
        {list.length === 0 ? (
          <span className="text-zinc-400 dark:text-zinc-500">{t('mp.cipher.chat.empty')}</span>
        ) : (
          list.map((m) => (
            <div key={m.id} className="break-words text-zinc-800 dark:text-zinc-200">
              <span className={clsx('font-semibold', m.player_id === playerId && TEAM_STYLES[team].text)}>
                {nameOf(m.player_id)}:
              </span>{' '}
              {m.text}
            </div>
          ))
        )}
      </div>

      {locked ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t('mp.cipher.chat.locked')}</p>
      ) : (
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 300))}
            placeholder={t('mp.cipher.chat.placeholder')}
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            {t('mp.cipher.chat.send')}
          </button>
        </form>
      )}
      {error && <div className="mt-2"><ErrorBox message={error} /></div>}
    </section>
  )
}

// ---- Rules / how to play ----

type Kind = 'r' | 'b' | 'n' | 'x'

/** Example key card: r = starting team (9), b = other team (8), n = neutral (7), x = assassin (1). */
const EXAMPLE_BOARD: Kind[] = [
  'r', 'n', 'b', 'b', 'r',
  'b', 'n', 'r', 'r', 'n',
  'r', 'b', 'x', 'r', 'b',
  'n', 'r', 'b', 'n', 'r',
  'b', 'r', 'n', 'b', 'n',
]

const SWATCH: Record<Kind, string> = {
  r: 'bg-red-500',
  b: 'bg-blue-500',
  n: 'bg-amber-200 dark:bg-amber-900/60',
  x: 'bg-zinc-900 dark:bg-black',
}

function Swatch({ kind, size = 'sm' }: { kind: Kind; size?: 'sm' | 'md' }) {
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded text-white',
        size === 'sm' ? 'h-5 w-5 text-[10px]' : 'h-8 w-8 text-xs sm:h-9 sm:w-9',
        SWATCH[kind],
      )}
    >
      {kind === 'x' ? '✕' : ''}
    </span>
  )
}

function MiniBoard() {
  const { t } = useTranslation()
  const legend: { kind: Kind; key: TranslationKey }[] = [
    { kind: 'r', key: 'mp.cipher.rules.legend.start' },
    { kind: 'b', key: 'mp.cipher.rules.legend.other' },
    { kind: 'n', key: 'mp.cipher.rules.legend.neutral' },
    { kind: 'x', key: 'mp.cipher.rules.legend.assassin' },
  ]
  return (
    <figure className="flex flex-col items-center gap-4 rounded-xl bg-zinc-50 p-4 sm:flex-row sm:justify-center dark:bg-zinc-900/40">
      <div className="grid grid-cols-5 gap-1.5" role="img" aria-label={t('mp.cipher.rules.boardAlt')}>
        {EXAMPLE_BOARD.map((kind, i) => (
          <Swatch key={i} kind={kind} size="md" />
        ))}
      </div>
      <figcaption className="flex flex-col gap-2 text-sm">
        {legend.map(({ kind, key }) => (
          <span key={kind} className="flex items-center gap-2">
            <Swatch kind={kind} />
            {t(key)}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

function Outcomes() {
  const { t } = useTranslation()
  const rows: { kind: Kind; key: TranslationKey }[] = [
    { kind: 'r', key: 'mp.cipher.rules.outcome.own' },
    { kind: 'n', key: 'mp.cipher.rules.outcome.neutral' },
    { kind: 'b', key: 'mp.cipher.rules.outcome.enemy' },
    { kind: 'x', key: 'mp.cipher.rules.outcome.assassin' },
  ]
  return (
    <ul className="mt-3 space-y-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/40">
      {rows.map(({ kind, key }) => (
        <li key={key} className="flex items-start gap-2">
          <Swatch kind={kind} />
          <span>{t(key)}</span>
        </li>
      ))}
    </ul>
  )
}

function RuleSection({
  title,
  items,
  children,
}: {
  title: TranslationKey
  items: TranslationKey[]
  children?: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section className="mt-5">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t(title)}</h4>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        {items.map((k) => (
          <li key={k}>{t(k)}</li>
        ))}
      </ul>
      {children}
    </section>
  )
}

function Rules({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { t } = useTranslation()
  return (
    <details
      open={defaultOpen}
      className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
    >
      <summary className="cursor-pointer text-base font-semibold text-zinc-800 dark:text-zinc-200">
        {t('mp.cipher.rules.title')}
      </summary>

      <p className="mt-3">{t('mp.cipher.rules.intro')}</p>

      <RuleSection
        title="mp.cipher.rules.setup.title"
        items={['mp.cipher.rules.setup.1', 'mp.cipher.rules.setup.2']}
      >
        <div className="mt-3">
          <MiniBoard />
        </div>
      </RuleSection>

      <RuleSection
        title="mp.cipher.rules.turn.title"
        items={['mp.cipher.rules.turn.1', 'mp.cipher.rules.turn.2']}
      >
        <Outcomes />
      </RuleSection>

      <RuleSection
        title="mp.cipher.rules.clue.title"
        items={[
          'mp.cipher.rules.clue.1',
          'mp.cipher.rules.clue.2',
          'mp.cipher.rules.clue.3',
          'mp.cipher.rules.clue.4',
          'mp.cipher.rules.clue.5',
        ]}
      />

      <RuleSection
        title="mp.cipher.rules.guess.title"
        items={['mp.cipher.rules.guess.1', 'mp.cipher.rules.guess.2', 'mp.cipher.rules.guess.3']}
      />

      <RuleSection
        title="mp.cipher.rules.end.title"
        items={['mp.cipher.rules.end.1', 'mp.cipher.rules.end.2']}
      />

      <RuleSection
        title="mp.cipher.rules.tips.title"
        items={['mp.cipher.rules.tips.1', 'mp.cipher.rules.tips.2', 'mp.cipher.rules.tips.3']}
      />

      <p className="mt-6 border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        {t('mp.cipher.rules.credit')}
      </p>
    </details>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
      {message}
    </div>
  )
}
