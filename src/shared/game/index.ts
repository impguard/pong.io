import * as Matter from 'matter-js';
import * as _ from 'lodash'
import { State, Config, Player, Input } from './state'

export * from './state'
export * from './spawn'


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
      beforeTick: []
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
 * Events Registrators
 ****************************************/

export const onBeforeTick = (state: State, callback: () => void) => {
  state.runner.beforeTick.push(callback)
}

/****************************************
 * Game Logic Helpers
 ****************************************/

export const tick = (state: State) => {
  _.forEach(state.players, player => {
    const delta = Matter.Vector.mult(player.velocity, state.config.delta)
    Matter.Composite.translate(player.composite, delta)
  })
}


export const assign = (state: State) => {
  const player = _.find(state.players, player => !player.assigned)

  if (player) {
    player.assigned = true
  }

  return player
}


export const input = (state: State, player: Player, input: Input) => {
  const horizontal = Matter.Vector.mult(player.right, input.horizontal)
  const velocity = Matter.Vector.mult(horizontal, state.config.player.speed)

  setPlayerVelocity(state, player, velocity)
}


export const setPlayerVelocity = (state: State, player: Player, velocity: Matter.Vector) => {
  const paddle = state.paddles[player.paddleId]
  const lflipper = state.flippers[player.lflipperId]
  const rflipper = state.flippers[player.rflipperId]

  player.velocity = velocity
  Matter.Body.setVelocity(paddle, velocity)
  Matter.Body.setVelocity(rflipper, velocity)
  Matter.Body.setVelocity(lflipper, velocity)
}


export const resetBall = (state: State, ball: Matter.Body) => {
  const x = 2 * Math.random() - 1
  const y = 2 * Math.random() - 1

  const direction = Matter.Vector.normalise(Matter.Vector.create(x, y))
  const velocity = Matter.Vector.mult(direction, state.config.ball.speed.max)

  Matter.Body.setPosition(ball, Matter.Vector.create(0, 0))
  Matter.Body.setVelocity(ball, velocity)
}