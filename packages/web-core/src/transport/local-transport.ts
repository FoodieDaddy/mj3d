import type { ClientAction, GameEvent, GameState, GameTransport } from '@kawuxing/protocol'
import { LocalMockServer } from '../server/local-mock-server'

export class LocalTransport implements GameTransport {
  private stateCallbacks: Array<(state: GameState) => void> = []
  private eventCallbacks: Array<(event: GameEvent) => void> = []
  private server: LocalMockServer

  constructor(options?: { acceptanceMode?: boolean }) {
    this.server = new LocalMockServer(this, options)
  }

  send(action: ClientAction): void {
    this.server.handleAction(action)
  }

  onState(callback: (state: GameState) => void): void {
    this.stateCallbacks.push(callback)
  }

  onEvent(callback: (event: GameEvent) => void): void {
    this.eventCallbacks.push(callback)
  }

  disconnect(): void {
    this.stateCallbacks = []
    this.eventCallbacks = []
  }

  emitState(state: GameState): void {
    for (const cb of this.stateCallbacks) {
      cb(state)
    }
  }

  emitEvent(event: GameEvent): void {
    for (const cb of this.eventCallbacks) {
      cb(event)
    }
  }

  getServer(): LocalMockServer {
    return this.server
  }
}
