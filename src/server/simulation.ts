import * as Matter from 'matter-js'
import * as _ from 'lodash'
import * as Game from '../shared/game'
import * as Util from './util'
import * as Bot from './bot'
import event from '../shared/event'
import { IApp, Status } from './interface'

export const setup = (app: IApp, config: Game.IConfig) => {
  app.game =  Game.create(config)

  // Spawn the balls into the game
  _.times(app.game.config.numBalls, () => {
    const ball = Game.spawnBall(app.game)
    Game.resetBall(app.game, ball)
  })

  const numPlayers = config.numPlayers
  const radius = config.arena.radius

  // Spawn each goal post
  const theta = 2 * Math.PI / numPlayers

  const posts = _.map(_.range(0, numPlayers), (num) => {
    const angle = num * theta
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)

    const position = Matter.Vector.create(x, y)

    const post = Game.spawnPost(app.game, {position, angle})

    return post
  })

  // Spawn every player
  _.times(numPlayers, (num) => {
    const leftPost = posts[num]
    const rightPost = posts[(num + 1) % numPlayers]

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
}

export const sample = (app: IApp): Game.ISample => {
  // May be worth optimizing this area of code
  const balls = _.mapValues(app.game.balls, (ball) => ({
    x: ball.position.x,
    y: ball.position.y,
    vx: ball.velocity.x,
    vy: ball.velocity.y,
  }))

  const players = _.mapValues(app.game.players, (player) => ({
    p: {
      x: player.paddle.position.x,
      y: player.paddle.position.y,
      vx: player.paddle.velocity.x,
      vy: player.paddle.velocity.y,
    },
    lf: sampleFlipper(player.lflipper),
    rf: sampleFlipper(player.rflipper),
    h: player.health,
  }))

  const covers = _.mapValues(app.game.covers, (cover) => ({
    x: cover.position.x,
    y: cover.position.y,
    a: cover.angle,
  }))

  return {balls, players, covers}
}

const sampleFlipper = (flipper: Game.IFlipper): Game.ISampleFlipper => {
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

export const sampleInitial = (app: IApp): Game.ISampleInitial => {
  const posts = _.mapValues(app.game.posts, (post) => ({
    x: post.position.x,
    y: post.position.y,
    a: post.angle,
  }))

  const players = _.mapValues(app.game.players, (player) => ({
    x: player.basePosition.x,
    y: player.basePosition.y,
    a: player.baseAngle,
    p: player.paddle.id,
    lf: player.lflipper.body.id,
    rf: player.rflipper.body.id,
  }))

  return {posts, players}
}

export const tick = (app: IApp) => {
  const { min, max } = app.game.config.ball.speed

  _.forEach(app.game.balls, (ball: Matter.Body) => {
    handleBall(app, ball)
    Game.clampBall(ball, min, max)
  })

  _.forEach(app.game.players, (player: Game.IPlayer) => {
    const isBot = !player.assigned
    const shouldBotPlay = app.status === Status.PLAYING

    const input = isBot && shouldBotPlay
      ? getBotPlayerInput(app, player)
      : !isBot
      ? getRealPlayerInput(app, player)
      : null

    if (!input) {
      return
    }

    const isAlive = player.health > 0

    if (isAlive) {
      Game.handleInput(app.game, player, input)
    }
  })
}

export const assign = (app: IApp): number => {
  const player = Game.assign(app.game)
  const id = player ? player.composite.id : null
  return id
}

export const reset = (app: IApp) => {
  _.forEach(app.game.balls, (ball: Matter.Body) => {
    Game.resetBall(app.game, ball)
  })

  _.forEach(app.game.players, (player) => {
    const position = player.basePosition
    const angle = player.baseAngle

    Matter.Body.setPosition(player.paddle, position)
    Matter.Body.setVelocity(player.paddle, Matter.Vector.create(0, 0))

    resetFlipper(player.lflipper)
    resetFlipper(player.rflipper)
  })
}

const resetFlipper = (flipper: Game.IFlipper) => {
  Matter.Body.setPosition(flipper.body, flipper.basePosition)
  Matter.Body.setVelocity(flipper.body, Matter.Vector.create(0, 0))

  Matter.Body.setAngle(flipper.body, flipper.baseAngle)
  Matter.Body.setAngularVelocity(flipper.body, 0)

  flipper.state = Game.IFlipperState.READY
}

export const run = (app: IApp) => {
  Game.run(app.game, () => tick(app))
}

/****************************************
 * Gameplay Logic
 ****************************************/

const getRealPlayerInput = (app: IApp, player: Game.IPlayer) => {
  const { id } = player.composite
  const { message } = app.players[id]

  if (!message) {
    return
  }

  const { input, frame } = message

  app.players[id].latestFrame = frame
  return input
}

const getBotPlayerInput = (app: IApp, player: Game.IPlayer) => {
  const input = Bot.think(app.game, player)
  return input
}

const handleBall = (app: IApp, ball: Matter.Body) => {
  const distance = Matter.Vector.magnitude(ball.position)
  const didScore = distance > app.game.config.arena.radius
  const isPlaying = app.status === Status.PLAYING

  if (didScore && isPlaying) {
      handleScore(app, ball)
      checkGameOver(app)
  }

  if (didScore) {
      Game.resetBall(app.game, ball)
  }
}

/**
 * Checks if the game is over.
 *
 * Note that it is expected that there will always be a positive number of
 * survivors. This function avoids the "no winner" problem by assuming that the
 * game design ensures that this cannot happen, eg. always have one less ball
 * than the number of players or checking game over after every individual ball
 * score.
 */
export const checkGameOver = (app: IApp) => {
  const survivors = _.filter(app.game.players, (player) => player.health > 0)
  const winner = _.size(survivors) <= 1
    ? _.first(survivors)
    : undefined

  if (!winner) {
    return
  }

  event.emit('gameOver', winner.composite.id)
}

const handleScore = (app: IApp, ball: Matter.Body) => {
  _.forEach(app.game.players, (player) => {
    if (player.health <= 0) { return }

    const didScore = !!Util.intersectsAt(
        Matter.Vector.create(0, 0), ball.position,
        player.goal[0], player.goal[1],
    )

    if (didScore) {
      score(app, ball, player)
    }
  })
}

const score = (app: IApp, ball: Matter.Body, player: Game.IPlayer) => {
  player.health -= app.game.config.ball.damage

  const isDead = player.health <= 0

  if (isDead) {
    console.log(`Player ${player.composite.id} is dead!`)
    Game.spawnCoverForPlayer(app.game, player)
  }
}
