let guestCounter = 0
let gameCounter = 0

export function createGuestId(): string {
  guestCounter++
  return `guest_${String(guestCounter).padStart(3, '0')}`
}

export function createBotId(index: number): string {
  return `bot_${String(index).padStart(3, '0')}`
}

export function createGameId(): string {
  gameCounter++
  return `game_${String(gameCounter).padStart(6, '0')}`
}
