import * as $ from 'jquery'
import * as _ from 'lodash'
import * as Matter from 'matter-js'
import * as State from './state'
import * as Gamepad from './gamepad'
import * as Game from '../../shared/game'
import * as Message from '../../shared/message'


interface ISimulationOptions {
  element: HTMLElement
  config: Game.Config
  sample: Game.InitialSample
}

export const setup = (app: State.App, options: ISimulationOptions) => {
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
    },
    element: options.element,
    engine: app.game.engine,
  })

  // @ts-ignore
  Matter.Render.lookAt(render, {
    min: {x: -400, y: -400},
    max: {x: 400, y: 400}
  })

  app.render = render

  Game.onBeforeTick(app.game, () => tick(app))
}

export const sync = (app: State.App, sample: Game.Sample) => {
  _.forEach(sample.balls, (value, id) => {
    const position = Matter.Vector.create(value.x, value.y)
    const velocity = Matter.Vector.create(value.vx, value.vy)

    const ball = id in app.game.balls
      ? app.game.balls[id]
      : Game.spawnBall(app.game, {id: _.toInteger(id)})

    Matter.Body.setPosition(ball, position)
    Matter.Body.setVelocity(ball, velocity)
  })

  _.forEach(sample.players, (value, id) => {
    const player: Game.Player = app.game.players[id]

    Game.setPlayerVelocity(app.game, player, Matter.Vector.create(value.vx, value.vy))
    Matter.Body.setPosition(player.paddle, Matter.Vector.create(value.px, value.py))
    Matter.Body.setPosition(player.lflipper.body, Matter.Vector.create(value.lfx, value.lfy))
    Matter.Body.setPosition(player.rflipper.body, Matter.Vector.create(value.rfx, value.rfy))
    Matter.Body.setAngle(player.lflipper.body, value.lfa)
    Matter.Body.setAngle(player.rflipper.body, value.rfa)
    player.lflipper.state = value.lfs
    player.rflipper.state = value.rfs
  })
}

export const tick = (app: State.App) => {
  const input = Gamepad.sample()
  const player = app.game.players[app.assignment]

  Game.input(app.game, player, input)

  const message: Message.Input = {input}
  app.socket.emit('input', message)
}


export const run = (app: State.App) => {
  Game.run(app.game)
  app.render.context.scale(10, -1)
  Matter.Render.run(app.render)
}


export const destroy = (app: State.App) => {
  Game.stop(app.game)
  Game.destroy(app.game)
  Matter.Render.stop(app.render)
  $(app.render.canvas).remove()
  app.render = app.game = null
}