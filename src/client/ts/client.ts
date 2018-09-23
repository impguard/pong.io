import * as $ from 'jquery'
import * as io from 'socket.io-client'
import * as simulation from './simulation'
import * as scene from './scene'
import * as State from './state'


const app: State.App = {
  socket: null,
  server: null,
  name: null,
  started: false,
  accepted: false,
  simulation: null,
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

  socket.on('accepted', () => {
    app.accepted = true

    const element = $("#game").get(0)

    simulation.setup(app, element, socket)
    simulation.run(app)

    scene.change(scene.Name.Game)
  })
}

const reset = (app: State.App) => {
  debugger
  if (app.socket) app.socket.disconnect()
  if (app.simulation) simulation.destroy(app)

  app.accepted = false
  scene.change(scene.Name.Home)
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