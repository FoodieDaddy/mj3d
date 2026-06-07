import type { ClientAction, GameEvent, GameState, GameTransport } from '@kawuxing/protocol'
import { Client } from '@stomp/stompjs'

export class SocketTransport implements GameTransport {
  private client: Client
  private stateCallbacks: Array<(state: GameState) => void> = []
  private eventCallbacks: Array<(event: GameEvent) => void> = []
  private roomId: string

  constructor(url: string, roomId: string = 'main') {
    this.roomId = roomId
    this.client = new Client({
      brokerURL: url,
      onConnect: () => {
        this.subscribe()
      },
      onDisconnect: () => {
        console.log('[SocketTransport] disconnected')
      },
      onStompError: (frame) => {
        console.error('[SocketTransport] STOMP error:', frame.headers['message'])
      },
    })
  }

  connect(): void {
    this.client.activate()
  }

  disconnect(): void {
    this.client.deactivate()
    this.stateCallbacks = []
    this.eventCallbacks = []
  }

  send(action: ClientAction): void {
    this.client.publish({
      destination: '/app/game/action',
      body: JSON.stringify(action),
    })
  }

  onState(callback: (state: GameState) => void): void {
    this.stateCallbacks.push(callback)
  }

  onEvent(callback: (event: GameEvent) => void): void {
    this.eventCallbacks.push(callback)
  }

  private subscribe(): void {
    // Subscribe to room events
    this.client.subscribe(`/topic/room/${this.roomId}`, (message) => {
      try {
        const data = JSON.parse(message.body)
        if (data.type) {
          // It's a GameEvent
          this.emitEvent(data as GameEvent)
        } else {
          // It's a GameState update
          this.emitState(data as GameState)
        }
      } catch (e) {
        console.error('[SocketTransport] parse error:', e)
      }
    })

    // Subscribe to private events
    this.client.subscribe('/user/queue/private', (message) => {
      try {
        const data = JSON.parse(message.body)
        this.emitEvent(data as GameEvent)
      } catch (e) {
        console.error('[SocketTransport] parse error:', e)
      }
    })
  }

  private emitState(state: GameState): void {
    for (const cb of this.stateCallbacks) {
      cb(state)
    }
  }

  private emitEvent(event: GameEvent): void {
    for (const cb of this.eventCallbacks) {
      cb(event)
    }
  }
}
