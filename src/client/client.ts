import * as socket from 'socket.io-client'

const io = socket('http://localhost:7777')

io.on('time', console.log)
