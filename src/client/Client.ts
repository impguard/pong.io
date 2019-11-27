import * as planck from "planck-js"

import Game from "../shared/Game"
import * as state from "../shared/state"

interface ClientDef {
  initialGameState: state.Game
  context: CanvasRenderingContext2D
  width: number
  height: number
}

export default class Client {
  game: Game
  initialGameState: state.Game

  init(def: ClientDef) {
    this.initialGameState = def.initialGameState
    this.context = def.context
    this.width = def.width
    this.height = def.height

    this.game = new Game(def.initialGameState)
  }

  sync(state: state.PartialGame) {
    if (!this.ready) {
      return
    }

    state.paddles.forEach(paddleState => {
      const paddle = this.game.actors.paddles[paddleState.id]
      
      paddle.body.setPosition(planck.Vec2(paddleState.x, paddleState.y))
      paddle.body.setAngle(paddleState.angle)
    })
  }

  render() {
  }

  get ready() {
    return !!this.game
  }

  private width: number
  private height: number
  private context: CanvasRenderingContext2D
  private def: ClientDef
}