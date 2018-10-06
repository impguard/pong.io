import * as Matter from 'matter-js'
import * as _ from 'lodash'
import {
  State,
  Player,
  Flipper,
  Input,
  FlipperState,
  FlipperType,
} from './interface'

const { CHARGE, SWING, READY, RESET } = FlipperState
interface Velocities {linear: Matter.Vector, angular: number}

export const input = (state: State, player: Player, input: Input) => {
  const velocity = solvePlayer(state, player, input.horizontal)

  const lvelocities = solveFlipper(state, player.lflipper, input.lswing)
  const rvelocities = solveFlipper(state, player.rflipper, input.rswing)

  resolvePaddleVelocity(player.paddle, velocity)
  resolveFlipperVelocity(player.lflipper, velocity, lvelocities)
  resolveFlipperVelocity(player.rflipper, velocity, rvelocities)
}

const solvePlayer = (state: State, player: Player, horizontal: number) => {
  const speed = state.config.player.speed * state.config.delta

  const direction = Matter.Vector.mult(player.right, horizontal)
  const velocity = Matter.Vector.mult(direction, speed)

  Matter.Composite.translate(player.composite, velocity)

  return velocity
}

const resolvePaddleVelocity = (
  paddle: Matter.Body,
  velocity: Matter.Vector,
) => {
  Matter.Body.setVelocity(paddle, velocity)
}

const resolveFlipperVelocity = (
  flipper: Flipper,
  velocity: Matter.Vector,
  velocities: Velocities,
) => {
  Matter.Body.setVelocity(flipper.body, Matter.Vector.add(
    velocity, velocities.linear,
  ))
  Matter.Body.setAngularVelocity(flipper.body, velocities.angular)
}

/****************************************
 * Angle Transform Helpers
 ****************************************/

const RAD_TO_DEG = 180 / Math.PI

const toWorldAngle = (flipper: Flipper, angle: number) => {
  const radianAngle = angle / RAD_TO_DEG
  const flippedAngle = flipper.type === FlipperType.RIGHT ? radianAngle : -radianAngle
  return flipper.baseAngle + flippedAngle
}

const toLocalAngle = (flipper: Flipper, angle: number) => {
  const moduloAngle = ((angle - flipper.baseAngle) * RAD_TO_DEG) % 360
  const normalAngle =
      moduloAngle > 180
    ? moduloAngle - 360
    : moduloAngle < -180
    ? moduloAngle + 360
    : moduloAngle

  return flipper.type === FlipperType.RIGHT ? normalAngle : - normalAngle
}

/****************************************
 * State Update Handlers
 ****************************************/

type Handler = (state: State, flipper: Flipper) => number

const charge: Handler = (state, flipper) => {
  const angle = toLocalAngle(flipper, flipper.body.angle)

  const delta = state.config.flipper.charge.speed * state.config.delta
  const basisAngle = angle - delta
  const clampAngle = _.clamp(basisAngle, state.config.flipper.charge.angle, 0)

  return clampAngle
}

const swing: Handler = (state, flipper) => {
  const angle = toLocalAngle(flipper, flipper.body.angle)

  const delta = state.config.flipper.swing.speed * state.config.delta
  const basisAngle = angle + delta

  const clampAngle = _.clamp(
    basisAngle,
    state.config.flipper.charge.angle,
    state.config.flipper.swing.angle,
  )

  if (clampAngle === state.config.flipper.swing.angle) {
    flipper.state = RESET
  }

  return clampAngle
}

const reset: Handler = (state, flipper) => {
  const angle = toLocalAngle(flipper, flipper.body.angle)

  const delta = state.config.flipper.reset.speed * state.config.delta
  const basisAngle = angle - delta
  const clampAngle = _.clamp(basisAngle, 0, state.config.flipper.swing.angle)

  if (clampAngle === 0) {
    flipper.state = READY
  }

  return clampAngle
}

const handlers = {
  [CHARGE]: charge,
  [SWING]: swing,
  [RESET]: reset,
}

const solveFlipper = (
  state: State,
  flipper: Flipper,
  shouldSwing: boolean,
): Velocities => {
  switch (flipper.state) {
    case READY:
      flipper.state = shouldSwing ? CHARGE : READY
      break
    case CHARGE:
      flipper.state = shouldSwing ? CHARGE : SWING
      break
  }

  if (flipper.state === READY) {
    return {
      angular: 0,
      linear: Matter.Vector.create(0, 0),
    }
  }

  const handler: Handler = handlers[flipper.state]
  const angle = handler(state, flipper)

  const nextAngle = toWorldAngle(flipper, angle)
  const delta = nextAngle - flipper.body.angle

  return rotateFlipper(state, flipper, delta)
}

const rotateFlipper = (
  state: State,
  flipper: Flipper,
  angle: number,
): Velocities => {
  const { width } = state.config.flipper
  const isLeft = flipper.type === FlipperType.LEFT

  const direction = isLeft ? 1 : -1
  const gap = direction * width / 2

  const right = Matter.Vector.rotate(
    Matter.Vector.create(1, 0),
    flipper.body.angle,
  )

  const point = Matter.Vector.add(
    flipper.body.position,
    Matter.Vector.mult(right, gap),
  )

  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  const dx = flipper.body.position.x - point.x
  const dy = flipper.body.position.y - point.y

  const nx = point.x + (dx * cos - dy * sin)
  const ny = point.y + (dx * sin + dy * cos)

  const linear = Matter.Vector.create(
    nx - flipper.body.position.x,
    ny - flipper.body.position.y,
  )

  Matter.Body.setPosition(flipper.body, {
      x: point.x + (dx * cos - dy * sin),
      y: point.y + (dx * sin + dy * cos),
  })

  Matter.Body.rotate(flipper.body, angle)

  return {
    linear,
    angular: angle,
  }
}
