import * as Matter from "matter-js";
import * as $ from "jquery"


export interface State {
  engine: Matter.Engine,
  runner: Matter.Runner,
  render?: Matter.Render,
  balls: {
    [key: number]: Matter.Body
  }
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
    Matter.Render.lookAt(render, [
      {x: -400, y: -400},
      {x: 400, y: 400}
    ])
  }

  const state: State = {
    balls: {},
    engine,
    runner,
    render,
  }

  for (let i = 0; i < config.numBalls; i++) {
    spawnBall(state, config.ball.radius)
  }

  return state
}


export const tick = (state: State, config: Config) => {
  Object.keys(state.balls).forEach((id) => {
    const ball: Matter.Body = state.balls[id]
    const distance = Matter.Vector.magnitude(ball.position)
    
    if (distance > config.arena.radius) {
      resetBall(ball, config)
    }
  })
}


export const resetBall = (ball, config: Config) => {
  const x = 2 * Math.random() - 1
  const y = 2 * Math.random() - 1

  const direction = Matter.Vector.normalise(Matter.Vector.create(x, y))
  const velocity = Matter.Vector.mult(direction, config.ball.speed.max)

  Matter.Body.setPosition(ball, Matter.Vector.create(0, 0))
  Matter.Body.setVelocity(ball, velocity)
}


const spawnBall = (state: State, radius) => {
  const ball = Matter.Bodies.circle(0, 0, radius, {
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
    Matter.Render.stop(state.render)
    $(state.render.canvas).remove()
  }

  Matter.Runner.stop(state.runner)
  Matter.Engine.clear(state.engine)
}


export const run = (state: State) =>  {
  if (state.render) {
    Matter.Render.run(state.render)
  }

  Matter.Runner.run(state.engine)
}