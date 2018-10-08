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
import config from './config'

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

const create = () => {
  const app: IApp = {
    status: Status.READY,
    inputs: {},
    game: null,
    server: io(httpServer),
  }

  Simulation.setup(app)

  event.on('gameOver', (winner: number) => {
    gameOver(app, winner)
  })

  app.server.on('connection', (socket) => {
    const didAdd = add(app, socket)

    if (!didAdd) {
      console.log('Rejected player')
      return
    }

    const numPlayers = getPlayerCount(app)
    const { playersRequired } = config.app.match

    if (app.status === Status.READY && numPlayers >= playersRequired) {
      app.status = Status.STARTING

      setTimeout(() => start(app), config.app.match.startDelay)

      const startingMessage: Message.IStarting = {
        delay: config.app.match.startDelay,
      }

      app.server.to('players').emit('starting', startingMessage)
      console.log(`Starting game in ${config.app.match.startDelay}ms`)
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

  console.log(`Accepted player. Assigned to ${id}`)

  socket.on('disconnect', () => {
    const remaining = getPlayerCount(app)

    if (remaining === 0) {
      console.log('No players remaining!')
      stop(app)
    }
  })

  socket.on('input', (message: Message.IInput) => {
    app.inputs[id] = message.input
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

  console.log(`Game is shutting down in ${config.app.match.finishDelay}s`)

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
  }, config.app.match.finishDelay)
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

httpServer.listen(80, () => {
  const app = create()

  Simulation.run(app)

  setInterval(() => {
    const message: Message.IGameState = {
      sample: Simulation.sample(app),
    }

    app.server.to('players').emit('gamestate', message)
  }, config.app.network.delta)
})
