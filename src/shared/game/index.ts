import * as Matter from 'matter-js';
import * as _ from 'lodash'

import * as Interface from './interface'

export * from './interface'
export * from './spawn'
export * from './logic'
export * from './input'

/****************************************
 * Lifecycle Functions
 ****************************************/

export const create = (config: Interface.Config): Interface.State => {
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


export const run = (state: Interface.State) =>  {
  state.runner.id = setInterval(() => {
    _.forEach(state.runner.beforeTick, callback => callback())

    Matter.Engine.update(state.engine, state.config.delta)
  }, state.config.delta)
}


export const stop = (state: Interface.State) => {
  clearInterval(state.runner.id)
}


export const destroy = (state: Interface.State) => {
  Matter.Engine.clear(state.engine)
}

/****************************************
 * Lifecycle Helpers
 ****************************************/

export const tick = (state: Interface.State) => {
  _.forEach(state.players, player => {
    const delta = Matter.Vector.mult(player.velocity, state.config.delta)
    Matter.Composite.translate(player.composite, delta)
  })
}


export const assign = (state: Interface.State) => {
  const player = _.find(state.players, player => !player.assigned)

  if (player) {
    player.assigned = true
  }

  return player
}

/****************************************
 * Events Registrators
 ****************************************/

export const onBeforeTick = (state: Interface.State, callback: () => void) => {
  state.runner.beforeTick.push(callback)
}
