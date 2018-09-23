import * as $ from 'jquery'
import * as _ from 'lodash'
import * as Game from '../../shared/game'


const input: Game.Input = {
  left: 0,
  right: 0,
}

export const sample = (): Game.Input => {
  return _.cloneDeep(input)
}

$(window).keydown(event => {
  const { keyCode } = event

  switch(keyCode) {
    case 39:
      input.right = 1
      break
    case 37:
      input.left = 1
      break
  }
})

$(window).keyup(event => {
  const { keyCode } = event

  switch(keyCode) {
    case 39:
      input.right = 0
      break
    case 37:
      input.left = 0
      break
  }
})