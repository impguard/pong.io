import * as Matter from 'matter-js'
import * as _ from 'lodash'

import event from '../event'
import { IConfig, IState } from './interface'

export * from './interface'
export * from './spawn'
export * from './input'

/****************************************
 * Lifecycle Functions
 ****************************************/

export const create = (config: IConfig): IState => {
  const world = Matter.World.create({
    gravity: {
      scale: 0, x: 0, y: 0,
    },
  })

  const engine = Matter.Engine.create({world})

  return {
    config,
    engine,
    frame: 0,
    balls: {},
    players: {},
    paddles: {},
    flippers: {},
    posts: {},
    covers: {},
    runner: {},
  }
}

export const run = (state: IState, tick: () => void) =>  {
  state.runner.id = setInterval(() => {
    tick()
    update(state)
    state.frame += 1
  }, state.config.delta)
}

export const stop = (state: IState) => {
  clearInterval(state.runner.id)
}

export const destroy = (state: IState) => {
  Matter.Engine.clear(state.engine)
}

/****************************************
 * Game Logic Helpers
 ****************************************/

export const update = (state: IState) => {
  Matter.Engine.update(state.engine, state.config.delta)
}

export const assign = (state: IState) => {
  const player = _.find(state.players, (p) => !p.assigned)

  if (player) {
    player.assigned = true
  }

  return player
}

export const resetBall = (state: IState, ball: Matter.Body) => {
  const x = 2 * Math.random() - 1
  const y = 2 * Math.random() - 1

  const direction = Matter.Vector.normalise(Matter.Vector.create(x, y))
  const velocity = Matter.Vector.mult(direction, state.config.ball.speed.min)

  Matter.Body.setPosition(ball, Matter.Vector.create(0, 0))
  Matter.Body.setVelocity(ball, velocity)
}

export const clampBall = (ball: Matter.Body, min: number, max: number) => {
  const speed = Matter.Vector.magnitude(ball.velocity)
  const clampedSpeed = _.clamp(speed, min, max)
  const direction = Matter.Vector.normalise(ball.velocity)
  const clampedVelocity = Matter.Vector.mult(direction, clampedSpeed)

  Matter.Body.setVelocity(ball, clampedVelocity)
}
