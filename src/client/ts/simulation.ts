import * as $ from 'jquery'
import * as Matter from 'matter-js'
import * as State from './state'
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

  Object.keys(app.game.balls).forEach((id) => {
    const ball = app.game.balls[id]
    Game.resetBall(ball, config)
  })
}


export const run = (app: State.App) => {
  Game.run(app.game)
}

export const destroy = (app: State.App) => {
  Game.destroy(app.game)
}