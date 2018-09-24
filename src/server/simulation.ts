import * as Matter from 'matter-js'
import * as _ from 'lodash'
import * as Game from '../shared/game'
import * as State from './state'
import config from './config'


export const setup = (app: State.App) => {
  app.game =  Game.create(config.game)

  _.times(app.game.config.numBalls, () => {
    const ball = Game.spawnBall(app.game)
    Game.resetBall(app.game, ball)
  })

  Game.onBeforeTick(app.game, () => tick(app))
}


export const sample = (app: State.App): Game.Sample => {
  // May be worth optimizing this area of code
  const balls = _.mapValues(app.game.balls, ball => ({
    x: ball.position.x,
    y: ball.position.y,
    vx: ball.velocity.x,
    vy: ball.velocity.y,
  }))

  return {balls}
}


export const tick = (app: State.App) => {
  _.forEach(app.game.balls, (ball: Matter.Body) => {
    const distance = Matter.Vector.magnitude(ball.position)

    if (distance > app.game.config.arena.radius) {
      Game.resetBall(app.game, ball)
    }
  })
}


export const run = (app: State.App) => {
  Game.run(app.game)
}