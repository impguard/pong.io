import * as http from 'http'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as logger from 'koa-logger'
import * as io from 'socket.io'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as Simulation from './simulation'
import * as Message from '../shared/message'
import { Status, App } from './interface'
import config from './config'

/****************************************
 * Koa Application
 ****************************************/

const koa = new Koa()
const router = new Router()

router.get('/health', (ctx) => {
  ctx.body = {
    'health': 'ENABLED'
  }
})

router.get('/reset', (ctx) => {
  ctx.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  ctx.body = {
    'state': 'RESET'
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
  const app: App = {
    status: Status.READY,
    inputs: {},
    game: null,
    emit: null,
    server: io(httpServer),
  }

  Simulation.setup(app)

  app.server.on('connection', socket => {
    add(app, socket)

    // const readyToPlay = getPlayerCount(app) >= config.app.match.playersRequired
    const readyToPlay = true
    console.log(app.status)

    if (app.status === Status.READY && readyToPlay) {
      app.status = Status.STARTING

      setTimeout(() => {
        Simulation.reset(app)
        app.status = Status.PLAYING
      }, config.app.match.delay)

      const startingMessage: Message.Starting = {
        delay: config.app.match.delay,
      }

      app.server.to('players').emit('starting', startingMessage)
      console.log(`Starting game in ${config.app.match.delay}ms`)
    }
  })

  return app
}

const add = (app: App, socket: SocketIO.Socket) => {
  const id = Simulation.assign(app)

  if (!id) {
    const rejectMessage: Message.Reject = {
      code: Message.ErrorCode.MATCHFULL,
    }

    socket.emit('rejected', rejectMessage)
    socket.disconnect()
    return
  }

  const acceptMessage: Message.Accept = {
    id,
    config: app.game.config,
    sample: Simulation.sampleInitial(app)
  }

  socket.emit('accepted', acceptMessage)
  socket.join('players')

  console.log(`Accepted player. Assigned to ${id}`)

  socket.on('disconnect', () => {
    const remaining = getPlayerCount(app)

    if (remaining === 0) {
      console.log('No players remaining!')
    }
  })

  socket.on('input', (message: Message.Input) => {
    app.inputs[id] = message.input
  })
}

/****************************************
 * Application Helpers
 ****************************************/

const getPlayerCount = (app: App) => {
  return _.size(app.server.to('players').sockets.length)
}

/****************************************
 * Entrypoint
 ****************************************/

httpServer.listen(80, () => {
  const app = create()

  Simulation.run(app)

  setInterval(() => {
    const message: Message.GameState = {
      sample: Simulation.sample(app)
    }

    app.server.to('players').emit('gamestate', message)
  }, config.app.network.delta)
})
