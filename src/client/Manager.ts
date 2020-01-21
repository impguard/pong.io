import * as planck from "planck-js"

import Viewer from "./Viewer"

import Game from "../shared/Game"
import * as state from "../shared/state"

interface ManagerDef {
  initialGameState: state.Game
  config: state.Config
  context: CanvasRenderingContext2D
  width: number
  height: number
}

export default class Manager {
  //
  // The underlying game that runs on the client.
  //
  game: Game

  //
  // The initial game state used to generate the game. It is currently kept for
  // reference purposes.
  //
  initialGameState: state.Game

  //
  // The config used by the game server. Acquired for reference purposes.
  //
  config: state.Config

  get ready() {
    return !!this.game
  }

  init(def: ManagerDef) {
    this.def = def

    this.initialGameState = def.initialGameState
    this.config = def.config

    this.game = new Game(def.initialGameState)
    this.viewer = new Viewer({
      game: this.game,
      initialGameState: this.def.initialGameState,
      context: def.context,
      width: def.width,
      height: def.height,
      scale: def.config.map.scale,
      options: {
        center: true,
        shape: true,
      }
    })
  }

  sync(state: state.PartialGame) {
    if (!this.ready) {
      return
    }

    state.paddles.forEach(paddleState => {
      const paddle = this.game.actors.paddles[paddleState.id]
      paddle.sync(paddleState)
    })

    state.balls.forEach(ballState => {
      const ball = this.game.actors.balls[ballState.id]
      ball.sync(ballState)
    })
  }

  render() {
    if (!this.ready) {
      return
    }

    this.viewer.render()
  }

  //
  // Underlying viewer that draws fixtures onto the canvas
  //
  private viewer: Viewer

  //
  // Underlying definition used to generate a manager.
  //
  private def: ManagerDef
}