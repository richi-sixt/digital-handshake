export type Team = 'red' | 'blue'
export type Role = 'spymaster' | 'operative'
export type CardColor = Team | 'neutral' | 'assassin'
export type Phase = 'lobby' | 'playing' | 'finished'

export const BOARD_SIZE = 25

export interface Seat {
  team: Team
  role: Role
}

export interface Clue {
  word: string
  count: number
}

/**
 * Public game state, stored in rooms.game_state. It never contains the key
 * card: unrevealed cards are `null`. The key lives in the private table
 * `cipher_keys` and is only readable by spymasters via the cc_get_key RPC.
 */
export interface CipherCardsState {
  phase: Phase
  seats: Record<string, Seat>
  words?: string[]
  revealed?: (CardColor | null)[]
  turn?: Team
  startTeam?: Team
  clue?: Clue | null
  guessesLeft?: number
  remaining?: Record<Team, number>
  winner?: Team | null
  endedBy?: 'cards' | 'assassin' | null
  /** Public message counters per team. Contents are private, see cc_get_messages. */
  chat?: Partial<Record<Team, number>>
}

export interface ChatMessage {
  id: number
  player_id: string
  text: string
  created_at: string
}

export type Key = CardColor[]
