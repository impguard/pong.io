import * as Matter from 'matter-js';
import * as _ from 'lodash'

import { Config, State } from './interface'

export * from './interface'
export * from './spawn'
export * from './input'

/****************************************
 * Lifecycle Functions
 ****************************************/

export const create = (config: Config): State => {
  const world = Matter.World.create({
    gravity: {
      scale: 0, x: 0, y: 0
    }
  })

  const engine = Matter.Engine.create({world})

  return {
    config,
    engine,
    balls: {},
    players: {},
    paddles: {},
    flippers: {},
    posts: {},
    runner: {
      beforeTick: [],
    }
  }
}


export const run = (state: State) =>  {
  state.runner.id = setInterval(() => {
    _.forEach(state.runner.beforeTick, callback => callback())

    Matter.Engine.update(state.engine, state.config.delta)
  }, state.config.delta)
}


export const stop = (state: State) => {
  clearInterval(state.runner.id)
}


export const destroy = (state: State) => {
  Matter.Engine.clear(state.engine)
}

/****************************************
 * Game Logic Helpers
 ****************************************/

export const assign = (state: State) => {
  const player = _.find(state.players, player => !player.assigned)

  if (player) {
    player.assigned = true
  }

  return player
}

export const resetBall = (state: State, ball: Matter.Body) => {
  const x = 2 * Math.random() - 1
  const y = 2 * Math.random() - 1

  const direction = Matter.Vector.normalise(Matter.Vector.create(x, y))
  const velocity = Matter.Vector.mult(direction, state.config.ball.speed.max)

  Matter.Body.setPosition(ball, Matter.Vector.create(0, 0))
  Matter.Body.setVelocity(ball, velocity)
}

/****************************************
 * Events Registrators
 ****************************************/

export const onBeforeTick = (state: State, callback: () => void) => {
  state.runner.beforeTick.push(callback)
}
