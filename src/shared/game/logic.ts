import * as Matter from 'matter-js';
import * as Interface from './interface'


export const setPlayerVelocity = (state: Interface.State,
                                  player: Interface.Player,
                                  velocity: Matter.Vector) => {
  player.velocity = velocity
  Matter.Body.setVelocity(player.paddle, velocity)
  Matter.Body.setVelocity(player.rflipper.body, velocity)
  Matter.Body.setVelocity(player.lflipper.body, velocity)
}


export const resetBall = (state: Interface.State, ball: Matter.Body) => {
  const x = 2 * Math.random() - 1
  const y = 2 * Math.random() - 1

  const direction = Matter.Vector.normalise(Matter.Vector.create(x, y))
  const velocity = Matter.Vector.mult(direction, state.config.ball.speed.max)

  Matter.Body.setPosition(ball, Matter.Vector.create(0, 0))
  Matter.Body.setVelocity(ball, velocity)
}

export const rotateFlipper = (state: Interface.State,
                              flipper: Interface.Flipper,
                              angle: number) =>  {
  const { width } = state.config.flipper
  const isLeft = flipper.type === Interface.FlipperType.LEFT

  const direction = isLeft ? 1 : -1
  const gap = direction * width / 2

  const right = Matter.Vector.rotate(
    Matter.Vector.create(1, 0),
    flipper.body.angle
  )

  const point = Matter.Vector.add(
    flipper.body.position,
    Matter.Vector.mult(right, gap)
  )

  rotateBody(flipper.body, point, angle)
}

const rotateBody = (body: Matter.Body, point: Matter.Vector, angle: number) => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  const dx = body.position.x - point.x
  const dy = body.position.y - point.y

  Matter.Body.setPosition(body, {
      x: point.x + (dx * cos - dy * sin),
      y: point.y + (dx * sin + dy * cos)
  })

  Matter.Body.rotate(body, angle)
}