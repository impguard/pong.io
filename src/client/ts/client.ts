import * as io from 'socket.io-client'
import * as game from './game'

enum Scene {
  Home = 'home',
  Game = 'game'
}

const state = {
  scene: document.getElementById(Scene.Home),
  socket: null
}

const switchScene = (scene: Scene) => {
  state.scene.style.display = 'none'
  state.scene = document.getElementById(scene)
  state.scene.style.display = ''
}

const play = document.getElementById('play')

play.addEventListener('click', () => {
  const host = (<HTMLInputElement> document.getElementById('host')).value
  const port = (<HTMLInputElement> document.getElementById('port')).value

  if (state.socket) {
    state.socket.disconnect()
  }

  state.socket = io(`${host}:${port}`)

  game.setup(state.socket)

  switchScene(Scene.Game)
})

// Client connects to game, gets initial game info
// => Server can choose to block client, or not
// => Generates physics/canvas/gamestate/all the things
// => Physics has references to all the game state objects

// It will get state from the server
// between state updates it will...
//
// getinput
// modify its player object based on input
// run a simulation frame
// based on location of objects, lerp position on screen
//
// when game state received from server
// server reconciliation
// => rollback current state
// => simulate forward based on history of inputs
