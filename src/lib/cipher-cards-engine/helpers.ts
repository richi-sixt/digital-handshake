import { BOARD_SIZE, type CipherCardsState, type Role, type Seat, type Team } from './types'

export const TEAMS: Team[] = ['red', 'blue']

export function otherTeam(team: Team): Team {
  return team === 'red' ? 'blue' : 'red'
}

/** Pick `count` distinct random words (Fisher-Yates on a copy). */
export function pickWords(list: readonly string[], count: number = BOARD_SIZE): string[] {
  const pool = Array.from(new Set(list.map((w) => w.trim()).filter(Boolean)))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

export function getSeat(state: CipherCardsState, playerId: string): Seat | null {
  return state.seats?.[playerId] ?? null
}

export function playersOf(state: CipherCardsState, team: Team, role: Role): string[] {
  return Object.entries(state.seats ?? {})
    .filter(([, s]) => s.team === team && s.role === role)
    .map(([pid]) => pid)
}

/** Each team needs exactly one spymaster and at least one operative. */
export function canStartGame(state: CipherCardsState): boolean {
  return TEAMS.every(
    (team) =>
      playersOf(state, team, 'spymaster').length === 1 &&
      playersOf(state, team, 'operative').length >= 1,
  )
}
