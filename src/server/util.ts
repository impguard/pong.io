import * as Matter from 'matter-js'

export const intersectsAt = (
  p1: Matter.Vector,
  p2: Matter.Vector,
  q1: Matter.Vector,
  q2: Matter.Vector,
): Matter.Vector | null => {
  const d = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x)

  if (d === 0) {
    return null
  }

  const u = ((q1.x - p1.x) * (q2.y - q1.y) - (q1.y - p1.y) * (q2.x - q1.x)) / d
  const v = ((q1.x - p1.x) * (p2.y - p1.y) - (q1.y - p1.y) * (p2.x - p1.x)) / d

  if (u < 0 || u > 1 || v < 0 || v > 1) {
    return null
  }

  const x = p1.x + u * (p2.x - p1.x)
  const y = p1.y + u * (p2.y - p1.y)

  return Matter.Vector.create(x, y)
}
