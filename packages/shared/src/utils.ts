export function generateId(): string {
  return crypto.randomUUID()
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
