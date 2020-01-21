import * as planck from "planck-js"

import Game from "../shared/Game"
import * as state from "../shared/state"
import { CircleShape } from "planck-js"

interface ViewerDef {
  game: Game
  initialGameState: state.Game
  context: CanvasRenderingContext2D
  width: number
  height: number
  scale: number

  options: {
    center: boolean 
    shape: boolean
  }
}

export default class Viewer {
  constructor(def: ViewerDef) {
    this.def = def
    this.context = def.context
    this.game = def.game

    this.maxX = this.def.width / 2
    this.minX = -this.maxX
    this.maxY = this.def.height / 2
    this.minY = -this.maxY

    this.context.translate(this.maxX, this.maxY)
  }

  render() {
    this.context.clearRect(this.minX, this.minY, this.def.width, this.def.height)

    this.context.strokeStyle = "blue"
    this.context.fillStyle = "black"
    Object.values(this.game.actors.paddles).forEach(paddle => {
      this.renderBody(paddle.body)
    })

    this.context.strokeStyle = "red"
    this.context.fillStyle = "black"
    Object.values(this.game.actors.walls).forEach(wall => {
      this.renderBody(wall.body)
    })

    this.context.strokeStyle = "green"
    this.context.fillStyle = "black"
    Object.values(this.game.actors.bases).forEach(base => {
      this.renderBody(base.body)
    })

    this.context.strokeStyle = "black"
    this.context.fillStyle = "black"
    Object.values(this.game.actors.balls).forEach(ball => {
      this.renderBody(ball.body)
    })
  }

  renderBody(body: planck.Body) {
    for (let f = body.getFixtureList(); f; f = f.getNext()) {
      const type = f.getType()
      const shape = f.getShape()
      
      switch(type) {
        case "polygon":
          this.renderPolygon(shape as planck.PolygonShape, body)
          break
        case "circle":
          this.renderCircle(shape as planck.CircleShape, body)
          break
        default:
          console.log("Unsupported render operation for shape", shape)
          break
      }
    }
  }

  renderCircle(shape: planck.CircleShape, body:planck.Body) {
    const center = body.getWorldCenter()
    const radius = shape.getRadius()

    if (this.def.options.shape) {
      this.context.beginPath()
      this.context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false)
      this.context.stroke()
    }

    if (this.def.options.center) {
      this.context.fillRect(center.x - 1, center.y - 1, 2, 2)
    }
  }

  renderPolygon(shape: planck.PolygonShape, body: planck.Body) {
    const initialLocalPoint = shape.m_vertices[0]
    const initialWorldPoint = body.getWorldPoint(initialLocalPoint)
    const initialPoint = this.getRenderPoint(initialWorldPoint)

    if (this.def.options.shape) {
      this.context.beginPath()
      this.context.moveTo(initialPoint.x, initialPoint.y)

      for (let i = 1; i < shape.m_vertices.length; i++) {
        const localPoint = shape.m_vertices[i]
        const worldPoint = body.getWorldPoint(localPoint)
        const point = this.getRenderPoint(worldPoint)

        this.context.lineTo(point.x, point.y)
      }

      this.context.lineTo(initialPoint.x, initialPoint.y)
      this.context.stroke()
    }

    if (this.def.options.center) {
      const position = this.getRenderPoint(body.getPosition())
      this.context.fillRect(position.x - 1, position.y - 1, 2, 2)
    }
  }

  getRenderPoint(point: planck.Vec2) {
    const newX = point.x / this.def.scale * (this.def.width / 2)
    const newY = -point.y / this.def.scale * (this.def.height / 2)

    return planck.Vec2(newX, newY)
  }

  private readonly minX: number
  private readonly maxX: number
  private readonly minY: number
  private readonly maxY: number

  private readonly context: CanvasRenderingContext2D
  private readonly game: Game
  private readonly def: ViewerDef
}