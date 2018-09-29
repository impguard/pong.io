import * as Matter from 'matter-js';
import * as _ from 'lodash'

export interface Player {
  composite: Matter.Composite
  basePosition: Matter.Vector
  baseAngle: number
  up: Matter.Vector
  right: Matter.Vector
  assigned: boolean
  paddleId: number
  lflipperId: number
  rflipperId: number
  velocity: Matter.Vector
  goal?: [Matter.Vector, Matter.Vector]
}

export interface State {
  engine: Matter.Engine,
  config: Config
  runner: {
    id?: any,
    beforeTick: (() => void)[],
  },
  players: {
    [id: number]: Player
  }
  balls: {
    [id: number]: Matter.Body
  },
  paddles: {
    [id: number]: Matter.Body
  },
  flippers: {
    [id: number]: Matter.Body
  }
  posts: {
    [id: number]: Matter.Body
  }
}

export interface InitialSample {
  players: {
    [id: number]: {
      x: number
      y: number
      a: number
      p: number
      lf: number
      rf: number
    }
  },
  posts: {
    [id: number]: {
      x: number
      y: number
      a: number
    }
  }
}

export interface Sample {
  balls: {
    [id: number]: {
      x: number
      y: number
      vx: number
      vy: number
    }
  }
  players: {
    [id: number]: {
      vx: number
      vy: number
      px: number
      py: number
      lfx: number
      lfy: number
      rfx: number
      rfy: number
    }
  }
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
    paddles: {},
    flippers: {},
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
  paddleId?: number
  lflipperId?: number
  rflipperId?: number
  position: Matter.Vector
  angle: number
  goal?: [Matter.Vector, Matter.Vector]
}

export const spawnPlayer = (state: State, options: ISpawnPlayerOptions) => {
  const baseOptions = _.pick(options, 'position', 'angle')

  const paddle = spawnPaddle(state, {
    ...(options.paddleId && { id: options.paddleId }),
    ...baseOptions,
  })

  const lflipper = spawnFlipper(state, {
    ...(options.lflipperId && { id: options.lflipperId }),
    ...baseOptions,
  })

  const rflipper = spawnFlipper(state, {
    ...(options.rflipperId && { id: options.rflipperId }),
    ...baseOptions,
  })

  const player = Matter.Composite.create({
    ...(options.id && { id: options.id }),
    bodies: [paddle, lflipper, rflipper],
  })

  const up = Matter.Vector.rotate(Matter.Vector.create(0, 1), options.angle)
  const right = Matter.Vector.rotate(Matter.Vector.create(1, 0), options.angle)

  Matter.World.add(state.engine.world, player)
  state.players[player.id] = {
    composite: player,
    velocity: Matter.Vector.create(0, 0),
    baseAngle: options.angle,
    basePosition: options.position,
    up,
    right,
    assigned: false,
    goal: options.goal,
    paddleId: paddle.id,
    lflipperId: lflipper.id,
    rflipperId: rflipper.id,
  }

  return player
}

interface ISpawnPaddleOptions {
  id?: number
  position: Matter.Vector
  angle: number
}

const spawnPaddle = (state: State, options: ISpawnPaddleOptions) => {
  const paddle = Matter.Bodies.rectangle(0, 0, state.config.player.width, state.config.player.height, {
    isStatic: true,
    collisionFilter: {
      group: 0,
      category: 2,
      mask: ~0,
    },
    ...options,
  })

  state.paddles[paddle.id] = paddle
  return paddle
}

interface ISpawnFlipperOptions {
  id?: number
  position: Matter.Vector
  angle: number
}

const spawnFlipper = (state: State, options: ISpawnPaddleOptions) => {
  const flipper = Matter.Bodies.rectangle(0, 0, state.config.player.width, state.config.player.height, {
    isStatic: true,
    collisionFilter: {
      group: 0,
      category: 2,
      mask: ~0,
    },
    ...options,
  })

  state.flippers[flipper.id] = flipper
  return flipper
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


export const tick = (state: State) => {
  _.forEach(state.players, player => {
    const delta = Matter.Vector.mult(player.velocity, state.config.delta)
    Matter.Composite.translate(player.composite, delta)
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
