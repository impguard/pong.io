import * as $ from 'jquery'
import * as io from 'socket.io-client'
import * as Simulation from './simulation'
import * as Scene from './scene'
import * as State from './state'
import * as Game from '../../shared/game'


const app: State.App = {
  socket: null,
  server: null,
  name: null,
  started: false,
  accepted: false,
  game: null,
}

/**
 * State Handlers
 */

const connect = (app: State.App, name, host, port) => {
  if (app.socket) app.socket.disconnect()

  app.server = {host, port}
  app.name = name
  app.socket = io(`${host}:${port}`)

  setup(app.socket)
}

const setup = (socket: SocketIOClient.Socket) => {
  socket.emit('join', name)

  socket.on('disconnect', (reason) => {
   if (reason === 'io server disconnect') {
      reset(app)
    }
  })

  socket.on('accepted', (config) => {
    app.accepted = true

    const element = $("#game").get(0)

    Simulation.setup(app, {element, config, socket})
    Simulation.run(app)

    Scene.change(Scene.Name.Game)
  })
}

const reset = (app: State.App) => {
  if (app.socket) app.socket.disconnect()
  if (app.game) Simulation.destroy(app)

  app.accepted = false
  Scene.change(Scene.Name.Home)
}

/**
 * User Events
 */

$('#play').click(() =>  {
  const name = $("#name").val()
  const host = $("#host").val()
  const port = $("#port").val()

  connect(app, name, host, port)
})

$('#reset').click(() => {
  const host = app.server.host
  const port = app.server.port

  fetch(`http://${host}:${port}/reset`)

  reset(app)
})