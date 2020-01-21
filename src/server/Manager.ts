import * as planck from "planck-js"

import Game from "../shared/Game"
import * as state from "../shared/state"
import { generateUniqueId } from "../shared/utils"


export default class Manager {
  game: Game
  initialGameState: state.Game
  config: state.Config

  constructor(config: state.Config) {
    this.config = config

    this.mapBound = config.map.scale - config.map.gap
    this.initialGameState = this.generateGameState()
    this.game = new Game(this.initialGameState)
  }

  generateGameState(): state.Game {
    const baseAngle = 2 * planck.Math.PI / this.config.numPlayers

    const paddleStates: state.Paddle[] = []
    const wallStates: state.Wall[] = []
    const baseStates: state.Base[] = []
    const ballStates: state.Ball[] = []

    let currPosition = planck.Vec2(this.mapBound, 0)
    let currOffsetPosition = planck.Vec2(this.mapBound + this.config.base.offset, 0)
    for (let i = 1; i < this.config.numPlayers + 1; i++) {
      // Compute new angle for this player
      const angle = i * baseAngle

      // Get the end point of this player's base
      const nextPosition = i === this.config.numPlayers
        ? planck.Vec2(this.mapBound, 0)
        : planck.Vec2(
            this.mapBound * planck.Math.cos(angle),
            this.mapBound * planck.Math.sin(angle)
          )

      // The player will spawn at the midpoint of the base
      const midpoint = planck.Vec2.mid(currPosition, nextPosition)

      // Create paddle
      const paddleState: state.Paddle = {
        id: generateUniqueId(),
        width: this.config.paddle.width,
        height: this.config.paddle.height,
        x: midpoint.x,
        y: midpoint.y,
        angle: angle - (baseAngle - planck.Math.PI) / 2
      }

      paddleStates.push(paddleState)

      // Create wall
      const wallState: state.Wall = {
        id: generateUniqueId(),
        width: this.config.wall.width,
        height: this.config.wall.height,
        x: nextPosition.x,
        y: nextPosition.y,
        angle: angle + planck.Math.PI / 2,
      }

      wallStates.push(wallState)

      // Create base
      const nextOffsetPosition = i === this.config.numPlayers
        ? planck.Vec2(this.mapBound + this.config.base.offset, 0)
        : planck.Vec2.add(nextPosition, planck.Vec2(
            this.config.base.offset * planck.Math.cos(angle),
            this.config.base.offset * planck.Math.sin(angle)
          ))

      const baseWidth = planck.Vec2.distance(
        currOffsetPosition, nextOffsetPosition,
      ) - this.config.base.gap

      const basePosition = planck.Vec2.mid(currOffsetPosition, nextOffsetPosition)

      const baseState: state.Base = {
        id: generateUniqueId(),
        width: baseWidth,
        height: this.config.base.height,
        x: basePosition.x,
        y: basePosition.y,
        angle: angle - (baseAngle - planck.Math.PI) / 2,
      }

      baseStates.push(baseState)

      currPosition = nextPosition
      currOffsetPosition = nextOffsetPosition
    }

    for (let i = 0; i < this.config.numBalls; i++) {
      const angle = 2 * planck.Math.PI * planck.Math.random()
      const speed = this.config.ball.maxSpeed
      const velocity = planck.Vec2(
        planck.Math.cos(angle),
        planck.Math.sin(angle)
      ).mul(speed)

      const ballState: state.Ball = {
        id: generateUniqueId(),
        radius: this.config.ball.radius,
        x: 0,
        y: 0,
        vx: this.config.ball.maxSpeed,
        vy: 0,
      }

      ballStates.push(ballState)
    }

    const gameState: state.Game = {
      paddles: paddleStates,
      walls: wallStates,
      bases: baseStates,
      balls: ballStates,
    }

    return gameState
  }


  snapshot(): state.PartialGame {
    const paddles: state.Paddle[] = []
    const balls: state.Ball[] = []

    Object.values(this.game.actors.paddles).forEach(paddle => {
      paddles.push(paddle.snapshot())
    })

    Object.values(this.game.actors.balls).forEach(ball => {
      balls.push(ball.snapshot())
    })

    return {
      paddles,
      balls,
    }
  }

  private mapBound: number
}