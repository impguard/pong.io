import * as planck from "planck-js"

export interface WallDef {
  id: number,
  position: planck.Vec2,
  width: number,
  height: number,
  angle: number,
}

export default class Wall {

  constructor(world: planck.World, def: WallDef) {
    this.world = world;

    this.body = world.createBody({
      userData: {
        id: def.id
      },
      type: "static",
      position: def.position,
      angle: def.angle,
    })

    this.fixture = this.body.createFixture({
      shape: planck.Box(def.width, def.height)
    })
  }

  get id(): number {
    return (this.body.getUserData() as any).id
  }

  private fixture: planck.Fixture
  private body: planck.Body
  private world: planck.World
}