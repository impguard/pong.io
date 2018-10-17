import * as _ from 'lodash'
import * as Matter from 'matter-js'
import * as Gamepad from './gamepad'
import * as Game from '../../shared/game'
import * as Message from '../../shared/message'
import { IApp } from './interface'

interface ISimulationOptions {
  element: HTMLElement,
  config: Game.IConfig,
  sample: Game.ISampleInitial,
}

export const setup = (app: IApp, options: ISimulationOptions) => {
  app.game = Game.create(options.config)

  _.forEach(options.sample.players, (player, id)  => {
    Game.spawnPlayer(app.game, {
      id: _.parseInt(id),
      position: Matter.Vector.create(player.x, player.y),
      angle: player.a,
      paddleId: player.p,
      lflipperId: player.lf,
      rflipperId: player.rf,
    })
  })

  _.forEach(options.sample.posts, (post, id) => {
    Game.spawnPost(app.game, {
      id: _.parseInt(id),
      position: Matter.Vector.create(post.x, post.y),
      angle: post.a,
    })
  })

  const render = Matter.Render.create({
    options: {
      width: 800,
      height: 800,
      wireframes: true,
      // @ts-ignore
      showBounds: true,
      showIds: true,
    },
    element: options.element,
    engine: app.game.engine,
  })

  // @ts-ignore
  Matter.Render.lookAt(render, {
    min: {x: -400, y: -400},
    max: {x: 400, y: 400},
  })

  app.render = render
}

export const sync = (app: IApp, message: Message.IGameState) => {
  const { frame, sample } = message

  _.forEach(sample.balls, (value, id) => {
    const position = Matter.Vector.create(value.x, value.y)
    const velocity = Matter.Vector.create(value.vx, value.vy)

    const ball = app.game.balls[id]
      ? app.game.balls[id]
      : Game.spawnBall(app.game, {id: _.toInteger(id)})

    Matter.Body.setPosition(ball, position)
    Matter.Body.setVelocity(ball, velocity)
  })

  _.forEach(sample.players, (value, id) => {
    const player: Game.IPlayer = app.game.players[id]

    player.health = value.h

    Matter.Body.setPosition(player.paddle, Matter.Vector.create(value.p.x, value.p.y))
    Matter.Body.setVelocity(player.paddle, Matter.Vector.create(value.p.vx, value.p.vy))

    syncFlipper(player.lflipper, value.lf)
    syncFlipper(player.rflipper, value.rf)
  })

  _.forEach(sample.covers, (value, id) => {
    if (app.game.covers[id]) { return }

    Game.spawnCover(app.game, {
      position: Matter.Vector.create(value.x, value.y),
      angle: value.a,
    })
  })

  let curr = frame
  while (curr < app.game.frame) {
    const input = app.inputs.get(curr)

    update(app, input)
    Game.update(app.game)

    curr += 1
  }
}

const syncFlipper = (flipper: Game.IFlipper, sample: Game.ISampleFlipper) => {
  const { body } = flipper

  flipper.state = sample.s

  Matter.Body.setPosition(body, Matter.Vector.create(sample.x, sample.y))
  Matter.Body.setVelocity(body, Matter.Vector.create(sample.vx, sample.vy))

  Matter.Body.setAngle(body, sample.a)
  Matter.Body.setAngularVelocity(body, sample.va)
}

export const tick = (app: IApp) => {
  const input = Gamepad.sample()
  const frame = app.game.frame

  const message: Message.IInput = { input, frame }

  update(app, input)

  app.inputs.set(frame, input)
  app.socket.emit('input', message)
}

export const update = (app: IApp, input: Game.IInput) => {
  const player = app.game.players[app.assignment]

  const { min, max } = app.game.config.ball.speed
  _.forEach(app.game.balls, (ball: Matter.Body) => {
    Game.clampBall(ball, min, max)
  })

  Game.handleInput(app.game, player, input)
}

export const run = (app: IApp) => {
  Game.run(app.game, () => tick(app))
  Matter.Render.run(app.render)
}

export const destroy = (app: IApp) => {
  Game.stop(app.game)
  Game.destroy(app.game)
  Matter.Render.stop(app.render)
  app.game = null
}
