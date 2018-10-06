import * as $ from 'jquery'
import * as _ from 'lodash'
import * as Game from '../../shared/game'

const keys = {
  left: 0,
  right: 0,
  j: false,
  k: false,
}

export const sample = (): Game.Input => {
  const input: Game.Input = {
    horizontal: keys.right - keys.left,
    lswing: keys.j,
    rswing: keys.k,
  }

  return input
}

$(window).keydown((event) => {
  const { keyCode } = event

  switch (keyCode) {
    case 68:
      keys.right = 1
      break
    case 65:
      keys.left = 1
      break
    case 39:
      keys.right = 1
      break
    case 37:
      keys.left = 1
      break
    case 74:
      keys.j = true
      break
    case 75:
      keys.k = true
      break
  }
})

$(window).keyup((event) => {
  const { keyCode } = event

  switch (keyCode) {
    case 68:
      keys.right = 0
      break
    case 65:
      keys.left = 0
      break
    case 39:
      keys.right = 0
      break
    case 37:
      keys.left = 0
      break
    case 74:
      keys.j = false
      break
    case 75:
      keys.k = false
      break
  }
})
