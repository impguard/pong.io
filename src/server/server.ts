import * as http from 'http'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as socket from 'socket.io'

/****************************************
 * Globals
 ****************************************/

const config = {
  START_MATCH_TIME: 5000,
  END_MATCH_TIME: 300000,
  GAME_LOOP_SPEED: 1000,
}

const state = {
  started: false,
  startCountdown: null,
}

/****************************************
 * Web Application
 ****************************************/

const app = new Koa()
const router = new Router()

router.get('/health', (ctx) => {
  ctx.body = {
    'health': 'ENABLED'
  }
})

router.get('/reset', (ctx) => {
  ctx.body = {
    'state': 'RESET'
  }

  startCountdown()
})

app.use(router.routes())
   .use(router.allowedMethods())

/****************************************
 * Game Server
 ****************************************/

const server = http.createServer(app.callback())
const io = socket(server)

const startCountdown = () => {
  clearTimeout(state.startCountdown)
  state.startCountdown = setTimeout(() => {
    const hasPlayers = Object.keys(io.sockets.connected).length >= 0
    if (hasPlayers) {
      state.started = true
      io.emit('start', 'Starting match...')
    }
  }, config.START_MATCH_TIME)
}

io.on('connection', (client) => {
  if (state.started) {
    setTimeout(() => client.disconnect(true), 500);
    return
  }
})

/****************************************
 * Entrypoint
 ****************************************/

server.listen(80, () => {

 startCountdown()

  // loop
  setInterval(() => {
    io.emit('time', `Time ${Date.now()}`)
  }, config.GAME_LOOP_SPEED)
})

