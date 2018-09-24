import * as Matter from 'matter-js';
import * as _ from 'lodash'


export interface State {
  engine: Matter.Engine,
  config: Config
  runner: {
    id?: any,
    beforeTick: (() => void)[],
  },
  balls: {
    [id: number]: Matter.Body
  },
}

export interface Sample {
  balls: {
    [id: number]: {
      x: number,
      y: number,
      vx: number,
      vy: number,
    }
  },
}

export interface Input {
  left: number,
  right: number,
}

export interface Config {
  numPlayers: number,
  numBalls: number,
  arena: {
    radius: number,
  }
  ball: {
    speed: {
      min: number,
      max: number,
    },
    radius: number,
  },
  delta: number,
}

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
    runner: {
      beforeTick: []
    }
  }
}


export const onBeforeTick = (state: State, callback: () => void) => {
  state.runner.beforeTick.push(callback)
}


export const resetBall = (state: State, ball: Matter.Body) => {
  const x = 2 * Math.random() - 1
  const y = 2 * Math.random() - 1

  const direction = Matter.Vector.normalise(Matter.Vector.create(x, y))
  const velocity = Matter.Vector.mult(direction, state.config.ball.speed.max)

  Matter.Body.setPosition(ball, Matter.Vector.create(0, 0))
  Matter.Body.setVelocity(ball, velocity)
}


export const spawnBall = (state: State, id?: number) => {
  const ball = Matter.Bodies.circle(0, 0, state.config.ball.radius, {
    ...id && { id },
    restitution: 1,
    friction: 0,
    frictionAir: 0,
    frictionStatic: 0,
    collisionFilter: {
      group: 0,
      category: 1,
      mask: ~0 << 1,
    }
  })

  Matter.World.add(state.engine.world, ball)
  state.balls[ball.id] = ball

  return ball
}


export const destroy = (state: State) => {
  Matter.Engine.clear(state.engine)
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