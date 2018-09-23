import * as http from 'http'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as io from 'socket.io'
import * as fs from 'fs'

import { config } from './config'

/****************************************
 * State
 ****************************************/

const state = {
  io: null,
}

/****************************************
 * Web Server and Application
 ****************************************/

const app = new Koa()
const router = new Router()

const cors = {
  'Access-Control-Allow-Origin': 'http://localhost:7778',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type',
}

router.get('/health', (ctx) => {
  ctx.body = {
    'health': 'ENABLED'
  }
})

router.get('/reset', (ctx) => {
  ctx.set(cors)
  ctx.body = {
    'state': 'RESET'
  }
})

router.get('/version', (ctx) => {
  ctx.type = 'json'
  ctx.body = fs.createReadStream('version.json')
})

app.use(router.routes())
   .use(router.allowedMethods())

const server = http.createServer(app.callback())
state.io = io(server)

state.io.on('connection', (client) => {
  client.on('disconnect', (client) => {
    var playersRemaining = state.io.sockets.connections != null
      ? Object.keys(state.io.sockets.connections).length
      : 0

    if (playersRemaining == 0) {
      console.log("No players remaining, resetting...")
    }
  })

  client.emit('accepted')
  console.log("Accepted player...")
})

/****************************************
 * Entrypoint
 ****************************************/

server.listen(80, () => {
  setInterval(() => {
  }, config.GAME_LOOP_SPEED)
})
