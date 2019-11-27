import * as planck from "planck-js"

interface PaddleDef {
  id: number,
  position: planck.Vec2,
  width: number,
  height: number,
  angle: number,
}

export default class Paddle {
  readonly def: PaddleDef
  readonly body: planck.Body

  constructor(world: planck.World, def: PaddleDef) {
    this.world = world

    this.body = world.createBody({
      type: "dynamic",
      position: def.position,
      angle: def.angle,
    })

    this.fixture = this.body.createFixture({
      shape: planck.Box(def.width, def.height)
    })

    this.def = def
  }

  private fixture: planck.Fixture
  private world: planck.World
}