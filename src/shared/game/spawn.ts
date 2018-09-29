import * as Matter from 'matter-js';
import * as _ from 'lodash'
import { State } from './state'


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