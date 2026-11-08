import { nanoid } from 'nanoid'
import { supabase } from './supabase'
import type { Room } from './multiplayer'
import type { ChatMessage, Key, Role, Team } from './cipher-cards-engine/types'

const SEAT_TOKEN_KEY = 'cipher_cards_seat_token'

/**
 * Secret per browser. Only its SHA-256 hash is stored in the database; the RPCs
 * use it to make sure nobody can act as another player.
 */
function getSeatToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem(SEAT_TOKEN_KEY)
  if (!token) {
    token = nanoid(32)
    localStorage.setItem(SEAT_TOKEN_KEY, token)
  }
  return token
}

async function rpcRoom(
  fn: string,
  roomId: string,
  playerId: string,
  args: Record<string, unknown> = {},
): Promise<Room> {
  const { data, error } = await supabase.rpc(fn, {
    p_room: roomId,
    p_player: playerId,
    p_token: getSeatToken(),
    ...args,
  })
  if (error) throw new Error(error.message)
  return data as Room
}

export const setSeat = (roomId: string, playerId: string, team: Team, role: Role) =>
  rpcRoom('cc_set_seat', roomId, playerId, { p_team: team, p_role: role })

export const clearSeat = (roomId: string, playerId: string) =>
  rpcRoom('cc_clear_seat', roomId, playerId)

export const startGame = (roomId: string, playerId: string, words: string[]) =>
  rpcRoom('cc_start', roomId, playerId, { p_words: words })

export const giveClue = (roomId: string, playerId: string, word: string, count: number) =>
  rpcRoom('cc_give_clue', roomId, playerId, { p_word: word, p_count: count })

export const revealCard = (roomId: string, playerId: string, index: number) =>
  rpcRoom('cc_reveal', roomId, playerId, { p_index: index })

export const endTurn = (roomId: string, playerId: string) =>
  rpcRoom('cc_end_turn', roomId, playerId)

export const rematch = (roomId: string, playerId: string) =>
  rpcRoom('cc_rematch', roomId, playerId)

export const sendMessage = (roomId: string, playerId: string, text: string) =>
  rpcRoom('cc_send_message', roomId, playerId, { p_text: text })

export async function fetchMessages(roomId: string, playerId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase.rpc('cc_get_messages', {
    p_room: roomId,
    p_player: playerId,
    p_token: getSeatToken(),
  })
  if (error) throw new Error(error.message)
  return data as ChatMessage[]
}

export async function fetchKey(roomId: string, playerId: string): Promise<Key> {
  const { data, error } = await supabase.rpc('cc_get_key', {
    p_room: roomId,
    p_player: playerId,
    p_token: getSeatToken(),
  })
  if (error) throw new Error(error.message)
  return data as Key
}
