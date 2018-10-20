import * as http from 'http'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as logger from 'koa-logger'
import * as io from 'socket.io'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as Simulation from './simulation'
import * as Message from '../shared/message'
import { Status, IApp } from './interface'
import event from '../shared/event'
import getConfig from './config'

/****************************************
 * Koa Application
 ****************************************/

const koa = new Koa()
const router = new Router()

router.get('/health', (ctx) => {
  ctx.body = {
    health: 'ENABLED',
  }
})

router.get('/reset', (ctx) => {
  ctx.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  ctx.body = {
    state: 'RESET',
  }
})

router.get('/version', (ctx) => {
  ctx.type = 'json'
  ctx.body = fs.createReadStream('version.json')
})

koa.use(logger())
   .use(router.routes())
   .use(router.allowedMethods())

const httpServer = http.createServer(koa.callback())

/****************************************
 * Game Application
 ****************************************/

const create = async () => {
  // Create app state
  const app: IApp = {
    status: Status.READY,
    config: null,
    players: {},
    game: null,
    server: io(httpServer),
  }

  const config = await getConfig()
  app.config = config.app

  Simulation.setup(app, config.game)

  // Setup app event handlers
  event.on('gameOver', (winner: number) => {
    gameOver(app, winner)
  })

  // Setup app server connection handler
  app.server.on('connection', (socket) => {
    const didAdd = add(app, socket)

    if (!didAdd) {
      console.log('Rejected player')
      return
    }

    const numPlayers = getPlayerCount(app)
    const { playersRequired } = app.config.match

    if (app.status === Status.READY && numPlayers >= playersRequired) {
      app.status = Status.STARTING

      setTimeout(() => start(app), app.config.match.startDelay)

      const startingMessage: Message.IStarting = {
        delay: app.config.match.startDelay,
      }

      app.server.to('players').emit('starting', startingMessage)
      console.log(`Starting game in ${app.config.match.startDelay}ms`)
    }
  })

  return app
}

const add = (app: IApp, socket: SocketIO.Socket) => {
  const isAccepting = app.status === Status.READY
    || app.status === Status.STARTING

  if (!isAccepting) {
    const rejectMessage: Message.IReject = {
      code: Message.ErrorCode.MATCHSTARTED,
    }

    socket.emit('rejected', rejectMessage)
    socket.disconnect()
    return false
  }

  const id = Simulation.assign(app)

  if (!id) {
    const rejectMessage: Message.IReject = {
      code: Message.ErrorCode.MATCHFULL,
    }

    socket.emit('rejected', rejectMessage)
    socket.disconnect()
    return false
  }

  const acceptMessage: Message.IAccept = {
    id,
    config: app.game.config,
    sample: Simulation.sampleInitial(app),
  }

  socket.emit('accepted', acceptMessage)
  socket.join('players')

  app.players[id] = {
    socket,
    message: null,
    latestFrame: 0,
  }

  console.log(`Accepted player. Assigned to ${id}`)

  socket.on('disconnect', () => {
    const remaining = getPlayerCount(app)

    if (remaining === 0) {
      console.log('No players remaining!')
      stop(app)
    }
  })

  socket.on('input', (message: Message.IInput) => {
    app.players[id].message = message
  })

  return true
}

/****************************************
 * Application Helpers
 ****************************************/

const start = (app: IApp) => {
  Simulation.reset(app)
  app.status = Status.PLAYING

  const numPlayers = getPlayerCount(app)
  console.log(`Game started with ${numPlayers} players`)
}

const stop = (app: IApp) => {
  if (app.status === Status.STOPPING) {
    return
  }

  console.log(`Game is shutting down in ${app.config.match.finishDelay}s`)

  app.status = Status.STOPPING

  setTimeout(() => {
    app.server.close(() => {
      httpServer.close(() => {
        process.exit(0)
      })
    })

    setTimeout(() => {
      process.exit(0)
    }, 5000)
  }, app.config.match.finishDelay)
}

const gameOver = (app: IApp, winner: number) => {
  console.log(`Game is over! Player ${winner} wins!`)

  const message: Message.IGameOver = { winner }
  app.server.to('players').emit('gameover', message)

  stop(app)
}

const getPlayerCount = (app: IApp) => {
  return _.size(app.server.in('players').sockets)
}

/****************************************
 * Entrypoint
 ****************************************/

httpServer.listen(80, async () => {
  const app = await create()

  Simulation.run(app)

  setInterval(() => {
    const sample = Simulation.sample(app)

    _.forEach(app.players, (player) => {
      const { latestFrame: frame, socket } = player
      const message: Message.IGameState = { sample, frame }
      socket.volatile.emit('gamestate', message)
    })
  }, app.config.network.delta)
})
