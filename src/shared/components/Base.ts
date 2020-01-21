import * as planck from "planck-js"

import * as state from "../state"
import Component from "./Component"

interface BaseDef {
  id: number,
  position: planck.Vec2,
  width: number,
  height: number,
  angle: number,
}

export default class Base extends Component {
  readonly def: BaseDef
  readonly body: planck.Body

  constructor(world: planck.World, def: BaseDef) {
    super()
    this.world = world
    this.def = def

    this.body = world.createBody({
      userData: {
        id: def.id
      },
      type: "static",
      position: def.position,
      angle: def.angle,
    })

    this.body.createFixture({
      shape: planck.Box(def.width / 2, def.height / 2),
      isSensor: true,
    })
  }

  sync(state: state.Base): void {
    this.body.setPosition(planck.Vec2(state.x, state.y))
    this.body.setAngle(state.angle)
  }

  snapshot() {
    throw new Error("Cannot snapshot base state");
  }

  private readonly world: planck.World
}