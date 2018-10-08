import * as Matter from 'matter-js'
import * as _ from 'lodash'
import * as Util from './util'
import { IState, IPlayer, IInput } from '../shared/game'

export const think = (state: IState, player: IPlayer): IInput => {
  let intersection
  let shortestTime = Infinity

  _.forEach(state.balls, (ball) => {
    const { speed, position } = ball
    const scoreIntersection = scoresAt(ball, player)

    if (!scoreIntersection) {
      return input(0, false, false)
    }

    const distance = Matter.Vector.magnitude(
      Matter.Vector.sub(position, scoreIntersection))

    const time = distance / speed

    if (time < shortestTime) {
      shortestTime = time
      intersection = scoreIntersection
    }
  })

  if (!intersection) {
    return input(0, false, false)
  }

  const { position: paddlePosition } = player.paddle
  const { width: paddleWidth } = state.config.paddle

  const direction = Matter.Vector.sub(intersection, paddlePosition)
  const isCloseEnough = Matter.Vector.magnitude(direction) < paddleWidth / 2

  if (isCloseEnough) {
    return input(0, false, false)
  }

  const { right } = player
  const horizontal = Matter.Vector.dot(right, direction) > 0 ? 1 : -1

  return input(horizontal, false, false)
}

const scoresAt = (ball: Matter.Body, player: IPlayer): Matter.Vector => {
  const [post1, post2] = player.goal
  const { position, velocity } = ball

  const destination = Matter.Vector.add(
    position,
    Matter.Vector.mult(velocity, 1000),
  )

  const intersection = Util.intersectsAt(position, destination, post1, post2)

  return intersection
}

const input = (horizontal: number, lswing: boolean, rswing: boolean) => ({
  horizontal, lswing, rswing,
})
