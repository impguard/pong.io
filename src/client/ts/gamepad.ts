import * as $ from 'jquery'
import * as _ from 'lodash'
import * as Game from '../../shared/game'


const keys = {
  left: 0,
  right: 0,
}

export const sample = (): Game.Input => {
  const input: Game.Input = {
    horizontal: keys.right - keys.left
  }

  return input
}

$(window).keydown(event => {
  const { keyCode } = event

  switch(keyCode) {
    case 39:
      keys.right = 1
      break
    case 37:
      keys.left = 1
      break
  }
})

$(window).keyup(event => {
  const { keyCode } = event

  switch(keyCode) {
    case 39:
      keys.right = 0
      break
    case 37:
      keys.left = 0
      break
  }
})