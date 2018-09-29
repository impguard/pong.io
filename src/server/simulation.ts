import * as Matter from 'matter-js'
import * as _ from 'lodash'
import * as Game from '../shared/game'
import * as State from './state'
import config from './config'


export const setup = (app: State.App) => {
  app.game =  Game.create(config.game)

  // Spawn the balls into the game
  _.times(app.game.config.numBalls, () => {
    const ball = Game.spawnBall(app.game)
    Game.resetBall(app.game, ball)
  })

  const numPlayers = config.game.numPlayers
  const radius = config.game.arena.radius

  // Spawn each goal post
  const theta = 2 * Math.PI / numPlayers;

  const posts = _.map(_.range(0, numPlayers), (number) => {
    const angle = number * theta
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)

    const position = Matter.Vector.create(x, y)

    const post = Game.spawnPost(app.game, {position, angle})

    return post
  })

  // Spawn every player
  _.times(numPlayers, (number) => {
    const leftPost = posts[number]
    const rightPost = posts[(number + 1) % numPlayers]

    const x = (leftPost.position.x + rightPost.position.x) / 2
    const y = (leftPost.position.y + rightPost.position.y) / 2

    const angle = Math.atan2(y, x) + Math.PI / 2
    const position = Matter.Vector.create(x, y)

    Game.spawnPlayer(app.game, {
      position, 
      angle, 
      goal: [leftPost.position, rightPost.position]
    })
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

  const players = _.mapValues(app.game.players, player => ({
    x: player.body.position.x,
    y: player.body.position.y
  }))

  return {balls, players}
}

export const sampleInitial = (app: State.App): Game.InitialSample => {
  const posts = _.mapValues(app.game.posts, posts => ({
    x: posts.position.x,
    y: posts.position.y,
    a: posts.angle,
  }))

  const players = _.mapValues(app.game.players, player => ({
    x: player.body.position.x,
    y: player.body.position.y,
    a: player.body.angle,
  }))

  return {posts, players}
}


export const tick = (app: State.App) => {
  _.forEach(app.game.balls, (ball: Matter.Body) => {
    const distance = Matter.Vector.magnitude(ball.position)

    if (distance > app.game.config.arena.radius) {
      Game.resetBall(app.game, ball)
    }
  })

  _.forEach(app.inputs, (input, id) => {
    const player: Game.Player = app.game.players[id]
    Game.input(app.game, player, input)
  })

  Game.tick(app.game)

  app.inputs = {}
}


export const assign = (app: State.App): number => {
  const player = Game.assign(app.game)

  if (player) {
    return player.body.id
  }

  return null
}

export const input = (app: State.App, id: number, input: Game.Input) => {
  const player = app.game.players[id]
  Game.input(app.game, player, input)
}


export const run = (app: State.App) => {
  Game.run(app.game)
}
