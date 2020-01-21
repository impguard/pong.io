import * as planck from "planck-js"

import * as state from "../state"
import Component from "./Component"

interface PaddleDef {
  id: number,
  position: planck.Vec2,
  width: number,
  height: number,
  angle: number,
}

export default class Paddle extends Component {
  readonly def: PaddleDef
  readonly body: planck.Body

  constructor(world: planck.World, def: PaddleDef) {
    super()
    this.world = world
    this.def = def

    this.body = world.createBody({
      type: "kinematic",
      position: def.position,
      angle: def.angle,
    })

    this.body.createFixture({
      shape: planck.Box(def.width / 2, def.height / 2)
    })
  }

  sync(state: state.Paddle): void {
    this.body.setPosition(planck.Vec2(state.x, state.y))
    this.body.setAngle(state.angle)
  }

  snapshot(): state.Paddle {
    const position = this.body.getPosition()
    const angle = this.body.getAngle()

    return {
      id: this.def.id,
      x: position.x,
      y: position.y,
      width: this.def.width,
      height: this.def.height,
      angle: angle,
    }
  }

  private readonly world: planck.World
}