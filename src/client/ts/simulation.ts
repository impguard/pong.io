import * as $ from 'jquery'
import * as _ from 'lodash'
import * as Matter from 'matter-js'
import * as State from './state'
import * as Gamepad from './gamepad'
import * as Game from '../../shared/ts/game'


export const setup = (app: State.App, element: HTMLElement, socket: SocketIOClient.Socket) => {
  const config = {
    arena: {
      radius: 300
    },
    ball: {
      speed: {
        min: 1,
        max: 2,
      },
      radius: 5,
    },
    numBalls: 10,
    numPlayers: 10,
  }

  app.game = Game.create(config, element)

  Game.onBeforeTick(app.game, () => Game.tick(app.game))
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
}