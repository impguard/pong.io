import * as Matter from 'matter-js'
import * as _ from 'lodash'
import * as Interface from './interface'
import * as Logic from './logic'

const { CHARGE, SWING, READY, RESET } = Interface.FlipperState


export const input = (state: Interface.State,
                      player: Interface.Player,
                      input: Interface.Input) => {
  handleVelocity(state, player, input.horizontal)
  handleFlipper(state, player.lflipper, input.lswing)
  handleFlipper(state, player.rflipper, input.rswing)
}

const handleVelocity = (state, player, horizontal: number) => {
  const direction = Matter.Vector.mult(player.right, horizontal)
  const velocity = Matter.Vector.mult(direction, state.config.player.speed)

  Logic.setPlayerVelocity(state, player, velocity)
}

const handleFlipper = (state, flipper, shouldSwing: boolean) => {
  switch (flipper.state) {
    case READY:
      flipper.state = shouldSwing ? CHARGE : READY
      break
    case CHARGE:
      flipper.state = shouldSwing ? CHARGE : SWING
      break
  }

  switch (flipper.state) {
    case CHARGE:
      charge(state, flipper)
      break
    case SWING:
      swing(state, flipper)
      break
    case RESET:
      reset(state, flipper)
      break
  }
}

const RAD_TO_DEG = 180 / Math.PI

const toWorldAngle = (flipper: Interface.Flipper, angle: number) => {
  const radianAngle = angle / RAD_TO_DEG
  const flippedAngle = flipper.type === Interface.FlipperType.RIGHT ? radianAngle : -radianAngle
  return flipper.baseAngle + flippedAngle
}

const toLocalAngle = (flipper: Interface.Flipper, angle: number) => {
  const moduloAngle = ((angle - flipper.baseAngle) * RAD_TO_DEG) % 360;
  const normalAngle =
      moduloAngle > 180
    ? moduloAngle - 360
    : moduloAngle < -180
    ? moduloAngle + 360
    : moduloAngle;

  return flipper.type === Interface.FlipperType.RIGHT ? normalAngle : - normalAngle
}

const charge = (state: Interface.State, flipper: Interface.Flipper) => {
  const angle = toLocalAngle(flipper, flipper.body.angle)

  const delta = state.config.flipper.charge.speed * state.config.delta
  const basisAngle = angle - delta
  const clampAngle = _.clamp(basisAngle, state.config.flipper.charge.angle, 0)

  const nextAngle = toWorldAngle(flipper, clampAngle)
  const nextDelta = nextAngle - flipper.body.angle
  Logic.rotateFlipper(state, flipper, nextDelta)
}

const swing = (state: Interface.State, flipper: Interface.Flipper) => {
  const angle = toLocalAngle(flipper, flipper.body.angle)

  const delta = state.config.flipper.swing.speed * state.config.delta
  const basisAngle = angle + delta

  const clampAngle = _.clamp(
    basisAngle,
    state.config.flipper.charge.angle,
    state.config.flipper.swing.angle
  )

  if (clampAngle === state.config.flipper.swing.angle) {
    flipper.state = RESET
  }

  const nextAngle = toWorldAngle(flipper, clampAngle)
  const nextDelta = nextAngle - flipper.body.angle


  Logic.rotateFlipper(state, flipper, nextDelta)
}

const reset = (state, flipper) => {
  const angle = toLocalAngle(flipper, flipper.body.angle)

  const delta = state.config.flipper.reset.speed * state.config.delta
  const basisAngle = angle - delta;
  const clampAngle = _.clamp(basisAngle, 0, state.config.flipper.swing.angle)

  if (clampAngle === 0) {
    flipper.state = READY
  }

  const nextAngle = toWorldAngle(flipper, clampAngle)
  const nextDelta = nextAngle - flipper.body.angle
  Logic.rotateFlipper(state, flipper, nextDelta)
}