import * as $ from 'jquery'
import * as io from 'socket.io-client'
import * as Simulation from './simulation'
import * as Render from './render'
import * as Scene from './scene'
import * as State from './state'
import * as Game from '../../shared/game'
import * as Message from '../../shared/message'

const globalApp: State.IApp = {
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

const connect = (app: State.IApp, name, host, port) => {
  if (app.socket) { app.socket.disconnect() }

  app.server = {host, port}
  app.name = name
  app.socket = io(`${host}:${port}`)

  setup(app, app.socket)
}

const setup = (app: State.IApp, socket: SocketIOClient.Socket) => {
  socket.emit('join', name)

  socket.on('rejected', (message: Message.IReject) => {
    if (message.code === Message.ErrorCode.MATCHFULL) {
      alert('match is full!')
    } else if (message.code === Message.ErrorCode.MATCHSTARTED) {
      alert('match has already started!')
    }
  })

  socket.on('starting', (message: Message.IStarting) => {
    const seconds = message.delay / 1000
    console.log(`Game is starting in ${seconds} seconds!`)
  })

  socket.on('disconnect', (reason) => {
   if (reason === 'io server disconnect') {
      console.log('disconnected by server')
      reset(app)
    } else {
      console.log('disconnected...attempting to reconnect')
    }
  })

  socket.on('gameover', (message: Message.IGameOver) => {
    const { winner } = message
    alert(`Winner is player ${winner}!`)
    Scene.change(Scene.Name.Home)
  })

  socket.on('accepted', (message: Message.IAccept) => {
    const { id, config, sample } = message

    app.accepted = true
    app.assignment = id

    const element = $('#game').get(0)

    Simulation.setup(app, {element, config, sample})
    Simulation.run(app)

    Render.setup(app)
    Render.run(app)

    Scene.change(Scene.Name.Game)
  })

  socket.on('gamestate', (message: Message.IGameState) => {
    Simulation.sync(app, message.sample)
  })

  // TODO: Move these events to gamestate... this is a bug
  socket.on('goal', (message: Message.IGoal) => {
    const playerId = message.id
    const health = message.health

    Simulation.playerHealth(app, playerId, health)
    console.log('Goal on Player ', playerId)
  })

  socket.on('death', (message: Message.IDeath) => {
    const playerId = message.id

    Simulation.playerDeath(app, playerId)
    console.log('Player', playerId, 'died' )
  })

}

const reset = (app: State.IApp) => {
  if (app.socket) { app.socket.disconnect() }

  if (app.game) {
    Simulation.destroy(app)
    Render.destroy(app)
  }

  app.accepted = false
  Scene.change(Scene.Name.Home)
}

/**
 * User Events
 */

$('#play').click(() =>  {
  const name = $('#name').val()
  const host = $('#host').val()
  const port = $('#port').val()

  connect(globalApp, name, host, port)
})
