import * as io from 'socket.io-client'
import * as app from './app'
import * as scene from './scene'

const state = {
  socket: null
}

const play = document.getElementById('play')
const reset = document.getElementById('reset')

play.addEventListener('click', () => {
  const host = (<HTMLInputElement> document.getElementById('host')).value
  const port = (<HTMLInputElement> document.getElementById('port')).value

  if (state.socket) {
    state.socket.disconnect()
  }

  state.socket = io(`${host}:${port}`)

  app.run(app.setup(state.socket))

  scene.change(scene.Name.Game)
})

reset.addEventListener('click', () => {
  const host = (<HTMLInputElement> document.getElementById('host')).value
  const port = (<HTMLInputElement> document.getElementById('port')).value

  fetch(`http://${host}:${port}/reset`)
})
