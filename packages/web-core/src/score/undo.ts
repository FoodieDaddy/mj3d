import type { NextPlayerStage } from '@kawuxing/protocol'

export function getUndoFrequencyDelta(undoCount: number): number {
  if (undoCount <= 1) return 0
  if (undoCount === 2) return -2
  if (undoCount === 3) return -5
  if (undoCount === 4) return -9
  return -14
}

export function getUndoProgressDelta(stage: NextPlayerStage): number | null {
  const map: Record<NextPlayerStage, number | null> = {
    beforeDraw: 0,
    drawing: -2,
    inHand: -4,
    discarded: null,
    responseWindow: null,
  }
  return map[stage]
}

export function getUndoDelta(
  undoCount: number,
  nextPlayerStage: NextPlayerStage,
): number | null {
  const base = -4
  const progressDelta = getUndoProgressDelta(nextPlayerStage)

  if (progressDelta === null) {
    return null
  }

  return base + getUndoFrequencyDelta(undoCount) + progressDelta
}
