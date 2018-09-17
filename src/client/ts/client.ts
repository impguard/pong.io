import * as app from './app'
import * as io from 'socket.io-client'
import * as scene from './scene'

const state = {
  socket: null,
  accepted: false,
  simulation: null,
}

const play = document.getElementById('play')
const reset = document.getElementById('reset')

play.addEventListener('click', () => {
  const name = (<HTMLInputElement> document.getElementById('name')).value
  const host = (<HTMLInputElement> document.getElementById('host')).value
  const port = (<HTMLInputElement> document.getElementById('port')).value

  if (state.socket) state.socket.disconnect()
  state.socket = io(`${host}:${port}`)
  state.socket.on('connect', connect, name)
})

reset.addEventListener('click', () => {
  const host = 'localhost'
  const port = '7777'

  fetch(`http://${host}:${port}/reset`)

  cleanUp()
})

const connect = (name: string) => {
  state.socket.emit('newPlayer', name)

  state.socket.on('disconnect', cleanUp)
  state.socket.on('accepted', () => {
    state.accepted = true

    state.simulation = app.run(app.setup())

    scene.change(scene.Name.Game)
  })
}

const cleanUp = () => {
  if (state.accepted) {
    app.destroy(state.simulation)
    state.accepted = false
  }
  state.socket.disconnect()

  scene.change(scene.Name.Home)
}
