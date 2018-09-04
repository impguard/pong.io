import * as http from 'http'
import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as socket from 'socket.io'

/****************************************
 * Koa Routes
 ****************************************/

const app = new Koa()
const router = new Router()

router.get('/health', (ctx) => {
  ctx.body = {
    'health': 'ENABLED'
  }
})

app.use(router.routes())
   .use(router.allowedMethods())

/****************************************
 * Game Server
 ****************************************/

const server = http.createServer(app.callback())
const io = socket(server)

server.listen(80)
