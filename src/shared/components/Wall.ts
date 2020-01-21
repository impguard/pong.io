import * as planck from "planck-js"

import * as state from "../state"
import Component from "./Component"

export interface WallDef {
  id: number,
  position: planck.Vec2,
  width: number,
  height: number,
  angle: number,
}

export default class Wall extends Component {
  readonly def: WallDef
  readonly body: planck.Body

  constructor(world: planck.World, def: WallDef) {
    super()
    this.def = def
    this.world = world

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

  sync(state: state.Paddle): void {
    this.body.setPosition(planck.Vec2(state.x, state.y))
    this.body.setAngle(state.angle)
  }

  snapshot(): void {
    throw new Error("Cannot snapshot wall state");
  }

  private readonly world: planck.World
}