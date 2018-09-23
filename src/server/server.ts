import * as http from 'http'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as io from 'socket.io'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as State from './state'
import * as Simulation from './simulation'
import { setupMaster } from 'cluster';
import { Socket } from 'net';

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

koa.use(router.routes())
   .use(router.allowedMethods())

const server = http.createServer(koa.callback())

/****************************************
 * Game Application
 ****************************************/

const create = () => {
  const app: State.App = {
    game: null,
    server: io(server),
  }

  app.server.on('connection', socket => {
    setup(app, socket)
  })
}

const setup = (app: State.App, socket: SocketIO.Socket) => {
  socket.on('disconnect', () => {
    const remaining = _.size(app.server.sockets.sockets)

    if (remaining === 0) {
      console.log('No players remaining!')
    }
  })

  socket.emit('accepted')

  console.log('Accepted player!')
}

server.listen(80, () => {
  const app = create()
})
