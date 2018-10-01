import * as $ from 'jquery'
import * as io from 'socket.io-client'
import * as Simulation from './simulation'
import * as Scene from './scene'
import * as State from './state'
import * as Game from '../../shared/game'
import * as Message from '../../shared/message'


const app: State.App = {
  socket: null,
  server: null,
  name: null,
  started: false,
  accepted: false,
  assignment: null,
  game: null,
  render: null,
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

  socket.on('rejected', (message: Message.Reject) => {
    if (message.code == Message.ErrorCode.MATCHFULL) {
      alert("match is full")
    }
  })

  socket.on('disconnect', (reason) => {
   if (reason === 'io server disconnect') {
      console.log('disconnected by server')
      reset(app)
    }
    else {
      console.log('disconnected...attempting to reconnect')
    }
  })

  socket.on('accepted', (message: Message.Accept) => {
    const { id, config, sample } = message

    app.accepted = true
    app.assignment = id

    const element = $("#game").get(0)

    Simulation.setup(app, {element, config, sample})

    const player = app.game.players[app.assignment]
    const angle = player.baseAngle
    $(app.render.canvas).css('transform', `scaleY(-1) rotate(-${angle}rad)`)

    Simulation.run(app)

    Scene.change(Scene.Name.Game)
  })

  socket.on('gamestate', (message: Message.GameState) => {
    Simulation.sync(app, message.sample)
  })

  socket.on('goal', (message: Message.Goal) => {
    const playerId = message.id
    const health = message.health

    Simulation.health(app, playerId, health)
    console.log('Goal on Player ', playerId)
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