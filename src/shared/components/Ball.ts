import * as planck from "planck-js"

import Component from "./Component"
import * as state from "../state"

interface BallDef {
  id: number,
  position: planck.Vec2,
  velocity: planck.Vec2,
  radius: number,
}

export default class Paddle extends Component {
  readonly def: BallDef
  readonly body: planck.Body

  constructor(world: planck.World, def: BallDef) {
    super()
    this.world = world
    this.def = def

    this.body = world.createBody({
      type: "dynamic",
      position: def.position,
      angle: 0,
      fixedRotation: true,
    })

    this.body.createFixture({
      shape: planck.Circle(def.radius)
    })

    this.body.setLinearVelocity(def.velocity)
  }

  sync(state: state.Ball): void {
    this.body.setPosition(planck.Vec2(state.x, state.y))
    this.body.setLinearVelocity(planck.Vec2(state.vx, state.vy))
  }

  snapshot(): state.Ball {
    const position = this.body.getPosition()
    const velocity = this.body.getLinearVelocity()

    return {
      id: this.def.id,
      x: position.x,
      y: position.y,
      vx: velocity.x,
      vy: velocity.y,
      radius: this.def.radius,
    }
  }

  private readonly world: planck.World
}