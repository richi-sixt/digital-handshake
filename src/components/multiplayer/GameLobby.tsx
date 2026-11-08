'use client'

import { useState } from 'react'
import { getPlayerId, getPlayerName, setPlayerName } from '@/lib/player'
import { useTranslation } from '@/i18n'
import {
  createRoom,
  findRoomByCode,
  joinRoom,
  getPlayerA,
  type Room,
  type AnyGameState,
} from '@/lib/multiplayer'
import { WaitingRoom } from './WaitingRoom'

interface GameLobbyProps {
  gameType: Room['game_type']
  initialGameState: () => AnyGameState
  maxPlayers?: number
  onRoomReady: (room: Room, playerId: string) => void
}

type LobbyMode = 'choice' | 'join' | 'waiting'

export function GameLobby({
  gameType,
  initialGameState,
  maxPlayers = 2,
  onRoomReady,
}: GameLobbyProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<LobbyMode>('choice')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [waitingRoom, setWaitingRoom] = useState<Room | null>(null)
  const [playerId] = useState(() => getPlayerId())
  const [name, setName] = useState(() => getPlayerName())

  async function handleCreateRoom() {
    setIsLoading(true)
    setError(null)
    const trimmedName = name.trim()
    if (trimmedName) setPlayerName(trimmedName)
    try {
      const room = await createRoom(gameType, playerId, initialGameState(), maxPlayers, trimmedName)
      // For multi-player games (>2), let the parent handle the waiting phase
      // so it can provide onStartGame to the WaitingRoom
      if (maxPlayers > 2) {
        onRoomReady(room, playerId)
        return
      }
      setWaitingRoom(room)
      setMode('waiting')
    } catch (err) {
      setError(t('mp.error.createRoom'))
      console.error('Create room error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleJoinRoom() {
    if (code.length !== 6) {
      setError(t('mp.error.invalidCode'))
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const room = await findRoomByCode(code)
      if (!room) {
        setError(t('mp.error.roomNotFound'))
        setIsLoading(false)
        return
      }
      if (room.game_type !== gameType) {
        setError(t('mp.error.wrongGame'))
        setIsLoading(false)
        return
      }
      if (room.status !== 'waiting' || room.players.length >= room.max_players) {
        setError(t('mp.error.roomFull'))
        setIsLoading(false)
        return
      }

      // Join room (auto-starts for 2-player games)
      const trimmedName = name.trim()
      if (trimmedName) setPlayerName(trimmedName)
      const updatedRoom = await joinRoom(room.id, playerId, trimmedName)
      onRoomReady(updatedRoom, playerId)
    } catch (err) {
      setError(t('mp.error.joinFailed'))
      console.error('Join room error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  function handleRoomReady(updatedRoom: Room) {
    onRoomReady(updatedRoom, playerId)
  }

  if (mode === 'waiting' && waitingRoom) {
    return (
      <WaitingRoom
        room={waitingRoom}
        playerId={playerId}
        onRoomReady={handleRoomReady}
      />
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {/* Player name input — shown in choice and join modes */}
        {(mode === 'choice' || mode === 'join') && (
          <div className="mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder={t('mp.enterName')}
              maxLength={20}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-center text-base text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
        )}

        {mode === 'choice' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              {t('mp.multiplayer')}
            </h2>
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="rounded-lg bg-violet-500 px-6 py-3 text-base font-medium text-white transition hover:bg-violet-400 disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-500"
            >
              {isLoading ? t('mp.creating') : t('mp.newRoom')}
            </button>
            <button
              onClick={() => {
                setMode('join')
                setError(null)
              }}
              className="rounded-lg bg-zinc-100 px-6 py-3 text-base font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              {t('mp.joinRoom')}
            </button>
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              {t('mp.cleanupNotice')}
            </p>
          </div>
        )}

        {mode === 'join' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              {t('mp.joinRoom')}
            </h2>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().slice(0, 6))
                setError(null)
              }}
              placeholder={t('mp.enterCode')}
              maxLength={6}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.2em] text-zinc-900 placeholder:text-zinc-400 placeholder:tracking-normal placeholder:text-base placeholder:font-normal focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              autoFocus
            />
            <button
              onClick={handleJoinRoom}
              disabled={isLoading || code.length !== 6}
              className="rounded-lg bg-violet-500 px-6 py-3 text-base font-medium text-white transition hover:bg-violet-400 disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-500"
            >
              {isLoading ? t('mp.joining') : t('mp.join')}
            </button>
            <button
              onClick={() => {
                setMode('choice')
                setCode('')
                setError(null)
              }}
              className="text-sm text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              {t('mp.back')}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
