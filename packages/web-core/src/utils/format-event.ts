import type { GameEvent, PlayerState, Tile } from '@kawuxing/protocol'

function suitLabel(suit: Tile['suit']): string {
  switch (suit) {
    case 'wan': return '万'
    case 'tiao': return '条'
    case 'tong': return '筒'
  }
}

function tileName(tile: Tile): string {
  return `${tile.value}${suitLabel(tile.suit)}`
}

function playerName(playerId: string, players: PlayerState[], myPlayerId: string): string {
  if (playerId === myPlayerId) return '你'
  return players.find(p => p.playerId === playerId)?.playerName ?? playerId
}

export function formatGameEvent(event: GameEvent, players: PlayerState[], myPlayerId: string): string {
  const name = (id: string) => playerName(id, players, myPlayerId)

  switch (event.type) {
    case 'PLAYER_JOINED': return `${name(event.playerId)} 加入`
    case 'PLAYER_LEFT': return `${name(event.playerId)} 离开`
    case 'BOT_FILLED': return `${name(event.playerId)} 补位`
    case 'TILE_DRAWN': return event.playerId === myPlayerId ? '你 摸了一张牌' : `${name(event.playerId)} 摸牌`
    case 'ADVANCED_TILE_PEEKED': return `${name(event.playerId)} 看了提前拿的牌，行为分 -2`
    case 'TILE_LEAKED': return `你看到了${name(event.playerId)}漏出的牌`
    case 'TILE_PUT_IN_HAND': return `${name(event.playerId)} 放入手牌`
    case 'TILE_DISCARDED': {
      const tile = players.flatMap(p => p.discardedTiles).find(t => t.id === event.tileId)
      const label = tile ? tileName(tile) : event.tileId
      return `${name(event.playerId)} 打出 ${label}`
    }
    case 'UNDO_REQUESTED': return `${name(event.playerId)} 请求撤回`
    case 'UNDO_ACCEPTED': return `${name(event.playerId)} 撤回成功`
    case 'UNDO_DENIED': return `${name(event.playerId)} 撤回被拒`
    case 'BEHAVIOR_SCORE_CHANGED': return `${name(event.playerId)} 行为分 ${event.delta > 0 ? '+' : ''}${event.delta}`
    case 'PLAYER_URGED': return `${name(event.playerId)} 催促了${name(event.targetPlayerId)}`
    case 'HAND_SHOWN': return `${name(event.playerId)} 亮牌`
    case 'WIN_DECLARED': return `${name(event.playerId)} 胡牌！`
    case 'RESPONSE_WINDOW_OPENED': return `等待响应...`
    case 'RESPONSE_WINDOW_CLOSED': return event.pongPlayerId ? `${name(event.pongPlayerId)} 碰牌！` : `无人碰牌`
  }
}
