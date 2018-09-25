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
  players: {
    [id: number]: {
      body: Matter.Body,
      basePosition: Matter.Vector,
      baseAngle: number,
      goal?: [Matter.Vector, Matter.Vector]
    },
  },
  posts: {
    [id: number]: Matter.Body
  }
}

export interface InitialSample {
  players: {
    [id: number]: {
      x: number,
      y: number,
      a: number,
    }
  },
  posts: {
    [id: number]: {
      x: number,
      y: number,
      a: number,
    }
  }
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
  players: {
    [id: number]: {
      x: number,
      y: number,
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
  },
  goal: {
    width: number,
    height: number,
  },
  player: {
    width: number,
    height: number,
  },
  ball: {
    speed: {
      min: number,
      max: number,
    },
    radius: number,
    sides: number,
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
    players: {},
    posts: {},
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

interface ISpawnBallOptions {
  id?: number
}

export const spawnBall = (state: State, options?: ISpawnBallOptions) => {
  const ball = Matter.Bodies.polygon(
    0, 0, 
    state.config.ball.sides, 
    state.config.ball.radius, {
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      collisionFilter: {
        group: 0,
        category: 1,
        mask: ~0 << 1,
      },
      ...options
  })

  Matter.World.add(state.engine.world, ball)
  state.balls[ball.id] = ball

  return ball
}

interface ISpawnPlayerOptions {
  id?: number
  position: Matter.Vector
  angle: number
  goal?: [Matter.Vector, Matter.Vector]
}

export const spawnPlayer = (state: State, options: ISpawnPlayerOptions) => {
  const bodyOptions = _.omit(options, 'goal')

  const player = Matter.Bodies.rectangle(0, 0, state.config.player.width, state.config.player.height, {
    isStatic: true,
    collisionFilter: {
      group: 0,
      category: 2,
      mask: ~0,
    },
    ...bodyOptions,
  })

  Matter.World.add(state.engine.world, player)
  state.players[player.id] = {
    baseAngle: options.angle,
    basePosition: options.position,
    body: player,
    goal: options.goal,
  }

  return player
}

interface ISpawnPostOptions {
  id?: number
  position: Matter.Vector
  angle: number
}

export const spawnPost = (state: State, options: ISpawnPostOptions) =>  {
  const post = Matter.Bodies.rectangle(0, 0, state.config.goal.width, state.config.goal.height, {
    isStatic: true,
    collisionFilter: {
      group: 0,
      category: 3,
      mask: ~0,
    },
    ...options,
  })

  Matter.World.add(state.engine.world, post)
  state.posts[post.id] = post

  return post
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
