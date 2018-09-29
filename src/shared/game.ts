import * as Matter from 'matter-js';
import * as _ from 'lodash'

export interface Player {
  body: Matter.Body
  basePosition: Matter.Vector
  baseAngle: number
  up: Matter.Vector
  right: Matter.Vector
  assigned: boolean
  goal?: [Matter.Vector, Matter.Vector]
}

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
    [id: number]: Player
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
  horizontal: number,
}

export interface Config {
  numPlayers: number,
  numBalls: number,
  arena: {
    radius: number,
  },
  post: {
    width: number,
    height: number,
  },
  player: {
    width: number,
    height: number,
    speed: number,
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
      inertia: Infinity,
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

  const up = Matter.Vector.rotate(Matter.Vector.create(0, 1), options.angle)
  const right = Matter.Vector.rotate(Matter.Vector.create(1, 0), options.angle)

  Matter.World.add(state.engine.world, player)
  state.players[player.id] = {
    baseAngle: options.angle,
    basePosition: options.position,
    up, 
    right,
    body: player,
    assigned: false,
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
  const post = Matter.Bodies.rectangle(0, 0, state.config.post.width, state.config.post.height, {
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

  Matter.Body.setVelocity(player.body, velocity)
}


export const tick = (state: State) => {
  _.forEach(state.players, player => {
    const dp = Matter.Vector.mult(player.body.velocity, state.config.delta)
    const position = Matter.Vector.add(player.body.position, dp)

    Matter.Body.setPosition(player.body, position)
  })
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
