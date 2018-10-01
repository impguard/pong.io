import * as Matter from 'matter-js'
import * as _ from 'lodash'
import * as Game from '../shared/game'
import * as Message from '../shared/message'
import * as State from './state'
import config from './config'
import { FlipperSample } from '../shared/game';


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
      goal: [leftPost.position, rightPost.position],
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

  const players = _.mapValues(app.game.players, player => {
    return {
      p: {
        x: player.paddle.position.x,
        y: player.paddle.position.y,
        vx: player.paddle.velocity.x,
        vy: player.paddle.velocity.y,
      },
      lf: sampleFlipper(player.lflipper),
      rf: sampleFlipper(player.rflipper),
    }
  })

  return {balls, players}
}

const sampleFlipper = (flipper: Game.Flipper): Game.FlipperSample => {
  const { body } = flipper

  return {
    s: flipper.state,
    x: body.position.x,
    y: body.position.y,
    a: body.angle,
    vx: body.velocity.x,
    vy: body.velocity.y,
    va: body.angularVelocity,
  }
}

export const sampleInitial = (app: State.App): Game.InitialSample => {
  const posts = _.mapValues(app.game.posts, posts => ({
    x: posts.position.x,
    y: posts.position.y,
    a: posts.angle,
  }))

  const players = _.mapValues(app.game.players, player => ({
    x: player.basePosition.x,
    y: player.basePosition.y,
    a: player.baseAngle,
    p: player.paddle.id,
    lf: player.lflipper.body.id,
    rf: player.rflipper.body.id,
  }))

  return {posts, players}
}


export const tick = (app: State.App) => {
  _.forEach(app.game.balls, (ball: Matter.Body) => {
    handleBall(app, ball)
  })

  _.forEach(app.inputs, (input, id) => {
    const player: Game.Player = app.game.players[id]
    const isAlive = player.health > 0

    if (isAlive) Game.input(app.game, player, input)
  })

  app.inputs = {}
}


export const assign = (app: State.App): number => {
  const player = Game.assign(app.game)
  const id = player ? player.composite.id : null
  return id
}


export const input = (app: State.App, id: number, input: Game.Input) => {
  const player = app.game.players[id]
  Game.input(app.game, player, input)
}


export const run = (app: State.App) => {
  Game.run(app.game)
}


/****************************************
 * Gameplay Logic
 ****************************************/


const handleBall = (app: State.App, ball: Matter.Body) => {
  const distance = Matter.Vector.magnitude(ball.position)
  const didScore = distance > app.game.config.arena.radius;

  if (didScore) {
      handleScore(app, ball);
      Game.resetBall(app.game, ball)
  }
}


const handleScore = (app: State.App, ball: Matter.Body) => {
  _.forEach(app.game.players, player => {
    if (player.health <= 0) return

    var didScore = lineSegmentsIntersect(
        Matter.Vector.create(0, 0), ball.position,
        player.goal[0], player.goal[1]
    );

    if (didScore) {
      score(app, ball, player);
    }
  })
}


const score = (app: State.App, ball: Matter.Body, player: Game.Player) => {
  player.health -= app.game.config.ball.damage;

  app.server.to('players').emit('goal', {
    id: player.composite.id,
    health: player.health,
  })

  const isDead = player.health <= 0

  if (isDead) {
    console.log('Player is dead')
  }
}


const lineSegmentsIntersect = (
  p1: Matter.Vector,
  p2: Matter.Vector,
  q1: Matter.Vector,
  q2: Matter.Vector,
) => {
  const d = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x)
  const u = ((q1.x - p1.x) * (q2.y - q1.y) - (q1.y - p1.y) * (q2.x - q1.x)) / d
  const v = ((q1.x - p1.x) * (p2.y - p1.y) - (q1.y - p1.y) * (p2.x - p1.x)) / d

  const didIntersect = !(d == 0.0 || u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0)
  return didIntersect
}
