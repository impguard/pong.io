import * as http from 'http'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as logger from 'koa-logger'
import * as io from 'socket.io'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as State from './state'
import * as Simulation from './simulation'
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
  const app: State.App = {
    game: null,
    server: io(httpServer),
  }

  Simulation.setup(app)
  
  app.server.on('connection', socket => {
    socket.emit('accepted', app.game.config)
    socket.join('players')

    add(app, socket)

    console.log('Accepted player!')
  })

  return app
}

const add = (app: State.App, socket: SocketIO.Socket) => {
  socket.on('disconnect', () => {
    const remaining = _.size(app.server.of('players').sockets)

    if (remaining === 0) {
      console.log('No players remaining!')
    }
  })
}

httpServer.listen(80, () => {
  const app = create()

  Simulation.run(app)

  setInterval(() => {
    app.server.to('players').emit('gamestate', Simulation.sample(app))

  }, config.app.network.delta)
})
