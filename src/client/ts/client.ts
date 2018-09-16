import * as io from 'socket.io-client'
import * as game from './game'
import * as scene from './scene'

const state = {
  socket: null
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

  scene.change(scene.Name.Game)
})
