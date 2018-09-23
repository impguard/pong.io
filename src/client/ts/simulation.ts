import * as $ from 'jquery'
import * as _ from 'lodash'
import * as Matter from 'matter-js'
import * as State from './state'
import * as Gamepad from './gamepad'
import * as Game from '../../shared/game'


interface ISimulationOptions {
  element: HTMLElement,
  socket: SocketIOClient.Socket,
  config: Game.Config,
}

export const setup = (app: State.App, options: ISimulationOptions) => {
  app.game = Game.create(options.config, options.element)

  Game.onBeforeTick(app.game, () => tick(app))
}

export const tick = (app: State.App) => {
  const input = Gamepad.sample()

  Game.tick(app.game)
}


export const run = (app: State.App) => {
  Game.run(app.game)
}

export const stop = (app: State.App) => {
  Game.stop(app.game)
}

export const destroy = (app: State.App) => {
  Game.destroy(app.game)
  app.game = null
}