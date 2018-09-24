import * as $ from 'jquery'
import * as _ from 'lodash'
import * as Matter from 'matter-js'
import * as State from './state'
import * as Gamepad from './gamepad'
import * as Game from '../../shared/game'


interface ISimulationOptions {
  element: HTMLElement,
  config: Game.Config,
}

export const setup = (app: State.App, options: ISimulationOptions) => {
  app.game = Game.create(options.config)

  const render = Matter.Render.create({
    options: {
      width: 800,
      height: 800,
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
    const ball = id in app.game.balls
      ? app.game.balls[id]
      : Game.spawnBall(app.game, _.toInteger(id))

    syncBall(ball, value.x, value.y, value.vx, value.vy)
  })
}

const syncBall = (ball: Matter.Body, x, y, vx, vy) => {
  Matter.Body.setPosition(ball, Matter.Vector.create(x, y))
  Matter.Body.setVelocity(ball, Matter.Vector.create(vx, vy))
}

export const tick = (app: State.App) => {
  const input = Gamepad.sample()
}


export const run = (app: State.App) => {
  Game.run(app.game)
  Matter.Render.run(app.render)
}

export const stop = (app: State.App) => {
  Game.stop(app.game)
}

export const destroy = (app: State.App) => {
  Game.destroy(app.game)
  app.game = null
}