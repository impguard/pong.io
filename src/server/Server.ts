import * as planck from "planck-js"

import Game from "../shared/Game"
import * as state from "../shared/state"
import { generateUniqueId } from "../shared/utils"


export interface ServerDef {
  numPlayers: number
  paddle: {
    width: number
    height: number
  }
  base: {
    gap: number
    height: number
  }
  wall: {
    width: number
    height: number
  }
}

export default class Server {
 game: Game
 initialGameState: state.Game

  constructor(def: ServerDef) {
    this.def = def

    this.initialGameState = this.generateGameState()
    this.game = new Game(this.initialGameState)
  }

  generateGameState(): state.Game {
    const baseAngle = planck.Math.PI / this.def.numPlayers

    const paddleStates: state.Paddle[] = []

    let currPosition = planck.Vec2(1, 0)
    for (let i = 0; i < this.def.numPlayers; i++) {
      // Compute new angle for this player
      const angle = i * baseAngle

      // Get the end point of this player's base
      const nextPosition = planck.Vec2(
        planck.Math.cos(angle),
        planck.Math.sin(angle)
      )

      // The player will spawn at the midpoint of the base
      const midpoint = planck.Vec2.mid(currPosition, nextPosition)

      // Create paddle
      const paddleState: state.Paddle = {
        id: generateUniqueId(),
        width: this.def.paddle.width,
        height: this.def.paddle.height,
        x: midpoint.x,
        y: midpoint.y,
        angle: angle + planck.Math.PI / 2
      }

      paddleStates.push(paddleState)

      currPosition = nextPosition
    }

    const gameState: state.Game = {
      paddles: paddleStates,
      bases: [],
      walls: [],
    }

    return gameState
  }


  snapshot(): state.PartialGame {
    const paddles: state.Paddle[] = []
    Object.values(this.game.actors.paddles).forEach(paddle => {
      const position = paddle.body.getPosition()
      const angle = paddle.body.getAngle()

      paddles.push({
        id: paddle.def.id,
        x: position.x,
        y: position.y,
        width: paddle.def.width,
        height: paddle.def.height,
        angle,
      })
    })

    return {
      paddles,
    }
  }

  private def: ServerDef
}