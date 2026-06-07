import type { ClientAction } from './actions'
import type { GameEvent } from './events'
import type { GameState } from './state'

export interface GameTransport {
  send(action: ClientAction): void
  onState(callback: (state: GameState) => void): void
  onEvent(callback: (event: GameEvent) => void): void
  disconnect(): void
}
