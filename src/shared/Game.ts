import * as planck from "planck-js"

import Paddle from "./components/Paddle"
import Wall from "./components/Wall"
import Base from "./components/Base"
import * as state from "./state"


export default class Game {
  readonly world: planck.World
  readonly actors: Actors

  constructor(state: state.Game) {
    this.world = planck.World()

    this.actors = {
      paddles: {},
      bases: {},
      walls: {},
    }

    state.paddles.forEach(paddleState => {
      const { id, width, height, x, y, angle } = paddleState

      const paddle = new Paddle(this.world, {
        id,
        width,
        height,
        position: planck.Vec2(x, y),
        angle,
      })

      this.actors.paddles[paddle.def.id] = paddle
    })

    state.bases.forEach(baseState => {
      const { id, width, height, x, y, angle } = baseState

      const base = new Base(this.world, {
        id,
        width,
        height,
        position: planck.Vec2(x, y),
        angle,
      })

      this.actors.bases[base.id] = base
    })

    state.walls.forEach(wallState => {
      const { id, width, height, x, y, angle } = wallState

      const wall = new Wall(this.world, {
        id,
        width,
        height,
        position: planck.Vec2(x, y),
        angle,
      })

      this.actors.walls[wall.id] = wall
    })
  }

  step(interval: number) {
    this.world.step(interval)
  }
}

interface Actors {
  walls: {
    [id: number]: Wall
  }
  paddles: {
    [id: number]: Paddle
  }
  bases: {
    [id: number]: Base
  }
}