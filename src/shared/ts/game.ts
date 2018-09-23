import * as Matter from 'matter-js';
import * as $ from 'jquery'
import * as _ from 'lodash'


export interface State {
  engine: Matter.Engine,
  runner: Matter.Runner,
  render?: Matter.Render,
  config: Config
  balls: {
    [key: number]: Matter.Body
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
}

export const create = (config: Config, element?: HTMLElement): State => {
  const world = Matter.World.create({
    gravity: {
      scale: 0, x: 0, y: 0
    }
  })

  const runner = Matter.Runner.create({
    delta: 16,
    isFixed: true,
  })
  const engine = Matter.Engine.create({world})

  let render = null
  if (element) {
    render = Matter.Render.create({
      options: {
        width: 800,
        height: 800,
      },
      element,
      engine
    })

    // @ts-ignore
    Matter.Render.lookAt(render, {
      min: {x: -400, y: -400},
      max: {x: 400, y: 400}
    })
  }

  return {
    config,
    engine,
    runner,
    render,
    balls: {}
  }
}


export const tick = (state: State) => {
  _.forEach(state.balls, (ball: Matter.Body) => {
    const distance = Matter.Vector.magnitude(ball.position)

    if (distance > state.config.arena.radius) {
      resetBall(state, ball)
    }
  })
}


export const onBeforeTick = (state: State, callback: (e: any) => void) => {
  Matter.Events.on(state.runner, 'beforeTick', callback)
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
  if (state.render) {
    $(state.render.canvas).remove()
  }
}


export const run = (state: State) =>  {
  if (state.render) {
    Matter.Render.run(state.render)
  }

  Matter.Runner.run(state.runner, state.engine)
}


export const stop = (state: State) => {
  if (state.render) {
    Matter.Render.stop(state.render)
  }

  Matter.Runner.stop(state.runner)
}