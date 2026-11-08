import { supabase } from './supabase'
import { type RealtimeChannel } from '@supabase/supabase-js'
import type { UNOGameState } from './uno-engine/types'
import type { CipherCardsState } from './cipher-cards-engine/types'

// ---- Types ----

export type AnyGameState =
  | TicTacToeState
  | MemoryGameState
  | UNOGameState
  | CipherCardsState

export interface Room {
  id: string
  code: string
  game_type: 'tic-tac-toe' | 'memory-game' | 'uno' | 'cipher-cards'
  status: 'waiting' | 'playing' | 'finished'
  players: string[]
  player_names: Record<string, string>
  host_player: string
  max_players: number
  game_state: AnyGameState
  current_turn: string | null
  winner: string | null
  created_at: string
}

export interface TicTacToeState {
  squares: (string | null)[]
}

export interface MemoryGameState {
  gridSizeId: string
  themeId: string
  cards: { id: number; itemId: string; type: 'image' | 'emoji'; content: string }[]
  flippedIndices: number[]
  matchedIndices: number[]
  scoreA: number
  scoreB: number
  moves: number
}

// ---- Player helpers (backward-compatible) ----

export function getPlayerA(room: Room): string {
  return room.players[0]
}

export function getPlayerB(room: Room): string | null {
  return room.players[1] ?? null
}

// ---- Room code generation ----

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// ---- Room CRUD ----

export async function createRoom(
  gameType: Room['game_type'],
  playerId: string,
  initialState: AnyGameState,
  maxPlayers: number = 2,
  playerName: string = '',
): Promise<Room> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateRoomCode()
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        game_type: gameType,
        players: [playerId],
        player_names: playerName ? { [playerId]: playerName } : {},
        host_player: playerId,
        max_players: maxPlayers,
        game_state: initialState,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && attempt < 2) continue
      throw error
    }
    return data as Room
  }
  throw new Error('Failed to generate unique room code')
}

export async function findRoomByCode(code: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select()
    .eq('code', code.toUpperCase())
    .single()

  if (error) return null
  return data as Room
}

export async function joinRoom(
  roomId: string,
  playerId: string,
  playerName: string = '',
): Promise<Room> {
  // Fetch current room to get existing players
  const { data: current, error: fetchError } = await supabase
    .from('rooms')
    .select()
    .eq('id', roomId)
    .single()

  if (fetchError || !current) throw fetchError ?? new Error('Room not found')

  const room = current as Room

  // Prevent duplicate joins
  if (room.players.includes(playerId)) {
    return room
  }

  const updatedPlayers = [...room.players, playerId]
  const updatedNames = { ...(room.player_names ?? {}), ...(playerName ? { [playerId]: playerName } : {}) }

  // For 2-player games, auto-start when second player joins
  const shouldAutoStart = room.max_players === 2 && updatedPlayers.length >= 2

  const update: Record<string, unknown> = {
    players: updatedPlayers,
    player_names: updatedNames,
  }

  if (shouldAutoStart) {
    update.status = 'playing'
    update.current_turn = updatedPlayers[0]
  }

  const { data, error } = await supabase
    .from('rooms')
    .update(update)
    .eq('id', roomId)
    .select()
    .single()

  if (error) throw error
  return data as Room
}

export async function startRoom(
  roomId: string,
  gameState: AnyGameState,
  currentTurn: string,
): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .update({
      status: 'playing',
      game_state: gameState,
      current_turn: currentTurn,
    })
    .eq('id', roomId)
    .select()
    .single()

  if (error) throw error
  return data as Room
}

export async function updateGameState(
  roomId: string,
  gameState: AnyGameState,
  currentTurn: string | null,
  winner: string | null = null,
  status?: Room['status'],
): Promise<void> {
  const update: Record<string, unknown> = {
    game_state: gameState,
    current_turn: currentTurn,
  }
  if (winner !== null) update.winner = winner
  if (status) update.status = status

  const { error } = await supabase
    .from('rooms')
    .update(update)
    .eq('id', roomId)

  if (error) throw error
}

// ---- Realtime subscription ----

let channelCounter = 0

export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: Room) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`room:${roomId}:${++channelCounter}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        onUpdate(payload.new as Room)
      },
    )
    .subscribe()

  return channel
}

export function unsubscribeFromRoom(channel: RealtimeChannel): void {
  supabase.removeChannel(channel)
}
