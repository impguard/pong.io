import * as Matter from 'matter-js'
import * as _ from 'lodash'
import { IState, IPlayer, IFlipperType, IFlipperState } from './interface'

interface ISpawnBallOptions {
  id?: number,
}

export const spawnBall = (state: IState, options?: ISpawnBallOptions) => {
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
      ...options,
  })

  Matter.World.add(state.engine.world, ball)
  state.balls[ball.id] = ball

  return ball
}

interface ISpawnPlayerOptions {
  id?: number,
  paddleId?: number,
  lflipperId?: number,
  rflipperId?: number,
  position: Matter.Vector,
  angle: number,
  goal?: [Matter.Vector, Matter.Vector],
}

export const spawnPlayer = (state: IState, options: ISpawnPlayerOptions) => {
  const paddle = spawnPaddle(state, {
    ...(options.paddleId && { id: options.paddleId }),
    position: options.position,
    angle: options.angle,
  })

  const up = Matter.Vector.rotate(Matter.Vector.create(0, 1), options.angle)
  const right = Matter.Vector.rotate(Matter.Vector.create(1, 0), options.angle)

  const fspacing = state.config.flipper.spacing +
    (state.config.flipper.width + state.config.paddle.width) / 2

  const lfposition = Matter.Vector.add(
    options.position,
    Matter.Vector.mult(right, -fspacing),
  )
  const rfposition = Matter.Vector.add(
    options.position,
    Matter.Vector.mult(right, fspacing),
  )

  const lflipper = spawnFlipper(state, {
    ...(options.lflipperId && { id: options.lflipperId }),
    position: lfposition,
    angle: options.angle,
    type: IFlipperType.LEFT,
  })

  const rflipper = spawnFlipper(state, {
    ...(options.rflipperId && { id: options.rflipperId }),
    position: rfposition,
    angle: options.angle,
    type: IFlipperType.RIGHT,
  })

  const player = Matter.Composite.create({
    ...(options.id && { id: options.id }),
    bodies: [paddle, lflipper.body, rflipper.body],
  })

  Matter.World.add(state.engine.world, player)
  state.players[player.id] = {
    composite: player,
    baseAngle: options.angle,
    basePosition: options.position,
    up,
    right,
    assigned: false,
    goal: options.goal,
    paddle,
    lflipper,
    rflipper,
    health: state.config.player.health,
  }

  return player
}

interface ISpawnPaddleOptions {
  id?: number
  position: Matter.Vector
  angle: number
}

const spawnPaddle = (state: IState, options: ISpawnPaddleOptions) => {
  const { width, height } = state.config.paddle
  const paddle = Matter.Bodies.rectangle(0, 0, width, height, {
    isStatic: true,
    collisionFilter: {
      group: 0,
      category: 2,
      mask: ~0,
    },
    ...options,
  })

  return paddle
}

interface ISpawnFlipperOptions {
  id?: number
  type: IFlipperType
  position: Matter.Vector
  angle: number
}

const spawnFlipper = (state: IState, options: ISpawnFlipperOptions) => {
  const bodyOptions = _.omit(options, 'type')
  const { width, height } = state.config.flipper

  const body = Matter.Bodies.rectangle(0, 0, width, height, {
    isStatic: true,
    collisionFilter: {
      group: 0,
      category: 2,
      mask: ~0,
    },
    ...bodyOptions,
  })

  const flipper = {
    body,
    state: IFlipperState.READY,
    type: options.type,
    baseAngle: options.angle,
    basePosition: options.position,
  }
  state.flippers[flipper.body.id] = flipper

  return flipper
}

interface ISpawnPostOptions {
  id?: number
  position: Matter.Vector
  angle: number
}

export const spawnPost = (state: IState, options: ISpawnPostOptions) =>  {
  const { width, height } = state.config.post
  const post = Matter.Bodies.rectangle(0, 0, width, height, {
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

interface ISpawnCoverOptions {
  id?: number,
  position: Matter.Vector,
  angle: number,
}

export const spawnCoverForPlayer = (state: IState, player: IPlayer) => {
  const { offset } = state.config.cover
  const { basePosition, baseAngle } = player

  const direction = Matter.Vector.mult(basePosition, -1)
  const norm = Matter.Vector.normalise(direction)
  const delta = Matter.Vector.mult(norm, offset)

  const position = Matter.Vector.add(basePosition, delta)
  const angle = baseAngle

  spawnCover(state, { position, angle })
}

export const spawnCover = (state: IState, options: ISpawnCoverOptions) => {
  const { width, height } = state.config.cover

  const cover = Matter.Bodies.rectangle(0, 0, width, height, {
    isStatic: true,
    collisionFilter: {
      group: 0,
      category: 3,
      mask: ~0,
    },
    ...options,
  })

  Matter.World.add(state.engine.world, cover)
  state.covers[cover.id] = cover

  return cover
}
